import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, Image, Modal, ScrollView, TextInput as RNTextInput,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
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
import { spacing } from '../../theme'
import { getCommonStyles } from '../../theme/commonStyles'
import { InventoryNavigationProp } from '../../navigation/types'
import { inventoryService, Batch } from '../../services/api/ApiServices'
import { withOpacity } from '../../utils/colorUtils'
import { resolvePublicUrl } from '../../config/appConfig'
import { useExportWithModal } from '../../hooks/useExportWithModal'

export const InventoryListScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<InventoryNavigationProp>()
  const { showWarning, showSuccess, showError } = useToast()
  const { modalState, closeModal, exportToExcelWithModal } = useExportWithModal()
  const commonStyles = getCommonStyles(theme)

  const [inventory, setInventory] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Edit modal
  const [editBatch, setEditBatch] = useState<Batch | null>(null)
  const [editForm, setEditForm] = useState({ batchNumber: '', quantity: '', purchasePrice: '', sellingPrice: '' })
  const [saving, setSaving] = useState(false)

  const fetchInventory = useCallback(async (page: number, q = search, pageSize = itemsPerPage) => {
    try {
      setLoading(true)
      const limit = pageSize === 0 ? 1000 : pageSize
      const response = await inventoryService.getInventory({ page, limit, search: q })
      setInventory(response.inventory || [])
      const total = response.pagination?.total || 0
      setTotalItems(total)
      setTotalPages(Math.max(1, Math.ceil(total / limit)))
      setCurrentPage(page)
    } catch {
      showError('Error', 'Failed to fetch inventory data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search])

  const handleSearch = (q: string) => {
    setSearch(q)
    fetchInventory(1, q)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    fetchInventory(1, search, value)
  }

  useFocusEffect(useCallback(() => { fetchInventory(1) }, [fetchInventory]))

  const onRefresh = useCallback(() => { setRefreshing(true); fetchInventory(1) }, [fetchInventory])

  const handleEdit = (batch: Batch) => {
    setEditBatch(batch)
    setEditForm({
      batchNumber: batch.batchNumber || '',
      quantity: String(batch.quantity),
      purchasePrice: String(batch.purchasePrice || ''),
      sellingPrice: String(batch.sellingPrice || ''),
    })
  }

  const handleSaveEdit = async () => {
    if (!editBatch) return
    setSaving(true)
    try {
      const updated = await inventoryService.updateInventory(editBatch.id, {
        batchNumber: editForm.batchNumber || undefined,
        quantity: parseInt(editForm.quantity) || undefined,
        purchasePrice: editForm.purchasePrice ? parseFloat(editForm.purchasePrice) : undefined,
        sellingPrice: editForm.sellingPrice ? parseFloat(editForm.sellingPrice) : undefined,
      })
      setInventory(prev => prev.map(b => b.id === editBatch.id ? { ...b, ...updated } : b))
      showSuccess('Updated', 'Inventory batch updated')
      setEditBatch(null)
    } catch {
      showError('Error', 'Failed to update batch')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (batch: Batch) => {
    showWarning(
      'Delete Batch',
      `Delete batch ${batch.batchNumber || batch.id}? This will also remove related records.`,
      {
        action: {
          label: 'Delete',
          onPress: async () => {
            try {
              await inventoryService.deleteInventory(batch.id)
              setInventory(prev => prev.filter(b => b.id !== batch.id))
              setTotalItems(t => Math.max(0, t - 1))
              showSuccess('Deleted', 'Batch deleted')
            } catch {
              showError('Error', 'Failed to delete batch')
            }
          }
        }
      }
    )
  }

  const filteredInventory = inventory.filter((item) => {
    if (stockFilter === 'low') return item.quantity > 0 && item.quantity < 10
    if (stockFilter === 'out') return item.quantity === 0
    if (stockFilter === 'in') return item.quantity >= 10
    return true
  })

  const handleExportFiltered = async () => {
    try {
      const response = await inventoryService.getInventory({ page: 1, limit: 10000, search })
      const allInventory = response.inventory || []
      const filteredForExport = allInventory.filter((item) => {
        if (stockFilter === 'low') return item.quantity > 0 && item.quantity < 10
        if (stockFilter === 'out') return item.quantity === 0
        if (stockFilter === 'in') return item.quantity >= 10
        return true
      })
      await exportToExcelWithModal({
        data: filteredForExport,
        columns: [
          { key: 'batchNumber', label: 'Batch #' },
          { key: 'productCode', label: 'Product Code' },
          { key: 'productName', label: 'Product Name' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'purchasePrice', label: 'Purchase Price' },
          { key: 'sellingPrice', label: 'Selling Price' },
        ],
        filename: 'inventory_export',
        reportTitle: 'Inventory Stock Report',
      })
    } catch {
      showError('Export Failed', 'Unable to load inventory for export')
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    listContainer: { padding: spacing.base, paddingBottom: 80 },
    inventoryCard: { marginBottom: spacing.md, padding: 0, borderRadius: 16, overflow: 'hidden' },
    gridCard: { width: '100%' },
    imageContainer: { width: '100%', height: 180, position: 'relative' },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderImage: { width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center' },
    unitsBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    unitsBadgeText: { color: theme.primaryForeground, fontSize: 12, fontWeight: 'bold' },
    cardContent: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    productName: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 4 },
    brandName: { fontSize: 12, fontWeight: '600', color: theme.primary, textTransform: 'uppercase' },
    actionsRow: { flexDirection: 'row', gap: 8 },
    iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 8 },
    grid2x2: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
    gridItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    gridLabel: { fontSize: 12, color: theme.mutedForeground },
    gridValue: { fontSize: 12, fontWeight: 'bold', color: theme.text },
    footerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border },
    sellingLabel: { fontSize: 14, color: theme.mutedForeground },
    sellingValue: { fontSize: 14, fontWeight: 'bold', color: theme.primary },
    fab: { position: 'absolute', right: spacing.base, bottom: spacing.base, width: 64, height: 64, borderRadius: 32, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomWidth: 1, borderBottomColor: theme.border, marginTop: 8 },
    tableHeaderText: { color: theme.mutedForeground, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
    colPhoto: { flex: 0.8 },
    colProduct: { flex: 2, paddingRight: 8 },
    colStock: { flex: 1, alignItems: 'center' },
    colPrice: { flex: 1, alignItems: 'flex-end' },
    rowImage: { width: 60, height: 40, borderRadius: 6, resizeMode: 'cover' },
    rowPlaceholder: { width: 60, height: 40, borderRadius: 6, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' },
    rowTitle: { color: theme.text, fontSize: 14, fontWeight: 'bold' },
    rowSubtitle: { color: theme.mutedForeground, fontSize: 10, marginTop: 2 },
    rowText: { color: theme.text, fontSize: 12, fontWeight: '600' },
    rowBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    rowBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    // Edit modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.text, backgroundColor: theme.card, marginBottom: 14 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: theme.text },
    saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center' },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: theme.primaryForeground },
  })

  const renderInventoryCard = ({ item: batch }: { item: Batch }) => (
    <Card style={[commonStyles.glassCard, s.inventoryCard, viewMode === 'grid' && s.gridCard]}>
      <View style={s.imageContainer}>
        {batch.product.imageUrl ? (
          <Image source={{ uri: resolvePublicUrl(batch.product.imageUrl)! }} style={s.image} />
        ) : (
          <View style={s.placeholderImage}>
            <Icon name="image" size={48} color={theme.textSecondary} />
          </View>
        )}
        <View style={s.unitsBadge}>
          <Text style={s.unitsBadgeText}>{batch.quantity} units</Text>
        </View>
      </View>
      <View style={s.cardContent}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.productName} numberOfLines={1}>{batch.product.name}</Text>
            <Text style={s.brandName} numberOfLines={1}>{batch.product.brand.name}</Text>
          </View>
          <View style={s.actionsRow}>
            <TouchableOpacity style={s.iconBtn} onPress={() => handleEdit(batch)}>
              <Icon name="edit" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { borderColor: theme.error }]} onPress={() => handleDelete(batch)}>
              <Icon name="delete-outline" size={16} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.grid2x2}>
          <View style={s.gridItem}><Text style={s.gridLabel}>Size: </Text><Text style={s.gridValue}>{batch.product.size?.name || 'N/A'}</Text></View>
          <View style={s.gridItem}><Text style={s.gridLabel}>Cat: </Text><Text style={s.gridValue}>{batch.product.category?.name || 'N/A'}</Text></View>
          <View style={s.gridItem}><Text style={s.gridLabel}>Batch: </Text><Text style={s.gridValue}>{batch.batchNumber || 'N/A'}</Text></View>
          <View style={s.gridItem}><Text style={s.gridLabel}>Loc: </Text><Text style={s.gridValue}>{batch.location?.name || 'N/A'}</Text></View>
        </View>
        <View style={s.footerRow}>
          <Text style={s.sellingLabel}>Selling: </Text>
          <Text style={s.sellingValue}>₹{batch.sellingPrice || 0}</Text>
        </View>
      </View>
    </Card>
  )

  const renderInventoryRow = ({ item: batch }: { item: Batch }) => (
    <TouchableOpacity style={s.tableRow} onPress={() => handleEdit(batch)} activeOpacity={0.7}>
      <View style={s.colPhoto}>
        {batch.product.imageUrl ? (
          <Image source={{ uri: resolvePublicUrl(batch.product.imageUrl)! }} style={s.rowImage} />
        ) : (
          <View style={s.rowPlaceholder}><Icon name="image" size={16} color={theme.textSecondary} /></View>
        )}
      </View>
      <View style={s.colProduct}>
        <Text style={s.rowTitle} numberOfLines={1}>{batch.product.name}</Text>
        <Text style={s.rowSubtitle} numberOfLines={1}>Batch: {batch.batchNumber || 'N/A'}</Text>
      </View>
      <View style={s.colStock}>
        <View style={[s.rowBadge, { backgroundColor: batch.quantity < 10 ? theme.warning : theme.primary }]}>
          <Text style={s.rowBadgeText}>{batch.quantity} units</Text>
        </View>
      </View>
      <View style={s.colPrice}>
        <Text style={s.rowText}>₹{batch.sellingPrice || 0}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderItem = ({ item }: { item: Batch }) =>
    viewMode === 'list' ? renderInventoryRow({ item }) : renderInventoryCard({ item })

  const renderListHeader = () => {
    if (viewMode !== 'list' || inventory.length === 0) return null
    return (
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, s.colPhoto]}>PHOTO</Text>
        <Text style={[s.tableHeaderText, s.colProduct]}>PRODUCT</Text>
        <Text style={[s.tableHeaderText, s.colStock]}>STOCK</Text>
        <Text style={[s.tableHeaderText, s.colPrice]}>PRICE</Text>
      </View>
    )
  }

  const renderSkeleton = () => {
    if (viewMode === 'list') {
      return (
        <View style={s.tableRow}>
          <View style={s.colPhoto}><Skeleton height={40} width={60} borderRadius={6} /></View>
          <View style={s.colProduct}><Skeleton height={16} width="80%" /></View>
          <View style={s.colStock}><Skeleton height={24} width={60} borderRadius={12} /></View>
          <View style={s.colPrice}><Skeleton height={16} width={40} /></View>
        </View>
      )
    }
    return (
      <Card style={[commonStyles.glassCard, s.inventoryCard]}>
        <View style={{ height: 180, width: '100%', backgroundColor: theme.surface }}>
          <Skeleton height="100%" width="100%" />
        </View>
        <View style={s.cardContent}>
          <Skeleton height={24} width="50%" style={{ marginBottom: 16 }} />
          <Skeleton height={60} width="100%" />
        </View>
      </Card>
    )
  }

  return (
    <SafeAreaView style={s.container} edges={['right', 'left']}>
      <MainHeader />
      <ScreenActionBar
        title="Inventory"
        primaryActionLabel="Add Stock"
        onPrimaryAction={() => navigation.navigate('StockUpdate', { productId: '' })}
        itemCount={totalItems}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExportFiltered}
        onToggleFilters={() => setShowFilters(v => !v)}
      />
      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={[s.input, { flexDirection: 'row', alignItems: 'center', gap: 8, height: 42, paddingVertical: 0 }]}>
          <Icon name="search" size={18} color={theme.mutedForeground} />
          <RNTextInput
            style={{ flex: 1, fontSize: 14, color: theme.text }}
            placeholder="Search inventory..."
            placeholderTextColor={theme.mutedForeground}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close" size={16} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFilters && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {([
                { key: 'all', label: 'All' },
                { key: 'in', label: 'In Stock' },
                { key: 'low', label: 'Low Stock' },
                { key: 'out', label: 'Out of Stock' },
              ] as const).map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setStockFilter(f.key)}
                  style={{
                    borderWidth: 1,
                    borderColor: stockFilter === f.key ? theme.primary : theme.border,
                    backgroundColor: stockFilter === f.key ? theme.primary : theme.surface,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: stockFilter === f.key ? theme.primaryForeground : theme.text, fontWeight: '700', fontSize: 12 }}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <FlatList
        data={loading ? Array(viewMode === 'list' ? 6 : 3).fill({}) : filteredInventory}
        renderItem={loading ? renderSkeleton : renderItem}
        keyExtractor={(item, index) => loading ? `skel-${index}` : item.id}
        contentContainerStyle={s.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={
          !loading && filteredInventory.length > 0 ? (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredInventory.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPageChange={p => fetchInventory(p)}
            />
          ) : null
        }
      />

      {/* global QuickAddPanel provides FAB - removed local FAB */}

      {/* Inline Edit Modal */}
      <Modal visible={!!editBatch} transparent animationType="slide" onRequestClose={() => setEditBatch(null)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setEditBatch(null)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={s.modalSheet}>
              <Text style={s.modalTitle}>Edit Inventory Batch</Text>
              <Text style={s.inputLabel}>Batch Number</Text>
              <RNTextInput
                style={s.input}
                value={editForm.batchNumber}
                onChangeText={t => setEditForm(p => ({ ...p, batchNumber: t }))}
                placeholderTextColor={theme.mutedForeground}
              />
              <Text style={s.inputLabel}>Quantity</Text>
              <RNTextInput
                style={s.input}
                value={editForm.quantity}
                onChangeText={t => setEditForm(p => ({ ...p, quantity: t }))}
                keyboardType="number-pad"
                placeholderTextColor={theme.mutedForeground}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>Purchase Price</Text>
                  <RNTextInput
                    style={s.input}
                    value={editForm.purchasePrice}
                    onChangeText={t => setEditForm(p => ({ ...p, purchasePrice: t }))}
                    keyboardType="decimal-pad"
                    placeholderTextColor={theme.mutedForeground}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>Selling Price</Text>
                  <RNTextInput
                    style={s.input}
                    value={editForm.sellingPrice}
                    onChangeText={t => setEditForm(p => ({ ...p, sellingPrice: t }))}
                    keyboardType="decimal-pad"
                    placeholderTextColor={theme.mutedForeground}
                  />
                </View>
              </View>
              <View style={s.modalActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setEditBatch(null)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSaveEdit} disabled={saving}>
                  <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      <DownloadCompletionModal
        visible={modalState.visible}
        filename={modalState.filename}
        filepath={modalState.filepath}
        filesize={modalState.filesize}
        onClose={closeModal}
      />
    </SafeAreaView>
  )
}
