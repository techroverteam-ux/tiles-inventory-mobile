import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { PaginationControl } from '../../components/common/PaginationControl'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/loading/Skeleton'
import { spacing, typography, borderRadius } from '../../theme'
import { getCommonStyles } from '../../theme/commonStyles'
import { InventoryNavigationProp } from '../../navigation/types'
import { inventoryService, Batch } from '../../services/api/ApiServices'

const resolveImageUrl = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `https://tiles-inventory.vercel.app${url}`
}

export const InventoryListScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<InventoryNavigationProp>()
  const { showWarning, showSuccess, showError } = useToast()
  const commonStyles = getCommonStyles(theme)

  const [inventory, setInventory] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

  const fetchInventory = useCallback(async (page: number) => {
    try {
      setLoading(true)
      const response = await inventoryService.getInventory({ page, limit: itemsPerPage })
      setInventory(response.inventory || [])
      
      const total = response.pagination?.total || 0
      setTotalItems(total)
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)))
      setCurrentPage(page)
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      showError('Error', 'Failed to fetch inventory data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchInventory(1)
    }, [fetchInventory])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchInventory(1)
  }, [fetchInventory])

  const handlePageChange = (newPage: number) => {
    fetchInventory(newPage)
  }

  const handleExportData = () => {
    import('../../utils/exportUtils').then(({ exportToExcel, commonColumns }) => {
      exportToExcel({
        data: inventory,
        columns: commonColumns.inventory,
        filename: 'inventory_export',
        reportTitle: 'Inventory Stock Report'
      }).then(success => {
        if (success) showSuccess('Export', 'Excel file ready to share')
      })
    })
  }

  const handleToggleFilters = () => {
    showWarning('Filters', 'Advanced filtering functionality will be available in the next release.')
  }

  const handleStockUpdate = (batch: Batch) => {
    navigation.navigate('StockUpdate', { productId: batch.productId })
  }

  const handleDelete = (batch: Batch) => {
    showWarning(
      'Delete Inventory',
      `Are you sure you want to delete this inventory record?`,
      {
        action: {
          label: 'Delete',
          onPress: () => {
            setInventory(inventory.filter(b => b.id !== batch.id))
            showSuccess('Deleted', 'Inventory record deleted')
          }
        }
      }
    )
  }

  const renderInventoryCard = ({ item: batch }: { item: Batch }) => {
    return (
      <Card style={[
        commonStyles.glassCard, 
        styles.inventoryCard,
        viewMode === 'grid' && styles.gridCard
      ]}>
        <View style={styles.imageContainer}>
          {batch.product.imageUrl ? (
            <Image source={{ uri: resolveImageUrl(batch.product.imageUrl)! }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="image" size={48} color={theme.textSecondary} />
            </View>
          )}
          <View style={styles.unitsBadge}>
            <Text style={styles.unitsBadgeText}>{batch.quantity} units</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName} numberOfLines={1}>{batch.product.name}</Text>
              <Text style={styles.brandName} numberOfLines={1}>{batch.product.brand.name}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleStockUpdate(batch)}>
                <Icon name="edit" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { borderColor: theme.error }]} onPress={() => handleDelete(batch)}>
                <Icon name="delete-outline" size={16} color={theme.error} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.grid2x2}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Size: </Text>
              <Text style={styles.gridValue}>{batch.product.size?.name || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Cat: </Text>
              <Text style={styles.gridValue}>{batch.product.category?.name || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Batch: </Text>
              <Text style={styles.gridValue}>{batch.batchNumber || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Loc: </Text>
              <Text style={styles.gridValue}>{batch.location?.name || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.sellingLabel}>Selling: </Text>
            <Text style={styles.sellingValue}>₹{batch.sellingPrice || 0}</Text>
          </View>
        </View>
      </Card>
    )
  }

  const renderInventoryRow = ({ item: batch }: { item: Batch }) => {
    return (
      <TouchableOpacity 
        style={styles.tableRow}
        onPress={() => handleStockUpdate(batch)}
        activeOpacity={0.7}
      >
        <View style={styles.colPhoto}>
          {batch.product.imageUrl ? (
            <Image source={{ uri: resolveImageUrl(batch.product.imageUrl)! }} style={styles.rowImage} />
          ) : (
            <View style={styles.rowPlaceholder}>
              <Icon name="image" size={16} color={theme.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.colProduct}>
          <Text style={styles.rowTitle} numberOfLines={1}>{batch.product.name}</Text>
          <Text style={styles.rowSubtitle} numberOfLines={1}>Batch: {batch.batchNumber || 'N/A'}</Text>
        </View>
        <View style={styles.colStock}>
          <View style={[styles.rowBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.rowBadgeText}>{batch.quantity} units</Text>
          </View>
        </View>
        <View style={styles.colPrice}>
          <Text style={styles.rowText}>₹{batch.sellingPrice || 0}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderItem = ({ item }: { item: Batch }) => {
    if (viewMode === 'list') return renderInventoryRow({ item })
    return renderInventoryCard({ item })
  }

  const renderListHeader = () => {
    if (viewMode !== 'list' || inventory.length === 0) return null
    return (
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colPhoto]}>PHOTO</Text>
        <Text style={[styles.tableHeaderText, styles.colProduct]}>PRODUCT</Text>
        <Text style={[styles.tableHeaderText, styles.colStock]}>STOCK</Text>
        <Text style={[styles.tableHeaderText, styles.colPrice]}>PRICE</Text>
      </View>
    )
  }

  const renderSkeletonCard = () => {
    if (viewMode === 'list') {
      return (
        <View style={styles.tableRow}>
          <View style={styles.colPhoto}><Skeleton height={40} width={60} borderRadius={6} /></View>
          <View style={styles.colProduct}><Skeleton height={16} width="80%" /></View>
          <View style={styles.colStock}><Skeleton height={24} width={60} borderRadius={12} /></View>
          <View style={styles.colPrice}><Skeleton height={16} width={40} /></View>
        </View>
      )
    }
    return (
      <Card style={[commonStyles.glassCard, styles.inventoryCard]}>
        <View style={{ height: 180, width: '100%', backgroundColor: theme.surface }}>
          <Skeleton height="100%" width="100%" />
        </View>
        <View style={styles.cardContent}>
          <Skeleton height={24} width="50%" style={{ marginBottom: 16 }} />
          <Skeleton height={60} width="100%" />
        </View>
      </Card>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContainer: {
      padding: spacing.base,
      paddingBottom: 80,
    },
    inventoryCard: {
      marginBottom: spacing.md,
      padding: 0,
      borderRadius: 16,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: 180,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.02)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    unitsBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    unitsBadgeText: {
      color: theme.primaryForeground,
      fontSize: 12,
      fontWeight: 'bold',
    },
    cardContent: {
      padding: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    productName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    brandName: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
      textTransform: 'uppercase',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    iconBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
    },
    grid2x2: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    gridItem: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    gridLabel: {
      fontSize: 12,
      color: theme.mutedForeground,
    },
    gridValue: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.text,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    sellingLabel: {
      fontSize: 14,
      color: theme.mutedForeground,
    },
    sellingValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primary,
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
    tableHeader: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginTop: 8,
    },
    tableHeaderText: {
      color: theme.mutedForeground,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    colPhoto: { flex: 0.8 },
    colProduct: { flex: 2, paddingRight: 8 },
    colStock: { flex: 1, alignItems: 'center' },
    colPrice: { flex: 1, alignItems: 'flex-end' },
    rowImage: {
      width: 60,
      height: 40,
      borderRadius: 6,
      resizeMode: 'cover',
    },
    rowPlaceholder: {
      width: 60,
      height: 40,
      borderRadius: 6,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    rowSubtitle: {
      color: theme.mutedForeground,
      fontSize: 10,
      marginTop: 2,
    },
    rowText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '600',
    },
    rowBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    rowBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <MainHeader />
      <ScreenActionBar
        title="Inventory"
        primaryActionLabel="Add Stock"
        onPrimaryAction={() => navigation.navigate('StockUpdate', { productId: '' })}
        itemCount={totalItems}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExportData}
        onToggleFilters={handleToggleFilters}
      />
      
      <FlatList
        data={loading ? Array(viewMode === 'list' ? 6 : 3).fill({}) : inventory}
        renderItem={loading ? renderSkeletonCard : renderItem}
        keyExtractor={(item, index) => loading ? `skel-${index}` : item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={
          !loading && inventory.length > 0 ? (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StockUpdate', { productId: '' })}
      >
        <Icon name="add" size={24} color={theme.textInverse} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}