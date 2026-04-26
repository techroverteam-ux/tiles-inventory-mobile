import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { SelectModal } from '../../components/common/SelectModal'
import { spacing, typography, borderRadius } from '../../theme'
import { MainStackParamList } from '../../navigation/types'
import {
  productService,
  brandService,
  categoryService,
  collectionService,
  sizeService,
  finishTypeService,
  locationService,
  Brand,
  Category,
  Collection,
  Size,
  FinishType,
  Location,
  CreateProductRequest
} from '../../services/api/ApiServices'

type ProductFormRouteProp = RouteProp<MainStackParamList, 'ProductForm'>

interface FormData {
  name: string
  code: string
  description: string
  brandId: string
  categoryId: string
  collectionId: string
  sizeId: string
  finishTypeId: string
  length: string
  width: string
  thickness: string
  sqftPerBox: string
  pcsPerBox: string
  locationId: string
  batchName: string
  stock: string
  image: File | null
}

interface FormErrors {
  [key: string]: string
}

export const ProductFormScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<ProductFormRouteProp>()
  const { productId } = route.params || {}
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    brandId: '',
    categoryId: '',
    collectionId: '',
    sizeId: '',
    finishTypeId: '',
    length: '',
    width: '',
    thickness: '',
    sqftPerBox: '1',
    pcsPerBox: '1',
    locationId: '',
    batchName: '',
    stock: '0',
    image: null
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageUri, setImageUri] = useState<string | null>(null)
  
  // Master data
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [filteredCollections, setFilteredCollections] = useState<any[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [filteredSizes, setFilteredSizes] = useState<Size[]>([])
  const [finishTypes, setFinishTypes] = useState<FinishType[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  const fetchMasterData = useCallback(async () => {
    setLoading(true)
    try {
      const [brandsRes, categoriesRes, collectionsRes, sizesRes, finishTypesRes, locationsRes] = await Promise.all([
        brandService.getBrands(),
        categoryService.getCategories(),
        collectionService.getCollections(),
        sizeService.getSizes(),
        finishTypeService.getFinishTypes(),
        locationService.getLocations()
      ])

      setBrands(brandsRes.brands.filter(b => b.isActive))
      setCategories(categoriesRes.categories.filter(c => c.isActive))
      setCollections(collectionsRes.collections.filter(c => c.isActive))
      setSizes(sizesRes.sizes.filter(s => s.isActive))
      setFinishTypes(finishTypesRes.finishTypes.filter(f => f.isActive))
      setLocations(locationsRes.locations.filter(l => l.isActive))
    } catch (error) {
      Alert.alert('Error', 'Failed to load form data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  // Filter categories when brand changes
  useEffect(() => {
    if (formData.brandId) {
      categoryService.getCategories(formData.brandId)
        .then(res => setFilteredCategories(res.categories.filter(c => c.isActive)))
        .catch(() => setFilteredCategories(categories))
    } else {
      setFilteredCategories(categories)
    }
  }, [formData.brandId, categories])

  // Filter collections when brand/category changes
  useEffect(() => {
    if (formData.brandId && formData.categoryId) {
      collectionService.getCollections(formData.brandId, formData.categoryId)
        .then(res => setFilteredCollections(res.collections.filter(c => c.isActive)))
        .catch(() => setFilteredCollections(collections))
    } else {
      setFilteredCollections(collections)
    }
  }, [formData.brandId, formData.categoryId, collections])

  // Filter sizes when brand/category changes
  useEffect(() => {
    if (formData.brandId && formData.categoryId) {
      sizeService.getSizes(formData.brandId, formData.categoryId)
        .then(res => setFilteredSizes(res.sizes.filter(s => s.isActive)))
        .catch(() => setFilteredSizes(sizes))
    } else {
      setFilteredSizes(sizes)
    }
  }, [formData.brandId, formData.categoryId, sizes])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.code.trim()) newErrors.code = 'Product code is required'
    if (!formData.brandId) newErrors.brandId = 'Brand is required'
    if (!formData.categoryId) newErrors.categoryId = 'Category is required'
    if (!formData.finishTypeId) newErrors.finishTypeId = 'Finish type is required'
    if (!formData.locationId) newErrors.locationId = 'Location is required'
    if (!formData.batchName.trim()) newErrors.batchName = 'Batch name is required'
    
    const stockNum = parseInt(formData.stock)
    if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Valid stock quantity is required'
    }

    const sqftNum = parseFloat(formData.sqftPerBox)
    if (isNaN(sqftNum) || sqftNum <= 0) {
      newErrors.sqftPerBox = 'Valid sq ft per box is required'
    }

    const pcsNum = parseInt(formData.pcsPerBox)
    if (isNaN(pcsNum) || pcsNum <= 0) {
      newErrors.pcsPerBox = 'Valid pieces per box is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as any,
    }

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0]
        setImageUri(asset.uri || null)
        
        // Create File object for upload
        if (asset.uri && asset.fileName && asset.type) {
          const file = {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
          } as any
          setFormData(prev => ({ ...prev, image: file }))
        }
      }
    })
  }

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again')
      return
    }

    setSaving(true)
    try {
      const productData: CreateProductRequest = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || undefined,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        collectionId: formData.collectionId || undefined,
        sizeId: formData.sizeId || undefined,
        length: formData.length ? parseFloat(formData.length) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
        thickness: formData.thickness ? parseFloat(formData.thickness) : undefined,
        sqftPerBox: parseFloat(formData.sqftPerBox),
        pcsPerBox: parseInt(formData.pcsPerBox),
        locationId: formData.locationId,
        batchName: formData.batchName.trim(),
        stock: parseInt(formData.stock),
        image: formData.image || undefined
      }

      if (productId) {
        // Update existing product
        await productService.updateProduct(productId, productData)
        Alert.alert('Success', 'Product updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      } else {
        // Create new product
        await productService.createProduct(productData)
        Alert.alert('Success', 'Product created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      }
    } catch (error: any) {
      console.error('Save product error:', error)
      Alert.alert('Error', error.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: spacing.base,
    },
    formCard: {
      marginBottom: spacing.base,
    },
    formGroup: {
      marginBottom: spacing.base,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    required: {
      color: theme.danger,
    },
    imageSection: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    imageContainer: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.base,
      backgroundColor: theme.gray100,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.base,
      overflow: 'hidden',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    imageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    imageButtonText: {
      fontSize: typography.fontSize.sm,
      color: theme.primary,
      fontWeight: typography.fontWeight.medium,
    },
    formRow: {
      flexDirection: 'row',
      gap: spacing.base,
    },
    formRowItem: {
      flex: 1,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.base,
      marginTop: spacing.lg,
    },
    cancelButton: {
      flex: 1,
    },
    saveButton: {
      flex: 1,
    },
  })

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.text }}>Loading form data...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.formCard} padding="lg">
          {/* Image Upload Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={handleImagePicker}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.productImage} />
              ) : (
                <Icon name="add-a-photo" size={40} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
              <Icon name="camera-alt" size={20} color={theme.primary} />
              <Text style={styles.imageButtonText}>
                {imageUri ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <TextInput
            label="Product Name"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Enter product name"
            required
            error={errors.name}
          />

          <TextInput
            label="Product Code"
            value={formData.code}
            onChangeText={(value) => updateFormData('code', value)}
            placeholder="Enter product code"
            required
            error={errors.code}
          />

          {/* Brand and Category */}
          <SelectModal
            label="Brand"
            value={formData.brandId}
            options={brands}
            onSelect={(value) => updateFormData('brandId', value)}
            placeholder="Select a brand"
            required
            error={errors.brandId}
          />

          <SelectModal
            label="Category"
            value={formData.categoryId}
            options={filteredCategories}
            onSelect={(value) => updateFormData('categoryId', value)}
            placeholder="Select a category"
            required
            disabled={!formData.brandId}
            error={errors.categoryId}
          />

          <SelectModal
            label="Collection"
            value={formData.collectionId}
            options={filteredCollections}
            onSelect={(value) => updateFormData('collectionId', value)}
            placeholder="Select collection (optional)"
            disabled={!formData.categoryId}
          />

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Enter product description (optional)"
            multiline
            numberOfLines={3}
          />

          {/* Dimensions */}
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <TextInput
                label="Length (mm)"
                value={formData.length}
                onChangeText={(value) => updateFormData('length', value)}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.formRowItem}>
              <TextInput
                label="Width (mm)"
                value={formData.width}
                onChangeText={(value) => updateFormData('width', value)}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <TextInput
            label="Thickness (mm)"
            value={formData.thickness}
            onChangeText={(value) => updateFormData('thickness', value)}
            placeholder="0"
            keyboardType="decimal-pad"
          />

          {/* Size and Finish Type */}
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <SelectModal
                label="Size"
                value={formData.sizeId}
                options={filteredSizes}
                onSelect={(value) => updateFormData('sizeId', value)}
                placeholder="Select size (optional)"
                disabled={!formData.categoryId}
              />
            </View>
            <View style={styles.formRowItem}>
              <SelectModal
                label="Finish Type"
                value={formData.finishTypeId}
                options={finishTypes}
                onSelect={(value) => updateFormData('finishTypeId', value)}
                placeholder="Select finish type"
                required
                error={errors.finishTypeId}
              />
            </View>
          </View>

          {/* Box Information */}
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <TextInput
                label="Sq Ft per Box"
                value={formData.sqftPerBox}
                onChangeText={(value) => updateFormData('sqftPerBox', value)}
                placeholder="1.0"
                keyboardType="decimal-pad"
                error={errors.sqftPerBox}
              />
            </View>
            <View style={styles.formRowItem}>
              <TextInput
                label="Pieces per Box"
                value={formData.pcsPerBox}
                onChangeText={(value) => updateFormData('pcsPerBox', value)}
                placeholder="1"
                keyboardType="number-pad"
                error={errors.pcsPerBox}
              />
            </View>
          </View>

          {/* Inventory Information */}
          <SelectModal
            label="Location"
            value={formData.locationId}
            options={locations}
            onSelect={(value) => updateFormData('locationId', value)}
            placeholder="Select location"
            required
            error={errors.locationId}
          />

          <TextInput
            label="Batch Name"
            value={formData.batchName}
            onChangeText={(value) => updateFormData('batchName', value)}
            placeholder="Enter batch name"
            required
            error={errors.batchName}
          />

          <TextInput
            label="Initial Stock"
            value={formData.stock}
            onChangeText={(value) => updateFormData('stock', value)}
            placeholder="0"
            keyboardType="number-pad"
            required
            error={errors.stock}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <LoadingButton
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
              disabled={saving}
            />
            <LoadingButton
              title={productId ? 'Update Product' : 'Create Product'}
              onPress={handleSave}
              variant="primary"
              loading={saving}
              style={styles.saveButton}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  )
}