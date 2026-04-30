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
import { Skeleton } from '../../components/loading/Skeleton'
import { purchaseOrderService, PurchaseOrder } from '../../services/api/ApiServices'
import { exportToExcel } from '../../utils/exportUtils'
import { spacing, typography } from '../../theme'

interface PurchaseOrderListScreenProps {
  navigation: any
}

export const PurchaseOrderListScreen: React.FC<PurchaseOrderListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showSuccess, showError, showWarning } = useToast()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const commonStyles = getCommonStyles(theme)

  useEffect(() => { loadOrders(1) }, [])

  useFocusEffect(useCallback(() => { loadOrders(1) }, []))

  const loadOrders = async (page = 1, pageSize = itemsPerPage) => {
    try {
      setLoading(true)
      const limit = pageSize === 0 ? 1000 : pageSize
      const response = await purchaseOrderService.getPurchaseOrders(page, limit)
      setOrders(response.purchaseOrders)
      setTotalItems(response.total || response.purchaseOrders.length)
      setTotalPages(Math.max(1, Math.ceil((response.total || response.purchaseOrders.length) / limit)))
      setCurrentPage(page)
    } catch (error) {
      showError('Error', 'Failed to load purchase orders')
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

  const handleUpdateStatus = async (orderId: string, status: PurchaseOrder['status']) => {
    try {
      const updated = await purchaseOrderService.updateStatus(orderId, status)
      setOrders(orders.map(o => o.id === orderId ? updated : o))
      showSuccess('Success', 'Order status updated successfully')
    } catch (error) {
      showError('Error', 'Failed to update order status')
    }
  }

  const handleDeleteOrder = (item: PurchaseOrder) => {
    showWarning(
      'Delete Order',
      `Delete order ${item.orderNumber}?`,
      {
        action: {
          label: 'Delete',
          onPress: async () => {
            try {
              await purchaseOrderService.deletePurchaseOrder(item.id)
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

  const handleExport = async () => {
    try {
      const response = await purchaseOrderService.getPurchaseOrders(1, 10000)
      const allOrders = response.purchaseOrders || []
      const filteredForExport = allOrders.filter(order => filter === 'ALL' || order.status === filter)

      exportToExcel({
        data: filteredForExport,
        columns: [
          { key: 'orderNumber', label: 'Order #' },
          { key: 'brand.name', label: 'Brand', format: (v: any) => v || (orders[0] as any)?.supplierName || 'N/A' },
          { key: 'status', label: 'Status' },
          { key: 'totalAmount', label: 'Amount', format: (v: number) => `₹${Number(v).toLocaleString()}` },
          { key: 'orderDate', label: 'Order Date', format: (v: string) => new Date(v).toLocaleDateString() },
        ],
        filename: 'purchase_orders_export_filtered',
        reportTitle: 'Filtered Purchase Orders Report',
      }).then(ok => { if (ok) showSuccess('Export', 'Excel file ready to share') })
    } catch {
      showError('Export Failed', 'Unable to load filtered purchase orders for export')
    }
  }

  const filteredOrders = orders.filter(order =>
    filter === 'ALL' || order.status === filter
  )

  const FilterButton = ({ status, title }: { status: typeof filter; title: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { backgroundColor: filter === status ? theme.primary : 'transparent', borderColor: theme.border }
      ]}
      onPress={() => setFilter(status)}
    >
      <Text style={[styles.filterButtonText, { color: filter === status ? theme.textInverse : theme.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  )

  const renderOrder = ({ item }: { item: PurchaseOrder }) => {
    const brand = (item as any).brand?.name || item.supplierName || 'N/A'
    return (
      <Card style={[commonStyles.glassCard, styles.orderCard]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PurchaseOrderDetail', { orderId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.badgeContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusBadgeText}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.centerIconWrap}>
            <Icon name="local-shipping" size={48} color={theme.border} />
          </View>

          <View style={styles.detailsWrap}>
            <Text style={styles.metaLabelSmall}>ORDER #</Text>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabelSmall}>Brand</Text>
                <Text style={styles.metaValue}>{brand}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabelSmall}>Amount</Text>
                <Text style={styles.metaValue}>₹{Number(item.totalAmount).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabelSmall}>Date</Text>
                <Text style={styles.metaValue}>{new Date(item.orderDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabelSmall}>Items</Text>
                <Text style={styles.metaValue}>{item.items?.length ?? 0}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('PurchaseOrderForm', { orderId: item.id })}
          >
            <Icon name="edit" size={14} color={theme.text} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteOrder(item)}>
            <Icon name="delete-outline" size={14} color="#fff" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    )
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

  const renderSkeleton = () => (
    <Card style={styles.orderCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={14} width="40%" />
    </Card>
  )

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { flex: 1, paddingHorizontal: spacing.base },
    filterContainer: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
    filterButton: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
    filterButtonText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
    orderCard: { marginBottom: spacing.md, padding: 0, borderRadius: 16, overflow: 'hidden' },
    badgeContainer: { alignItems: 'flex-end', padding: 16 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    centerIconWrap: { alignItems: 'center', paddingVertical: 20 },
    detailsWrap: { paddingHorizontal: 20, paddingBottom: 8 },
    orderNumber: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 20 },
    metaLabelSmall: { fontSize: 10, color: theme.mutedForeground, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    gridRow: { flexDirection: 'row', marginBottom: 16 },
    gridCol: { flex: 1 },
    metaValue: { color: theme.text, fontWeight: '700', fontSize: 14 },
    actionRow: { flexDirection: 'row', gap: 12, padding: 12 },
    editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
    editBtnText: { fontSize: 13, fontWeight: '700', color: theme.text },
    deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: theme.error },
    deleteBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    fab: { position: 'absolute', right: spacing.base, bottom: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'] },
    emptyText: { fontSize: typography.fontSize.base, color: theme.textSecondary, textAlign: 'center', marginTop: spacing.base },
  })

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <MainHeader />
      <ScreenActionBar
        title="Purchase Orders"
        primaryActionLabel="New Order"
        onPrimaryAction={() => navigation.navigate('PurchaseOrderForm')}
        itemCount={filteredOrders.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterContainer}>
          {(['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).map(s => (
            <FilterButton key={s} status={s} title={s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.content}>
        <FlatList
          data={loading ? Array(5).fill({}) : filteredOrders}
          renderItem={loading ? renderSkeleton : renderOrder}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
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
          ListFooterComponent={!loading && filteredOrders.length > 0 ? (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPageChange={handlePageChange}
            />
          ) : null}
        />
      </View>

      {/* global QuickAddPanel provides FAB - removed local FAB */}
    </SafeAreaView>
  )
}
