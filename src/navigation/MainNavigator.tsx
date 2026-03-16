import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from '../context/ThemeContext'
import { CustomDrawerContent } from '../components/navigation/CustomDrawerContent'
import { DashboardStack } from './stacks/DashboardStack'
import { InventoryStack } from './stacks/InventoryStack'
import { ProductsStack } from './stacks/ProductsStack'
import { OrdersStack } from './stacks/OrdersStack'
import { SettingsStack } from './stacks/SettingsStack'
import { ProductFormScreen } from '../screens/products/ProductFormScreen'
import { ProductListScreen } from '../screens/products/ProductListScreen'
import { OrderFormScreen } from '../screens/orders/OrderFormScreen'
import { PurchaseOrderListScreen } from '../screens/orders/PurchaseOrderListScreen'
import { SalesOrderListScreen } from '../screens/orders/SalesOrderListScreen'
import { BrandManagementScreen } from '../screens/settings/BrandManagementScreen'
import { CategoryManagementScreen } from '../screens/settings/CategoryManagementScreen'
import { SizeManagementScreen } from '../screens/settings/SizeManagementScreen'
import { LocationManagementScreen } from '../screens/settings/LocationManagementScreen'
import { ReportsScreen } from '../screens/reports/ReportsScreen'
import { MainStackParamList, DrawerParamList } from './types'

const Stack = createStackNavigator<MainStackParamList>()
const Drawer = createDrawerNavigator<DrawerParamList>()

const DrawerNavigator: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.surface,
          width: 280,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardStack} />
      <Drawer.Screen name="BrandManagement" component={BrandManagementScreen} />
      <Drawer.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      <Drawer.Screen name="SizeManagement" component={SizeManagementScreen} />
      <Drawer.Screen name="Products" component={ProductsStack} />
      <Drawer.Screen name="Inventory" component={InventoryStack} />
      <Drawer.Screen name="LocationManagement" component={LocationManagementScreen} />
      <Drawer.Screen name="PurchaseOrders" component={OrdersStack} />
      <Drawer.Screen name="SalesOrders" component={OrdersStack} />
      <Drawer.Screen name="Reports" component={ReportsScreen} />
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </Drawer.Navigator>
  )
}

export const MainNavigator: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen 
        name="Drawer" 
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Modal Screens */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen 
          name="ProductForm" 
          component={ProductFormScreen}
          options={{ 
            title: 'Product',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="ProductList" 
          component={ProductListScreen}
          options={{ 
            title: 'Products',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="OrderForm" 
          component={OrderFormScreen}
          options={{ 
            title: 'Order',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="PurchaseOrderList" 
          component={PurchaseOrderListScreen}
          options={{ 
            title: 'Purchase Orders',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="SalesOrderList" 
          component={SalesOrderListScreen}
          options={{ 
            title: 'Sales Orders',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="BrandManagement" 
          component={BrandManagementScreen}
          options={{ 
            title: 'Brand Management',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="CategoryManagement" 
          component={CategoryManagementScreen}
          options={{ 
            title: 'Category Management',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="SizeManagement" 
          component={SizeManagementScreen}
          options={{ 
            title: 'Size Management',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="LocationManagement" 
          component={LocationManagementScreen}
          options={{ 
            title: 'Location Management',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
        <Stack.Screen 
          name="Reports" 
          component={ReportsScreen}
          options={{ 
            title: 'Reports',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}