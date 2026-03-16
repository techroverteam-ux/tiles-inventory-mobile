import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from './ThemeContext'
import { spacing, borderRadius, typography } from '../theme'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onPress: () => void
  }
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void
  showSuccess: (title: string, message?: string, options?: { action?: ToastMessage['action'] }) => void
  showError: (title: string, message?: string, options?: { action?: ToastMessage['action'] }) => void
  showWarning: (title: string, message?: string, options?: { action?: ToastMessage['action'] }) => void
  showInfo: (title: string, message?: string, options?: { action?: ToastMessage['action'] }) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const { width: screenWidth } = Dimensions.get('window')

const ToastItem: React.FC<{
  toast: ToastMessage
  onHide: (id: string) => void
}> = ({ toast, onHide }) => {
  const { theme } = useTheme()
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(-screenWidth))

  React.useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideToast()
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id)
    })
  }

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          background: '#10B981',
          border: '#059669',
          icon: 'check-circle',
        }
      case 'error':
        return {
          background: '#EF4444',
          border: '#DC2626',
          icon: 'error',
        }
      case 'warning':
        return {
          background: '#F59E0B',
          border: '#D97706',
          icon: 'warning',
        }
      case 'info':
        return {
          background: '#3B82F6',
          border: '#2563EB',
          icon: 'info',
        }
      default:
        return {
          background: theme.primary,
          border: theme.primary,
          icon: 'info',
        }
    }
  }

  const colors = getToastColors()

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: spacing.base,
      right: spacing.base,
      backgroundColor: colors.background,
      borderRadius: borderRadius.base,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
      padding: spacing.base,
      flexDirection: 'row',
      alignItems: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 8,
      zIndex: 9999,
    },
    iconContainer: {
      marginRight: spacing.sm,
      marginTop: 2,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    message: {
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      opacity: 0.9,
      lineHeight: 20,
    },
    actionContainer: {
      marginTop: spacing.sm,
    },
    actionButton: {
      alignSelf: 'flex-start',
    },
    actionText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: '#FFFFFF',
      textDecorationLine: 'underline',
    },
    closeButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
  })

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Icon name={colors.icon} size={20} color="#FFFFFF" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{toast.title}</Text>
        {toast.message && (
          <Text style={styles.message}>{toast.message}</Text>
        )}
        {toast.action && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={toast.action.onPress}
            >
              <Text style={styles.actionText}>{toast.action.label}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
        <Icon name="close" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString()
    const newToast: ToastMessage = { ...toast, id }
    
    setToasts(prev => [newToast, ...prev.slice(0, 2)]) // Keep max 3 toasts
  }, [])

  const showSuccess = useCallback((title: string, message?: string, options?: { action?: ToastMessage['action'] }) => {
    showToast({ type: 'success', title, message, action: options?.action })
  }, [showToast])

  const showError = useCallback((title: string, message?: string, options?: { action?: ToastMessage['action'] }) => {
    showToast({ type: 'error', title, message, action: options?.action })
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string, options?: { action?: ToastMessage['action'] }) => {
    showToast({ type: 'warning', title, message, action: options?.action })
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string, options?: { action?: ToastMessage['action'] }) => {
    showToast({ type: 'info', title, message, action: options?.action })
  }, [showToast])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
      }}
    >
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ paddingTop: 60, gap: spacing.sm }}>
          {toasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onHide={hideToast}
            />
          ))}
        </View>
      </View>
    </ToastContext.Provider>
  )
}