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

  const getFilesDirectory = useCallback(async () => {
    try {
      // Try to use Download directory first (user-accessible)
      const downloadPath = `${RNFS.DownloadDirectoryPath}/TilesInventory`
      
      // Create directory if it doesn't exist
      const exists = await RNFS.exists(downloadPath)
      if (!exists) {
        try {
          await RNFS.mkdir(downloadPath, { NSURLIsExcludedFromBackupKey: false })
        } catch (e) {
          // If Download doesn't work, try Documents
          const documentsPath = `${RNFS.DocumentDirectoryPath}/Exports`
          const docExists = await RNFS.exists(documentsPath)
          if (!docExists) {
            await RNFS.mkdir(documentsPath, { NSURLIsExcludedFromBackupKey: false })
          }
          return documentsPath
        }
      }
      
      return downloadPath
    } catch (error) {
      console.error('Error accessing file directory:', error)
      // Fallback to cache directory
      return RNFS.CachesDirectoryPath
    }
  }, [])

  const getFileSizeString = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }, [])

  const exportToExcelWithModal = useCallback(async (options: ExportOptions) => {
    try {
      const exportsDir = await getFilesDirectory()
      
      // Prepare data for export
      const columns = options.columns
      const data = options.data
      const filename = options.filename || 'export'
      const includeTimestamp = options.includeTimestamp !== false
      const reportTitle = options.reportTitle || `${filename.charAt(0).toUpperCase() + filename.slice(1)} Report`

      // Call the original export function with custom path handling
      const result = await utilsExportToExcel({
        ...options,
        filename,
        reportTitle,
        includeTimestamp,
      })

      if ((result as any).success && (result as any).filename) {
        // Get file info
        const exportedFilename = (result as any).filename
        const filepath = `${exportsDir}/${exportedFilename}`
        
        try {
          // Try to copy file from cache to exports directory
          const cacheFile = `${RNFS.CachesDirectoryPath}/${exportedFilename}`
          const exists = await RNFS.exists(cacheFile)
          if (exists) {
            await RNFS.copyFile(cacheFile, filepath)
          }
          
          // Get file size
          const fileStats = await RNFS.stat(filepath)
          const filesize = getFileSizeString(fileStats.size)
          
          // Show modal
          setModalState({
            visible: true,
            filename: exportedFilename,
            filepath: filepath,
            filesize: filesize,
          })
        } catch (error) {
          console.error('Error preparing file for modal:', error)
          Alert.alert('Export', 'File exported successfully (in cache)')
        }
      } else {
        Alert.alert('Export Failed', (result as any).error || 'Failed to export file')
      }
    } catch (error) {
      console.error('Export error:', error)
      Alert.alert('Export Error', 'An unexpected error occurred')
    }
  }, [getFilesDirectory, getFileSizeString])

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }))
  }, [])

  return {
    modalState,
    closeModal,
    exportToExcelWithModal,
  }
}
