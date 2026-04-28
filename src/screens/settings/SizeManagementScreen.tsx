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
import { sizeService, Size } from '../../services/api/ApiServices'
import { spacing } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'
import { getCommonStyles } from '../../theme/commonStyles'
import { FormModal } from '../../components/common/FormModal'
import { FormField, FormRow, ActiveStatusToggle, FormActions, SectionBox } from '../../components/common/FormComponents'
import { useFocusEffect } from '@react-navigation/native'

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
  const [formData, setFormData] = useState({ name: '', description: '', length: '', width: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const commonStyles = getCommonStyles(theme)

  useEffect(() => { loadSizes() }, [])

  useFocusEffect(useCallback(() => { loadSizes() }, []))

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
        await sizeService.updateSize(editingSize.id, formData)
      } else {
        await sizeService.createSize({ ...formData, isActive: formData.isActive })
      }
      resetForm()
      await loadSizes()
    } catch (error) {
      Alert.alert('Error', 'Failed to save size')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (size: Size) => {
    setEditingSize(size)
    setFormData({ name: size.name, description: size.description || '', length: '', width: '', isActive: size.isActive ?? true })
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
    setFormData({ name: '', description: '', length: '', width: '', isActive: true })
    setEditingSize(null)
    setShowAddForm(false)
  }

  const renderSize = ({ item }: { item: Size }) => (
    <Card style={[commonStyles.glassCard, styles.sizeCard]} padding="none">
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sizeName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.sizeDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
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
      
      {/* Specific dimension tag for Sizes */}
      <View style={styles.dimensionTag}>
        <Icon name="link" size={14} color={theme.primary} style={{ transform: [{ rotate: '45deg' }] }} />
        <Text style={styles.dimensionTagText}>120" x 32"</Text>
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
    <Card style={[commonStyles.glassCard, styles.sizeCard]} padding="base">
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
    sizeCard: {
      marginBottom: 16,
      borderRadius: 24,
      overflow: 'hidden',
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 20,
      paddingTop: 20,
      marginBottom: 16,
    },
    sizeName: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    sizeDescription: {
      fontSize: 12,
      color: theme.mutedForeground,
      fontStyle: 'italic',
      paddingRight: 10,
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
    dimensionTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      marginHorizontal: 20,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
    },
    dimensionTagText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '600',
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
          title="Sizes"
          primaryActionLabel="Add Size"
          onPrimaryAction={() => setShowAddForm(true)}
          itemCount={sizes.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <FormModal
          key={editingSize?.id ?? 'new-size'}
          visible={showAddForm}
          title={editingSize ? 'Edit Size' : 'Add New Size'}
          onClose={resetForm}
        >
          <FormRow>
            <View style={{ flex: 1 }}>
              <FormField
                label="Name"
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                placeholder="e.g., 24×24"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="Description"
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
                placeholder="Enter description (optional)"
              />
            </View>
          </FormRow>
          <SectionBox>
            <FormRow>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Length (inch)"
                  leftIcon="straighten"
                  value={formData.length}
                  onChangeText={(t) => setFormData({ ...formData, length: t })}
                  placeholder="Enter length in inches"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Width (inch)"
                  leftIcon="straighten"
                  value={formData.width}
                  onChangeText={(t) => setFormData({ ...formData, width: t })}
                  placeholder="Enter width"
                  keyboardType="decimal-pad"
                />
              </View>
            </FormRow>
          </SectionBox>
          <ActiveStatusToggle
            value={formData.isActive}
            onChange={(v) => setFormData({ ...formData, isActive: v })}
          />
          <FormActions
            submitLabel={editingSize ? 'Update Size' : 'Create Size'}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            onAddMore={editingSize ? undefined : () => { handleSubmit() }}
            loading={submitting}
          />
        </FormModal>

        <FlatList
          data={loading ? Array(5).fill({}) : sizes}
          renderItem={loading ? renderSkeleton : renderSize}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.primary]} tintColor={theme.primary} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="straighten" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No sizes available</Text>
              </View>
            ) : null
          }
        />
      </View>

    </SafeAreaView>
  )
}