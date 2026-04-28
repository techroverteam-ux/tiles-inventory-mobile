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
import { categoryService, Category } from '../../services/api/ApiServices'
import { spacing } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'
import { getCommonStyles } from '../../theme/commonStyles'
import { FormModal } from '../../components/common/FormModal'
import { FormField, ActiveStatusToggle, FormActions } from '../../components/common/FormComponents'
import { exportToExcel } from '../../utils/exportUtils'

const fmtDate = (d: string) => {
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,'0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`
}

export const CategoryManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showSuccess, showError } = useToast()
  const commonStyles = getCommonStyles(theme)

  const [categories, setCategories] = useState<Category[]>([])
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async (page = 1, q = search, status = statusFilter) => {
    setLoading(true)
    try {
      const res = await categoryService.getCategories({
        page, limit: itemsPerPage, search: q,
        isActive: status === 'all' ? undefined : status,
      } as any)
      setCategories(res.categories)
      const total = (res as any).totalCount || res.total || 0
      setTotalItems(total)
      setTotalPages((res as any).totalPages || Math.max(1, Math.ceil(total / itemsPerPage)))
      setCurrentPage(page)
    } catch { showError('Error', 'Failed to load categories') }
    finally { setLoading(false); setRefreshing(false) }
  }, [search, statusFilter])

  useFocusEffect(useCallback(() => { load(1) }, []))

  const handleSearch = (q: string) => { setSearch(q); load(1, q, statusFilter) }
  const handleStatus = (s: typeof statusFilter) => { setStatusFilter(s); load(1, search, s) }

  const handleSubmit = async () => {
    if (!formData.name.trim()) { showError('Error', 'Name is required'); return }
    setSubmitting(true)
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData)
        showSuccess('Success', 'Category updated')
      } else {
        await categoryService.createCategory(formData)
        showSuccess('Success', 'Category created')
      }
      resetForm(); load(1)
    } catch { showError('Error', 'Failed to save category') }
    finally { setSubmitting(false) }
  }

  const handleDelete = (cat: Category) => {
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await categoryService.deleteCategory(cat.id); setCategories(p => p.filter(c => c.id !== cat.id)); showSuccess('Deleted', 'Category deleted') }
        catch { showError('Error', 'Failed to delete category') }
      }},
    ])
  }

  const resetForm = () => { setFormData({ name: '', description: '', isActive: true }); setEditingCategory(null); setShowForm(false) }

  const handleExport = () => {
    exportToExcel({ data: categories, columns: [
      { key: 'name', label: 'Category Name' },
      { key: 'description', label: 'Description' },
      { key: 'isActive', label: 'Status', format: (v: boolean) => v ? 'Active' : 'Inactive' },
      { key: '_count.products', label: 'Products', format: (v: number) => v?.toString() || '0' },
      { key: 'createdAt', label: 'Created Date', format: (v: string) => fmtDate(v) },
    ], filename: 'categories_export', reportTitle: 'Categories Report' })
      .then(ok => { if (ok) showSuccess('Export', 'Excel file ready to share') })
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
    gridDesc: { fontSize: 12, color: theme.mutedForeground, fontStyle: 'italic', marginBottom: 8, minHeight: 32 },
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
    colProducts: { flex: 0.8, alignItems: 'center' },
    colStatus: { flex: 0.8, alignItems: 'center' },
    colActions: { flex: 1.2, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
    rowName: { fontSize: 14, fontWeight: '700', color: theme.text },
    rowSub: { fontSize: 11, color: theme.mutedForeground, marginTop: 2 },
    rowText: { fontSize: 13, color: theme.text, fontWeight: '600' },
    rowIconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 14, color: theme.mutedForeground, marginTop: 12 },
  })

  const renderGridCard = ({ item }: { item: Category }) => (
    <Card style={[commonStyles.glassCard, s.gridCard]}>
      <View style={s.gridCardInner}>
        <View style={s.gridCardTop}>
          <Text style={s.gridName} numberOfLines={1}>{item.name}</Text>
          <View style={[s.statusBadge, { backgroundColor: item.isActive ? withOpacity(theme.primary, 0.15) : withOpacity(theme.error, 0.15) }]}>
            <Text style={[s.statusText, { color: item.isActive ? theme.primary : theme.error }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={s.gridDesc} numberOfLines={2}>{item.description || ''}</Text>
        <View style={s.gridMeta}>
          <View style={s.gridMetaRow}><Text style={s.gridMetaLabel}>Products</Text><Text style={s.gridMetaValue}>{(item as any)._count?.products ?? 0}</Text></View>
          <View style={s.gridMetaRow}><Text style={s.gridMetaLabel}>Created</Text><Text style={s.gridMetaValue}>{fmtDate(item.createdAt)}</Text></View>
          <View style={s.gridMetaRow}><Text style={s.gridMetaLabel}>By</Text><Text style={s.gridMetaValue}>{(item as any).createdBy?.name || 'System'}</Text></View>
        </View>
        <View style={s.gridActions}>
          <TouchableOpacity style={s.editBtn} onPress={() => { setEditingCategory(item); setFormData({ name: item.name, description: item.description || '', isActive: item.isActive ?? true }); setShowForm(true) }}>
            <Icon name="edit" size={14} color={theme.text} /><Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item)}>
            <Icon name="delete-outline" size={14} color="#fff" /><Text style={s.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  )

  const renderListRow = ({ item }: { item: Category }) => (
    <View style={s.tableRow}>
      <View style={s.colName}>
        <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.rowSub} numberOfLines={1}>{item.description || '—'}</Text>
      </View>
      <View style={s.colProducts}><Text style={s.rowText}>{(item as any)._count?.products ?? 0}</Text></View>
      <View style={s.colStatus}>
        <View style={[s.statusBadge, { backgroundColor: item.isActive ? withOpacity(theme.primary, 0.15) : withOpacity(theme.error, 0.15) }]}>
          <Text style={[s.statusText, { color: item.isActive ? theme.primary : theme.error }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <View style={s.colActions}>
        <TouchableOpacity style={s.rowIconBtn} onPress={() => { setEditingCategory(item); setFormData({ name: item.name, description: item.description || '', isActive: item.isActive ?? true }); setShowForm(true) }}>
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
          <Text style={s.title}>Categories</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => { setEditingCategory(null); setFormData({ name: '', description: '', isActive: true }); setShowForm(true) }}>
            <Icon name="add" size={18} color={theme.primaryForeground} />
            <Text style={s.addBtnText}>Add Category</Text>
          </TouchableOpacity>
        </View>
        <View style={s.actionsRow}>
          <View style={s.searchBox}>
            <Icon name="search" size={18} color={theme.mutedForeground} />
            <TextInput style={s.searchInput} placeholder="Search categories..." placeholderTextColor={theme.mutedForeground} value={search} onChangeText={handleSearch} />
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
          <Text style={s.countText}>{totalItems} categories</Text>
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
        data={loading ? Array(6).fill({}) : categories}
        renderItem={loading ? renderSkeleton : (viewMode === 'list' ? renderListRow : renderGridCard)}
        keyExtractor={(item, i) => loading ? `sk-${i}` : item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1) }} colors={[theme.primary]} tintColor={theme.primary} />}
        ListHeaderComponent={viewMode === 'list' && categories.length > 0 ? (
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colName]}>CATEGORY</Text>
            <Text style={[s.tableHeaderText, s.colProducts, { textAlign: 'center' }]}>PRODUCTS</Text>
            <Text style={[s.tableHeaderText, s.colStatus, { textAlign: 'center' }]}>STATUS</Text>
            <Text style={[s.tableHeaderText, s.colActions]}>ACTIONS</Text>
          </View>
        ) : null}
        ListEmptyComponent={!loading ? (
          <View style={s.empty}><Icon name="category" size={56} color={theme.mutedForeground} /><Text style={s.emptyText}>No categories found</Text></View>
        ) : null}
        ListFooterComponent={!loading && categories.length > 0 ? (
          <PaginationControl currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={p => load(p)} />
        ) : null}
      />

      <FormModal key={editingCategory?.id ?? 'new'} visible={showForm} title={editingCategory ? 'Edit Category' : 'Add New Category'} onClose={resetForm}>
        <FormField label="Name" required value={formData.name} onChangeText={t => setFormData(p => ({ ...p, name: t }))} placeholder="Enter category name" />
        <FormField label="Description" value={formData.description} onChangeText={t => setFormData(p => ({ ...p, description: t }))} placeholder="Enter description" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
        <ActiveStatusToggle value={formData.isActive} onChange={v => setFormData(p => ({ ...p, isActive: v }))} />
        <FormActions submitLabel={editingCategory ? 'Update Category' : 'Create Category'} onSubmit={handleSubmit} onCancel={resetForm} loading={submitting} />
      </FormModal>
    </SafeAreaView>
  )
}
