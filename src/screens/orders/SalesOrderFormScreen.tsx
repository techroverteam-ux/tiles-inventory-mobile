import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { SelectModal } from '../../components/common/SelectModal'
import { FormField, FormRow, FormActions } from '../../components/common/FormComponents'
import { DatePickerField } from '../../components/common/DatePickerField'
import { MainStackParamList } from '../../navigation/types'
import { salesOrderService, productService, locationService, Product, Location } from '../../services/api/ApiServices'
import { apiClient } from '../../services/api/ApiClient'
import { useToast } from '../../context/ToastContext'

type SalesOrderFormRouteProp = RouteProp<MainStackParamList, 'SalesOrderForm'>

const generateOrderNumber = () => `SO-${Date.now()}`

interface OrderEntry {
  productId: string
  locationId: string
  batchId: string
  batchName: string
  quantity: string
  soldDate: string
}

const emptyEntry = (): OrderEntry => ({
  productId: '', locationId: '', batchId: '', batchName: '',
  quantity: '', soldDate: new Date().toISOString().split('T')[0],
})

export const SalesOrderFormScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const { showError, showSuccess } = useToast()
  const route = useRoute<SalesOrderFormRouteProp>()
  const { orderId, order } = route.params || {}

  const [orderNumber, setOrderNumber] = useState(order?.orderNumber || generateOrderNumber())
  const [formData, setFormData] = useState<OrderEntry>(emptyEntry())
  const [queued, setQueued] = useState<OrderEntry[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productBatches, setProductBatches] = useState<any[]>([])
  const [totalStock, setTotalStock] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    productService.getProducts(1, 100).then(r => setProducts(r.products)).catch(() => {})
  }, [])

  // Fetch batches when product changes
  useEffect(() => {
    if (!formData.productId) {
      setProductBatches([]); setTotalStock(null)
      setFormData(p => ({ ...p, locationId: '', batchId: '', batchName: '', quantity: '' }))
      return
    }
    apiClient.get(`/inventory/by-product/${formData.productId}`)
      .then(r => {
        setProductBatches(r.data.batches || [])
        setTotalStock(r.data.totalStock ?? 0)
        setFormData(p => ({ ...p, locationId: '', batchId: '', batchName: '', quantity: '' }))
      })
      .catch(() => { setProductBatches([]); setTotalStock(null) })
  }, [formData.productId])

  // Auto-fill batch when location changes
  useEffect(() => {
    if (!formData.locationId) {
      setFormData(p => ({ ...p, batchId: '', batchName: '', quantity: '' })); return
    }
    const batch = productBatches.find((b: any) => b.location.id === formData.locationId)
    setFormData(p => ({ ...p, batchId: batch?.id || '', batchName: batch?.batchNumber || '', quantity: '' }))
  }, [formData.locationId])

  const update = (field: keyof OrderEntry, value: string) => {
    setFormData(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const availableLocations = productBatches.map((b: any) => ({
    id: b.location.id,
    name: `${b.location.name} (${b.quantity} units)`,
  }))

  const selectedBatch = productBatches.find((b: any) => b.location.id === formData.locationId)
  const locationStock = selectedBatch?.quantity ?? 0
  const noStock = formData.productId && totalStock !== null && totalStock <= 0

  const isCurrentValid = !!(formData.productId && formData.locationId && formData.batchId && formData.quantity && parseInt(formData.quantity) > 0 && !noStock)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.productId) e.productId = 'Product is required'
    if (!formData.locationId) e.locationId = 'Location is required'
    if (!formData.quantity || isNaN(Number(formData.quantity))) e.quantity = 'Valid quantity is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddMore = () => {
    if (!isCurrentValid) return
    setQueued(q => [...q, { ...formData }])
    setFormData(emptyEntry())
    setErrors({})
  }

  const removeQueued = (i: number) => setQueued(q => q.filter((_, j) => j !== i))

  const handleSave = async () => {
    const all = isCurrentValid ? [...queued, formData] : queued
    if (all.length === 0) { if (!validate()) return }

    setSaving(true)
    try {
      if (orderId) {
        await salesOrderService.updateSalesOrder(orderId, {
          orderNumber,
          productId: formData.productId,
          locationId: formData.locationId,
          batchId: formData.batchId,
          batchName: formData.batchName || undefined,
          quantity: Number(formData.quantity),
          soldDate: formData.soldDate || new Date().toISOString(),
          status: 'DRAFT' as const,
        })
        showSuccess('Success', 'Order updated')
        navigation.goBack()
      } else {
        let success = 0
        for (const entry of all) {
          await salesOrderService.createSalesOrder({
            productId: entry.productId,
            batchId: entry.batchId,
            quantity: Number(entry.quantity),
            soldDate: entry.soldDate || new Date().toISOString().split('T')[0],
            orderNumber: `SO-${Date.now()}`,
          })
          success++
        }
        showSuccess('Success', `${success} order${success > 1 ? 's' : ''} created`)
        navigation.goBack()
      }
    } catch (e: any) {
      showError('Error', e.response?.data?.error || 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  const count = (isCurrentValid ? 1 : 0) + queued.length
  const submitLabel = orderId
    ? (saving ? 'Updating...' : 'Update Order')
    : (saving ? 'Creating...' : count > 1 ? `Create ${count} Orders` : 'Create Order')

  const productOptions = products.map(p => ({ id: p.id, name: `${p.name}${p.brand?.name ? ' · ' + p.brand.name : ''}` }))

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20, paddingBottom: 100 },
    backBtn: { padding: 4, marginBottom: 8 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: theme.primary, marginBottom: 20 },
    orderNumRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    orderNumInput: {
      flex: 1, borderWidth: 1, borderColor: theme.primary, borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: '600',
      color: theme.primary, backgroundColor: theme.surface,
    },
    refreshBtn: {
      marginLeft: 10, width: 44, height: 44, borderRadius: 10,
      borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    sectionLabel: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 },
    queuedBox: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: theme.surface, marginBottom: 16, overflow: 'hidden' },
    queuedHeader: { fontSize: 11, fontWeight: '700', color: theme.mutedForeground, padding: 10, paddingBottom: 4 },
    queuedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border },
    queuedName: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.text },
    stockHint: { fontSize: 11, color: theme.mutedForeground, marginTop: -10, marginBottom: 12 },
    noStockWarn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: theme.error + '20', borderWidth: 1, borderColor: theme.error + '40',
      borderRadius: 10, padding: 10, marginBottom: 12,
    },
    noStockText: { fontSize: 13, color: theme.error, fontWeight: '600', flex: 1 },
  })

  return (
    <SafeAreaView style={s.container} edges={['top', 'right', 'left', 'bottom']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={s.pageTitle}>{orderId ? 'Edit Sales Order' : 'Create Sales Order'}</Text>

        {queued.length > 0 && (
          <View style={s.queuedBox}>
            <Text style={s.queuedHeader}>QUEUED ({queued.length})</Text>
            {queued.map((q, i) => {
              const prod = products.find(p => p.id === q.productId)
              return (
                <View key={i} style={s.queuedItem}>
                  <Text style={s.queuedName} numberOfLines={1}>{prod?.name || 'Order'} — Qty: {q.quantity}</Text>
                  <TouchableOpacity onPress={() => removeQueued(i)}>
                    <Icon name="close" size={18} color={theme.mutedForeground} />
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}

        <Text style={s.sectionLabel}>Order Number</Text>
        <View style={s.orderNumRow}>
          <TextInput
            style={s.orderNumInput}
            value={orderNumber}
            onChangeText={setOrderNumber}
            placeholder="Enter order number"
            placeholderTextColor={theme.mutedForeground}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={s.refreshBtn} onPress={() => setOrderNumber(generateOrderNumber())}>
            <Icon name="refresh" size={20} color={theme.mutedForeground} />
          </TouchableOpacity>
        </View>

        <SelectModal label="Product" value={formData.productId} options={productOptions}
          onSelect={(v) => update('productId', v)} placeholder="Search product by name, brand..."
          required error={errors.productId} />

        {noStock && (
          <View style={s.noStockWarn}>
            <Icon name="warning" size={16} color={theme.error} />
            <Text style={s.noStockText}>This product is out of stock and cannot be sold.</Text>
          </View>
        )}

        <FormRow>
          <View style={{ flex: 1 }}>
            <SelectModal label="Location" value={formData.locationId} options={availableLocations}
              onSelect={(v) => update('locationId', v)}
              placeholder={formData.productId ? 'Select a location' : 'Select a product first'}
              required disabled={!formData.productId || !!noStock} error={errors.locationId} />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label={`Quantity${locationStock > 0 ? ` (max ${locationStock})` : ''}`}
              required value={formData.quantity}
              onChangeText={(t) => {
                const n = parseInt(t)
                if (t === '') { update('quantity', ''); return }
                if (!isNaN(n) && n > 0) update('quantity', Math.min(n, locationStock || n).toString())
              }}
              placeholder="Enter quantity" keyboardType="number-pad"
              error={errors.quantity} />
          </View>
        </FormRow>

        {selectedBatch && (
          <Text style={s.stockHint}>Available at this location: {locationStock} units</Text>
        )}

        <FormRow>
          <View style={{ flex: 1 }}>
            <DatePickerField label="Sold Date" value={formData.soldDate} onChange={(d) => update('soldDate', d)} />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="Batch Name" value={formData.batchName}
              onChangeText={(t) => update('batchName', t)} placeholder="Auto-filled from batch" editable={false} />
          </View>
        </FormRow>

        <FormActions
          submitLabel={submitLabel}
          onSubmit={handleSave}
          onCancel={() => navigation.goBack()}
          onAddMore={orderId ? undefined : handleAddMore}
          loading={saving}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
