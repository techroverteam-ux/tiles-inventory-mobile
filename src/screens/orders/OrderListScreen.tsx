import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Image, TextInput, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { PaginationControl } from '../../components/common/PaginationControl'
import { DownloadCompletionModal } from '../../components/common/DownloadCompletionModal'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/loading/Skeleton'
import { purchaseOrderService, salesOrderService, PurchaseOrder, SalesOrder } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'
import { getCommonStyles } from '../../theme/commonStyles'
import { useExportWithModal } from '../../hooks/useExportWithModal'

const fmtDate = (v: string) =>
  new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')

type OrderType = 'purchase' | 'sales'

const PURCHASE_FILTERS = ['all', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const
const SALES_FILTERS = ['all', 'DRAFT', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const

export const OrderListScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const { showToast, showWarning, showError } = useToast()
  const { modalState, closeModal, exportToExcelWithModal, exporting } = useExportWithModal()
  const commonStyles = getCommonStyles(theme)

  const orderType: OrderType = route.params?.orderType || 'purchase'

  const [orders, setOrders] = useState<Array<PurchaseOrder | SalesOrder>>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => { loadOrders(1) }, [orderType])

  const loadOrders = async (page: number, q = search, pageSize = itemsPerPage) => {
    try {
      setLoading(true)
      const limit = pageSize === 0 ? 1000 : pageSize
      let ordersData: any[] = []
      let total = 0

      if (orderType === 'purchase') {
        const res = await purchaseOrderService.getPurchaseOrders(page, limit)
        ordersData = res.purchaseOrders || []
        total = res.total || 0
      } else {
        const res = await salesOrderService.getSalesOrders(page, limit)
        ordersData = res.salesOrders || []
        total = res.total || 0
      }

      const filtered = q.trim()
        ? ordersData.filter((o: any) =>
            o.orderNumber?.toLowerCase().includes(q.toLowerCase()) ||
            o.brand?.name?.toLowerCase().includes(q.toLowerCase()) ||
            o.supplierName?.toLowerCase().includes(q.toLowerCase())
          )
        : ordersData

      setOrders(filtered)
      setTotalItems(q.trim() ? filtered.length : total)
      setTotalPages(Math.max(1, Math.ceil((q.trim() ? filtered.length : total) / limit)))
      setCurrentPage(page)
    } catch {
      showToast(`Failed to load ${orderType} orders`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => { setSearch(q); loadOrders(1, q) }
  const handleItemsPerPageChange = (value: number) => { setItemsPerPage(value); loadOrders(1, search, value) }
  const handleRefresh = async () => { setRefreshing(true); await loadOrders(1); setRefreshing(false) }
  const handlePageChange = (newPage: number) => loadOrders(newPage)

  const handleExportData = async () => {
    try {
      const res = orderType === 'purchase'
        ? await purchaseOrderService.getPurchaseOrders(1, 10000)
        : await salesOrderService.getSalesOrders(1, 10000)

      const allOrders = (orderType === 'purchase' ? res.purchaseOrders : res.salesOrders) || []
      const filtered = allOrders.filter((o: any) => {
        const matchesSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter
        return matchesSearch && matchesStatus
      })

      if (orderType === 'purchase') {
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
      } else {
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
      }
    } catch {
      showError('Export Failed', 'Unable to export orders')
    }
  }

  const handleDelete = (id: string) => {
    showWarning('Delete Order', 'Are you sure you want to delete this order?', {
      action: {
        label: 'Delete',
        onPress: () => {
          setOrders(prev => prev.filter(o => o.id !== id))
          showToast('Order deleted', 'success')
        }
      }
    })
  }

  const filteredOrders = orders.filter((o: any) => statusFilter === 'all' || o.status === statusFilter)
  const filterOptions = orderType === 'purchase' ? PURCHASE_FILTERS : SALES_FILTERS

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    searchBox: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
      borderRadius: 12, paddingHorizontal: 12, height: 42, gap: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: theme.text },
    listContainer: { padding: spacing.base, paddingBottom: 80 },
    orderCard: { marginBottom: spacing.md, padding: 0, borderRadius: 16, overflow: 'hidden' },
    gridCard: { width: '100%' },
    cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 12, position: 'absolute', top: 0, right: 0, zIndex: 10 },
    statusBadge: { backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    statusText: { color: theme.primaryForeground, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    iconContainer: { height: 180, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
    contentContainer: { padding: 16 },
    orderLabel: { fontSize: 10, color: theme.mutedForeground, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    orderNumber: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16 },
    grid2x2: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
    gridItem: { width: '50%', paddingHorizontal: 8, marginBottom: 16 },
    gridLabel: { fontSize: 12, color: theme.mutedForeground, marginBottom: 4 },
    gridValue: { fontSize: 14, fontWeight: 'bold', color: theme.text },
    gridList: { marginBottom: 16 },
    gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    gridLabelInline: { fontSize: 12, color: theme.mutedForeground },
    gridValueInline: { fontSize: 12, fontWeight: 'bold', color: theme.text },
    actionRow: { flexDirection: 'row', padding: 16, paddingTop: 0, gap: 12 },
    outlineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border, paddingVertical: 10, borderRadius: 12, gap: 6 },
    outlineBtnText: { color: theme.text, fontWeight: 'bold', fontSize: 12 },
    deleteBtn: { paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 12 },
    tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomWidth: 1, borderBottomColor: theme.border, marginTop: 8 },
    tableHeaderText: { color: theme.mutedForeground, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
    colOrder: { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 6 },
    colPartner: { flex: 1.5, paddingRight: 8 },
    colAmount: { flex: 1, alignItems: 'flex-end', paddingRight: 8 },
    colDate: { flex: 1, alignItems: 'flex-end' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    rowTitle: { color: theme.text, fontSize: 12, fontWeight: 'bold' },
    rowSubtitle: { color: theme.mutedForeground, fontSize: 10 },
    rowText: { color: theme.text, fontSize: 12 },
    rowTextBold: { color: theme.text, fontSize: 12, fontWeight: 'bold' },
  })

  const renderOrderItem = ({ item }: { item: PurchaseOrder | SalesOrder }) => {
    const isPurchase = orderType === 'purchase'
    const date = fmtDate(item.orderDate)
    const amount = item.totalAmount
    const itemCount = item.items?.length || 0
    const partnerName = isPurchase
      ? ((item as any).brand?.name || (item as PurchaseOrder).supplierName || 'N/A')
      : (item as SalesOrder).customerName

    return (
      <Card style={[commonStyles.glassCard, styles.orderCard, viewMode === 'grid' && styles.gridCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{isPurchase ? item.status : 'SOLD'}</Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <Icon name={isPurchase ? 'local-shipping' : 'shopping-cart'} size={48} color={theme.textSecondary} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.orderLabel}>ORDER #</Text>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          {isPurchase ? (
            <View style={styles.grid2x2}>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>Brand</Text><Text style={styles.gridValue}>{partnerName}</Text></View>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>Amount</Text><Text style={styles.gridValue}>₹{amount.toLocaleString()}</Text></View>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>Date</Text><Text style={styles.gridValue}>{date}</Text></View>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>Items</Text><Text style={styles.gridValue}>{itemCount}</Text></View>
            </View>
          ) : (
            <View style={styles.gridList}>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabelInline}>Date: </Text>
                <Text style={styles.gridValueInline}>{date}</Text>
                <Text style={[styles.gridLabelInline, { marginLeft: 24 }]}>Qty: </Text>
                <Text style={styles.gridValueInline}>{itemCount}</Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate(isPurchase ? 'PurchaseOrderDetail' : 'SalesOrderDetail', { orderId: item.id })}>
            <Icon name="visibility" size={16} color={theme.text} />
            <Text style={styles.outlineBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate(isPurchase ? 'PurchaseOrderForm' : 'SalesOrderForm', { orderId: item.id })}>
            <Icon name="edit" size={16} color={theme.text} />
            <Text style={styles.outlineBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Icon name="delete-outline" size={16} color={theme.error} />
          </TouchableOpacity>
        </View>
      </Card>
    )
  }

  const renderOrderRow = ({ item }: { item: PurchaseOrder | SalesOrder }) => {
    const isPurchase = orderType === 'purchase'
    const date = fmtDate(item.orderDate)
    const partnerName = isPurchase
      ? ((item as any).brand?.name || (item as PurchaseOrder).supplierName || 'N/A')
      : (item as SalesOrder).customerName

    return (
      <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate(isPurchase ? 'PurchaseOrderDetail' : 'SalesOrderDetail', { orderId: item.id })} activeOpacity={0.7}>
        <View style={styles.colOrder}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.orderNumber}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'DELIVERED' ? theme.success : theme.primary }]} />
        </View>
        <View style={styles.colPartner}><Text style={styles.rowText} numberOfLines={1}>{partnerName || 'N/A'}</Text></View>
        <View style={styles.colAmount}><Text style={styles.rowTextBold}>₹{item.totalAmount.toLocaleString()}</Text></View>
        <View style={styles.colDate}><Text style={styles.rowSubtitle}>{date}</Text></View>
      </TouchableOpacity>
    )
  }

  const renderItem = ({ item }: { item: PurchaseOrder | SalesOrder }) =>
    viewMode === 'list' ? renderOrderRow({ item }) : renderOrderItem({ item })

  const renderListHeader = () => {
    if (viewMode !== 'list' || orders.length === 0) return null
    return (
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colOrder]}>ORDER #</Text>
        <Text style={[styles.tableHeaderText, styles.colPartner]}>PARTNER</Text>
        <Text style={[styles.tableHeaderText, styles.colAmount]}>AMOUNT</Text>
        <Text style={[styles.tableHeaderText, styles.colDate]}>DATE</Text>
      </View>
    )
  }

  const renderSkeleton = () => (
    <Card style={[commonStyles.glassCard, styles.orderCard]}>
      <View style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton width={80} height={80} borderRadius={16} />
      </View>
      <View style={styles.contentContainer}>
        <Skeleton width="40%" height={24} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={60} />
      </View>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <MainHeader />
      <ScreenActionBar
        title={orderType === 'purchase' ? 'Purchase Orders' : 'Sales Orders'}
        primaryActionLabel="New Order"
        onPrimaryAction={() => navigation.navigate(orderType === 'purchase' ? 'PurchaseOrderForm' : 'SalesOrderForm')}
        itemCount={totalItems}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExportData}
        onToggleFilters={() => setShowFilters(v => !v)}
        exporting={exporting}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${orderType} orders...`}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFilters && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {filterOptions.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setStatusFilter(f)}
                  style={{
                    borderWidth: 1,
                    borderColor: statusFilter === f ? theme.primary : theme.border,
                    backgroundColor: statusFilter === f ? theme.primary : theme.surface,
                    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: statusFilter === f ? theme.primaryForeground : theme.text, fontWeight: '700', fontSize: 12 }}>
                    {f === 'all' ? 'All' : f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <FlatList
        data={loading ? Array(viewMode === 'list' ? 6 : 3).fill({}) : filteredOrders}
        renderItem={loading ? renderSkeleton : renderItem}
        keyExtractor={(item, index) => loading ? `skel-${index}` : item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={!loading && filteredOrders.length > 0 ? (
          <PaginationControl
            currentPage={currentPage} totalPages={totalPages} totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} onPageChange={handlePageChange}
          />
        ) : null}
      />

      <DownloadCompletionModal
        visible={modalState.visible} filename={modalState.filename}
        filepath={modalState.filepath} filesize={modalState.filesize} onClose={closeModal}
      />
    </SafeAreaView>
  )
}
