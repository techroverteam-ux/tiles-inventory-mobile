import React from 'react'
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { spacing, borderRadius, shadows } from '../../theme'

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: keyof typeof spacing
  margin?: keyof typeof spacing
  shadow?: keyof typeof shadows
  touchable?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'base',
  margin = 'md',
  shadow = 'base',
  touchable = false,
  ...props
}) => {
  const { theme } = useTheme()

  const getCardStyles = (): ViewStyle => ({
    backgroundColor: theme.card,
    borderRadius: borderRadius.md,
    padding: spacing[padding],
    marginBottom: spacing[margin],
    ...shadows[shadow],
    shadowColor: theme.shadow,
  })

  const cardStyles = [getCardStyles(), style]

  if (touchable) {
    return (
      <TouchableOpacity
        style={cardStyles}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  )
}