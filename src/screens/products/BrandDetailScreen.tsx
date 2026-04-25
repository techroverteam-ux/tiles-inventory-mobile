import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingSpinner } from '../../components/loading'
import { brandService, Brand } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'

interface BrandDetailScreenProps {
  route: any
  navigation: any
}

export const BrandDetailScreen: React.FC<BrandDetailScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const { brandId } = route.params || {}
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadBrandDetails()
  }, [brandId])

  const loadBrandDetails = async () => {
    if (!brandId) {
      Alert.alert('Error', 'Brand ID is missing')
      navigation.goBack()
      return
    }

    try {
      const response = await brandService.getBrand(brandId)
      setBrand(response)
    } catch (error) {
      console.error('Failed to load brand details:', error)
      showToast('Failed to load brand details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadBrandDetails()
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
    logoContainer: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      marginBottom: spacing.lg,
      minHeight: 200,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    logo: {
      width: '100%',
      height: 200,
      borderRadius: borderRadius.base,
    },
    logoPlaceholder: {
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
    descriptionText: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Brand Details" onBack={() => navigation.goBack()} />
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  if (!brand) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Brand Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text }}>Brand not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={brand.name} onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Brand Logo */}
        {brand.logo ? (
          <Image
            source={{ uri: brand.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Icon name="image" size={40} color={theme.primary} />
            </View>
          </View>
        )}

        {/* Brand Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{brand.name}</Text>
        </View>

        {/* Brand Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Information</Text>
          <Card>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <View style={{ backgroundColor: theme.success + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm }}>
                <Text style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: theme.success }}>Active</Text>
              </View>
            </View>
            {brand.description && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value} numberOfLines={2}>{brand.description}</Text>
              </View>
            )}
            {!brand.description && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>-</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Additional Information */}
        {brand.createdAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Card>
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Created Date</Text>
                <Text style={styles.value}>
                  {new Date(brand.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
