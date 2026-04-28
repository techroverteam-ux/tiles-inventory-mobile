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
import { locationService, Location } from '../../services/api/ApiServices'
import { withOpacity } from '../../utils/colorUtils'
import { getCommonStyles } from '../../theme/commonStyles'
import { FormModal } from '../../components/common/FormModal'
import { FormField, ActiveStatusToggle, FormActions } from '../../components/common/FormComponents'
import { exportToExcel } from '../../utils/exportUtils'

const fmtDate = (d: string) => {
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,'0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`
}

export const LocationManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showSuccess, showError } = useToast()
  const commonStyles = getCommonStyles(theme)

  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async (page = 1, q = search, status = statusFilter) => {
    setLoading(true)
    try {
      const res = await locationService.getLocations({
        page, limit: itemsPerPage, search: q,
        isActive: status === 'all' ? undefined : status,
      })
      setLocations(res.locations)
      const total = (res as any).totalCount || res.total || 0
      setTotalItems(total)
      setTotalPages((res as any).totalPages || Math.max(1, Math.ceil(total / itemsPerPage)))
      setCurrentPage(page)
    } catch { showError('Error', 'Failed to load locations') }
    finally { setLoading(false); setRefreshing(false) }
  }, [search, statusFilter])

  useFocusEffect(useCallback(() => { load(1) }, []))

  const handleSearch = (q: string) => { setSearch(q); load(1, q, statusFilter) }
  const handleStatus = (s: typeof statusFilter) => { setStatusFilter(s); load(1, search, s) }

  const handleSubmit = async () => {
    if (!formData.name.trim()) { showError('Error', 'Name is required'); return }
    setSubmitting(true)
    try {
      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, formData)
        showSuccess('Success', 'Location updated')
      } else {
        await locationService.createLocation(formData)
        showSuccess('Success', 'Location created')
      }
      resetForm(); load(1)
    } catch { showError('Error', 'Failed to save location') }
    finally { setSubmitting(false) }
  }

  const handleDelete = (loc: Location) => {
    Alert.alert('Delete Location', `Delete "${loc.name}"? All stock batches in this location will also be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await locationService.deleteLocation(loc.id); setLocations(p => p.filter(l => l.id !== loc.id)); showSuccess('Deleted', 'Location deleted') }
        catch { showError('Error', 'Failed to delete location') }
      }},
    ])
  }

  const resetForm = () => { setFormData({ name: '', address: '', isActive: true }); setEditingLocation(null); setShowForm(false) }

  const handleExport = () => {
    exportToExcel({ data: locations, columns: [
      { key: 'name', label: 'Location Name' },
      { key: 'address', label: 'Address' },
      { key: 'isActive', label: 'Status', format: (v: boolean) => v ? 'Active' : 'Inactive' },
      { key: '_count.batches', label: 'Stock Batches', format: (v: number) => v?.toString() || '0' },
      { key: 'createdAt', label: 'Created Date', format: (v: string) => fmtDate(v) },
    ], filename: 'locations_export', reportTitle: 'Locations Report' })
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
    // Grid card
    gridCard: { marginBottom: 12, borderRadius: 20, overflow: 'hidden', padding: 0 },
    gridCardInner: { padding: 0 },
    gridIconArea: { height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: withOpacity(theme.primary, 0.05), position: 'relative' },
    gridIconWrap: { width: 64, height: 64, borderRadius: 16, backgroundColor: withOpacity(theme.primary, 0.12), alignItems: 'center', justifyContent: 'center' },
    gridBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    gridBadgeText: { fontSize: 10, fontWeight: '700' },
    gridContent: { padding: 14 },
    gridName: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 4 },
    gridAddress: { fontSize: 12, color: theme.mutedForeground, fontStyle: 'italic', marginBottom: 10 },
    gridBatchBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: withOpacity(theme.primary, 0.08), paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: withOpacity(theme.primary, 0.15), marginBottom: 12 },
    gridBatchText: { fontSize: 12, fontWeight: '700', color: theme.text },
    gridActions: { flexDirection: 'row', gap: 8 },
    editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
    editBtnText: { fontSize: 13, fontWeight: '700', color: theme.text },
    deleteIconBtn: { width: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 10 },
    // List row
    tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
    tableHeaderText: { fontSize: 10, fontWeight: '700', color: theme.mutedForeground, letterSpacing: 0.5 },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
    colName: { flex: 2 },
    colBatches: { flex: 0.8, alignItems: 'center' },
    colStatus: { flex: 0.8, alignItems: 'center' },
    colActions: { flex: 1.2, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
    rowName: { fontSize: 14, fontWeight: '700', color: theme.text },
    rowSub: { fontSize: 11, color: theme.mutedForeground, marginTop: 2 },
    rowText: { fontSize: 13, color: theme.text, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '700' },
    rowIconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 14, color: theme.mutedForeground, marginTop: 12 },
  })

  const renderGridCard = ({ item }: { item: Location }) => (
    <Card style={[commonStyles.glassCard, s.gridCard]}>
      <View style={s.gridCardInner}>
        <View style={s.gridIconArea}>
          <View style={s.gridIconWrap}>
            <Icon name="warehouse" size={32} color={theme.primary} />
          </View>
          <View style={[s.gridBadge, { backgroundColor: item.isActive ? withOpacity(theme.primary, 0.15) : withOpacity(theme.error, 0.15) }]}>
            <Text style={[s.gridBadgeText, { color: item.isActive ? theme.primary : theme.error }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <View style={s.gridContent}>
          <Text style={s.gridName} numberOfLines={1}>{item.name}</Text>
          {item.address ? <Text style={s.gridAddress} numberOfLines={1}>{item.address}</Text> : null}
          <View style={s.gridBatchBox}>
            <Icon name="inventory" size={14} color={theme.primary} />
            <Text style={s.gridBatchText}>{(item as any)._count?.batches ?? 0} stock batches</Text>
          </View>
          <View style={s.gridActions}>
            <TouchableOpacity style={s.editBtn} onPress={() => { setEditingLocation(item); setFormData({ name: item.name, address: item.address || '', isActive: item.isActive ?? true }); setShowForm(true) }}>
              <Icon name="edit" size={14} color={theme.text} /><Text style={s.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.deleteIconBtn} onPress={() => handleDelete(item)}>
              <Icon name="delete-outline" size={16} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  )

  const renderListRow = ({ item }: { item: Location }) => (
    <View style={s.tableRow}>
      <View style={s.colName}>
        <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
        {item.address ? <Text style={s.rowSub} numberOfLines={1}>{item.address}</Text> : null}
      </View>
      <View style={s.colBatches}><Text style={s.rowText}>{(item as any)._count?.batches ?? 0}</Text></View>
      <View style={s.colStatus}>
        <View style={[s.statusBadge, { backgroundColor: item.isActive ? withOpacity(theme.primary, 0.15) : withOpacity(theme.error, 0.15) }]}>
          <Text style={[s.statusText, { color: item.isActive ? theme.primary : theme.error }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <View style={s.colActions}>
        <TouchableOpacity style={s.rowIconBtn} onPress={() => { setEditingLocation(item); setFormData({ name: item.name, address: item.address || '', isActive: item.isActive ?? true }); setShowForm(true) }}>
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
      <View style={{ height: 120, backgroundColor: theme.surface }} />
      <View style={{ padding: 14 }}>
        <Skeleton height={20} width="60%" style={{ marginBottom: 10 }} />
        <Skeleton height={36} width="100%" />
      </View>
    </Card>
  )

  return (
    <SafeAreaView style={s.container} edges={['right', 'left']}>
      <MainHeader />
      <View style={s.topBar}>
        <View style={s.titleRow}>
          <Text style={s.title}>Locations</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => { setEditingLocation(null); setFormData({ name: '', address: '', isActive: true }); setShowForm(true) }}>
            <Icon name="add" size={18} color={theme.primaryForeground} />
            <Text style={s.addBtnText}>Add Location</Text>
          </TouchableOpacity>
        </View>
        <View style={s.actionsRow}>
          <View style={s.searchBox}>
            <Icon name="search" size={18} color={theme.mutedForeground} />
            <TextInput style={s.searchInput} placeholder="Search locations..." placeholderTextColor={theme.mutedForeground} value={search} onChangeText={handleSearch} />
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
          <Text style={s.countText}>{totalItems} locations</Text>
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
        data={loading ? Array(6).fill({}) : locations}
        renderItem={loading ? renderSkeleton : (viewMode === 'list' ? renderListRow : renderGridCard)}
        keyExtractor={(item, i) => loading ? `sk-${i}` : item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1) }} colors={[theme.primary]} tintColor={theme.primary} />}
        ListHeaderComponent={viewMode === 'list' && locations.length > 0 ? (
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colName]}>LOCATION</Text>
            <Text style={[s.tableHeaderText, s.colBatches, { textAlign: 'center' }]}>BATCHES</Text>
            <Text style={[s.tableHeaderText, s.colStatus, { textAlign: 'center' }]}>STATUS</Text>
            <Text style={[s.tableHeaderText, s.colActions]}>ACTIONS</Text>
          </View>
        ) : null}
        ListEmptyComponent={!loading ? (
          <View style={s.empty}><Icon name="warehouse" size={56} color={theme.mutedForeground} /><Text style={s.emptyText}>No locations found</Text></View>
        ) : null}
        ListFooterComponent={!loading && locations.length > 0 ? (
          <PaginationControl currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={p => load(p)} />
        ) : null}
      />

      <FormModal key={editingLocation?.id ?? 'new'} visible={showForm} title={editingLocation ? 'Edit Location' : 'Add New Location'} onClose={resetForm}>
        <FormField label="Location Name" required value={formData.name} onChangeText={t => setFormData(p => ({ ...p, name: t }))} placeholder="e.g., Warehouse A, Showroom Floor 1" />
        <FormField label="Address (Optional)" value={formData.address} onChangeText={t => setFormData(p => ({ ...p, address: t }))} placeholder="Enter address" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
        <ActiveStatusToggle value={formData.isActive} onChange={v => setFormData(p => ({ ...p, isActive: v }))} subtitle="Visible in system operations" />
        <FormActions submitLabel={editingLocation ? 'Update Location' : 'Create Location'} onSubmit={handleSubmit} onCancel={resetForm} loading={submitting} />
      </FormModal>
    </SafeAreaView>
  )
}
