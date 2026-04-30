import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { categoryService } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'

interface CategoryDetailScreenProps {
  route: any
  navigation: any
}

interface CategoryDetailItem {
  id: string
  name: string
  description?: string
  image?: string
  createdAt?: string
}

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme()
  const { showToast, showError } = useToast()
  const { categoryId } = route.params || {}
  
  const [category, setCategory] = useState<CategoryDetailItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCategoryDetails()
  }, [categoryId])

  const loadCategoryDetails = async () => {
    if (!categoryId) {
      showError('Error', 'Category ID is missing')
      navigation.goBack()
      return
    }

    try {
      const response = await categoryService.getCategory(categoryId)
      setCategory(response)
    } catch (error) {
      console.error('Failed to load category details:', error)
      showToast('Failed to load category details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCategoryDetails()
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
      minHeight: 200,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    image: {
      width: '100%',
      height: 200,
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
    descriptionText: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Category Details" onBack={() => navigation.goBack()} />
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Category Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text }}>Category not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={category.name} onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Category Image */}
        {category.image ? (
          <Image
            source={{ uri: category.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={40} color={theme.primary} />
            </View>
          </View>
        )}

        {/* Category Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{category.name}</Text>
        </View>

        {/* Category Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Information</Text>
          <Card>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <View style={{ backgroundColor: theme.success + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm }}>
                <Text style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: theme.success }}>Active</Text>
              </View>
            </View>
            {category.description && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value} numberOfLines={2}>{category.description}</Text>
              </View>
            )}
            {!category.description && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>-</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Description Section */}
        {category.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Full Description</Text>
            <Card>
              <Text style={styles.descriptionText}>{category.description}</Text>
            </Card>
          </View>
        )}

        {/* Additional Information */}
        {category.createdAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Card>
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Created Date</Text>
                <Text style={styles.value}>
                  {new Date(category.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
