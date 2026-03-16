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
import { spacing, typography, borderRadius } from '../../theme'
import { MainStackParamList } from '../../navigation/types'
import {
  productService,
  brandService,
  categoryService,
  sizeService,
  finishTypeService,
  locationService,
  Brand,
  Category,
  Size,
  FinishType,
  Location,
  CreateProductRequest
} from '../../services/api/ApiServices'

type ProductFormRouteProp = RouteProp<MainStackParamList, 'ProductForm'>

interface FormData {
  name: string
  code: string
  brandId: string
  categoryId: string
  sizeId: string
  finishTypeId: string
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
    brandId: '',
    categoryId: '',
    sizeId: '',
    finishTypeId: '',
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
  const [sizes, setSizes] = useState<Size[]>([])
  const [filteredSizes, setFilteredSizes] = useState<Size[]>([])
  const [finishTypes, setFinishTypes] = useState<FinishType[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  const fetchMasterData = useCallback(async () => {
    setLoading(true)
    try {
      const [brandsRes, categoriesRes, sizesRes, finishTypesRes, locationsRes] = await Promise.all([
        brandService.getBrands(),
        categoryService.getCategories(),
        sizeService.getSizes(),
        finishTypeService.getFinishTypes(),
        locationService.getLocations()
      ])

      setBrands(brandsRes.brands.filter(b => b.isActive))
      setCategories(categoriesRes.categories.filter(c => c.isActive))
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
      quality: 0.8,
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
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        sizeId: formData.sizeId || undefined,
        finishTypeId: formData.finishTypeId,
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

  const renderDropdown = (
    label: string,
    value: string,
    options: Array<{ id: string; name: string }>,
    onSelect: (value: string) => void,
    placeholder: string,
    required = false,
    disabled = false
  ) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled,
          errors[label.toLowerCase().replace(' ', '')] && styles.dropdownError
        ]}
        onPress={() => {
          if (!disabled && options.length > 0) {
            // Here you would typically open a picker modal
            // For now, we'll just select the first option as demo
            if (options.length > 0) {
              onSelect(options[0].id)
            }
          }
        }}
        disabled={disabled}
      >
        <Text style={[
          styles.dropdownText,
          !value && styles.dropdownPlaceholder
        ]}>
          {value ? options.find(opt => opt.id === value)?.name || placeholder : placeholder}
        </Text>
        <Icon name="arrow-drop-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
      {errors[label.toLowerCase().replace(' ', '')] && (
        <Text style={styles.errorText}>{errors[label.toLowerCase().replace(' ', '')]}</Text>
      )}
    </View>
  )

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
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: theme.surface,
      minHeight: 48,
    },
    dropdownDisabled: {
      opacity: 0.6,
      backgroundColor: theme.gray100,
    },
    dropdownError: {
      borderColor: theme.danger,
    },
    dropdownText: {
      fontSize: typography.fontSize.base,
      color: theme.text,
      flex: 1,
    },
    dropdownPlaceholder: {
      color: theme.textSecondary,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: theme.danger,
      marginTop: spacing.xs,
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
          {renderDropdown(
            'Brand',
            formData.brandId,
            brands,
            (value) => updateFormData('brandId', value),
            'Select a brand',
            true
          )}

          {renderDropdown(
            'Category',
            formData.categoryId,
            filteredCategories,
            (value) => updateFormData('categoryId', value),
            'Select a category',
            true,
            !formData.brandId
          )}

          {/* Size and Finish Type */}
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              {renderDropdown(
                'Size',
                formData.sizeId,
                filteredSizes,
                (value) => updateFormData('sizeId', value),
                'Select size (optional)',
                false,
                !formData.categoryId
              )}
            </View>
            <View style={styles.formRowItem}>
              {renderDropdown(
                'Finish Type',
                formData.finishTypeId,
                finishTypes,
                (value) => updateFormData('finishTypeId', value),
                'Select finish type',
                true
              )}
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
          {renderDropdown(
            'Location',
            formData.locationId,
            locations,
            (value) => updateFormData('locationId', value),
            'Select location',
            true
          )}

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