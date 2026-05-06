import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { PaginationControl } from '../../components/common/PaginationControl'
import { DownloadCompletionModal } from '../../components/common/DownloadCompletionModal'
import { getCommonStyles } from '../../theme/commonStyles'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/loading/Skeleton'
import { purchaseOrderService, PurchaseOrder } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'
import { useExportWithModal } from '../../hooks/useExportWithModal'

const fmtDate = (v: string) =>
  new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')

const STATUS_FILTERS_PO = ['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const
type POFilter = typeof STATUS_FILTERS_PO[number]

export const PurchaseOrderListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showSuccess, showError, showWarning } = useToast()
  const { modalState, closeModal, exportToExcelWithModal, exporting } = useExportWithModal()
  const commonStyles = getCommonStyles(theme)

  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<POFilter>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)

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
    } catch {
      showError('Error', 'Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => { setRefreshing(true); await loadOrders(1); setRefreshing(false) }
  const handlePageChange = (page: number) => loadOrders(page)
  const handleItemsPerPageChange = (value: number) => { setItemsPerPage(value); loadOrders(1, value) }

  const handleUpdateStatus = async (orderId: string, status: PurchaseOrder['status']) => {
    try {
      const updated = await purchaseOrderService.updateStatus(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
      showSuccess('Success', 'Order status updated')
    } catch {
      showError('Error', 'Failed to update order status')
    }
  }

  const handleDeleteOrder = (item: PurchaseOrder) => {
    showWarning('Delete Order', `Delete order ${item.orderNumber}?`, {
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
    })
  }

  const handleExport = async () => {
    try {
      const response = await purchaseOrderService.getPurchaseOrders(1, 10000)
      const all = response.purchaseOrders || []
      const filtered = all.filter(o => filter === 'ALL' || o.status === filter)
      await exportToExcelWithModal({
        data: filtered,
        columns: [
          { key: 'orderNumber', label: 'Order #' },
          { key: 'brand.name', label: 'Brand' },
          { key: 'status', label: 'Status' },
          { key: 'totalAmount', label: 'Amount', format: (v: number) => `₹${(v || 0).toLocaleString()}` },
          { key: 'orderDate', label: 'Order Date', format: fmtDate },
          { key: 'createdAt', label: 'Created At', format: fmtDate },
        ],
        filename: 'purchase_orders_export',
        reportTitle: 'Purchase Orders Report',
      })
    } catch {
      showError('Export Failed', 'Unable to export purchase orders')
    }
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

  const filteredOrders = orders.filter(o =>
    (filter === 'ALL' || o.status === filter) &&
    (search === '' || o.orderNumber?.toLowerCase().includes(search.toLowerCase()))
  )

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    searchBox: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
      borderRadius: 12, paddingHorizontal: 12, height: 42, gap: 8,
      marginHorizontal: 16, marginBottom: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: theme.text },
    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    content: { flex: 1, paddingHorizontal: spacing.base },
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
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginTop: 12 },
  })

  const renderOrder = ({ item }: { item: PurchaseOrder }) => {
    const brand = (item as any).brand?.name || item.supplierName || 'N/A'
    return (
      <Card style={[commonStyles.glassCard, s.orderCard]}>
        <TouchableOpacity onPress={() => navigation.navigate('PurchaseOrderDetail', { orderId: item.id })} activeOpacity={0.7}>
          <View style={s.badgeContainer}>
            <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={s.statusBadgeText}>{item.status}</Text>
            </View>
          </View>
          <View style={s.centerIconWrap}>
            <Icon name="local-shipping" size={48} color={theme.border} />
          </View>
          <View style={s.detailsWrap}>
            <Text style={s.metaLabelSmall}>ORDER #</Text>
            <Text style={s.orderNumber}>{item.orderNumber}</Text>
            <View style={s.gridRow}>
              <View style={s.gridCol}>
                <Text style={s.metaLabelSmall}>Brand</Text>
                <Text style={s.metaValue}>{brand}</Text>
              </View>
              <View style={s.gridCol}>
                <Text style={s.metaLabelSmall}>Amount</Text>
                <Text style={s.metaValue}>₹{Number(item.totalAmount).toFixed(2)}</Text>
              </View>
            </View>
            <View style={s.gridRow}>
              <View style={s.gridCol}>
                <Text style={s.metaLabelSmall}>Date</Text>
                <Text style={s.metaValue}>{new Date(item.orderDate).toLocaleDateString()}</Text>
              </View>
              <View style={s.gridCol}>
                <Text style={s.metaLabelSmall}>Items</Text>
                <Text style={s.metaValue}>{item.items?.length ?? 0}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('PurchaseOrderForm', { orderId: item.id })}>
            <Icon name="edit" size={14} color={theme.text} />
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteOrder(item)}>
            <Icon name="delete-outline" size={14} color="#fff" />
            <Text style={s.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    )
  }

  const renderSkeleton = () => (
    <Card style={s.orderCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={14} width="40%" />
    </Card>
  )

  return (
    <SafeAreaView style={s.container} edges={['right', 'left']}>
      <MainHeader />
      <ScreenActionBar
        title="Purchase Orders"
        primaryActionLabel="New Order"
        onPrimaryAction={() => navigation.navigate('PurchaseOrderForm')}
        itemCount={filteredOrders.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        exporting={exporting}
      />

      <View style={s.searchBox}>
        <Icon name="search" size={18} color={theme.mutedForeground} />
        <TextInput
          style={s.searchInput}
          placeholder="Search purchase orders..."
          placeholderTextColor={theme.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={16} color={theme.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={s.filterRow}>
          {STATUS_FILTERS_PO.map(st => (
            <TouchableOpacity
              key={st}
              style={[s.chip, { backgroundColor: filter === st ? theme.primary : 'transparent', borderColor: filter === st ? theme.primary : theme.border }]}
              onPress={() => setFilter(st)}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === st ? theme.primaryForeground : theme.text }}>
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={s.content}>
        <FlatList
          data={loading ? Array(5).fill({}) : filteredOrders}
          renderItem={loading ? renderSkeleton : renderOrder}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={!loading ? (
            <View style={s.emptyContainer}>
              <Icon name="description" size={64} color={theme.textSecondary} />
              <Text style={s.emptyText}>
                {filter === 'ALL' ? 'No purchase orders available' : `No ${filter.toLowerCase()} orders`}
              </Text>
            </View>
          ) : null}
          ListFooterComponent={!loading && filteredOrders.length > 0 ? (
            <PaginationControl
              currentPage={currentPage} totalPages={totalPages} totalItems={totalItems}
              itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} onPageChange={handlePageChange}
            />
          ) : null}
        />
      </View>

      <DownloadCompletionModal
        visible={modalState.visible} filename={modalState.filename}
        filepath={modalState.filepath} filesize={modalState.filesize} onClose={closeModal}
      />
    </SafeAreaView>
  )
}
