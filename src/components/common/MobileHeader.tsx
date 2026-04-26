import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useNavigation, DrawerActions } from '@react-navigation/native'

interface SearchResult {
  type: string
  label: string
  subtitle?: string
  onPress: () => void
}

interface MobileHeaderProps {
  title: string
  showSearch?: boolean
  showNotifications?: boolean
  showThemeToggle?: boolean
  onSearchResults?: (query: string) => Promise<SearchResult[]>
  notificationCount?: number
  onNotificationPress?: () => void
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showSearch = true,
  showNotifications = true,
  showThemeToggle = true,
  onSearchResults,
  notificationCount = 0,
  onNotificationPress,
}) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim() || !onSearchResults) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const results = await onSearchResults(query.trim())
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer())
  }

  const closeSearch = () => {
    setSearchVisible(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
      onPress={() => {
        item.onPress()
        closeSearch()
      }}
      activeOpacity={0.7}
    >
      <View style={styles.searchResultContent}>
        <Text style={[styles.searchResultLabel, { color: theme.text }]}>
          {item.label}
        </Text>
        {item.subtitle && (
          <Text style={[styles.searchResultSubtitle, { color: theme.mutedForeground }]}>
            {item.subtitle}
          </Text>
        )}
      </View>
      <View style={[styles.searchResultType, { backgroundColor: theme.muted }]}>
        <Text style={[styles.searchResultTypeText, { color: theme.mutedForeground }]}>
          {item.type}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <>
      <StatusBar
        backgroundColor={theme.surface}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            paddingTop: insets.top,
          }
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={openDrawer}
              activeOpacity={0.7}
            >
              <Icon name="menu" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {showSearch && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setSearchVisible(true)}
                activeOpacity={0.7}
              >
                <Icon name="search" size={22} color={theme.text} />
              </TouchableOpacity>
            )}

            {showThemeToggle && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleTheme}
                activeOpacity={0.7}
              >
                <Icon 
                  name={isDark ? 'wb-sunny' : 'nightlight-round'} 
                  size={22} 
                  color={theme.text} 
                />
              </TouchableOpacity>
            )}

            {showNotifications && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onNotificationPress}
                activeOpacity={0.7}
              >
                <Icon name="notifications" size={22} color={theme.text} />
                {notificationCount > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: theme.error }]}>
                    <Text style={[styles.notificationBadgeText, { color: theme.destructiveForeground }]}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        animationType="slide"
        onRequestClose={closeSearch}
      >
        <View style={[styles.searchModal, { backgroundColor: theme.background }]}>
          <StatusBar
            backgroundColor={theme.background}
            barStyle={isDark ? 'light-content' : 'dark-content'}
          />
          
          <View
            style={[
              styles.searchHeader,
              {
                backgroundColor: theme.surface,
                borderBottomColor: theme.border,
                paddingTop: insets.top,
              }
            ]}
          >
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color={theme.mutedForeground} style={styles.searchIcon} />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.muted,
                  }
                ]}
                placeholder="Search products, brands, orders..."
                placeholderTextColor={theme.mutedForeground}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchCloseButton}
                onPress={closeSearch}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContent}>
            {searchLoading ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.searchLoadingText, { color: theme.mutedForeground }]}>
                  Searching...
                </Text>
              </View>
            ) : searchQuery.trim() === '' ? (
              <View style={styles.searchEmpty}>
                <Icon name="search" size={48} color={theme.mutedForeground} />
                <Text style={[styles.searchEmptyText, { color: theme.mutedForeground }]}>
                  Start typing to search
                </Text>
                <Text style={[styles.searchEmptySubtext, { color: theme.mutedForeground }]}>
                  Search for products, brands, categories, orders, and more
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.searchEmpty}>
                <Icon name="search-off" size={48} color={theme.mutedForeground} />
                <Text style={[styles.searchEmptyText, { color: theme.mutedForeground }]}>
                  No results found
                </Text>
                <Text style={[styles.searchEmptySubtext, { color: theme.mutedForeground }]}>
                  Try different keywords or check spelling
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item, index) => `${item.type}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.searchResultsList}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchModal: {
    flex: 1,
  },
  searchHeader: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  searchCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchContent: {
    flex: 1,
  },
  searchLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  searchEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  searchEmptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  searchEmptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchResultsList: {
    paddingVertical: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchResultType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchResultTypeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
})