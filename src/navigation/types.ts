import { StackNavigationProp } from '@react-navigation/stack'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native'

// Root Stack Params
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Website: undefined
}

// Website Stack Params
export type WebsiteStackParamList = {
  WebsiteHome: undefined
  WebsiteProducts: { categoryId?: string, brandId?: string, sizeId?: string, searchQuery?: string }
  WebsiteProductDetail: { productId: string }
  WebsiteCart: undefined
  WebsiteWishlist: undefined
}

// Auth Stack Params
export type AuthStackParamList = {
  Login: undefined
  ForgotPassword: undefined
}

// Bottom Tab Params
export type BottomTabParamList = {
  DashboardTab: undefined
  ProductsTab: undefined
  InventoryTab: undefined
  PurchaseTab: undefined
  SalesTab: undefined
}

// Main Stack Params
export type MainStackParamList = {
  Drawer: undefined
  ProductForm: { productId?: string; product?: any }
  ProductList: undefined
  OrderForm: { orderId?: string }
  Reports: undefined
  ProductDetail: { productId: string }
  OrderDetail: { orderId: string }
  PurchaseOrderForm: { orderId?: string }
  PurchaseOrderList: undefined
  PurchaseOrderDetail: { orderId: string }
  PurchaseOrderDeliver: { orderId: string }
  SalesOrderForm: { orderId?: string; order?: any }
  SalesOrderList: undefined
  SalesOrderDetail: { orderId: string }
  BrandManagement: undefined
  CategoryManagement: undefined
  CollectionManagement: undefined
  SizeManagement: undefined
  LocationManagement: undefined
  Notifications: undefined
  GlobalSearch: undefined
  EnquiryForm: { productId?: string; productName?: string }
  AdminPanel: undefined
  AdminFunctions: undefined
}

// Drawer Params
export type DrawerParamList = {
  Tabs: undefined // Represents the bottom tab navigator
  BrandManagement: undefined
  CategoryManagement: undefined
  CollectionManagement: undefined
  SizeManagement: undefined
  LocationManagement: undefined
  Notifications: undefined
  GlobalSearch: undefined
  Reports: undefined
  Settings: undefined
  AdminPanel: undefined
  AdminFunctions: undefined
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
  OrderDetail: { orderId: string; orderType?: 'purchase' | 'sales' }
  PurchaseOrderList: undefined
  PurchaseOrderDetail: { orderId: string; orderType?: 'purchase' | 'sales' }
  SalesOrderList: undefined
  SalesOrderDetail: { orderId: string; orderType?: 'purchase' | 'sales' }
}

// Products Stack Params
export type ProductsStackParamList = {
  ProductList: undefined
  ProductDetail: { productId: string }
  BrandDetail: { brandId: string }
  CategoryDetail: { categoryId: string }
}

// Settings Stack Params
export type SettingsStackParamList = {
  SettingsMain: undefined
  Profile: undefined
  ThemeSettings: undefined
  About: undefined
  BrandManagement: undefined
  CategoryManagement: undefined
  SizeManagement: undefined
  LocationManagement: undefined
}

// Navigation Props
export type DashboardNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Dashboard'>,
  StackNavigationProp<MainStackParamList>
>

export type InventoryNavigationProp = CompositeNavigationProp<
  StackNavigationProp<InventoryStackParamList>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<MainStackParamList>
  >
>

export type OrdersNavigationProp = CompositeNavigationProp<
  StackNavigationProp<OrdersStackParamList>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<MainStackParamList>
  >
>

export type ProductsNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProductsStackParamList>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<MainStackParamList>
  >
>

export type SettingsNavigationProp = CompositeNavigationProp<
  StackNavigationProp<SettingsStackParamList>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<MainStackParamList>
  >
>

// Route Props
export type ProductDetailRouteProp = RouteProp<InventoryStackParamList, 'InventoryDetail'>
export type OrderDetailRouteProp = RouteProp<OrdersStackParamList, 'OrderDetail'>
