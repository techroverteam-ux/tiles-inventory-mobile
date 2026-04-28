import { Alert, Platform } from 'react-native'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import * as XLSX from 'xlsx'

export interface ExportColumn {
  key: string
  label: string
  width?: number
  format?: (value: any) => string
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
  columns: ExportColumn[]
  data: any[]
  includeTimestamp?: boolean
  reportTitle?: string
}

// Helper function to get nested object values (e.g., "brand.name")
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : ''
  }, obj)
}

function normalizeExportValue(value: any): string | number | boolean {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string') {
    const trimmedValue = value.trim()
    return trimmedValue === '' ? 'N/A' : trimmedValue
  }
  return value
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDateDDMMMYYYY(value: any): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const day = String(date.getDate()).padStart(2, '0')
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export const exportToExcel = async ({
  filename = 'export',
  sheetName = 'Sheet1',
  columns,
  data,
  includeTimestamp = true,
  reportTitle = 'Data Export Report',
}: ExportOptions) => {
  try {
    if (!data || data.length === 0) {
      Alert.alert('Export Failed', 'There is no data to export.')
      return false
    }

    // 1. Map data to rows based on columns
    const exportData = data.map(item => {
      const row: any = {}
      columns.forEach(column => {
        const value = getNestedValue(item, column.key)
        const formattedValue = column.format ? column.format(value) : value
        row[column.label] = normalizeExportValue(formattedValue)
      })
      return row
    })

    // 2. Create Workbook and Worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Append sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // 3. Generate Base64 string of the Excel file
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' })

    // 4. Save to temporary local storage
    const timestamp = includeTimestamp ? `_${new Date().getTime()}` : ''
    const finalFilename = `${filename}${timestamp}.xlsx`
    
    // Use CachesDirectoryPath so we don't pollute Documents unless user explicitly saves it
    const path = `${RNFS.CachesDirectoryPath}/${finalFilename}`
    
    await RNFS.writeFile(path, wbout, 'base64')

    // 5. Open Native Share Dialog
    const shareOptions = {
      title: reportTitle,
      url: `file://${path}`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      failOnCancel: false,
    }

    await Share.open(shareOptions)

    return true
  } catch (error) {
    console.error('Export Error:', error)
    Alert.alert('Export Error', 'An unexpected error occurred while exporting.')
    return false
  }
}

export const commonColumns = {
  product: [
    { key: 'name', label: 'Product Name' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'category.name', label: 'Category' },
    { key: 'size.name', label: 'Size' },
    { key: 'sqftPerBox', label: 'Sq Ft/Box', format: (v: number) => v?.toString() || '0' },
    { key: 'pcsPerBox', label: 'Pcs/Box', format: (v: number) => v?.toString() || '0' },
    { key: 'isActive', label: 'Status', format: (v: boolean) => v ? 'Active' : 'Inactive' },
    { key: 'createdAt', label: 'Created Date', format: (v: string) => formatDateDDMMMYYYY(v) }
  ] as ExportColumn[],

  inventory: [
    { key: 'product.name', label: 'Product' },
    { key: 'batchNumber', label: 'Batch #' },
    { key: 'location.name', label: 'Location' },
    { key: 'quantity', label: 'Qty', format: (v: number) => v?.toString() || '0' },
    { key: 'purchasePrice', label: 'Purchase Price', format: (v: number) => `₹${v?.toLocaleString() || 0}` },
    { key: 'sellingPrice', label: 'Selling Price', format: (v: number) => `₹${v?.toLocaleString() || 0}` },
    { key: 'createdAt', label: 'Added Date', format: (v: string) => formatDateDDMMMYYYY(v) }
  ] as ExportColumn[],

  salesOrder: [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'status', label: 'Status' },
    { key: 'totalAmount', label: 'Amount', format: (v: number) => `₹${v?.toLocaleString() || 0}` },
    { key: 'orderDate', label: 'Order Date', format: (v: string) => formatDateDDMMMYYYY(v) },
    { key: 'createdAt', label: 'Created At', format: (v: string) => formatDateDDMMMYYYY(v) }
  ] as ExportColumn[],

  purchaseOrder: [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'status', label: 'Status' },
    { key: 'totalAmount', label: 'Amount', format: (v: number) => `₹${v?.toLocaleString() || 0}` },
    { key: 'orderDate', label: 'Order Date', format: (v: string) => formatDateDDMMMYYYY(v) },
    { key: 'createdAt', label: 'Created At', format: (v: string) => formatDateDDMMMYYYY(v) }
  ] as ExportColumn[],
}
