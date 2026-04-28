import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { getCommonStyles } from '../../theme/commonStyles'
import { apiClient } from '../../services/api/ApiClient'
import { Product } from '../../services/api/ApiServices'

const { width } = Dimensions.get('window')

export const WebsiteHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    // Fetch a few products for the featured section
    const fetchFeatured = async () => {
      try {
        const res = await apiClient.get('/products?limit=4')
        if (res.data?.products) {
          setFeaturedProducts(res.data.products)
        }
      } catch (e) {
        console.warn('Failed to load featured products', e)
      }
    }
    fetchFeatured()
  }, [])

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    logoText: { fontSize: 20, fontWeight: '900', color: theme.primary },
    headerActions: { flexDirection: 'row', gap: 12 },
    iconButton: { padding: 8, backgroundColor: theme.surface, borderRadius: 20 },
    heroSection: {
      padding: 24,
      alignItems: 'center',
      marginTop: 20,
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: '900',
      textAlign: 'center',
      color: theme.text,
      marginBottom: 12,
      lineHeight: 40,
    },
    heroSubtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.mutedForeground,
      marginBottom: 24,
    },
    heroButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 24,
    },
    heroButtonText: {
      color: theme.primaryForeground,
      fontWeight: '800',
      fontSize: 16,
    },
    section: { paddingHorizontal: 16, paddingVertical: 24 },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 16 },
    productGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    productCard: {
      width: (width - 48) / 2,
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    productImage: { width: '100%', height: 120, backgroundColor: theme.muted },
    productInfo: { padding: 12 },
    productName: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 4 },
    productBrand: { fontSize: 12, color: theme.mutedForeground },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={[commonStyles.glass, styles.header, { borderWidth: 0, borderBottomWidth: 1 }]}>
        <Text style={styles.logoText}>House of Tiles</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('WebsiteCart')}>
            <Icon name="shopping-cart" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Auth')}>
            <Icon name="admin-panel-settings" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Transform Your Space With Premium Tiles</Text>
          <Text style={styles.heroSubtitle}>Discover our curated collection of high-quality tiles for every room in your home.</Text>
          <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('WebsiteProducts')}>
            <Text style={styles.heroButtonText}>Explore Collection</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.productGrid}>
            {featuredProducts.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[commonStyles.glassCard, styles.productCard]}
                onPress={() => navigation.navigate('WebsiteProductDetail', { productId: item.id })}
                activeOpacity={0.8}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Icon name="image" size={32} color={theme.textSecondary} />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productBrand} numberOfLines={1}>{item.brand?.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
