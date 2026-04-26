import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { spacing, typography, borderRadius } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface SettingsScreenProps {
  navigation: any
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme()
  const { user, logout } = useSession()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
  })

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout()
            showSuccess('Logged out successfully')
          },
        },
      ]
    )
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // API call to update profile
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000)) // Mock API call
      showSuccess('Profile updated successfully')
    } catch (error) {
      showError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const SettingsSection: React.FC<{
    title: string
    children: React.ReactNode
  }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <Card style={styles.sectionCard} padding="none">
        {children}
      </Card>
    </View>
  )

  const SettingsItem: React.FC<{
    icon: string
    title: string
    subtitle?: string
    onPress?: () => void
    rightComponent?: React.ReactNode
    showArrow?: boolean
    color?: string
  }> = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true, color }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIcon, { backgroundColor: withOpacity(color || theme.primary, 0.12) }]}>
          <Icon name={icon} size={20} color={color || theme.primary} />
        </View>
        <View style={styles.settingsText}>
          <Text style={[styles.settingsTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Icon name="chevron-right" size={20} color={theme.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: spacing.base,
    },
    profileCard: {
      alignItems: 'center',
      marginBottom: spacing.lg,
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
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textInverse,
    },
    userName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    sectionCard: {
      overflow: 'hidden',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingsIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.base,
    },
    settingsText: {
      flex: 1,
    },
    settingsTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    settingsSubtitle: {
      fontSize: typography.fontSize.sm,
      marginTop: spacing.xs,
    },
    settingsItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    profileForm: {
      gap: spacing.base,
      marginBottom: spacing.base,
    },
    dangerZone: {
      borderColor: withOpacity(theme.error, 0.3),
      borderWidth: 1,
      backgroundColor: withOpacity(theme.error, 0.05),
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Settings"
        showBack
        navigation={navigation}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard} padding="lg">
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@example.com'}</Text>
        </Card>

        {/* Profile Settings */}
        <SettingsSection title="Profile Information">
          <View style={[styles.settingsItem, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={styles.profileForm}>
              <TextInput
                label="Full Name"
                value={profileData.name}
                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                placeholder="Enter your full name"
              />
              <TextInput
                label="Email Address"
                value={profileData.email}
                onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <TextInput
                label="Phone Number"
                value={profileData.phone}
                onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
            <LoadingButton
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={loading}
              variant="primary"
            />
          </View>
        </SettingsSection>

        {/* App Settings */}
        <SettingsSection title="App Settings">
          <SettingsItem
            icon={isDark ? 'wb-sunny' : 'nightlight-round'}
            title="Dark Mode"
            subtitle={isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            onPress={toggleTheme}
            showArrow={false}
          />
          <SettingsItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingsItem
            icon="language"
            title="Language"
            subtitle="English (Default)"
            onPress={() => showSuccess('Language settings coming soon')}
          />
        </SettingsSection>

        {/* Management */}
        <SettingsSection title="Data Management">
          <SettingsItem
            icon="people"
            title="Brand Management"
            subtitle="Manage brands and suppliers"
            onPress={() => navigation.navigate('BrandManagement')}
            color={theme.info}
          />
          <SettingsItem
            icon="palette"
            title="Category Management"
            subtitle="Organize product categories"
            onPress={() => navigation.navigate('CategoryManagement')}
            color={theme.warning}
          />
          <SettingsItem
            icon="straighten"
            title="Size Management"
            subtitle="Configure product sizes"
            onPress={() => navigation.navigate('SizeManagement')}
            color={theme.success}
          />
          <SettingsItem
            icon="location-on"
            title="Location Management"
            subtitle="Manage warehouse locations"
            onPress={() => navigation.navigate('LocationManagement')}
            color={theme.primary}
          />
        </SettingsSection>

        {/* Reports & Analytics */}
        <SettingsSection title="Reports & Analytics">
          <SettingsItem
            icon="description"
            title="Reports"
            subtitle="View detailed reports"
            onPress={() => navigation.navigate('Reports')}
            color={theme.info}
          />
          <SettingsItem
            icon="search"
            title="Global Search"
            subtitle="Search across all data"
            onPress={() => navigation.navigate('GlobalSearch')}
            color={theme.warning}
          />
        </SettingsSection>

        {/* Admin Functions */}
        <SettingsSection title="Admin Functions">
          <SettingsItem
            icon="admin-panel-settings"
            title="Admin Panel"
            subtitle="Complete administrative control"
            onPress={() => navigation.navigate('AdminPanel')}
            color={theme.primary}
          />
          <SettingsItem
            icon="build"
            title="Admin Functions"
            subtitle="Database cleanup and maintenance"
            onPress={() => navigation.navigate('AdminFunctions')}
            color={theme.error}
          />
          <SettingsItem
            icon="backup"
            title="Data Backup"
            subtitle="Export and backup data"
            onPress={() => navigation.navigate('AdminPanel')}
            color={theme.success}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsItem
            icon="help"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => showSuccess('Support feature coming soon')}
          />
          <SettingsItem
            icon="info"
            title="About"
            subtitle="App version and information"
            onPress={() => Alert.alert('About', 'Tiles Inventory Mobile v1.0.0')}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <Card style={[styles.section, styles.dangerZone]} padding="lg">
          <Text style={[styles.sectionTitle, { color: theme.error }]}>⚠️ Danger Zone</Text>
          <SettingsItem
            icon="logout"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            color={theme.error}
            showArrow={false}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}