import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { ScreenActionBar } from '../../components/common/ScreenActionBar'
import { PaginationControl } from '../../components/common/PaginationControl'
import { Card } from '../../components/common/Card'
import { ImagePreview } from '../../components/common/ImagePreview'
import { Skeleton } from '../../components/loading/Skeleton'
import { productService, Product } from '../../services/api/ApiServices'
import { exportToExcel, commonColumns } from '../../utils/exportUtils'

const resolveImageUrl = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `https://tiles-inventory.vercel.app${url}`
}
import { spacing, typography, borderRadius } from '../../theme'
import { getCommonStyles } from '../../theme/commonStyles'

interface ProductListScreenProps {
  navigation: any
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showError, showSuccess, showWarning } = useToast()
  const commonStyles = getCommonStyles(theme)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null)
  const [search, setSearch] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20 // Standard limit

  useEffect(() => {
    loadProducts(1)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadProducts(1)
    }, [])
  )

  const loadProducts = async (page: number, q = search) => {
    try {
      setLoading(true)
      const response = await productService.getProducts(page, itemsPerPage, { search: q })
      setProducts(response.products || [])
      const total = response.total || 0
      setTotalItems(total)
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)))
      setCurrentPage(page)
    } catch (error) {
      showError('Error', 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    loadProducts(1, q)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProducts(1)
    setRefreshing(false)
  }

  const handlePageChange = (newPage: number) => {
    loadProducts(newPage)
  }

  const handleDeleteProduct = (product: Product) => {
    showWarning(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      {
        action: {
          label: 'Delete',
          onPress: () => deleteProduct(product.id),
        }
      }
    )
  }

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
      showSuccess('Success', 'Product deleted successfully')
    } catch (error) {
      showError('Error', 'Failed to delete product')
    }
  }

  const handleExportData = () => {
    exportToExcel({
      data: products,
      columns: commonColumns.product,
      filename: 'products_export',
      reportTitle: 'Products Catalog Report',
    }).then(success => {
      if (success) showSuccess('Export', 'Excel file ready to share')
    })
  }

  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const handleToggleFilters = () => setShowFilters(v => !v)

  const applyStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status)
    loadProducts(1, search)
  }

  const renderProduct = ({ item }: { item: Product }) => {
    const stockQty = (item as any).totalStock ?? item.stock ?? 0
    const isOutOfStock = stockQty === 0
    return (
      <Card style={[
        commonStyles.glassCard,
        styles.productCard,
        viewMode === 'grid' && styles.gridCard
      ]}>
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <TouchableOpacity onPress={() => setPreviewImage({ url: resolveImageUrl(item.imageUrl)!, name: item.name })}>
              <Image source={{ uri: resolveImageUrl(item.imageUrl)! }} style={styles.image} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="image" size={48} color={theme.textSecondary} />
            </View>
          )}
          <View style={[styles.activeBadge, { backgroundColor: item.isActive === false ? theme.error : theme.primary }]}>
            <Text style={styles.activeBadgeText}>{item.isActive === false ? 'Inactive' : 'Active'}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.productName}>{item?.name || 'Unknown Product'}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <View style={styles.infoBox}>
                <Icon name="layers" size={14} color={theme.mutedForeground} />
                <Text style={styles.infoBoxText}>{item?.brand?.name || 'UNKNOWN'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxText}>{item?.size?.name || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.infoBox}>
                <Icon name="filter-alt" size={14} color={theme.mutedForeground} />
                <Text style={styles.infoBoxText}>{item?.category?.name || 'UNKNOWN'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxText}>{item?.pcsPerBox || 0} pcs</Text>
              </View>
            </View>
          </View>

          <View style={styles.stockBar}>
            <Text style={styles.stockLabel}>TOTAL STOCK</Text>
            <View style={[styles.stockBadge, { backgroundColor: isOutOfStock ? theme.error : theme.success }]}>
              <Text style={styles.stockBadgeText}>{stockQty} units</Text>
            </View>
          </View>

          <View style={styles.footerInfo}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Created:</Text>
              <Text style={styles.footerValue}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : 'N/A'}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>By:</Text>
              <Text style={styles.footerValue}>{(item as any).createdBy?.name || 'System'}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('ProductForm', { product: item })}
            >
              <Icon name="edit" size={16} color={theme.text} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteProduct(item)}
            >
              <Icon name="delete-outline" size={16} color="#fff" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    )
  }

  const renderProductRow = ({ item }: { item: Product }) => {
    const stockQty = (item as any).totalStock ?? item.stock ?? 0
    const isOutOfStock = stockQty === 0
    return (
      <TouchableOpacity
        style={styles.tableRow}
        onPress={() => navigation.navigate('ProductForm', { product: item })}
        activeOpacity={0.7}
      >
        <View style={styles.colPhoto}>
          {item.imageUrl ? (
            <Image source={{ uri: resolveImageUrl(item.imageUrl)! }} style={styles.rowImage} />
          ) : (
            <View style={styles.rowPlaceholder}>
              <Icon name="image" size={16} color={theme.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.colProduct}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        </View>
        <View style={styles.colStock}>
          <View style={[styles.rowBadge, { backgroundColor: isOutOfStock ? theme.error : theme.primary }]}>
            <Text style={styles.rowBadgeText}>{stockQty} units</Text>
          </View>
        </View>
        <View style={styles.colSize}>
          <Text style={styles.rowText}>{item?.size?.name || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderItem = ({ item }: { item: Product }) => {
    if (viewMode === 'list') return renderProductRow({ item })
    return renderProduct({ item })
  }

  const renderListHeader = () => {
    if (viewMode !== 'list' || products.length === 0) return null
    return (
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colPhoto]}>PHOTO</Text>
        <Text style={[styles.tableHeaderText, styles.colProduct]}>PRODUCT</Text>
        <Text style={[styles.tableHeaderText, styles.colStock]}>STOCK</Text>
        <Text style={[styles.tableHeaderText, styles.colSize]}>SIZE (IN)</Text>
      </View>
    )
  }

  const renderSkeleton = () => {
    if (viewMode === 'list') {
      return (
        <View style={styles.tableRow}>
          <View style={styles.colPhoto}><Skeleton height={40} width={60} borderRadius={6} /></View>
          <View style={styles.colProduct}><Skeleton height={16} width="80%" /></View>
          <View style={styles.colStock}><Skeleton height={24} width={60} borderRadius={12} /></View>
          <View style={styles.colSize}><Skeleton height={16} width={40} /></View>
        </View>
      )
    }
    return (
      <Card style={[commonStyles.glassCard, styles.productCard]}>
        <View style={{ height: 200, width: '100%', backgroundColor: theme.surface }}>
          <Skeleton height="100%" width="100%" />
        </View>
        <View style={styles.cardContent}>
          <Skeleton height={24} width="50%" style={{ marginBottom: 16 }} />
          <Skeleton height={80} width="100%" />
        </View>
      </Card>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchRow: {
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 42,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
    },
    listContainer: {
      padding: spacing.base,
      paddingBottom: 80,
    },
    productCard: {
      marginBottom: spacing.md,
      padding: 0,
      borderRadius: 24,
      overflow: 'hidden',
    },
    gridCard: {
      width: '100%',
    },
    imageContainer: {
      width: '100%',
      height: 220,
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
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    activeBadgeText: {
      color: theme.primaryForeground,
      fontSize: 12,
      fontWeight: 'bold',
    },
    cardContent: {
      padding: 20,
    },
    productName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
    },
    infoGrid: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 12,
    },
    infoCol: {
      flex: 1,
      gap: 12,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.02)',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    infoBoxText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    stockBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    stockLabel: {
      color: theme.mutedForeground,
      fontWeight: '700',
      fontSize: 12,
      letterSpacing: 1,
    },
    stockBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    stockBadgeText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
    },
    footerInfo: {
      marginBottom: 24,
      gap: 8,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    footerLabel: {
      color: theme.mutedForeground,
      fontSize: 12,
    },
    footerValue: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '600',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
    },
    editBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      backgroundColor: 'transparent',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 6,
    },
    editBtnText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 14,
    },
    deleteBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.error,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 6,
    },
    deleteBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
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
    colSize: { flex: 1, alignItems: 'flex-end' },
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
        title="Products"
        primaryActionLabel="Add Product"
        onPrimaryAction={() => navigation.navigate('ProductForm')}
        itemCount={totalItems}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExportData}
        onToggleFilters={handleToggleFilters}
      />
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={theme.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.mutedForeground}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close" size={16} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Filter bar */}
      {showFilters && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all', 'active', 'inactive'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => applyStatusFilter(s)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                    borderWidth: 1,
                    borderColor: statusFilter === s ? theme.primary : theme.border,
                    backgroundColor: statusFilter === s ? theme.primary : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: statusFilter === s ? theme.primaryForeground : theme.text }}>
                    {s === 'all' ? 'All Status' : s === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      
      <FlatList
        data={loading ? Array(viewMode === 'list' ? 6 : 3).fill({}) : products}
        renderItem={loading ? renderSkeleton : renderItem}
        keyExtractor={(item, index) => loading ? `skel-${index}` : item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={
          !loading && products.length > 0 ? (
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

      <ImagePreview
        visible={!!previewImage}
        imageUrl={previewImage?.url || null}
        onClose={() => setPreviewImage(null)}
      />
    </SafeAreaView>
  )
}