import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
}) => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
  })

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size}
        color={color || theme.primary}
      />
    </View>
  )
}