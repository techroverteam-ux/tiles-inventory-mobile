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
import { PaginationControl } from '../../components/common/PaginationControl'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/loading/Skeleton'
import { locationService, Location } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'
import { getCommonStyles } from '../../theme/commonStyles'
import { FormModal } from '../../components/common/FormModal'
import { FormField, ActiveStatusToggle, FormActions } from '../../components/common/FormComponents'
import { useFocusEffect } from '@react-navigation/native'

interface LocationManagementScreenProps {
  navigation: any
}

export const LocationManagementScreen: React.FC<LocationManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)

  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => { loadLocations() }, [])

  useFocusEffect(useCallback(() => { loadLocations() }, []))

  const loadLocations = async () => {
    try {
      setLoading(true)
      const response = await locationService.getLocations()
      setLocations(response.locations)
    } catch (error) {
      Alert.alert('Error', 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadLocations()
    setRefreshing(false)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Location name is required')
      return
    }

    setSubmitting(true)
    try {
      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, formData)
      } else {
        await locationService.createLocation(formData)
      }
      resetForm()
      await loadLocations()
    } catch (error) {
      Alert.alert('Error', 'Failed to save location')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormData({ name: location.name, address: location.address || '', isActive: location.isActive ?? true })
    setShowAddForm(true)
  }

  const handleDelete = (location: Location) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${location.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteLocation(location.id),
        },
      ]
    )
  }

  const deleteLocation = async (id: string) => {
    try {
      await locationService.deleteLocation(id)
      setLocations(locations.filter(l => l.id !== id))
      Alert.alert('Success', 'Location deleted successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete location')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', address: '', isActive: true })
    setEditingLocation(null)
    setShowAddForm(false)
  }

  // Calculate paginated locations
  const totalPages = Math.ceil(locations.length / itemsPerPage)
  const paginatedLocations = locations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const renderLocation = ({ item }: { item: Location }) => (
    <Card style={[commonStyles.glassCard, styles.locationCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? theme.primary : theme.error }]}>
            <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <Icon name="warehouse" size={40} color={theme.primary} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.locationName}>{item.name}</Text>
        
        <View style={styles.infoBox}>
          <Icon name="inventory" size={16} color={theme.mutedForeground} />
          <Text style={styles.infoBoxText}>{item.address ? '1 stock batches' : '0 stock batches'}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.outlineBtn}
          onPress={() => handleEdit(item)}
        >
          <Icon name="edit" size={16} color={theme.text} />
          <Text style={styles.outlineBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Icon name="delete-outline" size={16} color={theme.error} />
        </TouchableOpacity>
      </View>
    </Card>
  )

  const renderSkeleton = () => (
    <Card style={[commonStyles.glassCard, styles.locationCard]}>
      <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton width={64} height={64} borderRadius={16} />
      </View>
      <View style={styles.contentContainer}>
        <Skeleton width="60%" height={24} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={40} borderRadius={8} />
      </View>
    </Card>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContainer: {
      padding: spacing.base,
      paddingBottom: 80,
    },
    locationCard: {
      marginBottom: spacing.md,
      padding: 0,
      borderRadius: 16,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 12,
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 10,
    },
    badgeContainer: {
      flexDirection: 'row',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    statusText: {
      color: theme.primaryForeground,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    iconContainer: {
      height: 160,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    iconWrapper: {
      width: 80,
      height: 80,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    contentContainer: {
      padding: 16,
    },
    locationName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    infoBoxText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    actionRow: {
      flexDirection: 'row',
      padding: 16,
      paddingTop: 0,
      gap: 12,
    },
    outlineBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    outlineBtnText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 12,
    },
    deleteBtn: {
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    fab: {
      position: 'absolute',
      right: spacing.base,
      bottom: spacing.base,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    formCard: {
      margin: spacing.base,
      marginBottom: 0,
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
  })

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <MainHeader />
      <ScreenActionBar
        title="Locations"
        primaryActionLabel="Add Location"
        onPrimaryAction={() => setShowAddForm(true)}
        itemCount={locations.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <FormModal
        key={editingLocation?.id ?? 'new-location'}
        visible={showAddForm}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        onClose={resetForm}
      >
        <FormField
          label="Location Name"
          required
          value={formData.name}
          onChangeText={(t) => setFormData({ ...formData, name: t })}
          placeholder="e.g., Warehouse A, Showroom Floor 1"
        />
        <FormField
          label="Address (Optional)"
          value={formData.address}
          onChangeText={(t) => setFormData({ ...formData, address: t })}
          placeholder="Enter address"
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />
        <ActiveStatusToggle
          value={formData.isActive}
          onChange={(v) => setFormData({ ...formData, isActive: v })}
          subtitle="Visible in system operations"
        />
        <FormActions
          submitLabel={editingLocation ? 'Update Location' : 'Create Location'}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          loading={submitting}
        />
      </FormModal>

      <FlatList
        data={loading ? Array(5).fill({}) : paginatedLocations}
        renderItem={loading ? renderSkeleton : renderLocation}
        keyExtractor={(item, index) => loading ? index.toString() : item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          !loading && locations.length > 0 ? (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={locations.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          ) : null
        }
      />

      {!showAddForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddForm(true)}
        >
          <Icon name="add" size={24} color={theme.textInverse} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}