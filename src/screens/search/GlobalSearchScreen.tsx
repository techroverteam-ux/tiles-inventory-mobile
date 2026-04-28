import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { LoadingSpinner } from '../../components/loading'
import { globalSearchService, GlobalSearchResult } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface GlobalSearchScreenProps {
  navigation: any
}

export const GlobalSearchScreen: React.FC<GlobalSearchScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchContainer: {
      backgroundColor: theme.surface,
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing.base,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: theme.text,
      paddingVertical: spacing.sm,
    },
    clearButton: {
      padding: spacing.xs,
    },
    contentContainer: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginLeft: spacing.sm,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
    },
    resultIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: withOpacity(theme.primary, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.base,
    },
    resultContent: {
      flex: 1,
    },
    resultLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    resultSubtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
    resultType: {
      fontSize: typography.fontSize.xs,
      color: theme.primary,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'uppercase',
    },
    recentSearchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    recentSearchText: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: theme.text,
      marginLeft: spacing.base,
    },
    removeRecentButton: {
      padding: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.lg,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.base,
    },
    loadingContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
  })

  useEffect(() => {
    if (query.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        performSearch(query.trim())
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true)
      const response = await globalSearchService.search(searchQuery)
      
      if (response.results.length === 0) {
        showToast('No results found', 'warning')
      }
      
      setResults(response.results)
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)]
        return updated.slice(0, 5) // Keep only 5 recent searches
      })
    } catch (error) {
      console.error('Search error:', error)
      showToast('Search failed. Please try again.', 'error')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultPress = (result: GlobalSearchResult) => {
    try {
      const type = result.type?.toLowerCase() || ''
      const id = result.id

      switch (type) {
        case 'product':
          navigation.navigate('Products', {
            screen: 'ProductDetail',
            params: { productId: id }
          })
          break
        case 'brand':
          navigation.navigate('Products', {
            screen: 'BrandDetail',
            params: { brandId: id }
          })
          break
        case 'category':
          navigation.navigate('Products', {
            screen: 'CategoryDetail',
            params: { categoryId: id }
          })
          break
        case 'customer':
          navigation.navigate('Customers', {
            screen: 'CustomerDetail',
            params: { customerId: id }
          })
          break
        case 'order':
        case 'purchaseorder':
          navigation.navigate('PurchaseOrders', {
            screen: 'PurchaseOrderDetail',
            params: { orderId: id, orderType: 'purchase' }
          })
          break
        case 'salesorder':
          navigation.navigate('SalesOrders', {
            screen: 'SalesOrderDetail',
            params: { orderId: id, orderType: 'sales' }
          })
          break
        case 'location':
          showToast('Location details', 'info')
          break
        case 'collection':
          navigation.navigate('CollectionManagement')
          break
        default:
          showToast(`Navigate to ${result.label}`, 'info')
      }
    } catch (error) {
      console.error('Navigation error:', error)
      showToast('Unable to navigate', 'error')
    }
  }

  const handleRecentSearchPress = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const removeRecentSearch = (searchQuery: string) => {
    setRecentSearches(prev => prev.filter(s => s !== searchQuery))
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    Keyboard.dismiss()
  }

  const getResultIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'product': return 'inventory'
      case 'brand': return 'business'
      case 'category': return 'category'
      case 'collection': return 'collections'
      case 'customer': return 'person'
      case 'order': return 'receipt'
      case 'purchaseorder': return 'shopping-cart'
      case 'salesorder': return 'local-shipping'
      case 'location': return 'place'
      default: return 'search'
    }
  }

  const renderResult = ({ item }: { item: GlobalSearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultIcon}>
        <Icon
          name={getResultIcon(item.type)}
          size={20}
          color={theme.primary}
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultType}>{item.type}</Text>
        <Text style={styles.resultLabel}>{item.label}</Text>
        {item.subtitle && (
          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <Icon name="chevron-right" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  )

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item)}
    >
      <Icon name="history" size={20} color={theme.textSecondary} />
      <Text style={styles.recentSearchText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeRecentButton}
        onPress={() => removeRecentSearch(item)}
      >
        <Icon name="close" size={16} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader />
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={20}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, orders..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => query.trim() && performSearch(query.trim())}
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
            >
              <Icon name="clear" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" />
            <Text style={styles.emptyText}>Searching...</Text>
          </View>
        ) : query.trim().length === 0 ? (
          // Show recent searches when no query
          recentSearches.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Icon name="history" size={20} color={theme.textSecondary} />
                <Text style={styles.sectionTitle}>Recent Searches</Text>
              </View>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item, index) => `recent-${index}`}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="search" size={64} color={theme.textSecondary} />
              <Text style={styles.emptyText}>
                Search for products, brands, orders,{'\n'}and more across your inventory.
              </Text>
            </View>
          )
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              No results found for "{query}".{'\n'}Try a different search term.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Icon name="search" size={20} color={theme.textSecondary} />
              <Text style={styles.sectionTitle}>
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </Text>
            </View>
            <FlatList
              data={results}
              renderItem={renderResult}
              keyExtractor={(item, index) => `result-${index}`}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
