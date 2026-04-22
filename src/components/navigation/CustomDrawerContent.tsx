import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'

interface NavigationItem {
  name: string
  label: string
  icon: string
  badge?: number
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    name: 'GlobalSearch',
    label: 'Global Search',
    icon: 'search',
  },
  {
    name: 'Products',
    label: 'Products',
    icon: 'inventory',
    children: [
      { name: 'ProductList', label: 'All Products', icon: 'list' },
      { name: 'ProductForm', label: 'Add Product', icon: 'add' },
    ],
  },
  {
    name: 'Inventory',
    label: 'Inventory',
    icon: 'warehouse',
  },
  {
    name: 'Orders',
    label: 'Orders',
    icon: 'receipt',
    children: [
      { name: 'PurchaseOrders', label: 'Purchase Orders', icon: 'shopping-cart' },
      { name: 'SalesOrders', label: 'Sales Orders', icon: 'point-of-sale' },
    ],
  },
  {
    name: 'Management',
    label: 'Management',
    icon: 'settings',
    children: [
      { name: 'BrandManagement', label: 'Brands', icon: 'business' },
      { name: 'CategoryManagement', label: 'Categories', icon: 'category' },
      { name: 'CollectionManagement', label: 'Collections', icon: 'collections' },
      { name: 'SizeManagement', label: 'Sizes', icon: 'straighten' },
      { name: 'LocationManagement', label: 'Locations', icon: 'location-on' },
    ],
  },
  {
    name: 'Customers',
    label: 'Customers',
    icon: 'people',
  },
  {
    name: 'Reports',
    label: 'Reports',
    icon: 'analytics',
  },
  {
    name: 'Notifications',
    label: 'Notifications',
    icon: 'notifications',
    badge: 3, // This would come from context
  },
  {
    name: 'AdminPanel',
    label: 'Admin Panel',
    icon: 'admin-panel-settings',
  },
  {
    name: 'Settings',
    label: 'Settings',
    icon: 'settings',
  },
]

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { theme } = useTheme()
  const { user, logout } = useSession()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const handleNavigation = (screenName: string) => {
    props.navigation.navigate(screenName)
  }

  const handleLogout = async () => {
    try {
      await logout()
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const currentRoute = props.state.routeNames[props.state.index]
    const isActive = currentRoute === item.name

    return (
      <View key={item.name}>
        <TouchableOpacity
          style={[
            styles.navItem,
            {
              backgroundColor: isActive ? theme.primary : 'transparent',
              marginLeft: level * 16,
              borderRadius: 8,
              marginHorizontal: 8,
              marginVertical: 2,
            }
          ]}
          onPress={() => {
            if (hasChildren) {
              toggleExpanded(item.name)
            } else {
              handleNavigation(item.name)
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.navItemContent}>
            <Icon
              name={item.icon}
              size={22}
              color={isActive ? theme.primaryForeground : theme.text}
              style={styles.navIcon}
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color: isActive ? theme.primaryForeground : theme.text,
                  flex: 1,
                }
              ]}
            >
              {item.label}
            </Text>
            
            {item.badge && item.badge > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.error }]}>
                <Text style={[styles.badgeText, { color: theme.destructiveForeground }]}>
                  {item.badge > 99 ? '99+' : item.badge}
                </Text>
              </View>
            )}
            
            {hasChildren && (
              <Icon
                name={isExpanded ? 'expand-less' : 'expand-more'}
                size={20}
                color={isActive ? theme.primaryForeground : theme.mutedForeground}
              />
            )}
          </View>
        </TouchableOpacity>

        {hasChildren && isExpanded && (
          <View style={styles.subItems}>
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Text style={[styles.logoText, { color: theme.primaryForeground }]}>HT</Text>
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={[styles.companyName, { color: theme.text }]}>
              House of Tiles
            </Text>
            <Text style={[styles.tagline, { color: theme.mutedForeground }]}>
              Inventory Management
            </Text>
          </View>
        </View>
        
        {user && (
          <View style={styles.userInfo}>
            <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
              <Text style={[styles.userInitial, { color: theme.primaryForeground }]}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                {user.name || 'User'}
              </Text>
              <Text style={[styles.userRole, { color: theme.mutedForeground }]} numberOfLines={1}>
                {user.role || 'Staff'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Navigation Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navigation}>
          {navigationItems.map(item => renderNavigationItem(item))}
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.destructive }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={20} color={theme.destructiveForeground} />
          <Text style={[styles.logoutText, { color: theme.destructiveForeground }]}>
            Logout
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
          © 2026 Tech Rover
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 12,
    marginTop: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  navigation: {
    paddingVertical: 8,
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIcon: {
    marginRight: 12,
    width: 22,
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  subItems: {
    marginLeft: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
})