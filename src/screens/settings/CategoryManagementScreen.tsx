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
import { categoryService, Category } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface CategoryManagementScreenProps {
  navigation: any
}

export const CategoryManagementScreen: React.FC<CategoryManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories()
      setCategories(response.categories)
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCategories()
    setRefreshing(false)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Category name is required')
      return
    }

    setSubmitting(true)
    try {
      if (editingCategory) {
        const updated = await categoryService.updateCategory(editingCategory.id, formData)
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c))
        Alert.alert('Success', 'Category updated successfully')
      } else {
        const newCategory = await categoryService.createCategory(formData)
        setCategories([newCategory, ...categories])
        Alert.alert('Success', 'Category created successfully')
      }
      resetForm()
    } catch (error) {
      Alert.alert('Error', 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || '' })
    setShowAddForm(true)
  }

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(category.id),
        },
      ]
    )
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id)
      setCategories(categories.filter(c => c.id !== id))
      Alert.alert('Success', 'Category deleted successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete category')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingCategory(null)
    setShowAddForm(false)
  }

  const renderCategory = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.categoryDescription, { color: theme.textSecondary }]}>
              {item.description}
            </Text>
          )}
          <Text style={[styles.categoryMeta, { color: theme.textSecondary }]}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.categoryActions}>
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
    <Card style={styles.categoryCard}>
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
    categoryCard: {
      marginBottom: spacing.base,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    categoryInfo: {
      flex: 1,
      marginRight: spacing.base,
    },
    categoryName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing.xs,
    },
    categoryDescription: {
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    categoryMeta: {
      fontSize: typography.fontSize.xs,
    },
    categoryActions: {
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
        title="Category Management"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {showAddForm && (
          <Card style={styles.formCard} padding="lg">
            <Text style={styles.formTitle}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Text>
            
            <TextInput
              label="Category Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter category name"
              required
            />
            
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter category description (optional)"
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
                title={editingCategory ? 'Update' : 'Create'}
                onPress={handleSubmit}
                loading={submitting}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        <FlatList
          data={loading ? Array(5).fill({}) : categories}
          renderItem={loading ? renderSkeleton : renderCategory}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="shape" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No categories available</Text>
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