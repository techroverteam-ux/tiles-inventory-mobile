import React, { useState, useEffect, useCallback } from 'react'
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
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { getCommonStyles } from '../../theme/commonStyles'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton } from '../../components/loading/Skeleton'
import { purchaseOrderService, PurchaseOrder } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface PurchaseOrderListScreenProps {
  navigation: any
}

export const PurchaseOrderListScreen: React.FC<PurchaseOrderListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const commonStyles = getCommonStyles(theme)

  useEffect(() => {
    loadOrders()
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadOrders()
    }, [])
  )

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await purchaseOrderService.getPurchaseOrders()
      setOrders(response.purchaseOrders)
    } catch (error) {
      Alert.alert('Error', 'Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'PENDING': return theme.warning
      case 'CONFIRMED': return theme.info
      case 'DELIVERED': return theme.success
      case 'CANCELLED': return theme.error
      default: return theme.textSecondary
    }
  }

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'PENDING': return 'schedule'
      case 'CONFIRMED': return 'check-circle'
      case 'DELIVERED': return 'local-shipping'
      case 'CANCELLED': return 'cancel'
      default: return 'help'
    }
  }

  const filteredOrders = orders.filter(order => 
    filter === 'ALL' || order.status === filter
  )

  const handleUpdateStatus = async (orderId: string, status: PurchaseOrder['status']) => {
    try {
      const updated = await purchaseOrderService.updateStatus(orderId, status)
      setOrders(orders.map(o => o.id === orderId ? updated : o))
      Alert.alert('Success', 'Order status updated successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status')
    }
  }

  const renderOrder = ({ item }: { item: PurchaseOrder }) => (
    <Card style={[commonStyles.glassCard, styles.orderCard]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PurchaseOrderDetail', { orderId: item.id })}
        activeOpacity={0.7}
      >
        {/* Top right badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, item.status === 'DELIVERED' && { backgroundColor: theme.primary }]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>

        {/* Center Icon */}
        <View style={styles.centerIconWrap}>
          <Icon name="local-shipping" size={48} color={theme.border} />
        </View>

        {/* Details */}
        <View style={styles.detailsWrap}>
          <Text style={styles.metaLabelSmall}>ORDER #</Text>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabelSmall}>Brand</Text>
              <Text style={styles.metaValue}>{item.supplierName}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabelSmall}>Amount</Text>
              <Text style={styles.metaValue}>${item.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabelSmall}>Date</Text>
              <Text style={styles.metaValue}>{new Date(item.orderDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabelSmall}>Items</Text>
              <Text style={styles.metaValue}>{item.items.length}</Text>
            </View>
          </View>
        </View>

      </TouchableOpacity>
    </Card>
  )

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
      marginBottom: spacing.md,
      padding: 0,
      borderRadius: 16,
      overflow: 'hidden',
    },
    badgeContainer: {
      alignItems: 'flex-end',
      padding: 16,
    },
    statusBadge: {
      backgroundColor: theme.info,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    statusBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    centerIconWrap: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    detailsWrap: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    orderNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
    },
    metaLabelSmall: {
      fontSize: 10,
      color: theme.mutedForeground,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    gridRow: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    gridCol: {
      flex: 1,
    },
    metaValue: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 14,
    },
    fab: {
      position: 'absolute',
      right: spacing.base,
      bottom: 24, // adjusted for tab bar
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
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScreenActionBar
        title="Purchase Orders"
        primaryActionLabel="New Order"
        onPrimaryAction={() => navigation.navigate('PurchaseOrderForm')}
        itemCount={filteredOrders.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <View style={styles.content}>
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
                <Icon name="description" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>
                  {filter === 'ALL' ? 'No purchase orders available' : `No ${filter.toLowerCase()} orders`}
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PurchaseOrderForm')}
      >
        <Icon name="add" size={24} color={theme.textInverse} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}