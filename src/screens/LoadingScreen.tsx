import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { spacing, typography } from '../theme'

export const LoadingScreen: React.FC = () => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 80,
      height: 80,
      backgroundColor: theme.primary,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    logoText: {
      color: theme.textInverse,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>TI</Text>
      </View>
      <Text style={styles.title}>Tiles Inventory</Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  )
}