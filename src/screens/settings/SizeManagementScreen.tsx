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
import { sizeService, Size } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'

interface SizeManagementScreenProps {
  navigation: any
}

export const SizeManagementScreen: React.FC<SizeManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSize, setEditingSize] = useState<Size | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSizes()
  }, [])

  const loadSizes = async () => {
    try {
      const response = await sizeService.getSizes()
      setSizes(response.sizes)
    } catch (error) {
      Alert.alert('Error', 'Failed to load sizes')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSizes()
    setRefreshing(false)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Size name is required')
      return
    }

    setSubmitting(true)
    try {
      if (editingSize) {
        const updated = await sizeService.updateSize(editingSize.id, formData)
        setSizes(sizes.map(s => s.id === editingSize.id ? updated : s))
        Alert.alert('Success', 'Size updated successfully')
      } else {
        const newSize = await sizeService.createSize(formData)
        setSizes([newSize, ...sizes])
        Alert.alert('Success', 'Size created successfully')
      }
      resetForm()
    } catch (error) {
      Alert.alert('Error', 'Failed to save size')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (size: Size) => {
    setEditingSize(size)
    setFormData({ name: size.name, description: size.description || '' })
    setShowAddForm(true)
  }

  const handleDelete = (size: Size) => {
    Alert.alert(
      'Delete Size',
      `Are you sure you want to delete "${size.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSize(size.id),
        },
      ]
    )
  }

  const deleteSize = async (id: string) => {
    try {
      await sizeService.deleteSize(id)
      setSizes(sizes.filter(s => s.id !== id))
      Alert.alert('Success', 'Size deleted successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete size')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingSize(null)
    setShowAddForm(false)
  }

  const renderSize = ({ item }: { item: Size }) => (
    <Card style={styles.sizeCard}>
      <View style={styles.sizeHeader}>
        <View style={styles.sizeInfo}>
          <Text style={[styles.sizeName, { color: theme.text }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.sizeDescription, { color: theme.textSecondary }]}>
              {item.description}
            </Text>
          )}
          <Text style={[styles.sizeMeta, { color: theme.textSecondary }]}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.sizeActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => handleEdit(item)}
          >
            <Icon name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
            onPress={() => handleDelete(item)}
          >
            <Icon name="delete" size={16} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.statusBadge, { 
        backgroundColor: item.isActive ? theme.success + '20' : theme.error + '20' 
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
    <Card style={styles.sizeCard}>
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
    sizeCard: {
      marginBottom: spacing.base,
    },
    sizeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    sizeInfo: {
      flex: 1,
      marginRight: spacing.base,
    },
    sizeName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing.xs,
    },
    sizeDescription: {
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    sizeMeta: {
      fontSize: typography.fontSize.xs,
    },
    sizeActions: {
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
        title="Size Management"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {showAddForm && (
          <Card style={styles.formCard} padding="lg">
            <Text style={styles.formTitle}>
              {editingSize ? 'Edit Size' : 'Add New Size'}
            </Text>
            
            <TextInput
              label="Size Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter size name (e.g., 12x12, 24x24)"
              required
            />
            
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter size description (optional)"
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
                title={editingSize ? 'Update' : 'Create'}
                onPress={handleSubmit}
                loading={submitting}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        <FlatList
          data={loading ? Array(5).fill({}) : sizes}
          renderItem={loading ? renderSkeleton : renderSize}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="ruler" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No sizes available</Text>
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