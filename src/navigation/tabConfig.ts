import React from 'react'
import { BottomTabParamList } from './types'
import { EnhancedDashboardScreen } from '../screens/dashboard/EnhancedDashboardScreen'
import { ProductsStack } from './stacks/ProductsStack'
import { InventoryStack } from './stacks/InventoryStack'
import { OrdersStack } from './stacks/OrdersStack'

export type MainTabRouteName = keyof BottomTabParamList

export interface MainTabItem {
  routeName: MainTabRouteName
  label: string
  icon: string
  component: React.ComponentType<any>
  initialParams?: Record<string, any>
}

export const mainTabItems: MainTabItem[] = [
  {
    routeName: 'DashboardTab',
    label: 'Dashboard',
    icon: 'dashboard',
    component: EnhancedDashboardScreen,
  },
  {
    routeName: 'ProductsTab',
    label: 'Products',
    icon: 'inventory-2',
    component: ProductsStack,
  },
  {
    routeName: 'InventoryTab',
    label: 'Inventory',
    icon: 'layers',
    component: InventoryStack,
  },
  {
    routeName: 'PurchaseTab',
    label: 'Purchase',
    icon: 'shopping-cart',
    component: OrdersStack,
    initialParams: { orderType: 'purchase' },
  },
  {
    routeName: 'SalesTab',
    label: 'Sales',
    icon: 'trending-up',
    component: OrdersStack,
    initialParams: { orderType: 'sales' },
  },
]

export const getMainTabNavigationTarget = (routeName: MainTabRouteName) => ({
  screen: 'Tabs',
  params: {
    screen: routeName,
  },
})
