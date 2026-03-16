import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton } from '../../components/loading/Skeleton'
import { salesOrderService, SalesOrder } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'

interface SalesOrderListScreenProps {
  navigation: any
}

export const SalesOrderListScreen: React.FC<SalesOrderListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'>('ALL')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await salesOrderService.getSalesOrders()
      setOrders(response.salesOrders)
    } catch (error) {
      Alert.alert('Error', 'Failed to load sales orders')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const getStatusColor = (status: SalesOrder['status']) => {
    switch (status) {
      case 'DRAFT': return theme.textSecondary
      case 'CONFIRMED': return theme.info
      case 'DELIVERED': return theme.success
      case 'CANCELLED': return theme.error
      default: return theme.textSecondary
    }
  }

  const getStatusIcon = (status: SalesOrder['status']) => {
    switch (status) {
      case 'DRAFT': return 'file-document-edit-outline'
      case 'CONFIRMED': return 'check-circle-outline'
      case 'DELIVERED': return 'truck-delivery'
      case 'CANCELLED': return 'close-circle-outline'
      default: return 'help-circle-outline'
    }
  }

  const filteredOrders = orders.filter(order => 
    filter === 'ALL' || order.status === filter
  )

  const renderOrder = ({ item }: { item: SalesOrder }) => (
    <Card style={styles.orderCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('SalesOrderDetail', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: theme.text }]}>
              {item.orderNumber}
            </Text>
            <Text style={[styles.customerName, { color: theme.textSecondary }]}>
              {item.customerName}
            </Text>
            <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
              {new Date(item.orderDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.orderStatus}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Icon 
                name={getStatusIcon(item.status)} 
                size={14} 
                color={getStatusColor(item.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
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
          {item.deliveryDate && (
            <Text style={[styles.deliveryDate, { color: theme.textSecondary }]}>
              Delivery: {new Date(item.deliveryDate).toLocaleDateString()}
            </Text>
          )}
          {item.customerPhone && (
            <Text style={[styles.customerContact, { color: theme.textSecondary }]}>
              {item.customerPhone}
            </Text>
          )}
        </View>

        {item.status === 'DRAFT' && (
          <View style={styles.quickActions}>
            <LoadingButton
              title="Edit"
              onPress={() => navigation.navigate('SalesOrderForm', { order: item })}
              variant="outline"
              size="small"
              style={{ flex: 1 }}
            />
            <LoadingButton
              title="Confirm"
              onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
              variant="primary"
              size="small"
              style={{ flex: 1 }}
            />
          </View>
        )}

        {item.status === 'CONFIRMED' && (
          <View style={styles.quickActions}>
            <LoadingButton
              title="Mark Delivered"
              onPress={() => handleUpdateStatus(item.id, 'DELIVERED')}
              variant="primary"
              size="small"
              fullWidth
            />
          </View>
        )}
      </TouchableOpacity>
    </Card>
  )

  const handleUpdateStatus = async (orderId: string, status: SalesOrder['status']) => {
    try {
      const orderData = orders.find(o => o.id === orderId)
      if (orderData) {
        const updated = await salesOrderService.updateSalesOrder(orderId, { status })
        setOrders(orders.map(o => o.id === orderId ? updated : o))
        Alert.alert('Success', 'Order status updated successfully')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status')
    }
  }

  const renderSkeleton = () => (
    <Card style={styles.orderCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={14} width="40%" />
    </Card>
  )

  const FilterButton = ({ status, title }: { status: typeof filter, title: string }) => (
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: spacing.base,
      gap: spacing.sm,
    },
    filterButton: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterButtonText: {
      fontSize: typography.fontSize.sm,
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
    customerName: {
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
      marginBottom: spacing.xs,
    },
    customerContact: {
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
        title="Sales Orders"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <FilterButton status="ALL" title="All" />
          <FilterButton status="DRAFT" title="Draft" />
          <FilterButton status="CONFIRMED" title="Confirmed" />
          <FilterButton status="DELIVERED" title="Delivered" />
        </View>

        <FlatList
          data={loading ? Array(5).fill({}) : filteredOrders}
          renderItem={loading ? renderSkeleton : renderOrder}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="receipt" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>
                  {filter === 'ALL' ? 'No sales orders available' : `No ${filter.toLowerCase()} orders`}
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SalesOrderForm')}
      >
        <Icon name="plus" size={24} color={theme.textInverse} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}