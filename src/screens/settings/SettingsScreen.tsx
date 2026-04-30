import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { getCommonStyles } from '../../theme/commonStyles'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { apiClient } from '../../services/api/ApiClient'
import { spacing, typography, borderRadius } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface SettingsScreenProps {
  navigation: any
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme()
  const { user, logout } = useSession()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@tiles.com',
  })

  const [companyData, setCompanyData] = useState({
    name: 'Tiles Showroom',
    address: '123 Tile Street',
  })

  const commonStyles = getCommonStyles(theme)

  const handleLogout = () => {
    showWarning('Logout', 'Are you sure you want to logout?', {
      action: {
        label: 'Logout',
        onPress: () => {
          logout()
          showSuccess('Logged out successfully')
        },
      },
    })
  }

  const handleDeleteAllData = () => {
    showWarning(
      'Delete All Data',
      'This will permanently wipe ALL brands, categories, products, inventory, and orders. This CANNOT be undone.',
      {
        action: {
          label: 'I Understand',
          onPress: () => {
            showWarning('Final Confirmation', 'Are you absolutely sure? All data will be permanently deleted.', {
              action: {
                label: 'Delete Everything',
                onPress: async () => {
                  try {
                    await apiClient.post('/admin/danger', { action: 'delete-all-data' })
                    showSuccess('All data deleted')
                  } catch {
                    showError('Failed to delete data')
                  }
                },
              },
            })
          },
        },
      }
    )
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await apiClient.put('/auth/profile', { name: profileData.name })
      showSuccess('Profile updated successfully')
    } catch (error) {
      showError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompany = async () => {
    showSuccess('Company info saved locally')
  }

  const SettingsSection: React.FC<{
    title: string
    children: React.ReactNode
  }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
    showArrow?: boolean
    color?: string
  }> = ({ icon, title, subtitle, onPress, showArrow = true, color }) => (
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
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && onPress && (
        <View style={styles.settingsItemRight}>
          <Icon name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    headerArea: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    screenTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    screenSubtitle: {
      fontSize: 14,
      color: theme.mutedForeground,
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsCard: {
      marginBottom: 20,
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
    },
    cardIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    inputField: {
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.text,
      fontSize: 14,
      fontWeight: '500',
    },
    saveBtn: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    saveBtnText: {
      color: theme.primaryForeground,
      fontWeight: 'bold',
      fontSize: 14,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
      marginLeft: 8,
    },
    sectionCard: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flex: 1,
    },
    settingsIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsText: {
      flex: 1,
    },
    settingsTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    settingsSubtitle: {
      fontSize: 12,
      color: theme.mutedForeground,
    },
    settingsItemRight: {
      marginLeft: 12,
    },
    dangerZone: {
      borderColor: theme.error,
      borderWidth: 1,
    },
    fab: {
      position: 'absolute',
      right: spacing.base,
      bottom: spacing.base,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <MainHeader />
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>
          <Icon name="notifications-none" size={14} color={theme.mutedForeground} style={{ marginRight: 6 }} /> Manage your account and application preferences
        </Text>
      </View>
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Settings Card */}
        <Card style={[commonStyles.glassCard, styles.settingsCard]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <Icon name="person-outline" size={20} color="#60a5fa" />
            </View>
            <Text style={styles.cardTitle}>Profile Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.inputField}
              value={profileData.name}
              onChangeText={(text) => setProfileData({ ...profileData, name: text })}
              placeholder="Admin User"
              placeholderTextColor={theme.mutedForeground}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.inputField}
              value={profileData.email}
              onChangeText={(text) => setProfileData({ ...profileData, email: text })}
              placeholder="admin@tiles.com"
              keyboardType="email-address"
              placeholderTextColor={theme.mutedForeground}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
            <Text style={styles.saveBtnText}>Save Profile Changes</Text>
          </TouchableOpacity>
        </Card>

        {/* Company Settings Card */}
        <Card style={[commonStyles.glassCard, styles.settingsCard]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <Icon name="business" size={20} color="#60a5fa" />
            </View>
            <Text style={styles.cardTitle}>Company Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name</Text>
            <TextInput
              style={styles.inputField}
              value={companyData.name}
              onChangeText={(text) => setCompanyData({ ...companyData, name: text })}
              placeholderTextColor={theme.mutedForeground}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Address</Text>
            <TextInput
              style={styles.inputField}
              value={companyData.address}
              onChangeText={(text) => setCompanyData({ ...companyData, address: text })}
              placeholderTextColor={theme.mutedForeground}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCompany}>
            <Text style={styles.saveBtnText}>Update Company Info</Text>
          </TouchableOpacity>
        </Card>

        {/* Additional Settings */}
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
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsItem
            icon="help"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => {}}
          />
          <SettingsItem
            icon="info"
            title="About"
            subtitle="App version and information"
            onPress={() => showInfo('About', 'House Of Tiles v1.2.0')}
          />
        </SettingsSection>

        <Card style={[styles.section, styles.dangerZone]} padding="lg">
          <Text style={[styles.sectionTitle, { color: theme.error, marginLeft: 0 }]}>⚠️ Danger Zone</Text>
          <SettingsItem
            icon="logout"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            color={theme.error}
            showArrow={false}
          />
          <SettingsItem
            icon="delete-forever"
            title="Delete All Data"
            subtitle="Permanently wipe all inventory data"
            onPress={handleDeleteAllData}
            color={theme.error}
            showArrow={false}
          />
        </Card>
      </ScrollView>

      {/* local FAB removed; profile is available via header profile menu */}
    </SafeAreaView>
  )
}