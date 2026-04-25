import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { apiClient } from '../../services/api/ApiClient'
import { spacing, typography, borderRadius } from '../../theme'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImage?: string
  label?: string
  disabled?: boolean
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImage,
  label = 'Upload Image',
  disabled = false
}) => {
  const { theme } = useTheme()
  const { showError, showSuccess } = useToast()
  const [uploading, setUploading] = useState(false)
  const [localImage, setLocalImage] = useState<string | null>(null)

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    uploadArea: {
      width: 200,
      height: 200,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.base,
    },
    uploadAreaActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '10',
    },
    uploadedImage: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.lg,
    },
    uploadContent: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    uploadIcon: {
      marginBottom: spacing.sm,
    },
    uploadText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
      textAlign: 'center',
    },
    uploadSubtext: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      gap: spacing.xs,
    },
    primaryButton: {
      backgroundColor: theme.primary,
    },
    secondaryButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    buttonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    primaryButtonText: {
      color: theme.textInverse,
    },
    secondaryButtonText: {
      color: theme.text,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.lg,
    },
    label: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.sm,
    },
  })

  const pickImage = () => {
    if (disabled) return

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as any,
    }

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0]
        if (asset.uri) {
          setLocalImage(asset.uri)
          uploadImage(asset)
        }
      }
    })
  }

  const uploadImage = async (asset: any) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'image.jpg',
      } as any)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.ok) {
        const data = await response.json()
        onImageUploaded(data.url)
        showSuccess('Image uploaded successfully')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      showError('Failed to upload image')
      setLocalImage(null)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setLocalImage(null)
            onImageUploaded('')
          },
        },
      ]
    )
  }

  const displayImage = localImage || currentImage
  const hasImage = !!displayImage

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.uploadArea,
          !hasImage && !disabled && styles.uploadAreaActive,
        ]}
        onPress={hasImage ? undefined : pickImage}
        disabled={disabled || uploading}
      >
        {hasImage ? (
          <>
            <Image source={{ uri: displayImage }} style={styles.uploadedImage} />
            {uploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}
          </>
        ) : (
          <View style={styles.uploadContent}>
            {uploading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <>
                <Icon
                  name="cloud-upload"
                  size={48}
                  color={theme.textSecondary}
                  style={styles.uploadIcon}
                />
                <Text style={styles.uploadText}>Tap to upload image</Text>
                <Text style={styles.uploadSubtext}>
                  JPG, PNG up to 10MB
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>

      {hasImage && !uploading && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={pickImage}
            disabled={disabled}
          >
            <Icon name="edit" size={16} color={theme.text} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Change
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={removeImage}
            disabled={disabled}
          >
            <Icon name="delete" size={16} color={theme.error} />
            <Text style={[styles.buttonText, { color: theme.error }]}>
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}