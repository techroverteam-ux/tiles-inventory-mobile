import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { MobileHeader } from '../../components/common/MobileHeader'
import { CSVExportButton, PDFExportButton } from '../../components/common/ExportButton'
import { commonColumns } from '../../services/exportService'

const { width: screenWidth } = Dimensions.get('window')

interface DashboardStats {
  totalProducts: number
  totalInventory: number
  lowStockItems: number
  totalOrders: number
  totalSales: number
  totalPurchases: number
  activeLocations: number
  activeBrands: number
}

interface RecentActivity {
  id: string
  type: 'product' | 'order' | 'inventory' | 'movement'
  title: string
  subtitle: string
  timestamp: string
  icon: string
  color: string
}

interface QuickAction {
  id: string
  title: string
  icon: string
  color: string
  onPress: () => void
}

export const EnhancedDashboardScreen: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useSession()
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInventory: 0,
    lowStockItems: 0,
    totalOrders: 0,
    totalSales: 0,
    totalPurchases: 0,
    activeLocations: 0,
    activeBrands: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const quickActions: QuickAction[] = [
    {
      id: 'add-product',
      title: 'Add Product',
      icon: 'add-box',
      color: theme.primary,
      onPress: () => {/* Navigate to add product */},
    },
    {
      id: 'create-order',
      title: 'Create Order',
      icon: 'receipt-long',
      color: theme.success,
      onPress: () => {/* Navigate to create order */},
    },
    {
      id: 'inventory-check',
      title: 'Inventory',
      icon: 'inventory',
      color: theme.warning,
      onPress: () => {/* Navigate to inventory */},
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'analytics',
      color: theme.info,
      onPress: () => {/* Navigate to reports */},
    },
  ]

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Simulate API calls - replace with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with actual API responses
      setStats({
        totalProducts: 1247,
        totalInventory: 15680,
        lowStockItems: 23,
        totalOrders: 89,
        totalSales: 156780,
        totalPurchases: 89450,
        activeLocations: 8,
        activeBrands: 15,
      })

      setRecentActivity([
        {
          id: '1',
          type: 'product',
          title: 'New Product Added',
          subtitle: 'Ceramic Floor Tile 24x24',
          timestamp: '2 hours ago',
          icon: 'add-box',
          color: theme.primary,
        },
        {
          id: '2',
          type: 'order',
          title: 'Purchase Order Created',
          subtitle: 'PO-2026-001 - ₹45,000',
          timestamp: '4 hours ago',
          icon: 'shopping-cart',
          color: theme.success,
        },
        {
          id: '3',
          type: 'inventory',
          title: 'Low Stock Alert',
          subtitle: 'Marble Tiles - Only 5 boxes left',
          timestamp: '6 hours ago',
          icon: 'warning',
          color: theme.warning,
        },
        {
          id: '4',
          type: 'movement',
          title: 'Stock Movement',
          subtitle: 'Transferred 50 boxes to Warehouse B',
          timestamp: '1 day ago',
          icon: 'swap-horiz',
          color: theme.info,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      Alert.alert('Error', 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleSearch = async (query: string) => {
    // Mock search results - replace with actual search API
    return [
      {
        type: 'Product',
        label: `Ceramic Tile ${query}`,
        subtitle: 'Floor Tile - 24x24',
        onPress: () => {/* Navigate to product */},
      },
      {
        type: 'Brand',
        label: `${query} Brand`,
        subtitle: '15 products available',
        onPress: () => {/* Navigate to brand */},
      },
    ]
  }

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; onPress?: () => void }> = ({
    title,
    value,
    icon,
    color,
    onPress,
  }) => (
    <TouchableOpacity
      style={[
        styles.statCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={[styles.statTitle, { color: theme.mutedForeground }]}>
        {title}
      </Text>
    </TouchableOpacity>
  )

  const QuickActionCard: React.FC<{ action: QuickAction }> = ({ action }) => (
    <TouchableOpacity
      style={[
        styles.quickActionCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        }
      ]}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
        <Icon name={action.icon} size={28} color={action.color} />
      </View>
      <Text style={[styles.quickActionTitle, { color: theme.text }]}>
        {action.title}
      </Text>
    </TouchableOpacity>
  )

  const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        }
      ]}
      activeOpacity={0.7}
    >
      <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
        <Icon name={activity.icon} size={20} color={activity.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: theme.text }]}>
          {activity.title}
        </Text>
        <Text style={[styles.activitySubtitle, { color: theme.mutedForeground }]}>
          {activity.subtitle}
        </Text>
      </View>
      <Text style={[styles.activityTime, { color: theme.mutedForeground }]}>
        {activity.timestamp}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MobileHeader
        title="Dashboard"
        onSearchResults={handleSearch}
        notificationCount={3}
        onNotificationPress={() => {/* Navigate to notifications */}}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.welcomeContent}>
            <Text style={[styles.welcomeTitle, { color: theme.text }]}>
              Welcome back, {user?.name || 'User'}!
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.mutedForeground }]}>
              Here's what's happening with your inventory today.
            </Text>
          </View>
          <View style={styles.exportActions}>
            <CSVExportButton
              data={[]} // Replace with actual data
              columns={commonColumns.product}
              filename="dashboard-export"
              reportTitle="Dashboard Summary"
              size="sm"
            />
            <PDFExportButton
              data={[]} // Replace with actual data
              columns={commonColumns.product}
              filename="dashboard-export"
              reportTitle="Dashboard Summary"
              size="sm"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon="inventory"
              color={theme.primary}
              onPress={() => {/* Navigate to products */}}
            />
            <StatCard
              title="Inventory Items"
              value={stats.totalInventory}
              icon="warehouse"
              color={theme.success}
              onPress={() => {/* Navigate to inventory */}}
            />
            <StatCard
              title="Low Stock"
              value={stats.lowStockItems}
              icon="warning"
              color={stats.lowStockItems > 0 ? theme.warning : theme.success}
              onPress={() => {/* Navigate to low stock */}}
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon="receipt"
              color={theme.info}
              onPress={() => {/* Navigate to orders */}}
            />
            <StatCard
              title="Sales Value"
              value={`₹${(stats.totalSales / 1000).toFixed(0)}K`}
              icon="trending-up"
              color={theme.success}
            />
            <StatCard
              title="Purchase Value"
              value={`₹${(stats.totalPurchases / 1000).toFixed(0)}K`}
              icon="shopping-cart"
              color={theme.primary}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => {/* Navigate to full activity log */}}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionAction, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Account for bottom navigation
  },
  welcomeSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 44) / 2, // Account for margins and gap
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statCardHeader: {
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (screenWidth - 44) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
  },
  activityTime: {
    fontSize: 12,
  },
  bottomSpacing: {
    height: 20,
  },
})