import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import { Alert, Platform } from 'react-native'

export interface ExportColumn {
  key: string
  label: string
  width?: number
  format?: (value: any) => string
}

export interface ExportOptions {
  filename?: string
  columns: ExportColumn[]
  data: any[]
  includeTimestamp?: boolean
  companyName?: string
  reportTitle?: string
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : ''
  }, obj)
}

function normalizeExportValue(value: any): string {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string') {
    const trimmedValue = value.trim()
    return trimmedValue === '' ? 'N/A' : trimmedValue
  }
  return String(value)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateDDMMMYYYY(value: any): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const day = String(date.getDate()).padStart(2, '0')
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export async function exportToCSV({
  filename = 'export',
  columns,
  data,
  includeTimestamp = true,
  companyName = 'Tiles Inventory Management System',
  reportTitle = 'Data Export Report',
}: ExportOptions): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    // Prepare CSV content
    let csvContent = ''
    
    // Add header rows
    csvContent += `${companyName}\n`
    csvContent += `${reportTitle}\n`
    if (includeTimestamp) {
      csvContent += `Generated on: ${formatDateDDMMMYYYY(new Date())}\n`
    }
    csvContent += '\n' // Empty line
    
    // Add column headers
    const headers = columns.map(col => `"${col.label}"`).join(',')
    csvContent += headers + '\n'
    
    // Add data rows
    data.forEach(item => {
      const row = columns.map(column => {
        const value = getNestedValue(item, column.key)
        const formattedValue = column.format ? column.format(value) : value
        const normalizedValue = normalizeExportValue(formattedValue)
        return `"${normalizedValue.replace(/"/g, '""')}"` // Escape quotes
      }).join(',')
      csvContent += row + '\n'
    })
    
    // Generate filename with timestamp
    const timestamp = includeTimestamp 
      ? new Date().toISOString().split('T')[0] 
      : ''
    const finalFilename = `${filename}${timestamp ? `-${timestamp}` : ''}.csv`
    
    // Write file to temporary directory
    const filePath = `${RNFS.TemporaryDirectoryPath}/${finalFilename}`
    await RNFS.writeFile(filePath, csvContent, 'utf8')
    
    // Share the file
    const shareOptions = {
      title: 'Export Data',
      message: `${reportTitle} - ${companyName}`,
      url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
      type: 'text/csv',
      filename: finalFilename,
    }
    
    await Share.open(shareOptions)
    
    return { success: true, filename: finalFilename }
  } catch (error) {
    console.error('Export failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    }
  }
}

export async function exportToPDF({
  filename = 'export',
  columns,
  data,
  includeTimestamp = true,
  companyName = 'Tiles Inventory Management System',
  reportTitle = 'Data Export Report',
}: ExportOptions): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    // For PDF export, we'll create an HTML table and convert it
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${reportTitle}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            color: #1E3A8A;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #1E3A8A;
            padding-bottom: 15px;
        }
        .company-name { 
            font-size: 18px; 
            font-weight: bold; 
            color: #1E3A8A; 
            margin-bottom: 5px;
        }
        .report-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #1E3A8A; 
            margin-bottom: 5px;
        }
        .date { 
            font-size: 12px; 
            color: #64748B; 
            font-style: italic;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th { 
            background-color: #1E3A8A; 
            color: white; 
            padding: 12px 8px; 
            text-align: center; 
            font-weight: bold;
            border: 1px solid #1E3A8A;
        }
        td { 
            padding: 10px 8px; 
            text-align: center; 
            border: 1px solid #1E3A8A;
            background-color: white;
        }
        tr:nth-child(even) td { 
            background-color: #F8FAFC; 
        }
        @media print {
            body { margin: 0; }
            .header { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${companyName}</div>
        <div class="report-title">${reportTitle}</div>
        ${includeTimestamp ? `<div class="date">Generated on: ${formatDateDDMMMYYYY(new Date())}</div>` : ''}
    </div>
    <table>
        <thead>
            <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(item => `
                <tr>
                    ${columns.map(column => {
                      const value = getNestedValue(item, column.key)
                      const formattedValue = column.format ? column.format(value) : value
                      const normalizedValue = normalizeExportValue(formattedValue)
                      return `<td>${normalizedValue}</td>`
                    }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`
    
    // Generate filename with timestamp
    const timestamp = includeTimestamp 
      ? new Date().toISOString().split('T')[0] 
      : ''
    const finalFilename = `${filename}${timestamp ? `-${timestamp}` : ''}.html`
    
    // Write HTML file to temporary directory
    const filePath = `${RNFS.TemporaryDirectoryPath}/${finalFilename}`
    await RNFS.writeFile(filePath, htmlContent, 'utf8')
    
    // Share the HTML file (can be opened in browser and printed as PDF)
    const shareOptions = {
      title: 'Export Data as PDF',
      message: `${reportTitle} - ${companyName}`,
      url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
      type: 'text/html',
      filename: finalFilename,
    }
    
    await Share.open(shareOptions)
    
    return { success: true, filename: finalFilename }
  } catch (error) {
    console.error('PDF export failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'PDF export failed' 
    }
  }
}

// Common column configurations matching web portal
export const commonColumns = {
  brand: [
    { key: 'name', label: 'Brand Name' },
    { key: 'description', label: 'Description' },
    { key: 'contactInfo', label: 'Contact Info' },
    { key: 'isActive', label: 'Status', format: (value: boolean) => value ? 'Active' : 'Inactive' },
    { key: '_count.categories', label: 'Categories', format: (value: number) => value?.toString() || '0' },
    { key: '_count.products', label: 'Products', format: (value: number) => value?.toString() || '0' },
    { key: 'createdAt', label: 'Created Date', format: (value: string) => formatDateDDMMMYYYY(value) },
    { key: 'updatedAt', label: 'Updated Date', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  category: [
    { key: 'name', label: 'Category Name' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'description', label: 'Description' },
    { key: 'isActive', label: 'Status', format: (value: boolean) => value ? 'Active' : 'Inactive' },
    { key: '_count.products', label: 'Products', format: (value: number) => value?.toString() || '0' },
    { key: 'createdAt', label: 'Created Date', format: (value: string) => formatDateDDMMMYYYY(value) },
    { key: 'updatedAt', label: 'Updated Date', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  size: [
    { key: 'name', label: 'Size Name' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'category.name', label: 'Category' },
    { key: 'length', label: 'Length (in)', format: (value: number) => value?.toString() || '' },
    { key: 'width', label: 'Width (in)', format: (value: number) => value?.toString() || '' },
    { key: 'description', label: 'Description' },
    { key: 'isActive', label: 'Status', format: (value: boolean) => value ? 'Active' : 'Inactive' },
    { key: '_count.products', label: 'Products', format: (value: number) => value?.toString() || '0' },
    { key: 'createdAt', label: 'Created Date', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  location: [
    { key: 'name', label: 'Location Name' },
    { key: 'address', label: 'Address' },
    { key: 'isActive', label: 'Status', format: (value: boolean) => value ? 'Active' : 'Inactive' },
    { key: '_count.batches', label: 'Inventory Batches', format: (value: number) => value?.toString() || '0' },
    { key: 'createdAt', label: 'Created Date', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  product: [
    { key: 'name', label: 'Product Name' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'category.name', label: 'Category' },
    { key: 'size.name', label: 'Size' },
    { key: 'sqftPerBox', label: 'Sq Ft/Box', format: (value: number) => value?.toString() || '0' },
    { key: 'pcsPerBox', label: 'Pcs/Box', format: (value: number) => value?.toString() || '0' },
    { key: 'isActive', label: 'Status', format: (value: boolean) => value ? 'Active' : 'Inactive' },
    { key: 'createdBy.name', label: 'Created By' },
    { key: 'createdAt', label: 'Created Date', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  salesOrder: [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'totalAmount', label: 'Amount', format: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'orderDate', label: 'Order Date', format: (value: string) => formatDateDDMMMYYYY(value) },
    { key: 'items.length', label: 'Unique Items', format: (value: number) => value?.toString() || '0' },
    { key: 'createdAt', label: 'Created At', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  purchaseOrder: [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'status', label: 'Status' },
    { key: 'totalAmount', label: 'Amount', format: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'orderDate', label: 'Order Date', format: (value: string) => formatDateDDMMMYYYY(value) },
    { key: 'createdAt', label: 'Created At', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  inventory: [
    { key: 'product.name', label: 'Product' },
    { key: 'batchNumber', label: 'Batch #' },
    { key: 'location.name', label: 'Location' },
    { key: 'quantity', label: 'Qty', format: (value: number) => value?.toString() || '0' },
    { key: 'unit', label: 'Unit' },
    { key: 'buyingPrice', label: 'Buying Price', format: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'sellingPrice', label: 'Selling Price', format: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'expiryDate', label: 'Expiry Date', format: (value: string) => formatDateDDMMMYYYY(value) },
    { key: 'createdAt', label: 'Added Date', format: (value: string) => formatDateDDMMMYYYY(value) }
  ] as ExportColumn[],

  stockMovement: [
    { key: 'product.name', label: 'Product' },
    { key: 'type', label: 'Type' },
    { key: 'quantity', label: 'Qty' },
    { key: 'fromLocation.name', label: 'From' },
    { key: 'toLocation.name', label: 'To' },
    { key: 'reason', label: 'Reason' },
    { key: 'createdAt', label: 'Date', format: (value: string) => formatDateDDMMMYYYY(value) },
    { key: 'createdBy.name', label: 'By' }
  ] as ExportColumn[]
}

// Export utility functions
export const showExportAlert = (onCSV: () => void, onPDF: () => void) => {
  Alert.alert(
    'Export Data',
    'Choose export format:',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'CSV', onPress: onCSV },
      { text: 'PDF', onPress: onPDF },
    ],
    { cancelable: true }
  )
}