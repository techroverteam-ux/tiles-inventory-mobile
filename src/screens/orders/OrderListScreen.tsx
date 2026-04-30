import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { PaginationControl } from '../../components/common/PaginationControl'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/loading/Skeleton'
import { purchaseOrderService, salesOrderService, PurchaseOrder, SalesOrder } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'
import { getCommonStyles } from '../../theme/commonStyles'

interface OrderListScreenProps {
  navigation: any
  route: any
}

type OrderType = 'purchase' | 'sales'

export const OrderListScreen: React.FC<OrderListScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const { showToast, showWarning, showSuccess, showError } = useToast()
  const commonStyles = getCommonStyles(theme)

  // Determine order type from route params
  const orderType: OrderType = route.params?.orderType || 'purchase'

  const [orders, setOrders] = useState<Array<PurchaseOrder | SalesOrder>>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    loadOrders(1)
  }, [orderType])

  const loadOrders = async (page: number, q = search, pageSize = itemsPerPage) => {
    try {
      setLoading(true)
      let ordersData = []
      let total = 0
      const limit = pageSize === 0 ? 1000 : pageSize

      if (orderType === 'purchase') {
        const response = await purchaseOrderService.getPurchaseOrders(page, limit)
        ordersData = response.purchaseOrders || []
        total = response.total || 0
      } else {
        const response = await salesOrderService.getSalesOrders(page, limit)
        ordersData = response.salesOrders || []
        total = response.total || 0
      }

      // Client-side search filter since API may not support search param
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
    } catch (error) {
      console.error(`Error loading ${orderType} orders:`, error)
      showToast(`Failed to load ${orderType} orders`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    loadOrders(1, q)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    loadOrders(1, search, value)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders(1)
    setRefreshing(false)
  }

  const handlePageChange = (newPage: number) => {
    loadOrders(newPage)
  }

  const handleExportData = async () => {
    try {
      const response = orderType === 'purchase'
        ? await purchaseOrderService.getPurchaseOrders(1, 10000)
        : await salesOrderService.getSalesOrders(1, 10000)

      const allOrders = (orderType === 'purchase' ? response.purchaseOrders : response.salesOrders) || []
      const filteredForExport = allOrders.filter(order => {
        const orderNum = order.orderNumber?.toLowerCase() || ''
        const supplier = order.supplierName?.toLowerCase() || ''
        const customer = order.customerName?.toLowerCase() || ''
        const searchText = search.toLowerCase()
        const matchesSearch = !search || orderNum.includes(searchText) || supplier.includes(searchText) || customer.includes(searchText)
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesStatus
      })

      import('../../utils/exportUtils').then(({ exportToExcel, commonColumns }) => {
        const columns = orderType === 'purchase' ? commonColumns.purchaseOrder : commonColumns.salesOrder
        exportToExcel({
          data: filteredForExport,
          columns,
          filename: `${orderType}_orders_export_filtered`,
          reportTitle: `${orderType === 'purchase' ? 'Filtered Purchase Orders' : 'Filtered Sales Orders'} Report`,
        }).then(success => {
          if (success) showSuccess('Export', 'Excel file ready to share')
        })
      })
    } catch {
      showError('Export Failed', 'Unable to load filtered orders for export')
    }
  }

  const handleToggleFilters = () => {
    setShowFilters(v => !v)
  }

  const handleDelete = (id: string) => {
    showWarning(
      'Delete Order',
      `Are you sure you want to delete this order?`,
      {
        action: {
          label: 'Delete',
          onPress: () => {
            setOrders(orders.filter(o => o.id !== id))
            showToast('Order deleted', 'success')
          }
        }
      }
    )
  }


  const filteredOrders = orders.filter((o: any) => statusFilter === 'all' ? true : o.status === statusFilter)

  const filterOptions = orderType === 'purchase'
    ? ['all', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']
    : ['all', 'DRAFT', 'CONFIRMED', 'DELIVERED', 'CANCELLED']

  const renderOrderItem = ({ item }: { item: PurchaseOrder | SalesOrder }) => {
    const isPurchase = orderType === 'purchase'
    const status = item.status
    const orderNumber = item.orderNumber
    const date = new Date(item.orderDate).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, '-')
    const amount = item.totalAmount
    const itemCount = item.items?.length || 0
    const partnerName = isPurchase
      ? ((item as any).brand?.name || (item as PurchaseOrder).supplierName || 'N/A')
      : (item as SalesOrder).customerName

    return (
      <Card style={[
        commonStyles.glassCard,
        styles.orderCard,
        viewMode === 'grid' && styles.gridCard
      ]}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {isPurchase ? (status === 'DELIVERED' ? 'DELIVERED' : status) : 'SOLD'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.iconContainer}>
          <Icon name={isPurchase ? 'local-shipping' : 'shopping-cart'} size={48} color={theme.textSecondary} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.orderLabel}>ORDER #</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>

          {isPurchase && (
            <View style={styles.grid2x2}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Brand</Text>
                <Text style={styles.gridValue}>{partnerName || 'N/A'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Amount</Text>
                <Text style={styles.gridValue}>₹{amount.toLocaleString()}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Date</Text>
                <Text style={styles.gridValue}>{date}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Items</Text>
                <Text style={styles.gridValue}>{itemCount}</Text>
              </View>
            </View>
          )}

          {!isPurchase && (
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
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate(isPurchase ? 'PurchaseOrderDetail' : 'SalesOrderDetail', { orderId: item.id })}
          >
            <Icon name="visibility" size={16} color={theme.text} />
            <Text style={styles.outlineBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate(isPurchase ? 'PurchaseOrderForm' : 'SalesOrderForm', { orderId: item.id })}
          >
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
    const status = item.status
    const orderNumber = item.orderNumber
    const date = new Date(item.orderDate).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, '-')
    const amount = item.totalAmount
    const partnerName = isPurchase
      ? ((item as any).brand?.name || (item as PurchaseOrder).supplierName || 'N/A')
      : (item as SalesOrder).customerName

    return (
      <TouchableOpacity 
        style={styles.tableRow}
        onPress={() => navigation.navigate(isPurchase ? 'PurchaseOrderDetail' : 'SalesOrderDetail', { orderId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.colOrder}>
          <Text style={styles.rowTitle} numberOfLines={1}>{orderNumber}</Text>
          <View style={[styles.statusDot, { backgroundColor: status === 'DELIVERED' ? theme.success : theme.primary }]} />
        </View>
        <View style={styles.colPartner}>
          <Text style={styles.rowText} numberOfLines={1}>{partnerName || 'N/A'}</Text>
        </View>
        <View style={styles.colAmount}>
          <Text style={styles.rowTextBold}>₹{amount.toLocaleString()}</Text>
        </View>
        <View style={styles.colDate}>
          <Text style={styles.rowSubtitle}>{date}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderItem = ({ item }: { item: PurchaseOrder | SalesOrder }) => {
    if (viewMode === 'list') return renderOrderRow({ item })
    return renderOrderItem({ item })
  }

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 42,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
    },
    listContainer: {
      padding: spacing.base,
      paddingBottom: 80,
    },
    orderCard: {
      marginBottom: spacing.md,
      padding: 0,
      borderRadius: 16,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 12,
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 10,
    },
    badgeContainer: {
      flexDirection: 'row',
    },
    statusBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    statusText: {
      color: theme.primaryForeground,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    iconContainer: {
      height: 180,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    contentContainer: {
      padding: 16,
    },
    orderLabel: {
      fontSize: 10,
      color: theme.mutedForeground,
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 4,
    },
    orderNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    grid2x2: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -8,
    },
    gridItem: {
      width: '50%',
      paddingHorizontal: 8,
      marginBottom: 16,
    },
    gridLabel: {
      fontSize: 12,
      color: theme.mutedForeground,
      marginBottom: 4,
    },
    gridValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
    },
    gridList: {
      marginBottom: 16,
    },
    gridRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    gridLabelInline: {
      fontSize: 12,
      color: theme.mutedForeground,
    },
    gridValueInline: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.text,
    },
    actionRow: {
      flexDirection: 'row',
      padding: 16,
      paddingTop: 0,
      gap: 12,
    },
    outlineBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    outlineBtnText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 12,
    },
    deleteBtn: {
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    fab: {
      position: 'absolute',
      right: spacing.base,
      bottom: spacing.base,
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
    tableHeader: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginTop: 8,
    },
    tableHeaderText: {
      color: theme.mutedForeground,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    colOrder: { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 6 },
    colPartner: { flex: 1.5, paddingRight: 8 },
    colAmount: { flex: 1, alignItems: 'flex-end', paddingRight: 8 },
    colDate: { flex: 1, alignItems: 'flex-end' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    rowTitle: {
      color: theme.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    rowSubtitle: {
      color: theme.mutedForeground,
      fontSize: 10,
    },
    rowText: {
      color: theme.text,
      fontSize: 12,
    },
    rowTextBold: {
      color: theme.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
  })

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
        onToggleFilters={handleToggleFilters}
      />
      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={[styles.searchBox]}>
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
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
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
        ListFooterComponent={
          !loading && filteredOrders.length > 0 ? (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPageChange={handlePageChange}
            />
          ) : null
        }
      />

      {/* global QuickAddPanel provides FAB - removed local FAB */}
    </SafeAreaView>
  )
}
