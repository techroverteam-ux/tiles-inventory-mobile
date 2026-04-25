import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton } from '../../components/loading/Skeleton'
import { LoadingSpinner } from '../../components/loading'
import { collectionService, Collection } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'

interface CollectionManagementScreenProps {
  navigation: any
}

export const CollectionManagementScreen: React.FC<CollectionManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
    },
    addButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      flexDirection: 'row',
      alignItems: 'center',
    },
    addButtonText: {
      color: theme.textInverse,
      fontWeight: typography.fontWeight.semibold,
      marginLeft: spacing.xs,
    },
    listContainer: {
      flex: 1,
      padding: spacing.base,
    },
    content: {
      flex: 1,
      padding: spacing.base,
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
    collectionCard: {
      marginBottom: spacing.sm,
    },
    collectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    collectionName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      flex: 1,
    },
    collectionActions: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: spacing.sm,
      marginLeft: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    editButton: {
      backgroundColor: theme.warning + '20',
    },
    deleteButton: {
      backgroundColor: theme.error + '20',
    },
    collectionDescription: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      marginBottom: spacing.sm,
    },
    collectionMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    activeBadge: {
      backgroundColor: theme.success + '20',
    },
    inactiveBadge: {
      backgroundColor: theme.error + '20',
    },
    statusText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    activeText: {
      color: theme.success,
    },
    inactiveText: {
      color: theme.error,
    },
    createdDate: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.lg,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.base,
    },
  })

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const response = await collectionService.getCollections()
      setCollections(response.collections)
    } catch (error) {
      showToast('Failed to load collections', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCollections()
    setRefreshing(false)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast('Collection name is required', 'warning')
      return
    }

    setSubmitting(true)
    try {
      if (editingCollection) {
        const updated = await collectionService.updateCollection(editingCollection.id, formData)
        setCollections(collections.map(c => c.id === editingCollection.id ? updated : c))
        showToast('Collection updated successfully', 'success')
      } else {
        const created = await collectionService.createCollection(formData)
        setCollections([created, ...collections])
        showToast('Collection created successfully', 'success')
      }
      resetForm()
    } catch (error) {
      showToast('Failed to save collection', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingCollection(null)
    setShowAddForm(false)
  }

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection)
    setFormData({
      name: collection.name,
      description: collection.description || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = (collection: Collection) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCollection(collection.id),
        },
      ]
    )
  }

  const deleteCollection = async (id: string) => {
    try {
      await collectionService.deleteCollection(id)
      setCollections(prev => prev.filter(c => c.id !== id))
      showToast('Collection deleted successfully', 'success')
    } catch (error) {
      showToast('Failed to delete collection', 'error')
    }
  }

  const renderCollection = ({ item }: { item: Collection }) => (
    <Card style={styles.collectionCard}>
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <View style={styles.collectionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Icon name="edit" size={20} color={theme.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Icon name="delete" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.collectionDescription}>{item.description}</Text>
      )}
      
      <View style={styles.collectionMeta}>
        <View style={[
          styles.statusBadge,
          item.isActive ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.isActive ? styles.activeText : styles.inactiveText
          ]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Text style={styles.createdDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
        </Text>
      </View>
    </Card>
  )

  const renderSkeleton = () => (
    <Card style={styles.collectionCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={14} width="40%" />
    </Card>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Collection Management" showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        {showAddForm && (
          <Card style={styles.formCard} padding="lg">
            <Text style={styles.formTitle}>
              {editingCollection ? 'Edit Collection' : 'Add New Collection'}
            </Text>

            <TextInput
              label="Collection Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter collection name"
              required
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter collection description (optional)"
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
                title={editingCollection ? 'Update' : 'Create'}
                onPress={handleSubmit}
                loading={submitting}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        <FlatList
          data={loading ? Array(5).fill({}) : collections}
          renderItem={loading ? renderSkeleton : renderCollection}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.primary]} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="collections" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>
                  No collections found.{"\n"}Add your first collection to get started.
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      {!showAddForm && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Icon name="add" size={20} color={theme.textInverse} />
          <Text style={styles.addButtonText}>Add Collection</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}