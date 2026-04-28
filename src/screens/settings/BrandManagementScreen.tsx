import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/loading/Skeleton'
import { brandService, Brand } from '../../services/api/ApiServices'
import { spacing } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'
import { getCommonStyles } from '../../theme/commonStyles'
import { FormModal } from '../../components/common/FormModal'
import { FormField, ActiveStatusToggle, FormActions } from '../../components/common/FormComponents'
import { useFocusEffect } from '@react-navigation/native'

interface BrandManagementScreenProps {
  navigation: any
}

export const BrandManagementScreen: React.FC<BrandManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const commonStyles = getCommonStyles(theme)

  useEffect(() => { loadBrands() }, [])

  useFocusEffect(useCallback(() => { loadBrands() }, []))

  const loadBrands = async () => {
    try {
      const response = await brandService.getBrands()
      setBrands(response.brands)
    } catch (error) {
      Alert.alert('Error', 'Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadBrands()
    setRefreshing(false)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Brand name is required')
      return
    }

    setSubmitting(true)
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand.id, formData)
      } else {
        await brandService.createBrand({ ...formData, isActive: formData.isActive })
      }
      resetForm()
      await loadBrands()
    } catch (error) {
      Alert.alert('Error', 'Failed to save brand')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({ name: brand.name, description: brand.description || '', isActive: brand.isActive })
    setShowAddForm(true)
  }

  const handleDelete = (brand: Brand) => {
    Alert.alert(
      'Delete Brand',
      `Are you sure you want to delete "${brand.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBrand(brand.id),
        },
      ]
    )
  }

  const deleteBrand = async (id: string) => {
    try {
      await brandService.deleteBrand(id)
      setBrands(brands.filter(b => b.id !== id))
      Alert.alert('Success', 'Brand deleted successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete brand')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', isActive: true })
    setEditingBrand(null)
    setShowAddForm(false)
  }

  const renderBrand = ({ item }: { item: Brand }) => (
    <Card style={[commonStyles.glassCard, styles.brandCard]} padding="none">
      <View style={styles.cardTopRow}>
        <Text style={styles.brandName}>{item.name}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.isActive ? withOpacity(theme.primary, 0.15) : withOpacity(theme.error, 0.15)
        }]}>
          <Text style={[styles.statusText, { 
            color: item.isActive ? theme.primary : theme.error 
          }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.productCountRow}>
        <Icon name="inventory-2" size={12} color={theme.mutedForeground} />
        <Text style={styles.productCountText}>0 Products</Text>
      </View>

      <View style={styles.detailsBlock}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Updated:</Text>
          <Text style={styles.detailValue}>N/A</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>By:</Text>
          <Text style={styles.detailValue}>Admin User</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleEdit(item)}
        >
          <Icon name="edit" size={14} color={theme.text} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Icon name="delete" size={14} color="#ffffff" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  )

  const renderSkeleton = () => (
    <Card style={[commonStyles.glassCard, styles.brandCard]} padding="base">
      <Skeleton height={24} width="40%" style={{ marginBottom: spacing.md }} />
      <Skeleton height={60} width="100%" style={{ marginBottom: spacing.md }} />
      <Skeleton height={36} width="100%" />
    </Card>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 80,
    },
    brandCard: {
      marginBottom: 16,
      borderRadius: 24,
      overflow: 'hidden',
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      marginBottom: 16,
    },
    brandName: {
      fontSize: 16,
      fontWeight: '900',
      color: theme.text,
      textTransform: 'uppercase',
      letterSpacing: -0.5,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },
    productCountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      gap: 6,
      marginBottom: 16,
    },
    productCountText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.mutedForeground,
    },
    detailsBlock: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      marginHorizontal: 12,
      padding: 12,
      borderRadius: 12,
      gap: 4,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detailLabel: {
      fontSize: 11,
      color: theme.mutedForeground,
    },
    detailValue: {
      fontSize: 11,
      color: theme.text,
      fontWeight: '700',
    },
    actionsRow: {
      flexDirection: 'row',
      padding: 12,
      gap: 12,
    },
    editBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      backgroundColor: theme.surface,
    },
    editBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    deleteBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.error,
    },
    deleteBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#ffffff',
    },
    formCard: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    formActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 14,
      color: theme.mutedForeground,
      marginTop: 16,
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <MainHeader />
      
      <View style={styles.content}>
        <ScreenActionBar
          title="Brands"
          primaryActionLabel="Add Brand"
          onPrimaryAction={() => setShowAddForm(true)}
          itemCount={brands.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <FormModal
          key={editingBrand?.id ?? 'new-brand'}
          visible={showAddForm}
          title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
          onClose={resetForm}
        >
          <FormField
            label="Name"
            required
            value={formData.name}
            onChangeText={(t) => setFormData({ ...formData, name: t })}
            placeholder="Enter brand name"
          />
          <FormField
            label="Description"
            value={formData.description}
            onChangeText={(t) => setFormData({ ...formData, description: t })}
            placeholder="Enter description"
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />
          <ActiveStatusToggle
            value={formData.isActive}
            onChange={(v) => setFormData({ ...formData, isActive: v })}
          />
          <FormActions
            submitLabel={editingBrand ? 'Update Brand' : 'Create Brand'}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            onAddMore={editingBrand ? undefined : () => { handleSubmit(); }}
            loading={submitting}
          />
        </FormModal>

        <FlatList
          data={loading ? Array(5).fill({}) : brands}
          renderItem={loading ? renderSkeleton : renderBrand}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.primary]} tintColor={theme.primary} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="label" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No brands available</Text>
              </View>
            ) : null
          }
        />
      </View>

    </SafeAreaView>
  )
}