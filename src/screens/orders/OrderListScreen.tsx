import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton } from '../../components/loading/Skeleton'
import { purchaseOrderService, salesOrderService, PurchaseOrder, SalesOrder } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'

interface OrderListScreenProps {
  navigation: any
}

type OrderType = 'purchase' | 'sales'
type OrderStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'

export const OrderListScreen: React.FC<OrderListScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [orderType, setOrderType] = useState<OrderType>('purchase')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<OrderStatus>('ALL')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const [poResponse, soResponse] = await Promise.all([
        purchaseOrderService.getPurchaseOrders().catch(() => ({ purchaseOrders: [] })),
        salesOrderService.getSalesOrders().catch(() => ({ salesOrders: [] }))
      ])
      setPurchaseOrders(poResponse.purchaseOrders || [])
      setSalesOrders(soResponse.salesOrders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      showToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return theme.warning
      case 'CONFIRMED': return theme.info
      case 'DELIVERED': return theme.success
      case 'CANCELLED': return theme.error
      default: return theme.textSecondary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'clock-outline'
      case 'CONFIRMED': return 'check-circle-outline'
      case 'DELIVERED': return 'truck-delivery'
      case 'CANCELLED': return 'close-circle-outline'
      default: return 'help-circle-outline'
    }
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      if (orderType === 'purchase') {
        const updated = await purchaseOrderService.updateStatus(orderId, status as any)
        setPurchaseOrders(purchaseOrders.map(o => o.id === orderId ? updated : o))
      } else {
        const updated = await salesOrderService.updateStatus(orderId, status as any)
        setSalesOrders(salesOrders.map(o => o.id === orderId ? updated : o))
      }
      showToast('Order status updated', 'success')
    } catch (error) {
      console.error('Error updating status:', error)
      showToast('Failed to update order status', 'error')
    }
  }

  const renderOrderItem = ({ item }: { item: PurchaseOrder | SalesOrder }) => {
    const isPurchase = orderType === 'purchase'
    const status = item.status

    return (
      <Card style={styles.orderCard}>
        <TouchableOpacity
          onPress={() => {
            if (isPurchase) {
              navigation.navigate('PurchaseOrderDetail', { orderId: item.id })
            } else {
              navigation.navigate('SalesOrderDetail', { orderId: item.id })
            }
          }}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={[styles.orderNumber, { color: theme.text }]}>
                {item.orderNumber}
              </Text>
              <Text style={[styles.partnerName, { color: theme.textSecondary }]}>
                {isPurchase ? (item as PurchaseOrder).supplierName : (item as SalesOrder).customerName}
              </Text>
              <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                {new Date(item.orderDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.orderStatus}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
                <Icon 
                  name={getStatusIcon(status)} 
                  size={14} 
                  color={getStatusColor(status)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                  {status}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.orderDetails}>
            <Text style={[styles.orderAmount, { color: theme.text }]}>
              ${item.totalAmount.toFixed(2)}
            </Text>
            <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
              {item.items.length} items
            </Text>
            {item.expectedDelivery && (
              <Text style={[styles.deliveryDate, { color: theme.textSecondary }]}>
                Expected: {new Date(item.expectedDelivery).toLocaleDateString()}
              </Text>
            )}
          </View>

          {status === 'PENDING' && (
            <View style={styles.quickActions}>
              <LoadingButton
                title="Confirm"
                onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
                variant="primary"
                size="small"
                style={{ flex: 1 }}
              />
              <LoadingButton
                title="Cancel"
                onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
                variant="outline"
                size="small"
                style={{ flex: 1 }}
              />
            </View>
          )}

          {status === 'CONFIRMED' && (
            <View style={styles.quickActions}>
              <LoadingButton
                title="Mark Delivered"
                onPress={() => navigation.navigate(isPurchase ? 'PurchaseOrderDeliver' : 'SalesOrderDeliver', { orderId: item.id })}
                variant="primary"
                size="small"
                fullWidth
              />
            </View>
          )}
        </TouchableOpacity>
      </Card>
    )
  }

  const renderSkeleton = () => (
    <Card style={styles.orderCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={14} width="40%" />
    </Card>
  )

  const FilterButton = ({ status, title }: { status: OrderStatus, title: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === status ? theme.primary : 'transparent',
          borderColor: theme.border,
        }
      ]}
      onPress={() => setFilter(status)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: filter === status ? theme.textInverse : theme.text }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  )

  const orders: Array<PurchaseOrder | SalesOrder> = orderType === 'purchase' ? [...purchaseOrders] : [...salesOrders]
  const filteredOrders = orders.filter(order => 
    filter === 'ALL' || order.status === filter
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: spacing.base,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      padding: spacing.xs,
    },
    tab: {
      flex: 1,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: theme.primary,
    },
    tabText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
    },
    tabTextActive: {
      color: theme.textInverse,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: spacing.base,
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    filterButton: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterButtonText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    orderCard: {
      marginBottom: spacing.base,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing.xs,
    },
    partnerName: {
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    orderDate: {
      fontSize: typography.fontSize.xs,
    },
    orderStatus: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      gap: spacing.xs,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    orderDetails: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    orderAmount: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.xs,
    },
    itemCount: {
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    deliveryDate: {
      fontSize: typography.fontSize.sm,
    },
    quickActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    fab: {
      position: 'absolute',
      right: spacing.base,
      bottom: spacing.base,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing['4xl'],
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.base,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Orders"
        showBack
        navigation={navigation}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={18} color={theme.text} />
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary + '50' }}
              thumbColor={isDark ? theme.primary : theme.textSecondary}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        }
      />
      
      <View style={styles.content}>
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, orderType === 'purchase' && styles.tabActive]}
            onPress={() => {
              setOrderType('purchase')
              setFilter('ALL')
            }}
          >
            <Icon 
              name="shopping-cart" 
              size={20} 
              color={orderType === 'purchase' ? theme.textInverse : theme.text}
            />
            <Text style={[styles.tabText, orderType === 'purchase' && styles.tabTextActive]}>
              Purchase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, orderType === 'sales' && styles.tabActive]}
            onPress={() => {
              setOrderType('sales')
              setFilter('ALL')
            }}
          >
            <Icon 
              name="local-shipping" 
              size={20} 
              color={orderType === 'sales' ? theme.textInverse : theme.text}
            />
            <Text style={[styles.tabText, orderType === 'sales' && styles.tabTextActive]}>
              Sales
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterContainer}>
          <FilterButton status="ALL" title="All" />
          <FilterButton status="PENDING" title="Pending" />
          <FilterButton status="CONFIRMED" title="Confirmed" />
          <FilterButton status="DELIVERED" title="Delivered" />
        </View>

        {/* Orders List */}
        <FlatList
          data={loading ? Array(5).fill({}) : filteredOrders}
          renderItem={loading ? renderSkeleton : renderOrderItem}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="file-document-multiple" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>
                  {filter === 'ALL' 
                    ? `No ${orderType} orders available` 
                    : `No ${filter.toLowerCase()} orders`
                  }
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      {/* FAB - Create New Order */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate(orderType === 'purchase' ? 'PurchaseOrderForm' : 'SalesOrderForm')}
      >
        <Icon name="add" size={28} color={theme.textInverse} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
