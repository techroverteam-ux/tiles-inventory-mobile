import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../context/ThemeContext'
import { getCommonStyles } from '../theme/commonStyles'
import { BottomTabParamList } from './types'

// Screens
import { EnhancedDashboardScreen } from '../screens/dashboard/EnhancedDashboardScreen'
import { ProductsStack } from './stacks/ProductsStack'
import { InventoryStack } from './stacks/InventoryStack'
import { OrdersStack } from './stacks/OrdersStack' // This needs to be parameterized or we create specific ones

const Tab = createBottomTabNavigator<BottomTabParamList>()

export const BottomTabNavigator: React.FC = () => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      id="BottomTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          commonStyles.glass,
          {
            backgroundColor: theme.surface,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 8,
            borderWidth: 0,
          }
        ],
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={EnhancedDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStack}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Icon name="inventory-2" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryStack}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Icon name="layers" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PurchaseTab"
        component={OrdersStack}
        initialParams={{ orderType: 'purchase' }}
        options={{
          tabBarLabel: 'Purchase',
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SalesTab"
        component={OrdersStack}
        initialParams={{ orderType: 'sales' }}
        options={{
          tabBarLabel: 'Sales',
          tabBarIcon: ({ color, size }) => (
            <Icon name="trending-up" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
