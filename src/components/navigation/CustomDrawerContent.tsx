import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { withOpacity } from '../../utils/colorUtils'

interface NavItem {
  name: string
  label: string
  icon: string
  screen: string
  params?: any
}

const navItems: NavItem[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-view', screen: 'Tabs', params: { screen: 'DashboardTab' } },
  { name: 'Brands', label: 'Brands', icon: 'people-outline', screen: 'BrandManagement' },
  { name: 'Categories', label: 'Categories', icon: 'palette', screen: 'CategoryManagement' },
  { name: 'Sizes', label: 'Sizes', icon: 'straighten', screen: 'SizeManagement' },
  { name: 'Products', label: 'Products', icon: 'inventory-2', screen: 'Tabs', params: { screen: 'ProductsTab' } },
  { name: 'PurchaseOrders', label: 'Purchase Orders', icon: 'shopping-cart', screen: 'Tabs', params: { screen: 'PurchaseTab' } },
  { name: 'SalesOrders', label: 'Sales Orders', icon: 'trending-up', screen: 'Tabs', params: { screen: 'SalesTab' } },
  { name: 'Inventory', label: 'Inventory', icon: 'layers', screen: 'Tabs', params: { screen: 'InventoryTab' } },
  { name: 'Locations', label: 'Locations', icon: 'location-on', screen: 'LocationManagement' },
  { name: 'Customers', label: 'Customers', icon: 'people', screen: 'Customers' },
  { name: 'Reports', label: 'Reports', icon: 'description', screen: 'Reports' },
  { name: 'Settings', label: 'Settings', icon: 'settings', screen: 'Settings' },
]

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { theme } = useTheme()
  const { user, logout } = useSession()
  const insets = useSafeAreaInsets()

  const currentRoute = props.state.routeNames[props.state.index]

  const isItemActive = (item: NavItem): boolean => {
    // For Tabs-based items, must check nested tab state — never match on screen name alone
    if (item.screen === 'Tabs') {
      if (currentRoute !== 'Tabs') return false
      const tabState = props.state.routes.find(r => r.name === 'Tabs')?.state
      if (tabState) {
        const activeTab = tabState.routeNames?.[tabState.index ?? 0]
        return activeTab === item.params?.screen
      }
      // No nested state yet — only Dashboard is default
      return item.params?.screen === 'DashboardTab'
    }
    // Direct drawer screen match
    return currentRoute === item.screen
  }

  const handleNav = (item: NavItem) => {
    if (item.params) {
      props.navigation.navigate(item.screen, item.params)
    } else {
      props.navigation.navigate(item.screen)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      props.navigation.reset({ index: 0, routes: [{ name: 'Auth' }] })
    } catch {}
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingHorizontal: 16,
      paddingTop: insets.top + 12,
      paddingBottom: 14,
      borderBottomWidth: 1, borderBottomColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: { width: 130, height: 48, resizeMode: 'contain', alignSelf: 'center' },
    navItem: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      paddingLeft: 20, paddingRight: 16, paddingVertical: 13,
      marginVertical: 1,
      position: 'relative',
    },
    navItemActive: {
      backgroundColor: withOpacity(theme.primary, 0.12),
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: theme.primary,
    },
    navLabel: { fontSize: 14, fontWeight: '600' },
    footer: {
      padding: 16, borderTopWidth: 1, borderTopColor: theme.border,
    },
    logoutRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 16, paddingVertical: 12,
      borderRadius: 10,
    },
    logoutText: { fontSize: 15, fontWeight: '500', color: theme.error },
  })

  return (
    <View style={[s.container, { borderRightWidth: 1, borderRightColor: theme.border }]}>
      {/* Logo header */}
      <View style={s.header}>
        <Image
          source={require('../../assets/images/hot-logo-cropped.png')}
          style={s.logo}
          onError={() => {}}
        />
      </View>

      {/* Nav items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {navItems.map(item => {
          const isActive = isItemActive(item)
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleNav(item)}
              activeOpacity={0.7}
            >
              <View style={[s.navItem, isActive && s.navItemActive]}>
                {isActive && <View style={s.activeIndicator} />}
                <Icon
                  name={item.icon}
                  size={20}
                  color={isActive ? theme.primary : theme.mutedForeground}
                />
                <Text style={[s.navLabel, { color: isActive ? theme.primary : theme.text }]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </DrawerContentScrollView>

      {/* Logout */}
      <View style={s.footer}>
        <TouchableOpacity style={s.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name="logout" size={22} color={theme.error} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
