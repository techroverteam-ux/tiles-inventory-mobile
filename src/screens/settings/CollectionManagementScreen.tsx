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
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { LoadingSpinner } from '../../components/loading'
import { collectionService, Collection } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'

export const CollectionManagementScreen: React.FC = () => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
    collectionCard: {
      backgroundColor: theme.surface,
      padding: spacing.base,
      marginBottom: spacing.sm,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: theme.border,
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
    <View style={styles.collectionCard}>
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <View style={styles.collectionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {/* TODO: Navigate to edit form */}}
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
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {/* TODO: Navigate to add form */}}
        >
          <Icon name="add" size={20} color={theme.textInverse} />
          <Text style={styles.addButtonText}>Add Collection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="collections" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              No collections found.{'\n'}Add your first collection to get started.
            </Text>
          </View>
        ) : (
          <FlatList
            data={collections}
            renderItem={renderCollection}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}