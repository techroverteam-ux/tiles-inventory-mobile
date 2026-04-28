import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { launchImageLibrary, MediaType } from 'react-native-image-picker'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { SelectModal } from '../../components/common/SelectModal'
import { FormField, FormRow, SectionBox, FormActions } from '../../components/common/FormComponents'
import { MainStackParamList } from '../../navigation/types'
import {
  productService, brandService, categoryService, sizeService,
  Brand, Category, Size, CreateProductRequest,
} from '../../services/api/ApiServices'

type ProductFormRouteProp = RouteProp<MainStackParamList, 'ProductForm'>

interface ProductEntry {
  name: string
  brandId: string
  categoryId: string
  sizeId: string
  sqftPerBox: string
  pcsPerBox: string
  image: any
  imageUri: string | null
}

const emptyEntry = (): ProductEntry => ({
  name: '', brandId: '', categoryId: '', sizeId: '',
  sqftPerBox: '', pcsPerBox: '', image: null, imageUri: null,
})

export const ProductFormScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<ProductFormRouteProp>()
  const { productId } = route.params || {}

  const [formData, setFormData] = useState<ProductEntry>(emptyEntry())
  const [queued, setQueued] = useState<ProductEntry[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchMasterData = useCallback(async () => {
    try {
      const [b, c, s] = await Promise.all([
        brandService.getBrands(), categoryService.getCategories(), sizeService.getSizes(),
      ])
      setBrands(b.brands.filter(x => x.isActive))
      setCategories(c.categories.filter(x => x.isActive))
      setSizes(s.sizes.filter(x => x.isActive))
    } catch { Alert.alert('Error', 'Failed to load form data') }
  }, [])

  useEffect(() => { fetchMasterData() }, [fetchMasterData])

  const update = (field: keyof ProductEntry, value: any) => {
    setFormData(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = (entry: ProductEntry) => {
    const e: Record<string, string> = {}
    if (!entry.name.trim()) e.name = 'Product name is required'
    if (!entry.brandId) e.brandId = 'Brand is required'
    if (!entry.categoryId) e.categoryId = 'Category is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImagePicker = () => {
    launchImageLibrary({ mediaType: 'photo' as MediaType, quality: 0.8 as any }, (res) => {
      if (res.assets?.[0]) {
        const asset = res.assets[0]
        update('imageUri', asset.uri || null)
        update('image', { uri: asset.uri, type: asset.type, name: asset.fileName })
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

  const saveEntry = async (entry: ProductEntry) => {
    const data: CreateProductRequest = {
      name: entry.name.trim(),
      code: '',
      brandId: entry.brandId,
      categoryId: entry.categoryId,
      sizeId: entry.sizeId || undefined,
      sqftPerBox: entry.sqftPerBox ? parseFloat(entry.sqftPerBox) : undefined,
      pcsPerBox: entry.pcsPerBox ? parseInt(entry.pcsPerBox) : undefined,
      image: entry.image || undefined,
    }
    if (productId) {
      await productService.updateProduct(productId, data)
    } else {
      await productService.createProduct(data)
    }
  }

  const handleSave = async () => {
    if (!validate(formData)) return
    setSaving(true)
    try {
      const all = [...queued, formData]
      for (const entry of all) await saveEntry(entry)
      const count = all.length
      Alert.alert('Success', productId ? 'Product updated' : `${count} product${count > 1 ? 's' : ''} created`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const submitLabel = (() => {
    const count = queued.length + 1
    if (productId) return saving ? 'Updating...' : 'Update Product'
    return saving ? 'Creating...' : count > 1 ? `Create ${count} Products` : 'Create Product'
  })()

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20, paddingBottom: 100 },
    backBtn: { padding: 4, marginBottom: 8 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: theme.primary, marginBottom: 20 },
    queuedBox: {
      borderWidth: 1, borderColor: theme.border, borderRadius: 10,
      backgroundColor: theme.surface, marginBottom: 16, overflow: 'hidden',
    },
    queuedHeader: { fontSize: 11, fontWeight: '700', color: theme.mutedForeground, padding: 10, paddingBottom: 4 },
    queuedItem: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 10, paddingVertical: 8,
      borderTopWidth: 1, borderTopColor: theme.border,
    },
    queuedThumb: { width: 32, height: 32, borderRadius: 6, backgroundColor: theme.muted },
    queuedName: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.text },
    imageUpload: {
      borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed',
      borderRadius: 12, height: 140, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.surface, marginBottom: 16, overflow: 'hidden',
    },
    uploadImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    uploadText: { fontSize: 13, color: theme.text, marginTop: 6, textAlign: 'center', paddingHorizontal: 16 },
    uploadBold: { fontWeight: '700' },
    uploadSub: { fontSize: 11, color: theme.mutedForeground, marginTop: 3 },
    labelOpt: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 8 },
    removeImg: { position: 'absolute', top: 6, right: 6, backgroundColor: theme.error, borderRadius: 12, padding: 2 },
  })

  return (
    <SafeAreaView style={s.container} edges={['top', 'right', 'left', 'bottom']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={s.pageTitle}>{productId ? 'Edit Product' : 'Add New Product'}</Text>

        {/* Queued items */}
        {queued.length > 0 && (
          <View style={s.queuedBox}>
            <Text style={s.queuedHeader}>QUEUED ({queued.length})</Text>
            {queued.map((q, i) => (
              <View key={i} style={s.queuedItem}>
                {q.imageUri
                  ? <Image source={{ uri: q.imageUri }} style={s.queuedThumb} />
                  : <View style={[s.queuedThumb, { alignItems: 'center', justifyContent: 'center' }]}>
                      <Icon name="image" size={16} color={theme.mutedForeground} />
                    </View>
                }
                <Text style={s.queuedName} numberOfLines={1}>{q.name}</Text>
                <TouchableOpacity onPress={() => removeQueued(i)}>
                  <Icon name="close" size={18} color={theme.mutedForeground} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <FormField
          label="Name" required
          value={formData.name}
          onChangeText={(t) => update('name', t)}
          placeholder="Enter product name"
          error={errors.name}
        />

        <FormRow>
          <View style={{ flex: 1 }}>
            <SelectModal label="Brand" value={formData.brandId} options={brands}
              onSelect={(v) => update('brandId', v)} placeholder="Select a brand" required error={errors.brandId} />
          </View>
          <View style={{ flex: 1 }}>
            <SelectModal label="Category" value={formData.categoryId} options={categories}
              onSelect={(v) => update('categoryId', v)} placeholder="Select a category" required error={errors.categoryId} />
          </View>
        </FormRow>

        <SelectModal label="Size" value={formData.sizeId} options={sizes}
          onSelect={(v) => update('sizeId', v)} placeholder="Select a size" />

        <SectionBox>
          <FormRow>
            <View style={{ flex: 1 }}>
              <FormField label="Sq Ft per Box" leftIcon="crop-square"
                value={formData.sqftPerBox} onChangeText={(t) => update('sqftPerBox', t)}
                placeholder="Enter sq ft" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Pieces per Box" leftIcon="grid-view"
                value={formData.pcsPerBox} onChangeText={(t) => update('pcsPerBox', t)}
                placeholder="Enter pieces" keyboardType="number-pad" />
            </View>
          </FormRow>
        </SectionBox>

        <Text style={s.labelOpt}>Product Image <Text style={{ fontWeight: '400', color: theme.mutedForeground }}>(Optional)</Text></Text>
        <TouchableOpacity style={s.imageUpload} onPress={handleImagePicker}>
          {formData.imageUri ? (
            <>
              <Image source={{ uri: formData.imageUri }} style={s.uploadImg} />
              <TouchableOpacity style={s.removeImg} onPress={() => { update('imageUri', null); update('image', null) }}>
                <Icon name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Icon name="image" size={32} color={theme.mutedForeground} />
              <Text style={s.uploadText}><Text style={s.uploadBold}>Click to upload</Text>, drag & drop, or paste an image</Text>
              <Text style={s.uploadSub}>PNG, JPG, GIF up to 5MB</Text>
            </>
          )}
        </TouchableOpacity>

        <FormActions
          submitLabel={submitLabel}
          onSubmit={handleSave}
          onCancel={() => navigation.goBack()}
          onAddMore={productId ? undefined : handleAddMore}
          loading={saving}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
