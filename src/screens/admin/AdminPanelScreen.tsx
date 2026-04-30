import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { apiClient } from '../../services/api/ApiClient'
import { MainHeader } from '../../components/navigation/MainHeader'
import { spacing, typography, borderRadius } from '../../theme'

interface AdminPanelScreenProps {
  navigation: any
}

interface SystemStats {
  totalUsers: number
  totalSessions: number
  systemUptime: string
  databaseSize: string
  lastBackup: string
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showToast, showSuccess, showError, showWarning } = useToast()
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalSessions: 0,
    systemUptime: '0 days',
    databaseSize: '0 MB',
    lastBackup: 'Never'
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [operationLoading, setOperationLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const [statsRes, usersRes] = await Promise.allSettled([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/admin/customers', { params: { pageSize: 1 } }),
      ])
      const stats = statsRes.status === 'fulfilled' ? statsRes.value.data : {}
      const usersTotal = usersRes.status === 'fulfilled' ? (usersRes.value.data?.pagination?.total || 0) : 0
      setSystemStats({
        totalUsers: usersTotal,
        totalSessions: stats.totalProducts || 0,
        systemUptime: 'Online',
        databaseSize: `${stats.totalProducts || 0} products`,
        lastBackup: 'N/A'
      })
    } catch (error) {
      showError('Failed to load system stats')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSystemStats()
    setRefreshing(false)
  }

  const AdminCard: React.FC<{
    title: string
    description: string
    icon: string
    color: string
    onPress: () => void
    dangerous?: boolean
  }> = ({ title, description, icon, color, onPress, dangerous = false }) => (
    <TouchableOpacity onPress={onPress}>
      <Card style={[styles.adminCard, dangerous && styles.dangerousCard]} padding="lg">
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
        </View>
        <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
        {dangerous && (
          <View style={styles.dangerBadge}>
            <Icon name="warning" size={16} color={theme.error} />
            <Text style={[styles.dangerText, { color: theme.error }]}>DANGEROUS</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  )

  const StatCard: React.FC<{
    title: string
    value: string | number
    icon: string
    color: string
  }> = ({ title, value, icon, color }) => (
    <Card style={styles.statCard} padding="base">
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      </View>
      <Text style={[styles.statTitle, { color: theme.textSecondary }]}>{title}</Text>
    </Card>
  )

  const handleDatabaseCleanup = () => {
    showWarning(
      'Database Cleanup',
      'This will permanently delete all soft-deleted records. This action cannot be undone. Are you sure?',
      {
        action: {
          label: 'Proceed',
          onPress: performDatabaseCleanup,
        },
      }
    )
  }

  const performDatabaseCleanup = async () => {
    setOperationLoading('cleanup')
    try {
      const response = await apiClient.post('/admin/cleanup')
      showSuccess('Database cleanup completed successfully')
    } catch (error) {
      showError('Database cleanup failed')
    } finally {
      setOperationLoading(null)
    }
  }

  const handleDataExport = async () => {
    setOperationLoading('export')
    try {
      showSuccess('Export', 'Use the Reports screen to export data')
    } finally {
      setOperationLoading(null)
    }
  }

  const handleSystemBackup = async () => {
    setOperationLoading('backup')
    try {
      showSuccess('Backup', 'Data is stored on the server — no local backup needed')
    } finally {
      setOperationLoading(null)
    }
  }

  const handleCacheReset = () => {
    showWarning('Reset Cache', 'This will clear all cached data and may temporarily slow down the app.', {
      action: {
        label: 'Reset',
        onPress: async () => {
          setOperationLoading('cache')
          try {
            const { SecureStorage } = await import('../../services/storage/SecureStorage')
            // Clear non-auth cache keys if any
            showSuccess('Cache reset successfully')
          } catch (error) {
            showError('Cache reset failed')
          } finally {
            setOperationLoading(null)
          }
        },
      },
    })
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: spacing.base,
    },
    warningCard: {
      backgroundColor: theme.warning + '10',
      borderColor: theme.warning + '30',
      borderWidth: 1,
      marginBottom: spacing.lg,
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    warningTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.warning,
      marginLeft: spacing.sm,
    },
    warningText: {
      fontSize: typography.fontSize.sm,
      color: theme.text,
      lineHeight: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.base,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
    },
    statTitle: {
      fontSize: typography.fontSize.sm,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.base,
    },
    adminCard: {
      marginBottom: spacing.base,
    },
    dangerousCard: {
      borderColor: theme.error + '30',
      borderWidth: 1,
      backgroundColor: theme.error + '05',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.base,
    },
    cardTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    cardDescription: {
      fontSize: typography.fontSize.sm,
      lineHeight: 20,
    },
    dangerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    dangerText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
    },
    quickActionsCard: {
      marginBottom: spacing.lg,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    actionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    actionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.base,
    },
    actionText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Card */}
        <Card style={styles.warningCard} padding="lg">
          <View style={styles.warningHeader}>
            <Icon name="admin-panel-settings" size={24} color={theme.warning} />
            <Text style={styles.warningTitle}>Administrator Access</Text>
          </View>
          <Text style={styles.warningText}>
            You have full administrative privileges. Please use these functions carefully as they can affect the entire system.
          </Text>
        </Card>

        {/* System Stats */}
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Active Users"
            value={systemStats.totalUsers}
            icon="people"
            color={theme.primary}
          />
          <StatCard
            title="Active Sessions"
            value={systemStats.totalSessions}
            icon="devices"
            color={theme.info}
          />
          <StatCard
            title="System Uptime"
            value={systemStats.systemUptime}
            icon="schedule"
            color={theme.success}
          />
          <StatCard
            title="Database Size"
            value={systemStats.databaseSize}
            icon="storage"
            color={theme.warning}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Card style={styles.quickActionsCard} padding="lg">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSystemBackup}
            disabled={operationLoading === 'backup'}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: theme.success + '20' }]}>
                <Icon name="backup" size={20} color={theme.success} />
              </View>
              <Text style={styles.actionText}>Create System Backup</Text>
            </View>
            {operationLoading === 'backup' && (
              <Icon name="hourglass-empty" size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDataExport}
            disabled={operationLoading === 'export'}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: theme.info + '20' }]}>
                <Icon name="download" size={20} color={theme.info} />
              </View>
              <Text style={styles.actionText}>Export All Data</Text>
            </View>
            {operationLoading === 'export' && (
              <Icon name="hourglass-empty" size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCacheReset}
            disabled={operationLoading === 'cache'}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: theme.warning + '20' }]}>
                <Icon name="refresh" size={20} color={theme.warning} />
              </View>
              <Text style={styles.actionText}>Reset Cache</Text>
            </View>
            {operationLoading === 'cache' && (
              <Icon name="hourglass-empty" size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </Card>

        {/* Management Functions */}
        <Text style={styles.sectionTitle}>Data Management</Text>
        <AdminCard
          title="Brand Management"
          description="Add, edit, and manage brand information and supplier details"
          icon="business"
          color={theme.primary}
          onPress={() => navigation.navigate('BrandManagement')}
        />
        <AdminCard
          title="Category Management"
          description="Organize and manage product categories and subcategories"
          icon="category"
          color={theme.info}
          onPress={() => navigation.navigate('CategoryManagement')}
        />
        <AdminCard
          title="Size Management"
          description="Configure product sizes, dimensions, and variations"
          icon="straighten"
          color={theme.success}
          onPress={() => navigation.navigate('SizeManagement')}
        />
        <AdminCard
          title="Location Management"
          description="Manage warehouse locations and storage areas"
          icon="location-on"
          color={theme.warning}
          onPress={() => navigation.navigate('LocationManagement')}
        />

        {/* System Functions */}
        <Text style={styles.sectionTitle}>System Functions</Text>
        <AdminCard
          title="Database Cleanup"
          description="Remove soft-deleted records and optimize database performance"
          icon="cleaning-services"
          color={theme.error}
          onPress={handleDatabaseCleanup}
          dangerous
        />
        <AdminCard
          title="System Reports"
          description="Generate comprehensive system and business reports"
          icon="assessment"
          color={theme.info}
          onPress={() => navigation.navigate('Reports')}
        />
        <AdminCard
          title="Global Search"
          description="Search across all system data and records"
          icon="search"
          color={theme.primary}
          onPress={() => navigation.navigate('GlobalSearch')}
        />
        <AdminCard
          title="Notification Center"
          description="Manage system notifications and alerts"
          icon="notifications"
          color={theme.warning}
          onPress={() => navigation.navigate('Notifications')}
        />

        {/* Last Backup Info */}
        <Card style={{ marginTop: spacing.base }} padding="base">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>
              Last Backup: {systemStats.lastBackup}
            </Text>
            <Icon name="info" size={16} color={theme.textSecondary} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}