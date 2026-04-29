import React from 'react'
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from '../context/ThemeContext'
import { PersistentBottomBar } from '../components/navigation/PersistentBottomBar'
import { CustomDrawerContent } from '../components/navigation/CustomDrawerContent'
import { MainHeader } from '../components/navigation/MainHeader'
import { BottomTabNavigator } from './BottomTabNavigator'
import { ProductsStack } from './stacks/ProductsStack'
import { OrdersStack } from './stacks/OrdersStack'
import { SettingsStack } from './stacks/SettingsStack'
import { ProductFormScreen } from '../screens/products/ProductFormScreen'
import { ProductListScreen } from '../screens/products/ProductListScreenComplete'
import { OrderFormScreen } from '../screens/orders/OrderFormScreen'
import { PurchaseOrderListScreen } from '../screens/orders/PurchaseOrderListScreen'
import { PurchaseOrderFormScreen } from '../screens/orders/PurchaseOrderFormScreen'
import { PurchaseOrderDetailScreen } from '../screens/orders/PurchaseOrderDetailScreen'
import { SalesOrderListScreen } from '../screens/orders/SalesOrderListScreen'
import { SalesOrderFormScreen } from '../screens/orders/SalesOrderFormScreen'
import { SalesOrderDetailScreen } from '../screens/orders/SalesOrderDetailScreen'
import { StockUpdateScreen } from '../screens/inventory/StockUpdateScreen'
import { BrandManagementScreen } from '../screens/settings/BrandManagementScreen'
import { CategoryManagementScreen } from '../screens/settings/CategoryManagementScreen'
import { SizeManagementScreen } from '../screens/settings/SizeManagementScreen'
import { LocationManagementScreen } from '../screens/settings/LocationManagementScreen'
import { CollectionManagementScreen } from '../screens/settings/CollectionManagementScreen'
import { ReportsScreen } from '../screens/reports/ReportsScreen'
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen'
import { GlobalSearchScreen } from '../screens/search/GlobalSearchScreen'
import { EnquiryFormScreen } from '../screens/enquiries/EnquiryFormScreen'
import { AdminFunctionsScreen } from '../screens/admin/AdminFunctionsScreen'
import { AdminPanelScreen } from '../screens/admin/AdminPanelScreen'
import { EnhancedDashboardScreen } from '../screens/dashboard/EnhancedDashboardScreen'
import { SettingsScreen } from '../screens/settings/SettingsScreen'
import { MainStackParamList, DrawerParamList } from './types'

const Stack = createStackNavigator<MainStackParamList>()
const Drawer = createDrawerNavigator<DrawerParamList>()

const DrawerNavigator: React.FC = () => {
  const { theme } = useTheme()

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        id="MainDrawer"
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
        <Drawer.Screen name="Tabs" component={BottomTabNavigator} />
        <Drawer.Screen name="GlobalSearch" component={GlobalSearchScreen} />
        <Drawer.Screen name="BrandManagement" component={BrandManagementScreen} />
        <Drawer.Screen name="CategoryManagement" component={CategoryManagementScreen} />
        <Drawer.Screen name="CollectionManagement" component={CollectionManagementScreen} />
        <Drawer.Screen name="SizeManagement" component={SizeManagementScreen} />
        <Drawer.Screen name="LocationManagement" component={LocationManagementScreen} />
        <Drawer.Screen name="Notifications" component={NotificationsScreen} />
        <Drawer.Screen name="Reports" component={ReportsScreen} />
        <Drawer.Screen name="AdminPanel" component={AdminPanelScreen} />
        <Drawer.Screen name="AdminFunctions" component={AdminFunctionsScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </View>
  )
}

export const MainNavigator: React.FC = () => {
  const { theme } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          id="MainStack"
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
              options={{ headerShown: false }}
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
              name="PurchaseOrderForm" 
              component={PurchaseOrderFormScreen}
              options={{ 
                title: 'Purchase Order',
                headerShown: false,
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
              name="SalesOrderForm" 
              component={SalesOrderFormScreen}
              options={{ 
                title: 'Sales Order',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="PurchaseOrderDetail"
              component={PurchaseOrderDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SalesOrderDetail"
              component={SalesOrderDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PurchaseOrderDeliver"
              component={PurchaseOrderDetailScreen}
              options={{ headerShown: false }}
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
              name="CollectionManagement" 
              component={CollectionManagementScreen}
              options={{ 
                title: 'Collection Management',
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
              name="Notifications" 
              component={NotificationsScreen}
              options={{ 
                title: 'Notifications',
                headerStyle: { backgroundColor: theme.surface },
                headerTintColor: theme.text
              }}
            />
            <Stack.Screen 
              name="GlobalSearch" 
              component={GlobalSearchScreen}
              options={{ 
                title: 'Search',
                headerStyle: { backgroundColor: theme.surface },
                headerTintColor: theme.text
              }}
            />
            <Stack.Screen 
              name="EnquiryForm" 
              component={EnquiryFormScreen}
              options={{ 
                title: 'Product Enquiry',
                headerStyle: { backgroundColor: theme.surface },
                headerTintColor: theme.text
              }}
            />
            <Stack.Screen 
              name="AdminPanel" 
              component={AdminPanelScreen}
              options={{ 
                title: 'Admin Panel',
                headerStyle: { backgroundColor: theme.surface },
                headerTintColor: theme.text
              }}
            />
            <Stack.Screen 
              name="AdminFunctions" 
              component={AdminFunctionsScreen}
              options={{ 
                title: 'Admin Functions',
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
      </View>
      <PersistentBottomBar />
    </View>
  )
}