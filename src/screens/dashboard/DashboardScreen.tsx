import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../context/ToastContext'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { LoadingScreen } from '../../components/loading/LoadingScreen'
import { Header } from '../../components/navigation/Header'
import { Skeleton, SkeletonText } from '../../components/loading/Skeleton'
import { spacing, typography, borderRadius } from '../../theme'
import { DashboardNavigationProp } from '../../navigation/types'
import { 
  dashboardService, 
  DashboardStats, 
  SalesData
} from '../../services/api/ApiServices'

interface ActivityItem {
  id: string
  type: 'product' | 'order' | 'inventory' | 'low-stock'
  title: string
  description: string
  timestamp: string
  status?: 'success' | 'warning' | 'error' | 'info'
}

export const DashboardScreen: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useSession()
  const { showError, showSuccess, showInfo } = useToast()
  const navigation = useNavigation<DashboardNavigationProp>()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false) // Start with false, set to true when needed
  const [refreshing, setRefreshing] = useState(false)

  // Debug loading state changes
  useEffect(() => {
    console.log('Loading state changed to:', loading)
  }, [loading])

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    console.log('Starting fetchDashboardData, isRefresh:', isRefresh, 'current loading:', loading)
    
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      console.log('Fetching dashboard data...')
      
      // Try to fetch stats first
      const statsData = await dashboardService.getStats()
      console.log('Stats data received:', statsData)
      setStats(statsData)

      // Try other endpoints - but don't wait for them
      dashboardService.getSalesData()
        .then(salesResponse => {
          console.log('Sales data:', salesResponse)
          setSalesData(salesResponse)
        })
        .catch(error => {
          console.log('Sales data API failed:', error)
          setSalesData([])
        })

      dashboardService.getRecentOrders()
        .then(ordersResponse => {
          console.log('Recent orders:', ordersResponse)
          setRecentOrders(ordersResponse)
        })
        .catch(error => {
          console.log('Recent orders API failed:', error)
          setRecentOrders([])
        })

      dashboardService.getLowStockItems()
        .then(lowStockResponse => {
          console.log('Low stock items:', lowStockResponse)
          console.log('Low stock item structure:', JSON.stringify(lowStockResponse[0], null, 2))
          setLowStockItems(lowStockResponse)
        })
        .catch(error => {
          console.log('Low stock API failed:', error)
          setLowStockItems([])
        })

      // Show success message only on first load
      if (!isRefresh) {
        console.log('Showing success toast')
        showSuccess('Dashboard Loaded', 'Welcome to Tiles Inventory')
      }
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      showError('Error', 'Failed to fetch dashboard data')
      
      // Set fallback data even on error
      setStats({
        totalProducts: 0,
        monthlySales: 0,
        purchaseOrders: 0,
        lowStockItems: 1
      })
    } finally {
      console.log('Finishing fetchDashboardData, setting loading to false')
      setLoading(false)
      setRefreshing(false)
    }
  }, [showError, showSuccess]) // Add back the toast dependencies

  // Load dashboard data on mount
  useEffect(() => {
    console.log('Dashboard useEffect triggered')
    fetchDashboardData()
    
    // Force loading to false after 5 seconds as a safety net
    const timeoutId = setTimeout(() => {
      console.log('Safety timeout: forcing loading to false')
      setLoading(false)
    }, 5000)
    
    return () => clearTimeout(timeoutId)
  }, []) // Empty dependency array - only run once on mount

  const onRefresh = useCallback(() => {
    fetchDashboardData(true)
  }, [fetchDashboardData])

  const generateRecentActivity = useCallback((): ActivityItem[] => {
    const activities: ActivityItem[] = []
    
    // Add recent orders
    recentOrders.slice(0, 3).forEach((order, index) => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: `Order ${order.orderNumber}`,
        description: `${order.status.toLowerCase()} - $${order.totalAmount?.toFixed(2) || '0.00'}`,
        timestamp: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
        status: order.status === 'DELIVERED' ? 'success' : 'info'
      })
    })

    // Add low stock alerts
    lowStockItems.slice(0, 2).forEach((item, index) => {
      const productName = item?.product?.name || item?.name || 'Unknown Product'
      const quantity = item?.quantity || 0
      
      activities.push({
        id: `low-stock-${item.id || index}`,
        type: 'low-stock',
        title: `Low Stock Alert`,
        description: `${productName} - ${quantity} units left`,
        timestamp: `${index + 2} hours ago`,
        status: 'warning'
      })
    })

    return activities.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }, [recentOrders, lowStockItems])

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    onPress?: () => void
  ) => (
    <Card
      style={[styles.statCard, { flex: 1, marginHorizontal: spacing.xs }]}
      touchable={!!onPress}
      onPress={onPress}
      padding="base"
      margin="none"
    >
      <View style={styles.statCardContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color={theme.textInverse} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </Card>
  )

  const renderStatCardSkeleton = () => (
    <Card style={[styles.statCard, { flex: 1, marginHorizontal: spacing.xs }]} padding="base" margin="none">
      <View style={styles.statCardContent}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={60} height={24} style={{ marginTop: spacing.sm }} />
        <Skeleton width={80} height={16} style={{ marginTop: spacing.xs }} />
      </View>
    </Card>
  )

  const renderActivityItem = ({ item }: { item: ActivityItem }) => {
    const getActivityIcon = () => {
      switch (item.type) {
        case 'product': return 'inventory'
        case 'order': return 'shopping-cart'
        case 'inventory': return 'storage'
        case 'low-stock': return 'warning'
        default: return 'circle'
      }
    }

    const getActivityColor = () => {
      switch (item.status) {
        case 'success': return theme.success
        case 'warning': return theme.warning
        case 'error': return theme.danger
        case 'info': return theme.info
        default: return theme.textSecondary
      }
    }

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor() }]}>
          <Icon name={getActivityIcon()} size={16} color={theme.textInverse} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityItemTitle}>{item.title}</Text>
          <Text style={styles.activityDescription}>{item.description}</Text>
          <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
        </View>
      </View>
    )
  }

  const renderActivitySkeleton = () => (
    <View style={styles.activityItem}>
      <Skeleton width={32} height={32} borderRadius={16} />
      <View style={styles.activityContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="80%" height={14} style={{ marginTop: spacing.xs }} />
        <Skeleton width="40%" height={12} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  )

  const renderLowStockItem = ({ item }: { item: any }) => {
    // Safely access nested properties
    const productName = item?.product?.name || item?.name || 'Unknown Product'
    const locationName = item?.location?.name || 'Unknown Location'
    const quantity = item?.quantity || 0
    
    return (
      <TouchableOpacity 
        style={styles.lowStockItem}
        onPress={() => navigation.navigate('Inventory' as never)}
      >
        <View style={styles.lowStockIcon}>
          <Icon name="warning" size={20} color={theme.warning} />
        </View>
        <View style={styles.lowStockContent}>
          <Text style={styles.lowStockItemTitle}>{productName}</Text>
          <Text style={styles.lowStockDescription}>
            {quantity} units left • {locationName}
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    )
  }

  const recentActivity = generateRecentActivity()

  // Show loading screen on initial load
  if (loading && !refreshing) {
    console.log('Showing loading screen, loading:', loading, 'refreshing:', refreshing, 'stats:', stats)
    return <LoadingScreen message="Loading dashboard data..." />
  }

  console.log('Rendering dashboard, loading:', loading, 'stats:', stats)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: spacing.base,
    },
    welcomeSection: {
      marginBottom: spacing.lg,
    },
    welcomeText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      color: theme.textSecondary,
    },
    userName: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginTop: spacing.xs,
    },
    statsContainer: {
      marginBottom: spacing.lg,
    },
    statsTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.base,
    },
    statsRow: {
      flexDirection: 'row',
      marginBottom: spacing.base,
    },
    statCard: {
      minHeight: 100,
    },
    statCardContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    statValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    statTitle: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    activitySection: {
      marginBottom: spacing.lg,
    },
    activityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    activityTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    viewAllButton: {
      fontSize: typography.fontSize.sm,
      color: theme.primary,
      fontWeight: typography.fontWeight.medium,
    },
    activityCard: {
      padding: 0,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    activityContent: {
      flex: 1,
    },
    activityItemTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    activityDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    activityTimestamp: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
    },
    lowStockSection: {
      marginBottom: spacing.lg,
    },
    lowStockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    lowStockTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    lowStockCard: {
      padding: 0,
    },
    lowStockItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    lowStockIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.warning + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    lowStockContent: {
      flex: 1,
    },
    lowStockItemTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    lowStockDescription: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
    },
    quickActionsSection: {
      marginBottom: spacing.lg,
    },
    quickActionsTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.base,
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: spacing.base,
    },
    quickActionButton: {
      flex: 1,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
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
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Overview</Text>
          
          <View style={styles.statsRow}>
            {loading ? (
              <>
                {renderStatCardSkeleton()}
                {renderStatCardSkeleton()}
                {renderStatCardSkeleton()}
              </>
            ) : (
              <>
                {renderStatCard(
                  'Products', 
                  stats?.totalProducts || 0, 
                  'inventory', 
                  theme.primary,
                  () => navigation.navigate('Inventory' as never)
                )}
                {renderStatCard(
                  'Low Stock', 
                  stats?.lowStockItems || 0, 
                  'warning', 
                  theme.warning,
                  () => navigation.navigate('Inventory' as never)
                )}
                {renderStatCard(
                  'Purchase Orders', 
                  stats?.purchaseOrders || 0, 
                  'shopping-cart', 
                  theme.info
                )}
              </>
            )}
          </View>

          <View style={styles.statsRow}>
            {loading ? (
              <>
                {renderStatCardSkeleton()}
              </>
            ) : (
              <>
                {renderStatCard(
                  'Monthly Sales', 
                  `$${(stats?.monthlySales || 0).toLocaleString()}`, 
                  'attach-money', 
                  theme.success
                )}
              </>
            )}
          </View>
        </View>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View style={styles.lowStockSection}>
            <View style={styles.lowStockHeader}>
              <Text style={styles.lowStockTitle}>Low Stock Alerts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Inventory' as never)}>
                <Text style={styles.viewAllButton}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <Card style={styles.lowStockCard}>
              <FlatList
                data={lowStockItems.slice(0, 3)}
                renderItem={renderLowStockItem}
                keyExtractor={(item, index) => item.id || `low-stock-${index}`}
                scrollEnabled={false}
              />
            </Card>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.activityCard}>
            {loading ? (
              <>
                {renderActivitySkeleton()}
                {renderActivitySkeleton()}
                {renderActivitySkeleton()}
              </>
            ) : recentActivity.length > 0 ? (
              <FlatList
                data={recentActivity}
                renderItem={renderActivityItem}
                keyExtractor={(item, index) => item.id || `activity-${index}`}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.activityItem}>
                <Text style={styles.activityDescription}>No recent activity</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <LoadingButton
              title="Add Product"
              onPress={() => navigation.navigate('ProductForm' as never)}
              variant="primary"
              style={styles.quickActionButton}
            />
            <LoadingButton
              title="New Order"
              onPress={() => navigation.navigate('OrderForm' as never)}
              variant="secondary"
              style={styles.quickActionButton}
            />
          </View>
          <View style={[styles.quickActionsRow, { marginTop: spacing.base }]}>
            <LoadingButton
              title="Purchase Orders"
              onPress={() => navigation.navigate('PurchaseOrderList' as never)}
              variant="outline"
              style={styles.quickActionButton}
            />
            <LoadingButton
              title="Sales Orders"
              onPress={() => navigation.navigate('SalesOrderList' as never)}
              variant="outline"
              style={styles.quickActionButton}
            />
          </View>
          <View style={[styles.quickActionsRow, { marginTop: spacing.base }]}>
            <LoadingButton
              title="View Products"
              onPress={() => navigation.navigate('ProductList' as never)}
              variant="outline"
              style={styles.quickActionButton}
            />
            <LoadingButton
              title="Reports"
              onPress={() => navigation.navigate('Reports' as never)}
              variant="outline"
              style={styles.quickActionButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}