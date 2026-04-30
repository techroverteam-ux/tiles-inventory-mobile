import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { launchImageLibrary, MediaType } from 'react-native-image-picker'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { SelectModal } from '../../components/common/SelectModal'
import { FormField, FormRow, SectionBox, FormActions } from '../../components/common/FormComponents'
import { DatePickerField } from '../../components/common/DatePickerField'
import { apiClient } from '../../services/api/ApiClient'
import { productService, locationService, Product, Location } from '../../services/api/ApiServices'

interface StockEntry {
  productId: string
  locationId: string
  batchNumber: string
  shade: string
  quantity: string
  expiryDate: string
  purchasePrice: string
  sellingPrice: string
  imageUri: string | null
  imageFile: any
}

const emptyEntry = (): StockEntry => ({
  productId: '', locationId: '', batchNumber: '', shade: '',
  quantity: '', expiryDate: '', purchasePrice: '0.00', sellingPrice: '0.00',
  imageUri: null, imageFile: null,
})

export const StockUpdateScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const { showError, showSuccess } = useToast()
  const { productId: initialProductId } = route.params || {}

  const [formData, setFormData] = useState<StockEntry>({ ...emptyEntry(), productId: initialProductId || '' })
  const [queued, setQueued] = useState<StockEntry[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([productService.getProducts(1, 100), locationService.getLocations()])
      .then(([p, l]) => {
        setProducts(p.products)
        setLocations(l.locations.filter(x => x.isActive))
      })
      .catch(() => showError('Error', 'Failed to load data'))
  }, [])

  const update = (field: keyof StockEntry, value: any) => {
    setFormData(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = (entry: StockEntry) => {
    const e: Record<string, string> = {}
    if (!entry.productId) e.productId = 'Product is required'
    if (!entry.quantity || isNaN(Number(entry.quantity))) e.quantity = 'Valid quantity is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const isEntryValid = (entry: StockEntry) => {
    return !!entry.productId && !!entry.quantity && !isNaN(Number(entry.quantity))
  }

  const handleImagePicker = () => {
    launchImageLibrary({ mediaType: 'photo' as MediaType, quality: 0.8 as any }, (res) => {
      if (res.assets?.[0]) {
        const asset = res.assets[0]
        update('imageUri', asset.uri || null)
        update('imageFile', { uri: asset.uri, type: asset.type, name: asset.fileName })
      }
    })
  }

  const handleAddMore = () => {
    if (!validate(formData)) return
    setQueued(q => [...q, { ...formData }])
    setFormData(emptyEntry())
    setErrors({})
  }

  const removeQueued = (i: number) => setQueued(q => q.filter((_, j) => j !== i))

  const saveEntry = async (entry: StockEntry) => {
    await apiClient.post('/inventory', {
      productId: entry.productId,
      locationId: entry.locationId || undefined,
      quantity: Number(entry.quantity),
      batchNumber: entry.batchNumber.trim() || undefined,
      shade: entry.shade.trim() || undefined,
      expiryDate: entry.expiryDate || undefined,
      purchasePrice: entry.purchasePrice ? Number(entry.purchasePrice) : undefined,
      sellingPrice: entry.sellingPrice ? Number(entry.sellingPrice) : undefined,
    })
  }

  const handleSubmit = async () => {
    if (!validate(formData) && queued.length === 0) return
    const all = validate(formData) ? [...queued, formData] : queued
    if (all.length === 0) return

    setLoading(true)
    try {
      for (const entry of all) await saveEntry(entry)
      showSuccess('Success', `${all.length} stock batch${all.length > 1 ? 'es' : ''} added`)
      navigation.goBack()
    } catch {
      showError('Error', 'Failed to add stock batch')
    } finally {
      setLoading(false)
    }
  }

  const count = (isEntryValid(formData) ? 1 : 0) + queued.length
  const submitLabel = loading ? 'Saving...' : count > 1 ? `Add ${count} Stock Batches` : 'Add Stock Batch'

  const productOptions = products.map(p => ({ id: p.id, name: p.name }))
  const locationOptions = locations.map(l => ({ id: l.id, name: l.name }))

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20, paddingBottom: 100 },
    backBtn: { padding: 4, marginBottom: 8 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: theme.primary, marginBottom: 20 },
    queuedBox: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: theme.surface, marginBottom: 16, overflow: 'hidden' },
    queuedHeader: { fontSize: 11, fontWeight: '700', color: theme.mutedForeground, padding: 10, paddingBottom: 4 },
    queuedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border },
    queuedThumb: { width: 32, height: 32, borderRadius: 6, backgroundColor: theme.muted },
    queuedName: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.text },
    imageUpload: {
      borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed',
      borderRadius: 12, height: 130, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.surface, marginBottom: 6, overflow: 'hidden',
    },
    uploadImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    uploadText: { fontSize: 13, color: theme.text, marginTop: 6, textAlign: 'center', paddingHorizontal: 16 },
    uploadBold: { fontWeight: '700' },
    uploadSub: { fontSize: 11, color: theme.mutedForeground, marginTop: 3 },
    uploadHint: { fontSize: 11, color: theme.mutedForeground, marginBottom: 16, textAlign: 'center' },
    labelOpt: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 8 },
    removeImg: { position: 'absolute', top: 6, right: 6, backgroundColor: theme.error, borderRadius: 12, padding: 2 },
  })

  return (
    <SafeAreaView style={s.container} edges={['top', 'right', 'left', 'bottom']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={s.pageTitle}>Add Stock Batch</Text>

        {queued.length > 0 && (
          <View style={s.queuedBox}>
            <Text style={s.queuedHeader}>QUEUED ({queued.length})</Text>
            {queued.map((q, i) => {
              const prod = products.find(p => p.id === q.productId)
              return (
                <View key={i} style={s.queuedItem}>
                  {q.imageUri
                    ? <Image source={{ uri: q.imageUri }} style={s.queuedThumb} />
                    : <View style={[s.queuedThumb, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Icon name="inventory" size={16} color={theme.mutedForeground} />
                      </View>
                  }
                  <Text style={s.queuedName} numberOfLines={1}>{prod?.name || 'Batch'} — Qty: {q.quantity}</Text>
                  <TouchableOpacity onPress={() => removeQueued(i)}>
                    <Icon name="close" size={18} color={theme.mutedForeground} />
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}

        <FormRow>
          <View style={{ flex: 1 }}>
            <SelectModal label="Product" value={formData.productId} options={productOptions}
              onSelect={(v) => update('productId', v)} placeholder="Select a product" required error={errors.productId} />
          </View>
          <View style={{ flex: 1 }}>
            <SelectModal label="Location (Optional)" value={formData.locationId} options={locationOptions}
              onSelect={(v) => update('locationId', v)} placeholder="Select a location" />
          </View>
        </FormRow>

        <FormRow>
          <View style={{ flex: 1 }}>
            <FormField label="Batch Number (Optional)" value={formData.batchNumber}
              onChangeText={(t) => update('batchNumber', t)} placeholder="e.g., BATCH-001" />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="Shade / Color" value={formData.shade}
              onChangeText={(t) => update('shade', t)} placeholder="e.g., Cream-A" />
          </View>
        </FormRow>

        <FormRow>
          <View style={{ flex: 1 }}>
            <FormField label="Quantity" required value={formData.quantity}
              onChangeText={(t) => update('quantity', t)} placeholder="Enter unit quantity"
              keyboardType="number-pad" error={errors.quantity} />
          </View>
          <View style={{ flex: 1 }}>
            <DatePickerField label="Expiry Date" value={formData.expiryDate}
              onChange={(d) => update('expiryDate', d)} placeholder="Select date" />
          </View>
        </FormRow>

        <SectionBox>
          <FormRow>
            <View style={{ flex: 1 }}>
              <FormField label="Purchase Price (per unit)" value={formData.purchasePrice}
                onChangeText={(t) => update('purchasePrice', t)} placeholder="0.00" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Selling Price (per unit)" value={formData.sellingPrice}
                onChangeText={(t) => update('sellingPrice', t)} placeholder="0.00" keyboardType="decimal-pad" />
            </View>
          </FormRow>
        </SectionBox>

        <Text style={s.labelOpt}>
          Stock Location Photo <Text style={{ fontWeight: '400', color: theme.mutedForeground }}>(Optional)</Text>
        </Text>
        <TouchableOpacity style={s.imageUpload} onPress={handleImagePicker}>
          {formData.imageUri ? (
            <>
              <Image source={{ uri: formData.imageUri }} style={s.uploadImg} />
              <TouchableOpacity style={s.removeImg} onPress={() => { update('imageUri', null); update('imageFile', null) }}>
                <Icon name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Icon name="image" size={30} color={theme.mutedForeground} />
              <Text style={s.uploadText}><Text style={s.uploadBold}>Click to upload</Text>, drag & drop, or paste an image</Text>
              <Text style={s.uploadSub}>PNG, JPG, GIF up to 5MB</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={s.uploadHint}>Photo of the stock in its warehouse location — helps you find it quickly.</Text>

        <FormActions
          submitLabel={submitLabel}
          onSubmit={handleSubmit}
          onCancel={() => navigation.goBack()}
          onAddMore={handleAddMore}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
