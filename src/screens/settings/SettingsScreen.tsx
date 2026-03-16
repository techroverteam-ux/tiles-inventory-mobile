import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { spacing, typography, borderRadius } from '../../theme'
import { SettingsNavigationProp } from '../../navigation/types'

interface SettingsItemProps {
  icon: string
  title: string
  subtitle?: string
  onPress?: () => void
  rightElement?: React.ReactNode
  showArrow?: boolean
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = true
}) => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.gray100,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.base,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginTop: 2,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
  })

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color={theme.textSecondary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.rightSection}>
        {rightElement}
        {showArrow && onPress && (
          <Icon name="chevron-right" size={20} color={theme.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  )
}

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme()
  const { user, logout } = useSession()
  const navigation = useNavigation<SettingsNavigationProp>()

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout()
          }
        }
      ]
    )
  }

  const handleThemeChange = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light')
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: spacing.base,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    profileCard: {
      alignItems: 'center',
      padding: spacing.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.base,
    },
    avatarText: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.textInverse,
    },
    userName: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
    },
    userRole: {
      fontSize: typography.fontSize.sm,
      color: theme.primary,
      fontWeight: typography.fontWeight.medium,
    },
    sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.base,
      marginTop: spacing.lg,
    },
    settingsCard: {
      padding: 0,
      marginBottom: spacing.base,
    },
    logoutButton: {
      marginTop: spacing.lg,
    },
    version: {
      textAlign: 'center',
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginTop: spacing.lg,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Card style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.userRole}>{user?.role || 'User'}</Text>
          </Card>
        </View>

        {/* App Settings */}
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="palette"
            title="Dark Mode"
            subtitle={`Currently ${isDark ? 'enabled' : 'disabled'}`}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={handleThemeChange}
                trackColor={{ false: theme.gray300, true: theme.primary }}
                thumbColor={theme.surface}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="color-lens"
            title="Theme Settings"
            subtitle="Customize appearance"
            onPress={() => navigation.navigate('ThemeSettings')}
          />
          <SettingsItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => {}}
          />
          <SettingsItem
            icon="language"
            title="Language"
            subtitle="English"
            onPress={() => {}}
          />
        </Card>

        {/* Data Management */}
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="category"
            title="Brand Management"
            subtitle="Manage product brands"
            onPress={() => navigation.navigate('BrandManagement' as never)}
          />
          <SettingsItem
            icon="label"
            title="Category Management"
            subtitle="Manage product categories"
            onPress={() => navigation.navigate('CategoryManagement' as never)}
          />
          <SettingsItem
            icon="straighten"
            title="Size Management"
            subtitle="Manage product sizes"
            onPress={() => navigation.navigate('SizeManagement' as never)}
          />
          <SettingsItem
            icon="location-on"
            title="Location Management"
            subtitle="Manage storage locations"
            onPress={() => navigation.navigate('LocationManagement' as never)}
          />
        </Card>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="person"
            title="Profile"
            subtitle="Edit your profile information"
            onPress={() => navigation.navigate('Profile')}
          />
          <SettingsItem
            icon="security"
            title="Security"
            subtitle="Password and security settings"
            onPress={() => {}}
          />
          <SettingsItem
            icon="backup"
            title="Backup & Sync"
            subtitle="Manage data synchronization"
            onPress={() => {}}
          />
        </Card>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="help"
            title="Help & FAQ"
            subtitle="Get help and find answers"
            onPress={() => {}}
          />
          <SettingsItem
            icon="feedback"
            title="Send Feedback"
            subtitle="Help us improve the app"
            onPress={() => {}}
          />
          <SettingsItem
            icon="info"
            title="About"
            subtitle="App version and information"
            onPress={() => navigation.navigate('About')}
          />
        </Card>

        {/* Logout Button */}
        <LoadingButton
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
          fullWidth
        />

        <Text style={styles.version}>
          Tiles Inventory Mobile v1.0.0
        </Text>
      </ScrollView>
    </View>
  )
}