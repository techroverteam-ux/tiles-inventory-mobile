import React, { useState } from 'react'
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { spacing, borderRadius, typography } from '../../theme'

interface ThemedTextInputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: string
  rightIcon?: string
  onRightIconPress?: () => void
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
  labelStyle?: TextStyle
  errorStyle?: TextStyle
  required?: boolean
  showPasswordToggle?: boolean
}

export const TextInput: React.FC<ThemedTextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  required = false,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}) => {
  const { theme } = useTheme()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = secureTextEntry || showPasswordToggle
  const actualSecureTextEntry = isPassword && !isPasswordVisible

  const getContainerStyles = (): ViewStyle => ({
    marginBottom: spacing.base,
  })

  const getLabelStyles = (): TextStyle => ({
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text,
    marginBottom: spacing.sm,
  })

  const getInputContainerStyles = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: error ? theme.danger : isFocused ? theme.primary : theme.inputBorder,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  })

  const getInputStyles = (): TextStyle => ({
    flex: 1,
    fontSize: typography.fontSize.base,
    color: theme.text,
    paddingVertical: spacing.md,
  })

  const getErrorStyles = (): TextStyle => ({
    fontSize: typography.fontSize.xs,
    color: theme.danger,
    marginTop: spacing.xs,
  })

  const getIconColor = () => {
    if (error) return theme.danger
    if (isFocused) return theme.primary
    return theme.textSecondary
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <View style={[getContainerStyles(), containerStyle]}>
      {label && (
        <Text style={[getLabelStyles(), labelStyle]}>
          {label}
          {required && <Text style={{ color: theme.danger }}> *</Text>}
        </Text>
      )}
      
      <View style={getInputContainerStyles()}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={{ marginRight: spacing.sm }}
          />
        )}
        
        <RNTextInput
          {...props}
          style={[getInputStyles(), inputStyle]}
          secureTextEntry={actualSecureTextEntry}
          placeholderTextColor={theme.inputPlaceholder}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
        />
        
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{ padding: spacing.xs }}
          >
            <Icon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ padding: spacing.xs }}
          >
            <Icon
              name={rightIcon}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[getErrorStyles(), errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  )
}