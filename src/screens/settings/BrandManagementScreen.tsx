import React, { useState, useEffect } from 'react'
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
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton } from '../../components/loading/Skeleton'
import { brandService, Brand } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

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
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadBrands()
  }, [])

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
        const updated = await brandService.updateBrand(editingBrand.id, formData)
        setBrands(brands.map(b => b.id === editingBrand.id ? updated : b))
        Alert.alert('Success', 'Brand updated successfully')
      } else {
        const newBrand = await brandService.createBrand(formData)
        setBrands([newBrand, ...brands])
        Alert.alert('Success', 'Brand created successfully')
      }
      resetForm()
    } catch (error) {
      Alert.alert('Error', 'Failed to save brand')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({ name: brand.name, description: brand.description || '' })
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
    setFormData({ name: '', description: '' })
    setEditingBrand(null)
    setShowAddForm(false)
  }

  const renderBrand = ({ item }: { item: Brand }) => (
    <Card style={styles.brandCard}>
      <View style={styles.brandHeader}>
        <View style={styles.brandInfo}>
          <Text style={[styles.brandName, { color: theme.text }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.brandDescription, { color: theme.textSecondary }]}>
              {item.description}
            </Text>
          )}
          <Text style={[styles.brandMeta, { color: theme.textSecondary }]}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.brandActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: withOpacity(theme.primary, 0.12) }]}
            onPress={() => handleEdit(item)}
          >
            <Icon name="edit" size={16} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: withOpacity(theme.error, 0.12) }]}
            onPress={() => handleDelete(item)}
          >
            <Icon name="delete" size={16} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.statusBadge, { 
        backgroundColor: item.isActive ? withOpacity(theme.success, 0.12) : withOpacity(theme.error, 0.12)
      }]}>
        <Text style={[styles.statusText, { 
          color: item.isActive ? theme.success : theme.error 
        }]}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </Card>
  )

  const renderSkeleton = () => (
    <Card style={styles.brandCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={14} width="40%" />
    </Card>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    brandCard: {
      marginBottom: spacing.base,
    },
    brandHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    brandInfo: {
      flex: 1,
      marginRight: spacing.base,
    },
    brandName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing.xs,
    },
    brandDescription: {
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    brandMeta: {
      fontSize: typography.fontSize.xs,
    },
    brandActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    fab: {
      position: 'absolute',
      right: spacing.base,
      bottom: spacing.base,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    formCard: {
      marginBottom: spacing.base,
    },
    formTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.base,
    },
    formActions: {
      flexDirection: 'row',
      gap: spacing.base,
      marginTop: spacing.base,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing['4xl'],
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.base,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Brand Management"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {showAddForm && (
          <Card style={styles.formCard} padding="lg">
            <Text style={styles.formTitle}>
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </Text>
            
            <TextInput
              label="Brand Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter brand name"
              required
            />
            
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter brand description (optional)"
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.formActions}>
              <LoadingButton
                title="Cancel"
                onPress={resetForm}
                variant="outline"
                style={{ flex: 1 }}
              />
              <LoadingButton
                title={editingBrand ? 'Update' : 'Create'}
                onPress={handleSubmit}
                loading={submitting}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        <FlatList
          data={loading ? Array(5).fill({}) : brands}
          renderItem={loading ? renderSkeleton : renderBrand}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="tag-multiple" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No brands available</Text>
              </View>
            ) : null
          }
        />
      </View>

      {!showAddForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddForm(true)}
        >
          <Icon name="plus" size={24} color={theme.textInverse} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}