import React from 'react'
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'

interface ImagePreviewProps {
  visible: boolean
  imageUrl: string | null
  onClose: () => void
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  visible,
  imageUrl,
  onClose,
}) => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    image: {
      width: screenWidth,
      height: screenHeight,
      resizeMode: 'contain',
    },
  })

  if (!imageUrl) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modal}>
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </TouchableOpacity>
      </View>
    </Modal>
  )
}