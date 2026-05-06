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
import { salesOrderService, SalesOrder } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'
import { useExportWithModal } from '../../hooks/useExportWithModal'

const fmtDate = (v: string) =>
  new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')

const STATUS_FILTERS_SO = ['ALL', 'DRAFT', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const
type SOFilter = typeof STATUS_FILTERS_SO[number]

export const SalesOrderListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showSuccess, showError, showWarning } = useToast()
  const { modalState, closeModal, exportToExcelWithModal, exporting } = useExportWithModal()
  const commonStyles = getCommonStyles(theme)

  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<SOFilter>('ALL')
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
      const response = await salesOrderService.getSalesOrders(page, limit)
      setOrders(response.salesOrders)
      setTotalItems(response.total || response.salesOrders.length)
      setTotalPages(Math.max(1, Math.ceil((response.total || response.salesOrders.length) / limit)))
      setCurrentPage(page)
    } catch {
      showError('Error', 'Failed to load sales orders')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => { setRefreshing(true); await loadOrders(1); setRefreshing(false) }
  const handlePageChange = (page: number) => loadOrders(page)
  const handleItemsPerPageChange = (value: number) => { setItemsPerPage(value); loadOrders(1, value) }

  const handleExport = async () => {
    try {
      const response = await salesOrderService.getSalesOrders(1, 10000)
      const all = response.salesOrders || []
      const filtered = all.filter(o => filter === 'ALL' || o.status === filter)
      await exportToExcelWithModal({
        data: filtered,
        columns: [
          { key: 'orderNumber', label: 'Order #' },
          { key: 'brand.name', label: 'Brand' },
          { key: 'totalAmount', label: 'Amount', format: (v: number) => `₹${(v || 0).toLocaleString()}` },
          { key: 'orderDate', label: 'Order Date', format: fmtDate },
          { key: 'items.length', label: 'Unique Items', format: (v: number) => v?.toString() || '0' },
          { key: 'createdAt', label: 'Created At', format: fmtDate },
        ],
        filename: 'sales_orders_export',
        reportTitle: 'Sales Orders Report',
      })
    } catch {
      showError('Export Failed', 'Unable to export sales orders')
    }
  }

  const handleDeleteOrder = (item: SalesOrder) => {
    showWarning('Delete Order', `Delete order ${item.orderNumber}?`, {
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
    })
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
    soldBadge: { backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    soldBadgeText: { color: theme.primaryForeground, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    centerIconWrap: { alignItems: 'center', paddingVertical: 20 },
    detailsWrap: { paddingHorizontal: 16 },
    orderNumber: { fontSize: 16, fontWeight: 'bold', color: theme.text },
    divider: { height: 1, backgroundColor: theme.border, width: 24, marginVertical: 12 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaLabel: { fontSize: 12, color: theme.mutedForeground, fontWeight: '500' },
    metaValue: { color: theme.text, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: 12, padding: 16, paddingTop: 24 },
    actionBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
      borderRadius: 12, paddingVertical: 10, gap: 6,
    },
    actionBtnText: { fontSize: 14, fontWeight: '600', color: theme.text },
    deleteBtn: {
      width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginTop: 12 },
  })

  const renderOrder = ({ item }: { item: SalesOrder }) => (
    <Card style={[commonStyles.glassCard, s.orderCard]}>
      <View style={s.badgeContainer}>
        <View style={s.soldBadge}><Text style={s.soldBadgeText}>SOLD</Text></View>
      </View>
      <View style={s.centerIconWrap}>
        <Icon name="shopping-cart" size={48} color={theme.border} />
      </View>
      <View style={s.detailsWrap}>
        <Text style={s.orderNumber}>{item.orderNumber}</Text>
        <View style={s.divider} />
        <View style={s.rowBetween}>
          <Text style={s.metaLabel}>Date: <Text style={s.metaValue}>{new Date(item.orderDate).toLocaleDateString()}</Text></Text>
          <Text style={s.metaLabel}>Qty: <Text style={s.metaValue}>{item.items?.length ?? 0}</Text></Text>
        </View>
      </View>
      <View style={s.actionRow}>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('SalesOrderDetail', { orderId: item.id })}>
          <Icon name="visibility" size={16} color={theme.text} />
          <Text style={s.actionBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('SalesOrderForm', { orderId: item.id, order: item })}>
          <Icon name="edit" size={16} color={theme.text} />
          <Text style={s.actionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteOrder(item)}>
          <Icon name="delete-outline" size={16} color={theme.error} />
        </TouchableOpacity>
      </View>
    </Card>
  )

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
        title="Sales Orders"
        primaryActionLabel="New Order"
        onPrimaryAction={() => navigation.navigate('SalesOrderForm')}
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
          placeholder="Search sales orders..."
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
          {STATUS_FILTERS_SO.map(st => (
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

      {!loading && orders.length > 0 && (
        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
          <PaginationControl
            currentPage={currentPage} totalPages={totalPages} totalItems={totalItems}
            itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} onPageChange={handlePageChange}
          />
        </View>
      )}

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
              <Icon name="receipt" size={64} color={theme.textSecondary} />
              <Text style={s.emptyText}>
                {filter === 'ALL' ? 'No sales orders available' : `No ${filter.toLowerCase()} orders`}
              </Text>
            </View>
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
