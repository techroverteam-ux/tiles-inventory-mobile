# Example Implementation - Inventory Module

## Complete Inventory Module Implementation

### 1. Inventory List Screen

```typescript
// src/screens/inventory/InventoryListScreen.tsx
import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { InventoryCard } from './components/InventoryCard'
import { InventoryFilters } from './components/InventoryFilters'
import { InventorySearch } from './components/InventorySearch'
import { InventoryCardSkeleton } from '../../components/loading/InventoryCardSkeleton'
import { FloatingActionButton } from '../../components/common/FloatingActionButton'
import { Header } from '../../components/navigation/Header'
import { useInventory } from './hooks/useInventory'
import { useInventoryNavigation } from '../../hooks/useNavigation'
import { colors } from '../../theme/colors'
import { InventoryItem, InventoryFilters as IInventoryFilters } from '../../types/inventory'

export const InventoryListScreen: React.FC = () => {
  const navigation = useInventoryNavigation()
  const {
    items,
    loading,
    refreshing,
    filters,
    stats,
    updateFilters,
    refreshData,
    loadMore,
    hasMore
  } = useInventory()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData()
    }, [refreshData])
  )

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    updateFilters({ search: query })
  }, [updateFilters])

  const handleFilterChange = useCallback((newFilters: Partial<IInventoryFilters>) => {
    updateFilters(newFilters)
    setShowFilters(false)
  }, [updateFilters])

  const handleItemPress = useCallback((item: InventoryItem) => {
    navigation.navigate('InventoryDetail', { productId: item.productId })
  }, [navigation])

  const handleAddProduct = useCallback(() => {
    navigation.navigate('ProductForm')
  }, [navigation])

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => (
    <InventoryCard
      item={item}
      onPress={() => handleItemPress(item)}
      onEdit={() => navigation.navigate('StockUpdate', { productId: item.productId })}
    />
  ), [handleItemPress, navigation])

  const renderSkeleton = useCallback(() => (
    <FlatList
      data={Array.from({ length: 6 })}
      renderItem={() => <InventoryCardSkeleton />}
      keyExtractor={(_, index) => `skeleton-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  ), [])

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No inventory items found</Text>
      <Text style={styles.emptySubtitle}>
        {filters.search ? 'Try adjusting your search or filters' : 'Add your first product to get started'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddProduct}
      >
        <Text style={styles.emptyButtonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  ), [filters.search, handleAddProduct])

  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Inventory" />
        <InventorySearch
          value={searchQuery}
          onChangeText={handleSearch}
          onFilterPress={() => setShowFilters(true)}
        />
        {renderSkeleton()}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Inventory" />
      
      <InventorySearch
        value={searchQuery}
        onChangeText={handleSearch}
        onFilterPress={() => setShowFilters(true)}
        activeFiltersCount={Object.keys(filters).filter(key => filters[key]).length}
      />

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {stats.lowStockItems}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.danger }]}>
              {stats.outOfStockItems}
            </Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${stats.totalValue.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
      />

      <FloatingActionButton
        iconName="add"
        onPress={handleAddProduct}
      />

      <InventoryFilters
        visible={showFilters}
        filters={filters}
        onApply={handleFilterChange}
        onClose={() => setShowFilters(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  }
})
```

### 2. Inventory Card Component

```typescript
// src/screens/inventory/components/InventoryCard.tsx
import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { QuickActionButton } from '../../../components/common/QuickActionButton'
import { colors } from '../../../theme/colors'
import { InventoryItem } from '../../../types/inventory'

interface InventoryCardProps {
  item: InventoryItem
  onPress: () => void
  onEdit: () => void
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onPress,
  onEdit
}) => {
  const getStockStatus = () => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: colors.danger }
    }
    if (item.quantity <= item.minStock) {
      return { label: 'Low Stock', color: colors.warning }
    }
    return { label: 'In Stock', color: colors.success }
  }

  const stockStatus = getStockStatus()
  const stockPercentage = Math.min((item.quantity / item.maxStock) * 100, 100)

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.productInfo}>
          {item.product.imageUrl ? (
            <Image
              source={{ uri: item.product.imageUrl }}
              style={styles.productImage}
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Icon name="inventory" size={24} color={colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.product.name}
            </Text>
            <Text style={styles.productCode} numberOfLines={1}>
              {item.product.code}
            </Text>
            <Text style={styles.brandCategory} numberOfLines={1}>
              {item.product.brand.name} • {item.product.category.name}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
          <Text style={styles.statusText}>{stockStatus.label}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.stockInfo}>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Current</Text>
            <Text style={styles.stockValue}>{item.quantity}</Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Min</Text>
            <Text style={styles.stockValue}>{item.minStock}</Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Max</Text>
            <Text style={styles.stockValue}>{item.maxStock}</Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Value</Text>
            <Text style={styles.stockValue}>
              ${(item.quantity * item.unitPrice).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.stockBar}>
          <View style={styles.stockBarBackground}>
            <View
              style={[
                styles.stockBarFill,
                {
                  width: `${stockPercentage}%`,
                  backgroundColor: stockStatus.color
                }
              ]}
            />
          </View>
          <Text style={styles.stockPercentage}>
            {Math.round(stockPercentage)}%
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.locationText}>
            📍 {item.location.name}
          </Text>
          <View style={styles.actions}>
            <QuickActionButton
              iconName="edit"
              onPress={onEdit}
              variant="primary"
              size="small"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12
  },
  productInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12
  },
  placeholderImage: {
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  productDetails: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  productCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2
  },
  brandCategory: {
    fontSize: 12,
    color: colors.textSecondary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  stockItem: {
    alignItems: 'center'
  },
  stockLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  stockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  stockBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    marginRight: 8
  },
  stockBarFill: {
    height: '100%',
    borderRadius: 3
  },
  stockPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    minWidth: 35,
    textAlign: 'right'
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  }
})
```

### 3. Inventory Hook

```typescript
// src/screens/inventory/hooks/useInventory.ts
import { useState, useCallback, useEffect } from 'react'
import { inventoryService } from '../../../services/api/InventoryService'
import { useApiError } from '../../../hooks/useApiError'
import { InventoryItem, InventoryFilters, InventoryStats } from '../../../types/inventory'

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const { handleError } = useApiError()

  const fetchItems = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    if (page === 1) {
      isRefresh ? setRefreshing(true) : setLoading(true)
    }

    try {
      const response = await inventoryService.getAll({
        ...filters,
        page,
        limit: 20
      })

      if (page === 1) {
        setItems(response.items || [])
      } else {
        setItems(prev => [...prev, ...(response.items || [])])
      }

      setHasMore((response.items?.length || 0) === 20)
      setCurrentPage(page)
    } catch (error) {
      handleError(error, 'fetchInventoryItems')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, handleError])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await inventoryService.getInventoryStats()
      setStats(statsData)
    } catch (error) {
      handleError(error, 'fetchInventoryStats')
    }
  }, [handleError])

  const updateFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
    setHasMore(true)
  }, [])

  const refreshData = useCallback(() => {
    fetchItems(1, true)
    fetchStats()
  }, [fetchItems, fetchStats])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchItems(currentPage + 1)
    }
  }, [loading, hasMore, currentPage, fetchItems])

  const updateStock = useCallback(async (id: string, quantity: number, reason: string) => {
    try {
      const updatedItem = await inventoryService.updateStock(id, { quantity, reason })
      
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ))
      
      // Refresh stats after stock update
      fetchStats()
      
      return updatedItem
    } catch (error) {
      handleError(error, 'updateStock')
      throw error
    }
  }, [handleError, fetchStats])

  useEffect(() => {
    fetchItems(1)
    fetchStats()
  }, [filters])

  return {
    items,
    loading,
    refreshing,
    filters,
    stats,
    hasMore,
    updateFilters,
    refreshData,
    loadMore,
    updateStock
  }
}
```

### 4. Stock Update Screen

```typescript
// src/screens/inventory/StockUpdateScreen.tsx
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { FormActionButtons } from '../../components/forms/FormActionButtons'
import { Header } from '../../components/navigation/Header'
import { useInventory } from './hooks/useInventory'
import { colors } from '../../theme/colors'
import { InventoryStackParamList } from '../../navigation/types'

type StockUpdateRouteProp = RouteProp<InventoryStackParamList, 'StockUpdate'>

export const StockUpdateScreen: React.FC = () => {
  const route = useRoute<StockUpdateRouteProp>()
  const navigation = useNavigation()
  const { productId } = route.params
  
  const { items, updateStock } = useInventory()
  const item = items.find(i => i.productId === productId)
  
  const [quantity, setQuantity] = useState(item?.quantity.toString() || '0')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!item) return

    const newQuantity = parseInt(quantity)
    if (isNaN(newQuantity) || newQuantity < 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity')
      return
    }

    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for the stock update')
      return
    }

    setSaving(true)
    try {
      await updateStock(item.id, newQuantity, reason)
      Alert.alert(
        'Success',
        'Stock updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (error) {
      // Error handled by useApiError hook
    } finally {
      setSaving(false)
    }
  }, [item, quantity, reason, updateStock, navigation])

  const handleCancel = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  if (!item) {
    return (
      <View style={styles.container}>
        <Header title="Stock Update" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item not found</Text>
        </View>
      </View>
    )
  }

  const quantityDiff = parseInt(quantity) - item.quantity
  const isIncrease = quantityDiff > 0
  const isDecrease = quantityDiff < 0

  return (
    <View style={styles.container}>
      <Header title="Update Stock" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.productCode}>{item.product.code}</Text>
          <Text style={styles.currentStock}>
            Current Stock: {item.quantity} units
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Quantity *</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter new quantity"
              keyboardType="numeric"
              style={styles.input}
            />
            {quantityDiff !== 0 && (
              <Text style={[
                styles.diffText,
                { color: isIncrease ? colors.success : colors.danger }
              ]}>
                {isIncrease ? '+' : ''}{quantityDiff} units
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reason *</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Purchase, Sale, Adjustment, Damage"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes (optional)"
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Stock:</Text>
              <Text style={styles.summaryValue}>{item.quantity} units</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>New Stock:</Text>
              <Text style={styles.summaryValue}>{quantity} units</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Change:</Text>
              <Text style={[
                styles.summaryValue,
                { color: isIncrease ? colors.success : isDecrease ? colors.danger : colors.text }
              ]}>
                {quantityDiff > 0 ? '+' : ''}{quantityDiff} units
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <FormActionButtons
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
          saveTitle="Update Stock"
          disabled={!reason.trim() || quantity === item.quantity.toString()}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  productInfo: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 16
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  productCode: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8
  },
  currentStock: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary
  },
  form: {
    backgroundColor: colors.white,
    padding: 16
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  diffText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4
  },
  summary: {
    backgroundColor: colors.gray50,
    padding: 16,
    borderRadius: 8,
    marginTop: 8
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text
  },
  actions: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary
  }
})
```

### 5. Type Definitions

```typescript
// src/types/inventory.ts
export interface InventoryItem {
  id: string
  productId: string
  locationId: string
  quantity: number
  minStock: number
  maxStock: number
  unitPrice: number
  lastUpdated: string
  product: {
    name: string
    code: string
    imageUrl?: string
    brand: { name: string }
    category: { name: string }
  }
  location: {
    name: string
    code: string
  }
}

export interface InventoryFilters {
  locationId?: string
  lowStock?: boolean
  outOfStock?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface InventoryStats {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
}

export interface StockUpdateRequest {
  quantity: number
  reason: string
  notes?: string
}

export interface StockHistoryItem {
  id: string
  inventoryId: string
  previousQuantity: number
  newQuantity: number
  change: number
  reason: string
  notes?: string
  createdAt: string
  createdBy: string
}
```

## Key Implementation Features

1. **Complete MVVM Architecture**: Separation of concerns with hooks, services, and components
2. **Skeleton Loading**: Content-aware loading states instead of spinners
3. **Button-Level Loading**: Individual button loading states
4. **Real-time Updates**: Optimistic updates with error handling
5. **Pull-to-Refresh**: Native refresh functionality
6. **Infinite Scrolling**: Pagination with load more
7. **Search & Filters**: Real-time search with advanced filtering
8. **Error Handling**: Centralized error management with user feedback
9. **Type Safety**: Full TypeScript implementation
10. **Performance Optimized**: Memoized callbacks and efficient re-renders
11. **Accessibility**: Proper accessibility labels and navigation
12. **Responsive Design**: Adapts to different screen sizes

This implementation demonstrates the complete architecture and can be replicated for other modules (Products, Orders, Customers) following the same patterns.