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
import { locationService, Location } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface LocationManagementScreenProps {
  navigation: any
}

export const LocationManagementScreen: React.FC<LocationManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
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
        const updated = await locationService.updateLocation(editingLocation.id, formData)
        setLocations(locations.map(l => l.id === editingLocation.id ? updated : l))
        Alert.alert('Success', 'Location updated successfully')
      } else {
        const newLocation = await locationService.createLocation(formData)
        setLocations([newLocation, ...locations])
        Alert.alert('Success', 'Location created successfully')
      }
      resetForm()
    } catch (error) {
      Alert.alert('Error', 'Failed to save location')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormData({ name: location.name, address: location.address || '' })
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
    setFormData({ name: '', address: '' })
    setEditingLocation(null)
    setShowAddForm(false)
  }

  const renderLocation = ({ item }: { item: Location }) => (
    <Card style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <Text style={[styles.locationName, { color: theme.text }]}>{item.name}</Text>
          {item.address && (
            <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
              {item.address}
            </Text>
          )}
          <Text style={[styles.locationMeta, { color: theme.textSecondary }]}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.locationActions}>
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
    <Card style={styles.locationCard}>
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
    locationCard: {
      marginBottom: spacing.base,
    },
    locationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    locationInfo: {
      flex: 1,
      marginRight: spacing.base,
    },
    locationName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing.xs,
    },
    locationAddress: {
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    locationMeta: {
      fontSize: typography.fontSize.xs,
    },
    locationActions: {
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
        title="Location Management"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {showAddForm && (
          <Card style={styles.formCard} padding="lg">
            <Text style={styles.formTitle}>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </Text>
            
            <TextInput
              label="Location Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter location name"
              required
            />
            
            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter location address (optional)"
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
                title={editingLocation ? 'Update' : 'Create'}
                onPress={handleSubmit}
                loading={submitting}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        <FlatList
          data={loading ? Array(5).fill({}) : locations}
          renderItem={loading ? renderSkeleton : renderLocation}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="map-marker" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No locations available</Text>
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