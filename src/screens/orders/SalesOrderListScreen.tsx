import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { PaginationControl } from '../../components/common/PaginationControl'
import { getCommonStyles } from '../../theme/commonStyles'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton } from '../../components/loading/Skeleton'
import { salesOrderService, SalesOrder } from '../../services/api/ApiServices'
import { exportToExcel } from '../../utils/exportUtils'
import { spacing, typography } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface SalesOrderListScreenProps {
  navigation: any
}

export const SalesOrderListScreen: React.FC<SalesOrderListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showSuccess, showError, showWarning } = useToast()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const commonStyles = getCommonStyles(theme)

  useEffect(() => {
    loadOrders(1)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadOrders(1)
    }, [])
  )

  const loadOrders = async (page = 1, pageSize = itemsPerPage) => {
    try {
      setLoading(true)
      const limit = pageSize === 0 ? 1000 : pageSize
      const response = await salesOrderService.getSalesOrders(page, limit)
      setOrders(response.salesOrders)
      setTotalItems(response.total || response.salesOrders.length)
      setTotalPages(Math.max(1, Math.ceil((response.total || response.salesOrders.length) / limit)))
      setCurrentPage(page)
    } catch (error) {
      showError('Error', 'Failed to load sales orders')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders(1)
    setRefreshing(false)
  }

  const handlePageChange = (page: number) => loadOrders(page)
  const handleItemsPerPageChange = (value: number) => { setItemsPerPage(value); loadOrders(1, value) }

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
      case 'DRAFT': return 'edit-note'
      case 'CONFIRMED': return 'check-circle'
      case 'DELIVERED': return 'local-shipping'
      case 'CANCELLED': return 'cancel'
      default: return 'help'
    }
  }

  const handleExport = async () => {
    try {
      const response = await salesOrderService.getSalesOrders(1, 10000)
      const allOrders = response.salesOrders || []
      const filteredForExport = allOrders.filter(order => filter === 'ALL' || order.status === filter)

      exportToExcel({
        data: filteredForExport,
        columns: [
          { key: 'orderNumber', label: 'Order #' },
          { key: 'status', label: 'Status' },
          { key: 'totalAmount', label: 'Amount', format: (v: number) => `₹${Number(v).toLocaleString()}` },
          { key: 'orderDate', label: 'Order Date', format: (v: string) => new Date(v).toLocaleDateString() },
        ],
        filename: 'sales_orders_export_filtered',
        reportTitle: 'Filtered Sales Orders Report',
      }).then(ok => { if (ok) showSuccess('Export', 'Excel file ready to share') })
    } catch {
      showError('Export Failed', 'Unable to load filtered sales orders for export')
    }
  }

  const filteredOrders = orders.filter(order => 
    filter === 'ALL' || order.status === filter
  )

  const handleDeleteOrder = (item: SalesOrder) => {
    showWarning(
      'Delete Order',
      `Delete order ${item.orderNumber}?`,
      {
        action: {
          label: 'Delete',
          onPress: async () => {
            try {
              await salesOrderService.deleteSalesOrder(item.id)
              setOrders(prev => prev.filter(o => o.id !== item.id))
              showSuccess('Deleted', 'Order deleted')
            } catch {
              showError('Error', 'Failed to delete order')
            }
          }
        }
      }
    )
  }

  const renderOrder = ({ item }: { item: SalesOrder }) => (
    <Card style={[commonStyles.glassCard, styles.orderCard]}>
      {/* Top right badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.soldBadge}>
          <Text style={styles.soldBadgeText}>SOLD</Text>
        </View>
      </View>

      {/* Center Icon */}
      <View style={styles.centerIconWrap}>
        <Icon name="shopping-cart" size={48} color={theme.border} />
      </View>

      {/* Details */}
      <View style={styles.detailsWrap}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={styles.divider} />
        
        <View style={styles.rowBetween}>
          <Text style={styles.metaLabel}>Date: <Text style={styles.metaValue}>{new Date(item.orderDate).toLocaleDateString()}</Text></Text>
          <Text style={styles.metaLabel}>Qty: <Text style={styles.metaValue}>{item.items.length}</Text></Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SalesOrderDetail', { orderId: item.id })}>
          <Icon name="visibility" size={16} color={theme.text} />
          <Text style={styles.actionBtnText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SalesOrderForm', { orderId: item.id, order: item })}>
          <Icon name="edit" size={16} color={theme.text} />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteOrder(item)}>
          <Icon name="delete-outline" size={16} color={theme.error} />
        </TouchableOpacity>
      </View>
    </Card>
  )

  const handleUpdateStatus = async (orderId: string, status: SalesOrder['status']) => {
    try {
      const orderData = orders.find(o => o.id === orderId)
      if (orderData) {
        const updated = await salesOrderService.updateSalesOrder(orderId, { status })
        setOrders(orders.map(o => o.id === orderId ? updated : o))
        showSuccess('Success', 'Order status updated successfully')
      }
    } catch (error) {
      showError('Error', 'Failed to update order status')
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
      marginBottom: spacing.md,
      padding: 0,
      borderRadius: 16,
      overflow: 'hidden',
    },
    badgeContainer: {
      alignItems: 'flex-end',
      padding: 16,
    },
    soldBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    soldBadgeText: {
      color: theme.primaryForeground,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    centerIconWrap: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    detailsWrap: {
      paddingHorizontal: 16,
    },
    orderNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      width: 24,
      marginVertical: 12,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metaLabel: {
      fontSize: 12,
      color: theme.mutedForeground,
      fontWeight: '500',
    },
    metaValue: {
      color: theme.text,
      fontWeight: '700',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      paddingTop: 24,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingVertical: 10,
      gap: 6,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    deleteBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
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
      bottom: 24, // adjust for bottom nav
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
      <MainHeader />
      <ScreenActionBar
        title="Sales Orders"
        primaryActionLabel="New Order"
        onPrimaryAction={() => navigation.navigate('SalesOrderForm')}
        itemCount={filteredOrders.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.filterContainer, { paddingHorizontal: spacing.base, paddingVertical: spacing.sm }]}>
          {(['ALL', 'DRAFT', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).map(s => (
            <FilterButton key={s} status={s} title={s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} />
          ))}
        </View>
      </ScrollView>

      {!loading && orders.length > 0 ? (
        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onPageChange={handlePageChange}
          />
        </View>
      ) : null}
      
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
                <Icon name="receipt" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>
                  {filter === 'ALL' ? 'No sales orders available' : `No ${filter.toLowerCase()} orders`}
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      {/* global QuickAddPanel provides FAB - removed local FAB */}
    </SafeAreaView>
  )
}