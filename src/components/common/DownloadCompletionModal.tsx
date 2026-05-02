import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Share from 'react-native-share'
import { useTheme } from '../../context/ThemeContext'
import { spacing, typography } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface DownloadCompletionModalProps {
  visible: boolean
  filename: string
  filepath: string
  filesize: string
  onClose: () => void
  onOpenFile?: () => void
}

export const DownloadCompletionModal: React.FC<DownloadCompletionModalProps> = ({
  visible,
  filename,
  filepath,
  filesize,
  onClose,
  onOpenFile,
}) => {
  const { theme } = useTheme()
  const [loading, setLoading] = React.useState(false)

  const handleOpenFile = async () => {
    try {
      setLoading(true)
      if (onOpenFile) {
        await Promise.resolve(onOpenFile())
      } else {
        await Share.open({
          url: `file://${filepath}`,
          type: filename.endsWith('.pdf')
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      }
      setTimeout(onClose, 500)
    } catch (error) {
      console.log('Error opening file:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      setLoading(true)
      await Share.open({
        url: `file://${filepath}`,
        filename,
        title: `Share ${filename}`,
        type: filename.endsWith('.pdf')
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      setTimeout(onClose, 500)
    } catch (error) {
      console.log('Error sharing file:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenFolder = async () => {
    try {
      setLoading(true)

      if (Platform.OS === 'android') {
        try {
          await Share.open({
            url: `file://${filepath}`,
            filename: filepath.substring(filepath.lastIndexOf('/') + 1),
            message: 'Your export file is ready',
          })
          setTimeout(onClose, 500)
        } catch (e: any) {
          if (e?.message !== 'User did not share') {
            Alert.alert('File Location', `File saved to:\n${filepath}`)
          }
        }
      } else {
        Alert.alert('File Location', `File saved to:\n${filepath}`)
      }
    } catch (error) {
      console.log('Error opening folder:', error)
      Alert.alert('Error', 'Could not open folder')
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
      width: '85%',
      maxWidth: 400,
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: spacing.xl,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: withOpacity(theme.border, 0.3),
    },
    checkmark: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#16A34A',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.mutedForeground,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    fileInfo: {
      width: '100%',
      backgroundColor: withOpacity(theme.surface, 0.5),
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    fileIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: withOpacity(theme.primary, 0.15),
      justifyContent: 'center',
      alignItems: 'center',
    },
    fileDetails: {
      flex: 1,
    },
    fileName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: 2,
    },
    fileSize: {
      fontSize: typography.fontSize.xs,
      color: theme.mutedForeground,
    },
    buttonContainer: {
      width: '100%',
      gap: spacing.md,
    },
    primaryButton: {
      width: '100%',
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
    },
    primaryButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.primaryForeground,
    },
    secondaryButtonRow: {
      width: '100%',
      flexDirection: 'row',
      gap: spacing.md,
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: withOpacity(theme.border, 0.2),
      borderRadius: 12,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryButtonText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    footer: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: withOpacity(theme.border, 0.3),
      width: '100%',
      alignItems: 'center',
    },
    footerText: {
      fontSize: typography.fontSize.xs,
      color: theme.mutedForeground,
      textAlign: 'center',
    },
  })

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={loading}>
            <Icon name="close" size={20} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.checkmark}>
            {loading ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <Icon name="check-circle" size={40} color="white" />
            )}
          </View>

          <Text style={styles.title}>Download Complete!</Text>
          <Text style={styles.subtitle}>Your file has been saved successfully</Text>

          <View style={styles.fileInfo}>
            <View style={styles.fileIcon}>
              <Icon
                name={filename.endsWith('.pdf') ? 'picture-as-pdf' : 'description'}
                size={20}
                color={theme.primary}
              />
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {filename}
              </Text>
              <Text style={styles.fileSize}>{filesize} • Downloads folder</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleOpenFile}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon name="folder-open" size={18} color={theme.primaryForeground} />
              <Text style={styles.primaryButtonText}>Open File</Text>
            </TouchableOpacity>

            <View style={styles.secondaryButtonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleShare}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Icon name="share" size={16} color={theme.text} />
                <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleOpenFolder}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Icon name="folder" size={16} color={theme.text} />
                <Text style={styles.secondaryButtonText}>Folder</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>File saved to Downloads • Tap outside to close</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}
