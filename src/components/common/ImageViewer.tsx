import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Share from 'react-native-share'
import RNFS from 'react-native-fs'
import { useTheme } from '../../context/ThemeContext'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface ImageViewerProps {
  visible: boolean
  imageUri: string
  onClose: () => void
  title?: string
  allowDownload?: boolean
  allowShare?: boolean
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  imageUri,
  onClose,
  title,
  allowDownload = true,
  allowShare = true,
}) => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Animation values
  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const originX = useSharedValue(0)
  const originY = useSharedValue(0)

  // Refs
  const panRef = useRef()
  const pinchRef = useRef()

  const resetTransform = () => {
    scale.value = withSpring(1)
    translateX.value = withSpring(0)
    translateY.value = withSpring(0)
  }

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      originX.value = event.focalX
      originY.value = event.focalY
    },
    onActive: (event) => {
      scale.value = Math.max(0.5, Math.min(event.scale, 3))
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1)
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    },
  })

  const panHandler = useAnimatedGestureHandler({
    onStart: () => {
      // Store initial values
    },
    onActive: (event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX
        translateY.value = event.translationY
      }
    },
    onEnd: () => {
      // Boundary checks
      const maxTranslateX = (screenWidth * (scale.value - 1)) / 2
      const maxTranslateY = (screenHeight * (scale.value - 1)) / 2

      if (translateX.value > maxTranslateX) {
        translateX.value = withSpring(maxTranslateX)
      } else if (translateX.value < -maxTranslateX) {
        translateX.value = withSpring(-maxTranslateX)
      }

      if (translateY.value > maxTranslateY) {
        translateY.value = withSpring(maxTranslateY)
      } else if (translateY.value < -maxTranslateY) {
        translateY.value = withSpring(-maxTranslateY)
      }
    },
  })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }
  })

  const handleDownload = async () => {
    if (!imageUri) return

    try {
      setLoading(true)
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `image-${timestamp}.jpg`
      
      // Download path
      const downloadPath = `${RNFS.DownloadDirectoryPath}/${filename}`
      
      // Download the image
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUri,
        toFile: downloadPath,
      }).promise

      if (downloadResult.statusCode === 200) {
        Alert.alert(
          'Download Complete',
          `Image saved to Downloads folder as ${filename}`,
          [{ text: 'OK' }]
        )
      } else {
        throw new Error('Download failed')
      }
    } catch (error) {
      console.error('Download error:', error)
      Alert.alert('Download Failed', 'Failed to download image')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!imageUri) return

    try {
      setLoading(true)
      
      const shareOptions = {
        title: title || 'Share Image',
        message: title || 'Shared from Tiles Inventory App',
        url: imageUri,
        type: 'image/jpeg',
      }

      await Share.open(shareOptions)
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Share error:', error)
        Alert.alert('Share Failed', 'Failed to share image')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetTransform()
    setImageLoaded(false)
    onClose()
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Image'}
          </Text>
          
          <View style={styles.headerActions}>
            {allowShare && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleShare}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Icon name="share" size={24} color="white" />
                )}
              </TouchableOpacity>
            )}
            
            {allowDownload && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleDownload}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Icon name="file-download" size={24} color="white" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <PinchGestureHandler
            ref={pinchRef}
            onGestureEvent={pinchHandler}
            simultaneousHandlers={panRef}
          >
            <Animated.View style={styles.imageWrapper}>
              <PanGestureHandler
                ref={panRef}
                onGestureEvent={panHandler}
                simultaneousHandlers={pinchRef}
                minPointers={1}
                maxPointers={1}
              >
                <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoadStart={() => setImageLoaded(false)}
                    onLoadEnd={() => setImageLoaded(true)}
                    onError={() => {
                      setImageLoaded(true)
                      Alert.alert('Error', 'Failed to load image')
                    }}
                  />
                  
                  {!imageLoaded && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="white" />
                      <Text style={styles.loadingText}>Loading image...</Text>
                    </View>
                  )}
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </View>

        {/* Footer with instructions */}
        <View style={[styles.footer, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <Text style={styles.instructionText}>
            Pinch to zoom • Drag to pan • Double tap to reset
          </Text>
        </View>

        {/* Double tap to reset */}
        <TouchableOpacity
          style={styles.doubleTapArea}
          onPress={resetTransform}
          activeOpacity={1}
        />
      </View>
    </Modal>
  )
}

// Thumbnail component with viewer integration
interface ImageThumbnailProps {
  imageUri: string
  title?: string
  style?: any
  onPress?: () => void
  allowDownload?: boolean
  allowShare?: boolean
  placeholder?: string
}

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  imageUri,
  title,
  style,
  onPress,
  allowDownload = true,
  allowShare = true,
  placeholder = 'No Image',
}) => {
  const { theme } = useTheme()
  const [viewerVisible, setViewerVisible] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      setViewerVisible(true)
    }
  }

  if (!imageUri) {
    return (
      <View style={[styles.thumbnail, styles.placeholderContainer, style, { backgroundColor: theme.muted }]}>
        <Icon name="image" size={32} color={theme.mutedForeground} />
        <Text style={[styles.placeholderText, { color: theme.mutedForeground }]}>
          {placeholder}
        </Text>
      </View>
    )
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.thumbnail, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onLoadStart={() => setImageLoaded(false)}
          onLoadEnd={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <View style={styles.thumbnailLoading}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        )}
        
        <View style={styles.thumbnailOverlay}>
          <Icon name="zoom-in" size={20} color="white" />
        </View>
      </TouchableOpacity>

      <ImageViewer
        visible={viewerVisible}
        imageUri={imageUri}
        title={title}
        onClose={() => setViewerVisible(false)}
        allowDownload={allowDownload}
        allowShare={allowShare}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    paddingBottom: 12,
    zIndex: 1,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: screenWidth,
    height: screenHeight - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  doubleTapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: 0,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
})