import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { spacing, typography } from '../../theme'

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: spacing.xl,
    },
    loadingContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    spinner: {
      marginBottom: spacing.base,
    },
    message: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    appName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      textAlign: 'center',
      marginTop: spacing.base,
    },
  })

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/hot-logo-cropped.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={theme.primary} 
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
      
      <Text style={styles.appName}>Tiles Inventory</Text>
    </View>
  )
}