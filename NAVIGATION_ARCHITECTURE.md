# Navigation Architecture

## Navigation Structure Overview

```
App
├── AuthNavigator (Stack)
│   ├── LoginScreen
│   └── ForgotPasswordScreen
└── MainNavigator (Stack)
    ├── TabNavigator (Bottom Tabs)
    │   ├── DashboardStack
    │   ├── InventoryStack
    │   ├── OrdersStack
    │   ├── CustomersStack
    │   └── SettingsStack
    └── Modal Screens
        ├── ProductFormScreen
        ├── OrderFormScreen
        ├── CustomerFormScreen
        └── ReportsScreen
```

## Navigation Implementation

### Root Navigator
```typescript
// src/navigation/AppNavigator.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useSession } from '../hooks/useSession'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import { LoadingScreen } from '../screens/LoadingScreen'

const Stack = createStackNavigator()

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

### Authentication Navigator
```typescript
// src/navigation/AuthNavigator.tsx
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'

const Stack = createStackNavigator()

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}
```

### Main Navigator
```typescript
// src/navigation/MainNavigator.tsx
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { TabNavigator } from './TabNavigator'
import { ProductFormScreen } from '../screens/products/ProductFormScreen'
import { OrderFormScreen } from '../screens/orders/OrderFormScreen'
import { CustomerFormScreen } from '../screens/customers/CustomerFormScreen'
import { ReportsScreen } from '../screens/reports/ReportsScreen'
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen'
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen'
import { CustomerDetailScreen } from '../screens/customers/CustomerDetailScreen'

const Stack = createStackNavigator()

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Tabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Modal Screens */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen 
          name="ProductForm" 
          component={ProductFormScreen}
          options={{ title: 'Product' }}
        />
        <Stack.Screen 
          name="OrderForm" 
          component={OrderFormScreen}
          options={{ title: 'Order' }}
        />
        <Stack.Screen 
          name="CustomerForm" 
          component={CustomerFormScreen}
          options={{ title: 'Customer' }}
        />
        <Stack.Screen 
          name="Reports" 
          component={ReportsScreen}
          options={{ title: 'Reports' }}
        />
      </Stack.Group>
      
      {/* Detail Screens */}
      <Stack.Group>
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{ title: 'Product Details' }}
        />
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{ title: 'Order Details' }}
        />
        <Stack.Screen 
          name="CustomerDetail" 
          component={CustomerDetailScreen}
          options={{ title: 'Customer Details' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}
```

### Tab Navigator
```typescript
// src/navigation/TabNavigator.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { colors } from '../theme/colors'
import { DashboardStack } from './stacks/DashboardStack'
import { InventoryStack } from './stacks/InventoryStack'
import { OrdersStack } from './stacks/OrdersStack'
import { CustomersStack } from './stacks/CustomersStack'
import { SettingsStack } from './stacks/SettingsStack'

const Tab = createBottomTabNavigator()

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard'
              break
            case 'Inventory':
              iconName = 'inventory'
              break
            case 'Orders':
              iconName = 'shopping-cart'
              break
            case 'Customers':
              iconName = 'people'
              break
            case 'Settings':
              iconName = 'settings'
              break
            default:
              iconName = 'circle'
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray200,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Inventory" component={InventoryStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Customers" component={CustomersStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  )
}
```

### Feature Stack Navigators

#### Dashboard Stack
```typescript
// src/navigation/stacks/DashboardStack.tsx
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { DashboardScreen } from '../../screens/dashboard/DashboardScreen'
import { NotificationsScreen } from '../../screens/notifications/NotificationsScreen'
import { Header } from '../../components/navigation/Header'

const Stack = createStackNavigator()

export const DashboardStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  )
}
```

#### Inventory Stack
```typescript
// src/navigation/stacks/InventoryStack.tsx
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { InventoryListScreen } from '../../screens/inventory/InventoryListScreen'
import { InventoryDetailScreen } from '../../screens/inventory/InventoryDetailScreen'
import { StockUpdateScreen } from '../../screens/inventory/StockUpdateScreen'
import { Header } from '../../components/navigation/Header'

const Stack = createStackNavigator()

export const InventoryStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="InventoryList" 
        component={InventoryListScreen}
        options={{ title: 'Inventory' }}
      />
      <Stack.Screen 
        name="InventoryDetail" 
        component={InventoryDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen 
        name="StockUpdate" 
        component={StockUpdateScreen}
        options={{ title: 'Update Stock' }}
      />
    </Stack.Navigator>
  )
}
```

#### Orders Stack
```typescript
// src/navigation/stacks/OrdersStack.tsx
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { OrderListScreen } from '../../screens/orders/OrderListScreen'
import { OrderDetailScreen } from '../../screens/orders/OrderDetailScreen'
import { Header } from '../../components/navigation/Header'

const Stack = createStackNavigator()

export const OrdersStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="OrderList" 
        component={OrderListScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  )
}
```

## Navigation Types

```typescript
// src/navigation/types.ts
import { StackNavigationProp } from '@react-navigation/stack'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native'

// Root Stack Params
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}

// Auth Stack Params
export type AuthStackParamList = {
  Login: undefined
  ForgotPassword: undefined
}

// Main Stack Params
export type MainStackParamList = {
  Tabs: undefined
  ProductForm: { productId?: string }
  OrderForm: { orderId?: string }
  CustomerForm: { customerId?: string }
  Reports: undefined
  ProductDetail: { productId: string }
  OrderDetail: { orderId: string }
  CustomerDetail: { customerId: string }
}

// Tab Params
export type TabParamList = {
  Dashboard: undefined
  Inventory: undefined
  Orders: undefined
  Customers: undefined
  Settings: undefined
}

// Dashboard Stack Params
export type DashboardStackParamList = {
  DashboardMain: undefined
  Notifications: undefined
}

// Inventory Stack Params
export type InventoryStackParamList = {
  InventoryList: undefined
  InventoryDetail: { productId: string }
  StockUpdate: { productId: string }
}

// Orders Stack Params
export type OrdersStackParamList = {
  OrderList: undefined
  OrderDetail: { orderId: string }
}

// Navigation Props
export type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  StackNavigationProp<MainStackParamList>
>

export type InventoryNavigationProp = CompositeNavigationProp<
  StackNavigationProp<InventoryStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    StackNavigationProp<MainStackParamList>
  >
>

export type OrdersNavigationProp = CompositeNavigationProp<
  StackNavigationProp<OrdersStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    StackNavigationProp<MainStackParamList>
  >
>

// Route Props
export type ProductDetailRouteProp = RouteProp<InventoryStackParamList, 'InventoryDetail'>
export type OrderDetailRouteProp = RouteProp<OrdersStackParamList, 'OrderDetail'>
```

## Custom Header Component

```typescript
// src/components/navigation/Header.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { StackHeaderProps } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { colors } from '../../theme/colors'
import { useSession } from '../../hooks/useSession'

export const Header: React.FC<StackHeaderProps> = ({
  navigation,
  route,
  options,
  back
}) => {
  const { user } = useSession()
  const title = options.title || route.name

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {back ? (
          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.openDrawer?.()}
            style={styles.menuButton}
          >
            <Icon name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.iconButton}
        >
          <Icon name="notifications" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.iconButton}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start'
  },
  centerSection: {
    flex: 2,
    alignItems: 'center'
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  backButton: {
    padding: 8
  },
  menuButton: {
    padding: 8
  },
  iconButton: {
    padding: 8,
    marginLeft: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  }
})
```

## Navigation Hooks

```typescript
// src/hooks/useNavigation.ts
import { useNavigation as useRNNavigation } from '@react-navigation/native'
import { InventoryNavigationProp, OrdersNavigationProp } from '../navigation/types'

export const useInventoryNavigation = () => {
  return useRNNavigation<InventoryNavigationProp>()
}

export const useOrdersNavigation = () => {
  return useRNNavigation<OrdersNavigationProp>()
}

// Navigation helper functions
export const navigationHelpers = {
  navigateToProductDetail: (navigation: any, productId: string) => {
    navigation.navigate('ProductDetail', { productId })
  },
  
  navigateToOrderDetail: (navigation: any, orderId: string) => {
    navigation.navigate('OrderDetail', { orderId })
  },
  
  navigateToProductForm: (navigation: any, productId?: string) => {
    navigation.navigate('ProductForm', { productId })
  },
  
  navigateToOrderForm: (navigation: any, orderId?: string) => {
    navigation.navigate('OrderForm', { orderId })
  }
}
```

## Deep Linking Configuration

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native'

export const linking: LinkingOptions<any> = {
  prefixes: ['tilesinventory://'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          ForgotPassword: 'forgot-password'
        }
      },
      Main: {
        screens: {
          Tabs: {
            screens: {
              Dashboard: 'dashboard',
              Inventory: 'inventory',
              Orders: 'orders',
              Customers: 'customers',
              Settings: 'settings'
            }
          },
          ProductDetail: 'product/:productId',
          OrderDetail: 'order/:orderId',
          CustomerDetail: 'customer/:customerId',
          ProductForm: 'product/form/:productId?',
          OrderForm: 'order/form/:orderId?',
          CustomerForm: 'customer/form/:customerId?'
        }
      }
    }
  }
}
```

## Key Navigation Features

1. **Type Safety**: Full TypeScript support for navigation params
2. **Nested Navigation**: Proper stack and tab navigation hierarchy
3. **Modal Presentation**: Form screens presented as modals
4. **Custom Header**: Consistent header with branding and actions
5. **Deep Linking**: Support for URL-based navigation
6. **Session Aware**: Navigation changes based on authentication state
7. **Accessibility**: Proper navigation announcements for screen readers
8. **Performance**: Lazy loading of screens and optimized transitions