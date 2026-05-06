import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import RNFS from 'react-native-fs'
import { exportToExcel as utilsExportToExcel } from '../utils/exportUtils'

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
  reportTitle?: string
}

export interface DownloadModalState {
  visible: boolean
  filename: string
  filepath: string
  filesize: string
}

export const useExportWithModal = () => {
  const [modalState, setModalState] = useState<DownloadModalState>({
    visible: false,
    filename: '',
    filepath: '',
    filesize: '',
  })
  const [exporting, setExporting] = useState(false)

  const getFileSizeString = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }, [])

  const exportToExcelWithModal = useCallback(async (options: ExportOptions) => {
    try {
      setExporting(true)

      const result = await utilsExportToExcel({
        ...options,
        filename: options.filename || 'export',
        reportTitle: options.reportTitle || `${(options.filename || 'export').charAt(0).toUpperCase() + (options.filename || 'export').slice(1)} Report`,
        includeTimestamp: options.includeTimestamp !== false,
      })

      if ((result as any).success && (result as any).filename) {
        const exportedFilename = (result as any).filename
        const cacheFilePath = (result as any).filepath || `${RNFS.CachesDirectoryPath}/${exportedFilename}`

        // Save to Downloads/TilesInventory
        const downloadDir = `${RNFS.DownloadDirectoryPath}/TilesInventory`
        const dirExists = await RNFS.exists(downloadDir)
        if (!dirExists) {
          await RNFS.mkdir(downloadDir)
        }

        const finalPath = `${downloadDir}/${exportedFilename}`
        await RNFS.copyFile(cacheFilePath, finalPath)

        const fileStats = await RNFS.stat(finalPath)
        const filesize = getFileSizeString(fileStats.size)

        setExporting(false)
        setModalState({
          visible: true,
          filename: exportedFilename,
          filepath: finalPath,
          filesize,
        })
      } else {
        setExporting(false)
        Alert.alert('Export Failed', (result as any).error || 'Failed to export file')
      }
    } catch (error) {
      setExporting(false)
      console.error('Export error:', error)
      Alert.alert('Export Error', 'An unexpected error occurred')
    }
  }, [getFileSizeString])

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }))
  }, [])

  return {
    modalState,
    closeModal,
    exportToExcelWithModal,
    exporting,
  }
}
