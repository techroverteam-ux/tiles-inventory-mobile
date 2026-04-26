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
import { useNavigation } from '@react-navigation/native'
import { MobileHeader } from '../../components/common/MobileHeader'
import { QuickAddPanel } from '../../components/common/QuickAddPanel'
import { withOpacity } from '../../utils/colorUtils'

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
  totalCategories: number
  totalSizes: number
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

export const EnhancedDashboardScreen: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useSession()
  const navigation = useNavigation<any>()
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
    totalCategories: 0,
    totalSizes: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 800))
      setStats({
        totalProducts: 1247,
        totalInventory: 15680,
        lowStockItems: 23,
        totalOrders: 89,
        totalSales: 156780,
        totalPurchases: 89450,
        activeLocations: 8,
        activeBrands: 10,
        totalCategories: 8,
        totalSizes: 12,
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
    return [
      {
        type: 'Product',
        label: `Ceramic Tile ${query}`,
        subtitle: 'Floor Tile - 24x24',
        onPress: () => navigation.navigate('Products'),
      },
    ]
  }

  // Stat cards matching web version
  const statCards = [
    { title: 'BRANDS', value: stats.activeBrands, subtitle: 'Active Partners', icon: 'people', screen: 'BrandManagement' },
    { title: 'CATEGORIES', value: stats.totalCategories, subtitle: 'Types of products', icon: 'palette', screen: 'CategoryManagement' },
    { title: 'SIZES', value: stats.totalSizes, subtitle: 'Variations available', icon: 'straighten', screen: 'SizeManagement' },
    { title: 'PRODUCTS', value: stats.totalProducts, subtitle: 'Total items in catalog', icon: 'inventory-2', screen: 'Products' },
    { title: 'INVENTORY', value: stats.totalInventory, subtitle: 'In-stock units', icon: 'layers', screen: 'Inventory' },
    { title: 'PURCHASE ORDERS', value: stats.totalOrders, subtitle: 'Incoming stock orders', icon: 'shopping-cart', screen: 'PurchaseOrders' },
    { title: 'SALES ORDERS', value: stats.totalSales > 0 ? Math.floor(stats.totalSales / 1000) : 0, subtitle: 'Total transactions', icon: 'trending-up', screen: 'SalesOrders' },
    { title: 'LOW STOCK', value: stats.lowStockItems, subtitle: 'Items need attention', icon: 'warning', screen: 'Inventory' },
  ]

  const StatCard: React.FC<{
    title: string
    value: string | number
    subtitle: string
    icon: string
    screen: string
  }> = ({ title, value, subtitle, icon, screen }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate(screen)}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconWrap, { backgroundColor: withOpacity(theme.primary, 0.12) }]}>
        <Icon name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[styles.statCardTitle, { color: theme.mutedForeground }]}>{title}</Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color: theme.primary }]}>{value}</Text>
        <Text style={[styles.statSubtitle, { color: theme.mutedForeground }]}> {subtitle}</Text>
      </View>
    </TouchableOpacity>
  )

  const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => (
    <TouchableOpacity
      style={[styles.activityItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      activeOpacity={0.7}
    >
      <View style={[styles.activityIcon, { backgroundColor: withOpacity(activity.color, 0.12) }]}>
        <Icon name={activity.icon} size={20} color={activity.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: theme.text }]}>{activity.title}</Text>
        <Text style={[styles.activitySubtitle, { color: theme.mutedForeground }]}>{activity.subtitle}</Text>
      </View>
      <Text style={[styles.activityTime, { color: theme.mutedForeground }]}>{activity.timestamp}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MobileHeader
        title="Dashboard"
        onSearchResults={handleSearch}
        notificationCount={3}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <View style={[styles.welcomeSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.welcomeTitle, { color: theme.text }]}>
              Welcome back, {user?.name || 'User'}!
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.mutedForeground }]}>
              Here's what's happening with your inventory today.
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            {statCards.map(card => (
              <StatCard key={card.title} {...card} />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.sectionAction, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Quick Add FAB */}
      <QuickAddPanel navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  welcomeSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  welcomeTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, lineHeight: 20 },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  sectionAction: { fontSize: 14, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (screenWidth - 44) / 2,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statCardTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statSubtitle: { fontSize: 12 },
  activityList: { gap: 8 },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  activitySubtitle: { fontSize: 12 },
  activityTime: { fontSize: 12 },
  bottomSpacing: { height: 20 },
})
