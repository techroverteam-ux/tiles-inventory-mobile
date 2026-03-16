import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native'
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { spacing, typography, borderRadius } from '../../theme'

interface MenuItem {
  id: string
  title: string
  icon: string
  route: string
  badge?: number
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'dashboard',
    route: 'Dashboard',
  },
  {
    id: 'brands',
    title: 'Brands',
    icon: 'business',
    route: 'BrandManagement',
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: 'category',
    route: 'CategoryManagement',
  },
  {
    id: 'sizes',
    title: 'Sizes',
    icon: 'straighten',
    route: 'SizeManagement',
  },
  {
    id: 'products',
    title: 'Products',
    icon: 'inventory',
    route: 'Products',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: 'storage',
    route: 'Inventory',
  },
  {
    id: 'locations',
    title: 'Locations',
    icon: 'place',
    route: 'LocationManagement',
  },
  {
    id: 'purchase',
    title: 'Purchase Orders',
    icon: 'shopping-cart',
    route: 'PurchaseOrders',
  },
  {
    id: 'sales',
    title: 'Sales Orders',
    icon: 'point-of-sale',
    route: 'SalesOrders',
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'assessment',
    route: 'Reports',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    route: 'Settings',
  },
]

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { theme } = useTheme()
  const { user, logout } = useSession()
  const { navigation, state } = props

  const activeRoute = state.routeNames[state.index]

  const handleMenuPress = (route: string) => {
    navigation.navigate(route)
  }

  const handleLogout = async () => {
    await logout()
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surface,
    },
    header: {
      backgroundColor: theme.primary,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.base,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    logo: {
      width: 60,
      height: 60,
      marginBottom: spacing.sm,
    },
    appName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textInverse,
      textAlign: 'center',
    },
    appSubtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.textInverse,
      opacity: 0.8,
      textAlign: 'center',
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.base,
      paddingTop: spacing.base,
      borderTopWidth: 1,
      borderTopColor: theme.textInverse + '20',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.textInverse + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    avatarText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textInverse,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textInverse,
    },
    userRole: {
      fontSize: typography.fontSize.sm,
      color: theme.textInverse,
      opacity: 0.8,
    },
    menuSection: {
      flex: 1,
      paddingTop: spacing.base,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      marginHorizontal: spacing.sm,
      borderRadius: borderRadius.base,
    },
    activeMenuItem: {
      backgroundColor: theme.primary + '15',
    },
    menuIcon: {
      width: 24,
      marginRight: spacing.base,
      alignItems: 'center',
    },
    menuText: {
      flex: 1,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
    },
    activeMenuText: {
      color: theme.primary,
      fontWeight: typography.fontWeight.semibold,
    },
    badge: {
      backgroundColor: theme.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    badgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: theme.textInverse,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: spacing.base,
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.lg,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.base,
      backgroundColor: theme.error + '10',
    },
    logoutIcon: {
      marginRight: spacing.base,
    },
    logoutText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.error,
    },
    version: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/hot-logo-cropped.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Tiles Inventory</Text>
          <Text style={styles.appSubtitle}>Management System</Text>
        </View>

        {/* User Section */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Admin'}</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.route
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                isActive && styles.activeMenuItem,
              ]}
              onPress={() => handleMenuPress(item.route)}
            >
              <View style={styles.menuIcon}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={isActive ? theme.primary : theme.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.menuText,
                  isActive && styles.activeMenuText,
                ]}
              >
                {item.title}
              </Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon
            name="logout"
            size={20}
            color={theme.error}
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  )
}