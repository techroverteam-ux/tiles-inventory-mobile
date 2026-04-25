import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingSpinner } from '../../components/loading'
import { spacing, typography, borderRadius } from '../../theme'

interface ProductDetailScreenProps {
  route: any
  navigation: any
}

interface Product {
  id: string
  code: string
  name: string
  category?: string
  brand?: string
  size?: string
  price?: number
  costPrice?: number
  quantity?: number
  description?: string
  imageUrl?: string
  createdAt?: string
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const { productId } = route.params || {}
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadProductDetails()
  }, [productId])

  const loadProductDetails = async () => {
    if (!productId) {
      Alert.alert('Error', 'Product ID is missing')
      navigation.goBack()
      return
    }

    try {
      // For now, we'll fetch from a mock or API
      // In a real implementation, you'd call productService.getProduct(productId)
      setProduct({
        id: productId,
        code: 'PROD-001',
        name: 'Sample Product',
        category: 'Category Name',
        brand: 'Brand Name',
        size: 'Standard',
        price: 999,
        costPrice: 500,
        quantity: 100,
        description: 'This is a sample product description.',
        imageUrl: undefined,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to load product details:', error)
      showToast('Failed to load product details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProductDetails()
    setRefreshing(false)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: spacing.base,
    },
    imageContainer: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      marginBottom: spacing.lg,
      minHeight: 250,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    productImage: {
      width: '100%',
      height: 250,
      borderRadius: borderRadius.base,
    },
    imagePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.base,
      marginTop: spacing.base,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginBottom: spacing.base,
      borderWidth: 1,
      borderColor: theme.border,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      flex: 1,
    },
    value: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    priceSection: {
      backgroundColor: theme.primary + '10',
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginBottom: spacing.base,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    priceLast: {
      marginBottom: 0,
    },
    priceLabel: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
    },
    priceValue: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.primary,
    },
    quantityBadge: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
    },
    quantityLow: {
      backgroundColor: theme.warning + '20',
    },
    quantityOk: {
      backgroundColor: theme.success + '20',
    },
    quantityText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase',
    },
    quantityTextLow: {
      color: theme.warning,
    },
    quantityTextOk: {
      color: theme.success,
    },
    descriptionText: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Product Details" onBack={() => navigation.goBack()} />
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Product Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text }}>Product not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const quantityLevel = product.quantity ? (product.quantity > 50 ? 'ok' : 'low') : 'low'

  return (
    <SafeAreaView style={styles.container}>
      <Header title={product.name} onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Product Image */}
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={40} color={theme.primary} />
            </View>
          </View>
        )}

        {/* Product Code and Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{product.name}</Text>
          <Text style={{ fontSize: typography.fontSize.base, color: theme.textSecondary }}>
            Code: {product.code}
          </Text>
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          <Card>
            {product.category && (
              <View style={styles.row}>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.value}>{product.category}</Text>
              </View>
            )}
            {product.brand && (
              <View style={styles.row}>
                <Text style={styles.label}>Brand</Text>
                <Text style={styles.value}>{product.brand}</Text>
              </View>
            )}
            {product.size && (
              <View style={[styles.row, !product.quantity && styles.lastRow]}>
                <Text style={styles.label}>Size</Text>
                <Text style={styles.value}>{product.size}</Text>
              </View>
            )}
            {product.quantity !== undefined && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Current Stock</Text>
                <View
                  style={[
                    styles.quantityBadge,
                    quantityLevel === 'low' ? styles.quantityLow : styles.quantityOk,
                  ]}
                >
                  <Text
                    style={[
                      styles.quantityText,
                      quantityLevel === 'low' ? styles.quantityTextLow : styles.quantityTextOk,
                    ]}
                  >
                    {product.quantity} units
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Pricing Information */}
        {(product.costPrice || product.price) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.priceSection}>
              {product.costPrice && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Cost Price</Text>
                  <Text style={styles.priceValue}>₹{product.costPrice.toFixed(2)}</Text>
                </View>
              )}
              {product.price && (
                <View style={[styles.priceRow, product.costPrice ? {} : styles.priceLast]}>
                  <Text style={styles.priceLabel}>Selling Price</Text>
                  <Text style={styles.priceValue}>₹{product.price.toFixed(2)}</Text>
                </View>
              )}
              {product.costPrice && product.price && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Margin</Text>
                  <Text style={styles.priceValue}>
                    ₹{(product.price - product.costPrice).toFixed(2)} ({(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%)
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description */}
        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Card>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </Card>
          </View>
        )}

        {/* Created Information */}
        {product.createdAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Card>
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Created Date</Text>
                <Text style={styles.value}>
                  {new Date(product.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
