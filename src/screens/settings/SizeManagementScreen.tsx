import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, ScrollView, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/loading/Skeleton'
import { PaginationControl } from '../../components/common/PaginationControl'
import { sizeService, Size } from '../../services/api/ApiServices'
import { withOpacity } from '../../utils/colorUtils'
import { getCommonStyles } from '../../theme/commonStyles'
import { FormModal } from '../../components/common/FormModal'
import { FormField, FormRow, ActiveStatusToggle, FormActions, SectionBox } from '../../components/common/FormComponents'
import { exportToExcel } from '../../utils/exportUtils'

const fmtDate = (d: string) => {
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,'0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`
}

export const SizeManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showSuccess, showError } = useToast()
  const commonStyles = getCommonStyles(theme)

  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const [showForm, setShowForm] = useState(false)
  const [editingSize, setEditingSize] = useState<Size | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', length: '', width: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async (page = 1, q = search, status = statusFilter) => {
    setLoading(true)
    try {
      const res = await sizeService.getSizes({
        page, limit: itemsPerPage, search: q,
        isActive: status === 'all' ? undefined : status,
      } as any)
      setSizes(res.sizes)
      const total = (res as any).totalCount || res.total || 0
      setTotalItems(total)
      setTotalPages((res as any).totalPages || Math.max(1, Math.ceil(total / itemsPerPage)))
      setCurrentPage(page)
    } catch { showError('Error', 'Failed to load sizes') }
    finally { setLoading(false); setRefreshing(false) }
  }, [search, statusFilter])

  useFocusEffect(useCallback(() => { load(1) }, []))

  const handleSearch = (q: string) => { setSearch(q); load(1, q, statusFilter) }
  const handleStatus = (s: typeof statusFilter) => { setStatusFilter(s); load(1, search, s) }

  const handleSubmit = async () => {
    const finalName = formData.name.trim() || (formData.length && formData.width ? `${formData.length}x${formData.width}"` : '')
    if (!finalName) { showError('Error', 'Enter a name or dimensions'); return }
    setSubmitting(true)
    try {
      const payload = {
        name: finalName,
        description: formData.description,
        length: formData.length ? parseFloat(formData.length) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
        isActive: formData.isActive,
      }
      if (editingSize) {
        await sizeService.updateSize(editingSize.id, payload)
        showSuccess('Success', 'Size updated')
      } else {
        await sizeService.createSize(payload)
        showSuccess('Success', 'Size created')
      }
      resetForm(); load(1)
    } catch { showError('Error', 'Failed to save size') }
    finally { setSubmitting(false) }
  }

  const handleDelete = (size: Size) => {
    Alert.alert('Delete Size', `Delete "${size.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await sizeService.deleteSize(size.id); setSizes(p => p.filter(s => s.id !== size.id)); showSuccess('Deleted', 'Size deleted') }
        catch { showError('Error', 'Failed to delete size') }
      }},
    ])
  }

  const resetForm = () => { setFormData({ name: '', description: '', length: '', width: '', isActive: true }); setEditingSize(null); setShowForm(false) }

  const handleExport = () => {
    exportToExcel({ data: sizes, columns: [
      { key: 'name', label: 'Size Name' },
      { key: 'description', label: 'Description' },
      { key: 'length', label: 'Length (in)', format: (v: number) => v?.toString() || '' },
      { key: 'width', label: 'Width (in)', format: (v: number) => v?.toString() || '' },
      { key: 'isActive', label: 'Status', format: (v: boolean) => v ? 'Active' : 'Inactive' },
      { key: '_count.products', label: 'Products', format: (v: number) => v?.toString() || '0' },
      { key: 'createdAt', label: 'Created Date', format: (v: string) => fmtDate(v) },
    ], filename: 'sizes_export', reportTitle: 'Sizes Report' })
      .then(ok => { if (ok) showSuccess('Export', 'Excel file ready to share') })
  }

  const getDimensions = (item: Size) => {
    const l = (item as any).length
    const w = (item as any).width
    return l && w ? `${l}" × ${w}"` : item.description || 'N/A'
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    topBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
    actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 10, height: 40, gap: 6 },
    searchInput: { flex: 1, fontSize: 14, color: theme.text },
    iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.primary, paddingHorizontal: 14, height: 40, borderRadius: 12 },
    addBtnText: { color: theme.primaryForeground, fontWeight: '700', fontSize: 14 },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    countText: { fontSize: 13, color: theme.mutedForeground },
    toggleGroup: { flexDirection: 'row', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 8, overflow: 'hidden' },
    toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
    toggleBtnActive: { backgroundColor: theme.muted },
    toggleText: { fontSize: 11, fontWeight: '700', color: theme.mutedForeground },
    toggleTextActive: { color: theme.primary },
    filterBar: { paddingHorizontal: 16, paddingBottom: 8 },
    filterRow: { flexDirection: 'row', gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    filterChipText: { fontSize: 13, fontWeight: '600', color: theme.text },
    filterChipTextActive: { color: theme.primaryForeground },
    listContent: { paddingHorizontal: 16, paddingBottom: 80 },
    gridCard: { marginBottom: 12, borderRadius: 20, overflow: 'hidden', padding: 0 },
    gridCardInner: { padding: 16 },
    gridCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    gridName: { fontSize: 15, fontWeight: '800', color: theme.text, flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '700' },
    dimTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: withOpacity(theme.primary, 0.08), paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: withOpacity(theme.primary, 0.15), marginBottom: 8 },
    dimText: { fontSize: 13, fontWeight: '600', color: theme.text },
    gridMeta: { backgroundColor: withOpacity(theme.muted, 0.3), padding: 10, borderRadius: 12, marginBottom: 12, gap: 3 },
    gridMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
    gridMetaLabel: { fontSize: 11, color: theme.mutedForeground },
    gridMetaValue: { fontSize: 11, fontWeight: '600', color: theme.text },
    gridActions: { flexDirection: 'row', gap: 8 },
    editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
    editBtnText: { fontSize: 13, fontWeight: '700', color: theme.text },
    deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, backgroundColor: theme.error },
    deleteBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
    tableHeaderText: { fontSize: 10, fontWeight: '700', color: theme.mutedForeground, letterSpacing: 0.5 },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
    colName: { flex: 2 },
    colDim: { flex: 1, alignItems: 'center' },
    colStatus: { flex: 0.8, alignItems: 'center' },
    colActions: { flex: 1.2, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
    rowName: { fontSize: 14, fontWeight: '700', color: theme.text },
    rowSub: { fontSize: 11, color: theme.mutedForeground, marginTop: 2 },
    rowText: { fontSize: 12, color: theme.text, fontWeight: '600', textAlign: 'center' },
    rowIconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 14, color: theme.mutedForeground, marginTop: 12 },
  })

  const renderGridCard = ({ item }: { item: Size }) => (
    <Card style={[commonStyles.glassCard, s.gridCard]}>
      <View style={s.gridCardInner}>
        <View style={s.gridCardTop}>
          <Text style={s.gridName} numberOfLines={1}>{item.name}</Text>
          <View style={[s.statusBadge, { backgroundColor: item.isActive ? withOpacity(theme.primary, 0.15) : withOpacity(theme.error, 0.15) }]}>
            <Text style={[s.statusText, { color: item.isActive ? theme.primary : theme.error }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <View style={s.dimTag}>
          <Icon name="straighten" size={14} color={theme.primary} />
          <Text style={s.dimText}>{getDimensions(item)}</Text>
        </View>
        <View style={s.gridMeta}>
          <View style={s.gridMetaRow}><Text style={s.gridMetaLabel}>Products</Text><Text style={s.gridMetaValue}>{(item as any)._count?.products ?? 0}</Text></View>
          <View style={s.gridMetaRow}><Text style={s.gridMetaLabel}>Created</Text><Text style={s.gridMetaValue}>{fmtDate(item.createdAt)}</Text></View>
          <View style={s.gridMetaRow}><Text style={s.gridMetaLabel}>By</Text><Text style={s.gridMetaValue}>{(item as any).createdBy?.name || 'System'}</Text></View>
        </View>
        <View style={s.gridActions}>
          <TouchableOpacity style={s.editBtn} onPress={() => { setEditingSize(item); setFormData({ name: item.name, description: item.description || '', length: String((item as any).length || ''), width: String((item as any).width || ''), isActive: item.isActive ?? true }); setShowForm(true) }}>
            <Icon name="edit" size={14} color={theme.text} /><Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item)}>
            <Icon name="delete-outline" size={14} color="#fff" /><Text style={s.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  )

  const renderListRow = ({ item }: { item: Size }) => (
    <View style={s.tableRow}>
      <View style={s.colName}>
        <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.rowSub} numberOfLines={1}>{item.description || '—'}</Text>
      </View>
      <View style={s.colDim}><Text style={s.rowText}>{getDimensions(item)}</Text></View>
      <View style={s.colStatus}>
        <View style={[s.statusBadge, { backgroundColor: item.isActive ? withOpacity(theme.primary, 0.15) : withOpacity(theme.error, 0.15) }]}>
          <Text style={[s.statusText, { color: item.isActive ? theme.primary : theme.error }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <View style={s.colActions}>
        <TouchableOpacity style={s.rowIconBtn} onPress={() => { setEditingSize(item); setFormData({ name: item.name, description: item.description || '', length: String((item as any).length || ''), width: String((item as any).width || ''), isActive: item.isActive ?? true }); setShowForm(true) }}>
          <Icon name="edit" size={15} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.rowIconBtn, { borderColor: theme.error }]} onPress={() => handleDelete(item)}>
          <Icon name="delete-outline" size={15} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderSkeleton = () => (
    <Card style={[commonStyles.glassCard, s.gridCard]}>
      <View style={{ padding: 16 }}>
        <Skeleton height={20} width="50%" style={{ marginBottom: 10 }} />
        <Skeleton height={40} width="100%" style={{ marginBottom: 10 }} />
        <Skeleton height={36} width="100%" />
      </View>
    </Card>
  )

  return (
    <SafeAreaView style={s.container} edges={['right', 'left']}>
      <MainHeader />
      <View style={s.topBar}>
        <View style={s.titleRow}>
          <Text style={s.title}>Sizes</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => { setEditingSize(null); setFormData({ name: '', description: '', length: '', width: '', isActive: true }); setShowForm(true) }}>
            <Icon name="add" size={18} color={theme.primaryForeground} />
            <Text style={s.addBtnText}>Add Size</Text>
          </TouchableOpacity>
        </View>
        <View style={s.actionsRow}>
          <View style={s.searchBox}>
            <Icon name="search" size={18} color={theme.mutedForeground} />
            <TextInput style={s.searchInput} placeholder="Search sizes..." placeholderTextColor={theme.mutedForeground} value={search} onChangeText={handleSearch} />
            {search.length > 0 && <TouchableOpacity onPress={() => handleSearch('')}><Icon name="close" size={16} color={theme.mutedForeground} /></TouchableOpacity>}
          </View>
          <TouchableOpacity style={[s.iconBtn, showFilters && { backgroundColor: withOpacity(theme.primary, 0.1), borderColor: theme.primary }]} onPress={() => setShowFilters(v => !v)}>
            <Icon name="tune" size={18} color={showFilters ? theme.primary : theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={handleExport}>
            <Icon name="file-download" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={s.metaRow}>
          <Text style={s.countText}>{totalItems} sizes</Text>
          <View style={s.toggleGroup}>
            <TouchableOpacity style={[s.toggleBtn, viewMode === 'grid' && s.toggleBtnActive]} onPress={() => setViewMode('grid')}>
              <Icon name="grid-view" size={13} color={viewMode === 'grid' ? theme.primary : theme.mutedForeground} />
              <Text style={[s.toggleText, viewMode === 'grid' && s.toggleTextActive]}>GRID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.toggleBtn, viewMode === 'list' && s.toggleBtnActive]} onPress={() => setViewMode('list')}>
              <Icon name="view-list" size={13} color={viewMode === 'list' ? theme.primary : theme.mutedForeground} />
              <Text style={[s.toggleText, viewMode === 'list' && s.toggleTextActive]}>LIST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showFilters && (
        <View style={s.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.filterRow}>
              {(['all', 'true', 'false'] as const).map(sv => (
                <TouchableOpacity key={sv} style={[s.filterChip, statusFilter === sv && s.filterChipActive]} onPress={() => handleStatus(sv)}>
                  <Text style={[s.filterChipText, statusFilter === sv && s.filterChipTextActive]}>
                    {sv === 'all' ? 'All Status' : sv === 'true' ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <FlatList
        data={loading ? Array(6).fill({}) : sizes}
        renderItem={loading ? renderSkeleton : (viewMode === 'list' ? renderListRow : renderGridCard)}
        keyExtractor={(item, i) => loading ? `sk-${i}` : item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1) }} colors={[theme.primary]} tintColor={theme.primary} />}
        ListHeaderComponent={viewMode === 'list' && sizes.length > 0 ? (
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colName]}>SIZE</Text>
            <Text style={[s.tableHeaderText, s.colDim, { textAlign: 'center' }]}>DIMENSIONS</Text>
            <Text style={[s.tableHeaderText, s.colStatus, { textAlign: 'center' }]}>STATUS</Text>
            <Text style={[s.tableHeaderText, s.colActions]}>ACTIONS</Text>
          </View>
        ) : null}
        ListEmptyComponent={!loading ? (
          <View style={s.empty}><Icon name="straighten" size={56} color={theme.mutedForeground} /><Text style={s.emptyText}>No sizes found</Text></View>
        ) : null}
        ListFooterComponent={!loading && sizes.length > 0 ? (
          <PaginationControl currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={p => load(p)} />
        ) : null}
      />

      <FormModal key={editingSize?.id ?? 'new'} visible={showForm} title={editingSize ? 'Edit Size' : 'Add New Size'} onClose={resetForm}>
        <FormRow>
          <View style={{ flex: 1 }}>
            <FormField label="Name" value={formData.name} onChangeText={t => setFormData(p => ({ ...p, name: t }))} placeholder="e.g., 24×24" />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="Description" value={formData.description} onChangeText={t => setFormData(p => ({ ...p, description: t }))} placeholder="Optional" />
          </View>
        </FormRow>
        <SectionBox>
          <FormRow>
            <View style={{ flex: 1 }}>
              <FormField label="Length (inch)" leftIcon="straighten" value={formData.length} onChangeText={t => setFormData(p => ({ ...p, length: t }))} placeholder="e.g., 24" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Width (inch)" leftIcon="straighten" value={formData.width} onChangeText={t => setFormData(p => ({ ...p, width: t }))} placeholder="e.g., 24" keyboardType="decimal-pad" />
            </View>
          </FormRow>
        </SectionBox>
        <ActiveStatusToggle value={formData.isActive} onChange={v => setFormData(p => ({ ...p, isActive: v }))} />
        <FormActions submitLabel={editingSize ? 'Update Size' : 'Create Size'} onSubmit={handleSubmit} onCancel={resetForm} loading={submitting} />
      </FormModal>
    </SafeAreaView>
  )
}
