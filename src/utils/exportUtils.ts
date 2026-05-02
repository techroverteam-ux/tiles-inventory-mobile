import { Alert, Platform } from 'react-native'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import * as XLSX from 'xlsx-js-style'

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

// Styling constants copied from website export for parity
const BRAND_COLORS = {
  navyBg: '1E3A8A',
  navyText: '1E3A8A',
  white: 'FFFFFF',
  bodyText: '1F2937',
}

const TEMPLATE_STYLE = {
  fontName: 'Calibri',
  titleFontSize: 14,
  subtitleFontSize: 12,
  dateFontSize: 10,
  headerFontSize: 11,
  bodyFontSize: 11,
  borderColor: '1E3A8A',
}

function allBorder(color = TEMPLATE_STYLE.borderColor) {
  const side = { style: 'thin' as const, color: { rgb: color } }
  return { top: side, bottom: side, left: side, right: side }
}

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
  companyName = 'House Of Tiles',
  headerColor,
}: ExportOptions) => {
  try {
    if (!data || data.length === 0) {
      Alert.alert('Export Failed', 'There is no data to export.')
      return false
    }

    // Prepare data rows
    const exportData = data.map(item => {
      const row: any = {}
      columns.forEach(column => {
        const value = getNestedValue(item, column.key)
        const formattedValue = column.format ? column.format(value) : value
        row[column.label] = normalizeExportValue(formattedValue)
      })
      return row
    })

    // Create workbook and worksheet placing table at row 4 (A4)
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([])
    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: 'A4', skipHeader: false })

    // Add company header rows
    XLSX.utils.sheet_add_aoa(worksheet, [
      [companyName],
      [reportTitle],
      [includeTimestamp ? `Generated on: ${formatDateDDMMMYYYY(new Date())}` : ''],
    ], { origin: 'A1' })

    // Compute range to determine end column/row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    const lastCol = columns.length - 1

    // Row heights (match website)
    worksheet['!rows'] = [ { hpt: 22 }, { hpt: 18 }, { hpt: 16 }, { hpt: 18 } ]

    // Apply merges for title rows if multiple columns (rows 1-3)
    if (columns.length > 1) {
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } },
      ]
    }

    // Header/background color
    const colBg = (headerColor || BRAND_COLORS.navyBg).replace(/^#/, '').replace(/^FF/i, '').toUpperCase()

    // Style column header row (row index 3 => 4th row A4 header)
    for (let col = 0; col <= range.e.c; col++) {
      const addr = XLSX.utils.encode_cell({ r: 3, c: col })
      if (worksheet[addr]) {
        worksheet[addr].s = {
          font: { name: TEMPLATE_STYLE.fontName, bold: true, sz: TEMPLATE_STYLE.headerFontSize, color: { rgb: BRAND_COLORS.white } },
          fill: { fgColor: { rgb: colBg } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: allBorder()
        }
      }
    }

    // Data rows styling
    for (let row = 4; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const addr = XLSX.utils.encode_cell({ r: row, c: col })
        if (worksheet[addr]) {
          worksheet[addr].s = {
            font: { name: TEMPLATE_STYLE.fontName, sz: TEMPLATE_STYLE.bodyFontSize, color: { rgb: BRAND_COLORS.bodyText } },
            fill: { fgColor: { rgb: BRAND_COLORS.white } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: allBorder()
          }
        }
      }
    }

    // Title row styles for rows 0..2 (company, title, date)
    const titleRowStyles = [
      { font: { name: TEMPLATE_STYLE.fontName, bold: true, sz: TEMPLATE_STYLE.titleFontSize, color: { rgb: BRAND_COLORS.navyText } }, fill: { fgColor: { rgb: BRAND_COLORS.white } }, alignment: { horizontal: 'center', vertical: 'center' } },
      { font: { name: TEMPLATE_STYLE.fontName, bold: true, sz: TEMPLATE_STYLE.subtitleFontSize, color: { rgb: BRAND_COLORS.navyText } }, fill: { fgColor: { rgb: BRAND_COLORS.white } }, alignment: { horizontal: 'center', vertical: 'center' } },
      { font: { name: TEMPLATE_STYLE.fontName, italic: true, sz: TEMPLATE_STYLE.dateFontSize, color: { rgb: BRAND_COLORS.bodyText } }, fill: { fgColor: { rgb: BRAND_COLORS.white } }, alignment: { horizontal: 'center', vertical: 'center' } },
    ]
    for (let titleRow = 0; titleRow < 3; titleRow++) {
      for (let col = 0; col <= lastCol; col++) {
        const addr = XLSX.utils.encode_cell({ r: titleRow, c: col })
        if (!worksheet[addr]) {
          worksheet[addr] = { t: 's', v: '' }
        }

        const isFirst = col === 0
        const isLast = col === lastCol

        worksheet[addr].s = {
          ...titleRowStyles[titleRow],
          border: {
            top: { style: 'thin', color: { rgb: TEMPLATE_STYLE.borderColor } },
            bottom: { style: 'thin', color: { rgb: TEMPLATE_STYLE.borderColor } },
            left: isFirst ? { style: 'thin', color: { rgb: TEMPLATE_STYLE.borderColor } } : undefined,
            right: isLast ? { style: 'thin', color: { rgb: TEMPLATE_STYLE.borderColor } } : undefined,
          },
        }
      }
    }

    // Set print settings similar to website
    worksheet['!printHeader'] = [1, 3]
    worksheet['!margins'] = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }

    // Auto-fit columns based on website logic
    const autoFitCols = columns.map((column, index) => {
      let maxLength = column.label.length
      data.forEach(item => {
        const value = getNestedValue(item, column.key)
        const formattedValue = normalizeExportValue(column.format ? column.format(value) : value)
        maxLength = Math.max(maxLength, String(formattedValue).length)
      })
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }
    })
    worksheet['!cols'] = autoFitCols

    // Append sheet and write workbook as base64
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' })

    const timestamp = includeTimestamp ? `_${new Date().getTime()}` : ''
    const finalFilename = `${filename}${timestamp}.xlsx`
    const path = `${RNFS.CachesDirectoryPath}/${finalFilename}`

    await RNFS.writeFile(path, wbout, 'base64')

    // Share file
    const shareOptions = {
      title: reportTitle,
      url: `file://${path}`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      failOnCancel: false,
    }

    await Share.open(shareOptions)
    return { success: true, filename: finalFilename }
  } catch (error) {
    console.error('Export Error:', error)
    Alert.alert('Export Error', 'An unexpected error occurred while exporting.')
    return { success: false, error: error instanceof Error ? error.message : 'Export Error' }
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
