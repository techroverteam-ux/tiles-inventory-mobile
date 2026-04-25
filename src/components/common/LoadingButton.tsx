import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { spacing, borderRadius, shadows } from '../../theme'

interface LoadingButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  loadingColor?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  loadingColor,
  icon,
  fullWidth = false
}) => {
  const { theme } = useTheme()
  const isDisabled = disabled || loading

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.base,
      ...shadows.sm,
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = spacing.md
        baseStyle.paddingVertical = spacing.sm
        baseStyle.minHeight = 36
        break
      case 'large':
        baseStyle.paddingHorizontal = spacing.xl
        baseStyle.paddingVertical = spacing.base
        baseStyle.minHeight = 52
        break
      default: // medium
        baseStyle.paddingHorizontal = spacing.base
        baseStyle.paddingVertical = spacing.md
        baseStyle.minHeight = 44
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = theme.primary
        break
      case 'secondary':
        baseStyle.backgroundColor = theme.secondary
        break
      case 'outline':
        baseStyle.backgroundColor = 'transparent'
        baseStyle.borderWidth = 1
        baseStyle.borderColor = theme.primary
        break
      case 'danger':
        baseStyle.backgroundColor = theme.danger
        break
      case 'success':
        baseStyle.backgroundColor = theme.success
        break
    }

    // Disabled state
    if (isDisabled) {
      baseStyle.opacity = 0.6
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%'
    }

    return baseStyle
  }

  const getTextStyles = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    }

    // Size text styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = 14
        break
      case 'large':
        baseTextStyle.fontSize = 18
        break
      default: // medium
        baseTextStyle.fontSize = 16
    }

    // Variant text styles
    switch (variant) {
      case 'outline':
        baseTextStyle.color = theme.primary
        break
      default:
        baseTextStyle.color = theme.textInverse
    }

    return baseTextStyle
  }

  const getSpinnerColor = (): string => {
    if (loadingColor) return loadingColor
    
    switch (variant) {
      case 'outline':
        return theme.primary
      default:
        return theme.textInverse
    }
  }

  const buttonStyles = [getButtonStyles(), style]
  const textStyles = [getTextStyles(), textStyle]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={getSpinnerColor()}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}