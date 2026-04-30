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
import { purchaseOrderService, productService, Product } from '../../services/api/ApiServices'
import { useToast } from '../../context/ToastContext'

type PurchaseOrderFormRouteProp = RouteProp<MainStackParamList, 'PurchaseOrderForm'>

const generateOrderNumber = () => `PO-${Date.now()}`

interface OrderEntry {
  productId: string
  quantity: string
  amount: string
  orderDate: string
  expectedDate: string
  batchName: string
}

const emptyEntry = (): OrderEntry => ({
  productId: '',
  quantity: '',
  amount: '',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDate: '',
  batchName: '',
})

export const PurchaseOrderFormScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const { showError, showSuccess } = useToast()
  const route = useRoute<PurchaseOrderFormRouteProp>()
  const { orderId } = route.params || {}

  const [orderNumber, setOrderNumber] = useState(generateOrderNumber())
  const [formData, setFormData] = useState<OrderEntry>(emptyEntry())
  const [queued, setQueued] = useState<OrderEntry[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    productService.getProducts(1, 100).then(r => setProducts(r.products)).catch(() => {})
  }, [])

  const update = (field: keyof OrderEntry, value: string) => {
    setFormData(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const isCurrentValid = !!(formData.productId && formData.quantity)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.productId) e.productId = 'Product is required'
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
    if (!validate() && queued.length === 0) return
    const all = isCurrentValid ? [...queued, formData] : queued
    if (all.length === 0) { showError('Error', 'Please fill required fields'); return }

    setSaving(true)
    try {
      if (orderId) {
        await purchaseOrderService.updatePurchaseOrder(orderId, {
          orderNumber,
          productId: formData.productId,
          quantity: Number(formData.quantity),
          amount: Number(formData.amount) || 0,
          batchName: formData.batchName || undefined,
          orderDate: formData.orderDate || new Date().toISOString(),
          expectedDate: formData.expectedDate || undefined,
          status: 'PENDING' as const,
        })
        showSuccess('Success', 'Order updated')
        navigation.goBack()
      } else {
        let success = 0
        for (const entry of all) {
          await purchaseOrderService.createPurchaseOrder({
            productId: entry.productId,
            orderDate: entry.orderDate || new Date().toISOString().split('T')[0],
            expectedDate: entry.expectedDate || undefined,
            quantity: Number(entry.quantity),
            amount: Number(entry.amount) || 0,
            batchName: entry.batchName || undefined,
            orderNumber: `PO-${Date.now()}`,
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
  const selectedProduct = products.find(p => p.id === formData.productId)

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
  })

  return (
    <SafeAreaView style={s.container} edges={['top', 'right', 'left', 'bottom']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={s.pageTitle}>{orderId ? 'Edit Purchase Order' : 'Create Purchase Order'}</Text>

        {/* Queued */}
        {queued.length > 0 && (
          <View style={s.queuedBox}>
            <Text style={s.queuedHeader}>QUEUED ({queued.length})</Text>
            {queued.map((q, i) => {
              const prod = products.find(p => p.id === q.productId)
              return (
                <View key={i} style={s.queuedItem}>
                  <Text style={s.queuedName} numberOfLines={1}>{prod?.name || 'Order'} — Qty: {q.quantity}{q.amount ? ` — ₹${q.amount}` : ''}</Text>
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

        <FormRow>
          <View style={{ flex: 1 }}>
            <FormField label="Quantity" required value={formData.quantity} onChangeText={(t) => update('quantity', t)}
              placeholder="Enter quantity" keyboardType="number-pad" error={errors.quantity} />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="Amount" value={formData.amount} onChangeText={(t) => update('amount', t)}
              placeholder="Enter amount" keyboardType="decimal-pad" />
          </View>
        </FormRow>

        <FormRow>
          <View style={{ flex: 1 }}>
            <DatePickerField label="Order Date" value={formData.orderDate} onChange={(d) => update('orderDate', d)} />
          </View>
          <View style={{ flex: 1 }}>
            <DatePickerField label="Expected Date" value={formData.expectedDate} onChange={(d) => update('expectedDate', d)} placeholder="Select date" />
          </View>
        </FormRow>

        <FormField label="Batch Name" value={formData.batchName} onChangeText={(t) => update('batchName', t)} placeholder="Enter batch name" />

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
