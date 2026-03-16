import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton, SkeletonText } from '../../components/loading/Skeleton'
import { spacing, typography, borderRadius } from '../../theme'
import { InventoryNavigationProp } from '../../navigation/types'
import { inventoryService, Batch, InventoryFilters } from '../../services/api/ApiServices'

export const InventoryListScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<InventoryNavigationProp>()
  
  const [inventory, setInventory] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchInventory = useCallback(async (page = 1, isRefresh = false, search = '') => {
    if (page === 1) {
      isRefresh ? setRefreshing(true) : setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const filters: InventoryFilters = {
        page,
        limit: 20,
        search: search.trim() || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      }

      const response = await inventoryService.getInventory(filters)
      
      if (page === 1) {
        setInventory(response.inventory)
      } else {
        setInventory(prev => [...prev, ...response.inventory])
      }

      setCurrentPage(response.pagination.page)
      setTotalPages(response.pagination.pages)
      setHasMore(response.pagination.page < response.pagination.pages)
      
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      Alert.alert('Error', 'Failed to fetch inventory data')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchInventory(1, false, searchQuery)
    }, [fetchInventory, searchQuery])
  )

  const onRefresh = useCallback(() => {
    setCurrentPage(1)
    fetchInventory(1, true, searchQuery)
  }, [fetchInventory, searchQuery])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && currentPage < totalPages) {
      fetchInventory(currentPage + 1, false, searchQuery)
    }
  }, [loadingMore, hasMore, currentPage, totalPages, fetchInventory, searchQuery])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchInventory(1, false, query)
  }, [fetchInventory])

  const getStockStatus = (batch: Batch) => {
    if (batch.quantity === 0) {
      return { label: 'Out of Stock', color: theme.danger }
    }
    if (batch.quantity < 10) {
      return { label: 'Low Stock', color: theme.warning }
    }
    return { label: 'In Stock', color: theme.success }
  }

  const handleItemPress = (batch: Batch) => {
    navigation.navigate('InventoryDetail', { productId: batch.productId })
  }

  const handleStockUpdate = (batch: Batch) => {
    navigation.navigate('StockUpdate', { productId: batch.productId })
  }

  const renderInventoryCard = ({ item: batch }: { item: Batch }) => {
    const stockStatus = getStockStatus(batch)
    const totalValue = batch.quantity * (batch.sellingPrice || batch.purchasePrice || 0)

    return (
      <Card
        style={styles.inventoryCard}
        touchable
        onPress={() => handleItemPress(batch)}
        padding="base"
      >
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            {batch.product.imageUrl ? (
              <View style={styles.productImageContainer}>
                <Icon name="image" size={24} color={theme.textSecondary} />
              </View>
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Icon name="inventory" size={24} color={theme.textSecondary} />
              </View>
            )}
            
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={1}>
                {batch.product.name}
              </Text>
              <Text style={styles.productCode} numberOfLines={1}>
                {batch.product.code}
              </Text>
              <Text style={styles.brandCategory} numberOfLines={1}>
                {batch.product.brand.name} • {batch.product.category.name}
              </Text>
              <Text style={styles.batchInfo} numberOfLines={1}>
                Batch: {batch.batchNumber} • {batch.location.name}
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
              <Text style={styles.stockLabel}>Quantity</Text>
              <Text style={styles.stockValue}>{batch.quantity}</Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={styles.stockLabel}>Purchase</Text>
              <Text style={styles.stockValue}>
                ${batch.purchasePrice?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={styles.stockLabel}>Selling</Text>
              <Text style={styles.stockValue}>
                ${batch.sellingPrice?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={styles.stockLabel}>Total Value</Text>
              <Text style={styles.stockValue}>
                ${totalValue.toFixed(2)}
              </Text>
            </View>
          </View>

          {batch.shade && (
            <View style={styles.shadeInfo}>
              <Text style={styles.shadeLabel}>Shade: </Text>
              <Text style={styles.shadeValue}>{batch.shade}</Text>
            </View>
          )}

          {batch.expiryDate && (
            <View style={styles.expiryInfo}>
              <Text style={styles.expiryLabel}>Expires: </Text>
              <Text style={styles.expiryValue}>
                {new Date(batch.expiryDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={styles.lastUpdated}>
              Updated: {new Date(batch.updatedAt).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => handleStockUpdate(batch)}
            >
              <Icon name="edit" size={16} color={theme.primary} />
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    )
  }

  const renderSkeletonCard = () => (
    <Card style={styles.inventoryCard} padding="base">
      <View style={styles.cardHeader}>
        <View style={styles.productInfo}>
          <Skeleton width={48} height={48} borderRadius={8} />
          <View style={styles.productDetails}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={12} style={{ marginTop: 4 }} />
            <Skeleton width="70%" height={12} style={{ marginTop: 4 }} />
            <Skeleton width="90%" height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.stockInfo}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.stockItem}>
              <Skeleton width={40} height={12} />
              <Skeleton width={30} height={16} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
        
        <View style={styles.cardFooter}>
          <Skeleton width={100} height={12} />
          <Skeleton width={60} height={28} borderRadius={14} />
        </View>
      </View>
    </Card>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="inventory" size={64} color={theme.textSecondary} />
      <Text style={styles.emptyTitle}>No inventory found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search terms' : 'No inventory items available'}
      </Text>
    </View>
  )

  const renderFooter = () => {
    if (!loadingMore) return null
    
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchContainer: {
      padding: spacing.base,
    },
    listContainer: {
      padding: spacing.base,
      paddingBottom: 80,
    },
    inventoryCard: {
      marginBottom: spacing.base,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    productInfo: {
      flexDirection: 'row',
      flex: 1,
      marginRight: spacing.md,
    },
    productImageContainer: {
      width: 48,
      height: 48,
      backgroundColor: theme.gray100,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    productImagePlaceholder: {
      width: 48,
      height: 48,
      backgroundColor: theme.gray100,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    productDetails: {
      flex: 1,
    },
    productName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: 2,
    },
    productCode: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    brandCategory: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    batchInfo: {
      fontSize: typography.fontSize.xs,
      color: theme.primary,
      fontWeight: typography.fontWeight.medium,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textInverse,
    },
    cardContent: {
      gap: spacing.md,
    },
    stockInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    stockItem: {
      alignItems: 'center',
    },
    stockLabel: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    stockValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    shadeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    shadeLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
    shadeValue: {
      fontSize: typography.fontSize.sm,
      color: theme.text,
      fontWeight: typography.fontWeight.medium,
    },
    expiryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    expiryLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
    expiryValue: {
      fontSize: typography.fontSize.sm,
      color: theme.warning,
      fontWeight: typography.fontWeight.medium,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    lastUpdated: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
    },
    updateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.gray100,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    updateButtonText: {
      fontSize: typography.fontSize.xs,
      color: theme.primary,
      fontWeight: typography.fontWeight.medium,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['2xl'],
      paddingVertical: spacing['4xl'],
    },
    emptyTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginTop: spacing.base,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    loadingFooter: {
      paddingVertical: spacing.base,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search inventory..."
          leftIcon="search"
        />
      </View>

      {loading && inventory.length === 0 ? (
        <FlatList
          data={Array.from({ length: 6 })}
          renderItem={renderSkeletonCard}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderInventoryCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  )
}