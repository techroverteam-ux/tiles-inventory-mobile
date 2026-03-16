import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { spacing, typography, shadows } from '../../theme'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBackPress?: () => void
  rightComponent?: React.ReactNode
  navigation?: any
}

export const Header: React.FC<HeaderProps> = ({
  title = 'App',
  showBack = false,
  onBackPress,
  rightComponent,
  navigation
}) => {
  const { theme } = useTheme()
  const { user } = useSession()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else if (navigation) {
      navigation.goBack()
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
      justifyContent: 'flex-end'
    },
    backButton: {
      padding: spacing.sm
    },
    menuButton: {
      padding: spacing.sm
    },
    iconButton: {
      padding: spacing.sm,
      marginLeft: spacing.sm
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text
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
              console.log('Menu button pressed, navigation:', navigation)
              if (navigation?.openDrawer) {
                navigation.openDrawer()
              } else if (navigation?.getParent?.()?.openDrawer) {
                navigation.getParent().openDrawer()
              } else {
                console.log('No openDrawer method found')
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
            <TouchableOpacity
              onPress={() => navigation?.navigate('Notifications' as never)}
              style={styles.iconButton}
            >
              <Icon name="notifications" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
}