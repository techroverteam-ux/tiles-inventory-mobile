import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
  Animated,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { withOpacity } from '../../utils/colorUtils'

interface SearchResult {
  type: string
  label: string
  subtitle?: string
  onPress: () => void
}

interface MobileHeaderProps {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  showThemeToggle?: boolean
  onSearchResults?: (query: string) => Promise<SearchResult[]>
  notificationCount?: number
  onNotificationPress?: () => void
}

const quickShortcuts = [
  { label: 'Products', screen: 'Products' },
  { label: 'Inventory', screen: 'Inventory' },
  { label: 'Purchase Orders', screen: 'PurchaseOrders' },
  { label: 'Sales Orders', screen: 'SalesOrders' },
]

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  showSearch = true,
  showNotifications = true,
  showThemeToggle = true,
  onSearchResults,
  notificationCount = 0,
  onNotificationPress,
}) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user, logout } = useSession()
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()

  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [userMenuVisible, setUserMenuVisible] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim() || !onSearchResults) { setSearchResults([]); return }
    setSearchLoading(true)
    try {
      const results = await onSearchResults(query.trim())
      setSearchResults(results)
    } catch { setSearchResults([]) }
    finally { setSearchLoading(false) }
  }

  const closeSearch = () => {
    setSearchVisible(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleLogout = async () => {
    setUserMenuVisible(false)
    await logout()
  }

  const s = StyleSheet.create({
    header: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingTop: insets.top,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 56,
      gap: 8,
    },
    menuBtn: { padding: 6, borderRadius: 8 },
    logo: { width: 80, height: 36, resizeMode: 'contain', borderRadius: 8 },
    spacer: { flex: 1 },
    rightRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    iconBtn: { padding: 8, borderRadius: 20, position: 'relative' },
    badge: {
      position: 'absolute', top: 4, right: 4,
      minWidth: 18, height: 18, borderRadius: 9,
      backgroundColor: theme.error,
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 1.5, borderColor: theme.surface,
    },
    badgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
    avatar: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 13, fontWeight: '700', color: theme.primaryForeground },
    chevron: { marginLeft: 2 },

    // User dropdown
    userMenuOverlay: { flex: 1 },
    userMenuCard: {
      position: 'absolute', top: 0, right: 12,
      width: 220, borderRadius: 12, borderWidth: 1,
      borderColor: theme.border, backgroundColor: theme.card,
      elevation: 8, shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 8,
      overflow: 'hidden',
    },
    userMenuHeader: {
      padding: 14, borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    userMenuName: { fontSize: 14, fontWeight: '700', color: theme.text },
    userMenuEmail: { fontSize: 12, color: theme.mutedForeground, marginTop: 2 },
    userMenuItem: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    userMenuItemText: { fontSize: 14, color: theme.text },
    userMenuDivider: { height: 1, backgroundColor: theme.border, marginHorizontal: 14 },
    userMenuLogout: { color: theme.error },

    // Search modal
    searchModal: { flex: 1, backgroundColor: theme.background },
    searchHeader: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1, borderBottomColor: theme.border,
      paddingTop: insets.top, paddingHorizontal: 12, paddingBottom: 10,
    },
    searchInputRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.muted, borderRadius: 10,
      paddingHorizontal: 10, height: 42,
    },
    searchInput: { flex: 1, fontSize: 15, color: theme.text, paddingVertical: 0 },
    searchMeta: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginTop: 8,
    },
    searchMetaText: { fontSize: 12, color: theme.mutedForeground },
    doneBtn: { fontSize: 14, fontWeight: '700', color: theme.text },
    searchBody: { flex: 1, padding: 14 },
    searchHint: { fontSize: 13, color: theme.mutedForeground, marginBottom: 14 },
    shortcutsCard: {
      borderRadius: 10, borderWidth: 1, borderColor: theme.border,
      backgroundColor: theme.card, padding: 12,
    },
    shortcutsLabel: {
      fontSize: 10, fontWeight: '700', letterSpacing: 0.8,
      color: theme.mutedForeground, marginBottom: 10,
    },
    shortcutsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    shortcutBtn: {
      paddingHorizontal: 12, paddingVertical: 8,
      borderRadius: 6, borderWidth: 1, borderColor: theme.border,
      backgroundColor: theme.card,
    },
    shortcutText: { fontSize: 13, color: theme.text },
    resultItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    resultContent: { flex: 1 },
    resultLabel: { fontSize: 15, fontWeight: '500', color: theme.text },
    resultSub: { fontSize: 12, color: theme.mutedForeground, marginTop: 2 },
    resultType: {
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
      backgroundColor: theme.muted,
    },
    resultTypeText: { fontSize: 11, color: theme.mutedForeground, fontWeight: '500' },
  })

  const headerTop = insets.top + 56 + 10

  return (
    <>
      <View style={s.header}>
        <View style={s.headerContent}>
          {/* Hamburger */}
          <TouchableOpacity style={s.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7}>
            <Icon name="menu" size={24} color={theme.text} />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require('../../assets/images/hot-logo-cropped.png')}
            style={s.logo}
            onError={() => {}}
          />

          <View style={s.spacer} />

          {/* Right icons */}
          <View style={s.rightRow}>
            {showSearch && (
              <TouchableOpacity style={s.iconBtn} onPress={() => setSearchVisible(true)} activeOpacity={0.7}>
                <Icon name="search" size={22} color={theme.text} />
              </TouchableOpacity>
            )}
            {showThemeToggle && (
              <TouchableOpacity style={s.iconBtn} onPress={toggleTheme} activeOpacity={0.7}>
                <Icon name={isDark ? 'wb-sunny' : 'nightlight-round'} size={22} color={theme.text} />
              </TouchableOpacity>
            )}
            {showNotifications && (
              <TouchableOpacity style={s.iconBtn} onPress={onNotificationPress} activeOpacity={0.7}>
                <Icon name="notifications" size={22} color={theme.text} />
                {notificationCount > 0 && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {/* User avatar + dropdown */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}
              onPress={() => setUserMenuVisible(true)}
              activeOpacity={0.7}
            >
              <View style={s.avatar}>
                <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
              </View>
              <Icon name="keyboard-arrow-down" size={18} color={theme.mutedForeground} style={s.chevron} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* User Dropdown Modal */}
      <Modal visible={userMenuVisible} transparent animationType="fade" onRequestClose={() => setUserMenuVisible(false)}>
        <Pressable style={s.userMenuOverlay} onPress={() => setUserMenuVisible(false)}>
          <View style={[s.userMenuCard, { top: headerTop }]}>
            <View style={s.userMenuHeader}>
              <Text style={s.userMenuName}>{user?.name || 'Admin User'}</Text>
              <Text style={s.userMenuEmail}>{user?.email || ''}</Text>
            </View>
            <TouchableOpacity style={s.userMenuItem} onPress={() => { setUserMenuVisible(false); toggleTheme() }} activeOpacity={0.7}>
              <Icon name={isDark ? 'wb-sunny' : 'nightlight-round'} size={18} color={theme.text} />
              <Text style={s.userMenuItemText}>System Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.userMenuItem} onPress={() => { setUserMenuVisible(false); navigation.navigate('Settings') }} activeOpacity={0.7}>
              <Icon name="settings" size={18} color={theme.text} />
              <Text style={s.userMenuItemText}>Settings</Text>
            </TouchableOpacity>
            <View style={s.userMenuDivider} />
            <TouchableOpacity style={s.userMenuItem} onPress={handleLogout} activeOpacity={0.7}>
              <Icon name="logout" size={18} color={theme.error} />
              <Text style={[s.userMenuItemText, s.userMenuLogout]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Search Modal */}
      <Modal visible={searchVisible} animationType="slide" onRequestClose={closeSearch}>
        <View style={s.searchModal}>
          <View style={s.searchHeader}>
            <View style={s.searchInputRow}>
              <Icon name="search" size={18} color={theme.mutedForeground} style={{ marginRight: 8 }} />
              <TextInput
                style={s.searchInput}
                placeholder="Search brands, categories, sizes, products, orders..."
                placeholderTextColor={theme.mutedForeground}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]) }} activeOpacity={0.7}>
                  <Icon name="close" size={18} color={theme.text} />
                </TouchableOpacity>
              )}
            </View>
            <View style={s.searchMeta}>
              <Text style={s.searchMetaText}>Global search</Text>
              <TouchableOpacity onPress={closeSearch} activeOpacity={0.7}>
                <Text style={s.doneBtn}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.searchBody}>
            {searchLoading ? (
              <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
            ) : searchQuery.trim().length >= 2 ? (
              searchResults.length === 0 ? (
                <Text style={s.searchHint}>No results found.</Text>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(_, i) => `${i}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={s.resultItem} onPress={() => { item.onPress(); closeSearch() }} activeOpacity={0.7}>
                      <View style={s.resultContent}>
                        <Text style={s.resultLabel}>{item.label}</Text>
                        {item.subtitle && <Text style={s.resultSub}>{item.subtitle}</Text>}
                      </View>
                      <View style={s.resultType}>
                        <Text style={s.resultTypeText}>{item.type}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )
            ) : (
              <>
                <Text style={s.searchHint}>Try searching for products, brands, categories, sizes or orders.</Text>
                <View style={s.shortcutsCard}>
                  <Text style={s.shortcutsLabel}>QUICK SHORTCUTS</Text>
                  <View style={s.shortcutsGrid}>
                    {quickShortcuts.map(item => (
                      <TouchableOpacity
                        key={item.screen}
                        style={s.shortcutBtn}
                        onPress={() => { closeSearch(); navigation.navigate(item.screen) }}
                        activeOpacity={0.7}
                      >
                        <Text style={s.shortcutText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}
