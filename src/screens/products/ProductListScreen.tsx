import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { Skeleton } from '../../components/loading/Skeleton'
import { productService, Product } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'

interface ProductListScreenProps {
  navigation: any
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showError, showSuccess, showWarning } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery])

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts()
      setProducts(response.products)
      showSuccess('Products Loaded', `Found ${response.products.length} products`)
    } catch (error) {
      showError('Error', 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filtered)
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

  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.productCode, { color: theme.textSecondary }]}>
            Code: {item.code}
          </Text>
          <Text style={[styles.productDetails, { color: theme.textSecondary }]}>
            {item.brand.name} • {item.category.name}
            {item.size && ` • ${item.size.name}`}
          </Text>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => navigation.navigate('ProductForm', { product: item })}
          >
            <Icon name="edit" size={16} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
            onPress={() => handleDeleteProduct(item)}
          >
            <Icon name="delete" size={16} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.productFooter}>
        <Text style={[styles.productMeta, { color: theme.textSecondary }]}>
          {item.sqftPerBox} sq ft/box • {item.pcsPerBox} pcs/box
        </Text>
        <Text style={[styles.productMeta, { color: theme.textSecondary }]}>
          {item.finishType.name}
        </Text>
      </View>
    </Card>
  )

  const renderSkeleton = () => (
    <Card style={styles.productCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={16} width="40%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={14} width="80%" />
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
    searchContainer: {
      marginBottom: spacing.base,
    },
    productCard: {
      marginBottom: spacing.base,
    },
    productHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    productInfo: {
      flex: 1,
      marginRight: spacing.base,
    },
    productName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing.xs,
    },
    productCode: {
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    productDetails: {
      fontSize: typography.fontSize.sm,
    },
    productActions: {
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
    productFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: spacing.sm,
      gap: spacing.xs,
    },
    productMeta: {
      fontSize: typography.fontSize.xs,
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
        title="Products"
        showBack
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('ProductForm')}>
            <Icon name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
          />
        </View>

        <FlatList
          data={loading ? Array(5).fill({}) : filteredProducts}
          renderItem={loading ? renderSkeleton : renderProduct}
          keyExtractor={(item, index) => loading ? index.toString() : item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="inventory" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No products found' : 'No products available'}
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm')}
      >
        <Icon name="add" size={24} color={theme.textInverse} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}