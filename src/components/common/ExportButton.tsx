import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  StyleSheet 
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { DownloadCompletionModal } from './DownloadCompletionModal'
import { useExportWithModal } from '../../hooks/useExportWithModal'
import { 
  exportToCSV, 
  exportToPDF, 
  ExportColumn, 
  showExportAlert 
} from '../../services/exportService'

interface ExportButtonProps {
  data: any[]
  columns: ExportColumn[]
  filename?: string
  reportTitle?: string
  disabled?: boolean
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onExportStart?: () => void
  onExportComplete?: (result: { success: boolean; filename?: string; error?: string }) => void
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  filename = 'export',
  reportTitle,
  disabled = false,
  variant = 'outline',
  size = 'md',
  onExportStart,
  onExportComplete,
}) => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const { modalState, closeModal, exportToExcelWithModal } = useExportWithModal()

  const handleExport = () => {
    if (data.length === 0) {
      Alert.alert('No Data', 'There is no data to export.')
      return
    }

    const handleCSVExport = async () => {
      setLoading(true)
      if (onExportStart) onExportStart()

      const result = await exportToCSV({
        filename,
        columns,
        data,
        includeTimestamp: true,
        reportTitle: reportTitle || `${filename.charAt(0).toUpperCase() + filename.slice(1)} Report`,
      })

      setLoading(false)
      if (onExportComplete) onExportComplete(result)

      if (result.success) {
        Alert.alert('Export Successful', `Data exported as ${result.filename}`)
      } else {
        Alert.alert('Export Failed', result.error || 'Failed to export data')
      }
    }

    const handlePDFExport = async () => {
      setLoading(true)
      if (onExportStart) onExportStart()

      const result = await exportToPDF({
        filename,
        columns,
        data,
        includeTimestamp: true,
        reportTitle: reportTitle || `${filename.charAt(0).toUpperCase() + filename.slice(1)} Report`,
      })

      setLoading(false)
      if (onExportComplete) onExportComplete(result)

      if (result.success) {
        Alert.alert('Export Successful', `Data exported as ${result.filename}`)
      } else {
        Alert.alert('Export Failed', result.error || 'Failed to export data')
      }
    }

    const handleExcelExport = async () => {
      setLoading(true)
      if (onExportStart) onExportStart()

      await exportToExcelWithModal({
        filename,
        columns,
        data,
        includeTimestamp: true,
        reportTitle: reportTitle || `${filename.charAt(0).toUpperCase() + filename.slice(1)} Report`,
      })

      setLoading(false)
    }

    showExportAlert(handleCSVExport, handlePDFExport, handleExcelExport)
  }

  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 8,
      borderWidth: 1,
    }

    const sizeStyles = {
      sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      md: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 40 },
      lg: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
    }

    const variantStyles = {
      primary: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: theme.border,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.6 : 1,
    }
  }

  const getTextStyle = () => {
    const baseStyle = {
      marginLeft: 8,
      fontWeight: '500' as const,
    }

    const sizeStyles = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    }

    const variantStyles = {
      primary: { color: theme.primaryForeground },
      outline: { color: theme.text },
      ghost: { color: theme.text },
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return theme.primaryForeground
      default:
        return theme.text
    }
  }

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 22 : 20

  return (
    <>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handleExport}
        disabled={disabled || loading || data.length === 0}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getIconColor()} />
        ) : (
          <Icon name="file-download" size={iconSize} color={getIconColor()} />
        )}
        <Text style={getTextStyle()}>
          {loading ? 'Exporting...' : 'Export'}
        </Text>
      </TouchableOpacity>
      <DownloadCompletionModal
        visible={modalState.visible}
        filename={modalState.filename}
        filepath={modalState.filepath}
        filesize={modalState.filesize}
        onClose={closeModal}
      />
    </>
  )
}

// Quick export buttons for specific formats
export const CSVExportButton: React.FC<Omit<ExportButtonProps, 'variant'>> = (props) => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (props.data.length === 0) {
      Alert.alert('No Data', 'There is no data to export.')
      return
    }

    setLoading(true)
    if (props.onExportStart) props.onExportStart()

    const result = await exportToCSV({
      filename: props.filename || 'export',
      columns: props.columns,
      data: props.data,
      includeTimestamp: true,
      reportTitle: props.reportTitle || `${(props.filename || 'export').charAt(0).toUpperCase() + (props.filename || 'export').slice(1)} Report`,
    })

    setLoading(false)
    if (props.onExportComplete) props.onExportComplete(result)

    if (result.success) {
      Alert.alert('Export Successful', `Data exported as ${result.filename}`)
    } else {
      Alert.alert('Export Failed', result.error || 'Failed to export data')
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.quickButton,
        { 
          backgroundColor: theme.success,
          opacity: props.disabled || loading || props.data.length === 0 ? 0.6 : 1 
        }
      ]}
      onPress={handleExport}
      disabled={props.disabled || loading || props.data.length === 0}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.successForeground} />
      ) : (
        <Icon name="table-chart" size={18} color={theme.successForeground} />
      )}
      <Text style={[styles.quickButtonText, { color: theme.successForeground }]}>
        {loading ? 'Exporting...' : 'CSV'}
      </Text>
    </TouchableOpacity>
  )
}

export const ExcelExportButton: React.FC<Omit<ExportButtonProps, 'variant'>> = (props) => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const { modalState, closeModal, exportToExcelWithModal } = useExportWithModal()

  const handleExport = async () => {
    if (props.data.length === 0) {
      Alert.alert('No Data', 'There is no data to export.')
      return
    }

    setLoading(true)
    if (props.onExportStart) props.onExportStart()

    await exportToExcelWithModal({
      filename: props.filename || 'export',
      columns: props.columns,
      data: props.data,
      includeTimestamp: true,
      reportTitle: props.reportTitle || `${(props.filename || 'export').charAt(0).toUpperCase() + (props.filename || 'export').slice(1)} Report`,
    })

    setLoading(false)
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.quickButton,
          { 
            backgroundColor: theme.primary,
            opacity: props.disabled || loading || props.data.length === 0 ? 0.6 : 1 
          }
        ]}
        onPress={handleExport}
        disabled={props.disabled || loading || props.data.length === 0}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.primaryForeground} />
        ) : (
          <Icon name="file-download" size={18} color={theme.primaryForeground} />
        )}
        <Text style={[styles.quickButtonText, { color: theme.primaryForeground }]}> 
          {loading ? 'Exporting...' : 'Excel'}
        </Text>
      </TouchableOpacity>
      <DownloadCompletionModal
        visible={modalState.visible}
        filename={modalState.filename}
        filepath={modalState.filepath}
        filesize={modalState.filesize}
        onClose={closeModal}
      />
    </>
  )
}

export const PDFExportButton: React.FC<Omit<ExportButtonProps, 'variant'>> = (props) => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (props.data.length === 0) {
      Alert.alert('No Data', 'There is no data to export.')
      return
    }

    setLoading(true)
    if (props.onExportStart) props.onExportStart()

    const result = await exportToPDF({
      filename: props.filename || 'export',
      columns: props.columns,
      data: props.data,
      includeTimestamp: true,
      reportTitle: props.reportTitle || `${(props.filename || 'export').charAt(0).toUpperCase() + (props.filename || 'export').slice(1)} Report`,
    })

    setLoading(false)
    if (props.onExportComplete) props.onExportComplete(result)

    if (result.success) {
      Alert.alert('Export Successful', `Data exported as ${result.filename}`)
    } else {
      Alert.alert('Export Failed', result.error || 'Failed to export data')
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.quickButton,
        { 
          backgroundColor: theme.error,
          opacity: props.disabled || loading || props.data.length === 0 ? 0.6 : 1 
        }
      ]}
      onPress={handleExport}
      disabled={props.disabled || loading || props.data.length === 0}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.destructiveForeground} />
      ) : (
        <Icon name="picture-as-pdf" size={18} color={theme.destructiveForeground} />
      )}
      <Text style={[styles.quickButtonText, { color: theme.destructiveForeground }]}>
        {loading ? 'Exporting...' : 'PDF'}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minHeight: 36,
  },
  quickButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
})