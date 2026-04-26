import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../context/ToastContext'
import { spacing, typography, shadows } from '../../theme'

interface EnhancedHeaderProps {
  title?: string
  showBack?: boolean
  onBackPress?: () => void
  navigation?: any
  showThemeToggle?: boolean
  showExport?: boolean
  onExport?: () => void
  rightComponent?: React.ReactNode
  showProfile?: boolean
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  title = 'App',
  showBack = false,
  onBackPress,
  navigation,
  showThemeToggle = true,
  showExport = true,
  onExport,
  rightComponent,
  showProfile = true
}) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user } = useSession()
  const { showSuccess } = useToast()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else if (navigation) {
      navigation.goBack()
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      showSuccess('Export feature coming soon!')
    }
  }

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      ...shadows.sm,
      shadowColor: theme.shadow,
    },
    leftSection: {
      flex: 1,
      alignItems: 'flex-start'
    },
    centerSection: {
      flex: 2,
      alignItems: 'center'
    },
    rightSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    backButton: {
      padding: spacing.sm
    },
    menuButton: {
      padding: spacing.sm
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },    iconButton: {
      padding: spacing.sm,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    avatarText: {
      color: theme.textInverse,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold
    }
  })

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (navigation?.openDrawer) {
                navigation.openDrawer()
              } else if (navigation?.getParent?.()?.openDrawer) {
                navigation.getParent().openDrawer()
              }
            }}
            style={styles.menuButton}
          >
            <Icon name="menu" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {rightComponent || (
          <>
            {/* Theme Toggle */}
            {showThemeToggle && (
              <TouchableOpacity
                onPress={toggleTheme}
                style={styles.iconButton}
              >
                <Icon name={isDark ? 'wb-sunny' : 'nightlight-round'} size={22} color={theme.text} />
              </TouchableOpacity>
            )}

            {/* Export Button */}
            {showExport && (
              <TouchableOpacity
                onPress={handleExport}
                style={styles.iconButton}
              >
                <Icon name="download" size={22} color={theme.text} />
              </TouchableOpacity>
            )}

            {/* Notifications */}
            <TouchableOpacity
              onPress={() => navigation?.navigate('Notifications' as never)}
              style={styles.iconButton}
            >
              <Icon name="notifications" size={22} color={theme.text} />
            </TouchableOpacity>
            
            {/* Profile Avatar */}
            {showProfile && (
              <TouchableOpacity
                onPress={() => navigation?.navigate('Settings' as never)}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  )
}