import { apiClient } from './ApiClient'

// ============ Authentication ============

export interface AuthResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {})
    } catch (error) {
      console.error('Logout failed:', error)
    }
  },

  forgotPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      console.error('Forgot password request failed:', error)
      throw error
    }
  },

  resetPassword: async (token: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, password })
      return response.data
    } catch (error) {
      console.error('Reset password failed:', error)
      throw error
    }
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token })
      return response.data
    } catch (error) {
      console.error('Email verification failed:', error)
      throw error
    }
  },
}

// ============ Global Search ============

export interface GlobalSearchResult {
  type: string
  label: string
  subtitle?: string
  href: string
  id?: string
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[]
  total: number
}

export const globalSearchService = {
  search: async (query: string): Promise<GlobalSearchResponse> => {
    try {
      const response = await apiClient.get('/global-search', {
        params: { q: query }
      })
      
      // Map API response to GlobalSearchResult format
      const results = response.data.results?.map((item: any) => ({
        type: item.type || 'Unknown',
        label: item.name || item.title || item.label || '',
        subtitle: item.subtitle || item.description || '',
        href: item.href || `/${item.type?.toLowerCase()}/${item.id}`,
        id: item.id,
      })) || []

      return {
        results,
        total: response.data.total || results.length,
      }
    } catch (error) {
      console.error('Global search error:', error)
      return {
        results: [],
        total: 0,
      }
    }
  },
}

// ============ Purchase Orders ============

export interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity?: number
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDelivery?: string
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  items: PurchaseOrderItem[]
  notes?: string
}

export interface PurchaseOrderResponse {
  purchaseOrders: PurchaseOrder[]
  total: number
}

export const purchaseOrderService = {
  getPurchaseOrders: async (page: number = 1, limit: number = 20): Promise<PurchaseOrderResponse> => {
    try {
      const response = await apiClient.get('/purchase-orders', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error)
      return { purchaseOrders: [], total: 0 }
    }
  },

  getPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.get(`/purchase-orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch purchase order:', error)
      throw error
    }
  },

  createPurchaseOrder: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.post('/purchase-orders', data)
      return response.data
    } catch (error) {
      console.error('Failed to create purchase order:', error)
      throw error
    }
  },

  updatePurchaseOrder: async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.put(`/purchase-orders/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Failed to update purchase order:', error)
      throw error
    }
  },

  updateStatus: async (id: string, status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'DELIVERED' | 'CANCELLED'): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.patch(`/purchase-orders/${id}`, { status })
      return response.data
    } catch (error) {
      console.error('Failed to update purchase order status:', error)
      throw error
    }
  },

  deletePurchaseOrder: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/purchase-orders/${id}`)
    } catch (error) {
      console.error('Failed to delete purchase order:', error)
      throw error
    }
  },
}

// ============ Sales Orders ============

export interface SalesOrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount?: number
  totalPrice: number
}

export interface SalesOrder {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone?: string
  orderDate: string
  deliveryDate?: string
  expectedDelivery?: string
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  discount?: number
  items: SalesOrderItem[]
  notes?: string
}

export interface SalesOrderResponse {
  salesOrders: SalesOrder[]
  total: number
}

export const salesOrderService = {
  getSalesOrders: async (page: number = 1, limit: number = 20): Promise<SalesOrderResponse> => {
    try {
      const response = await apiClient.get('/sales-orders', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch sales orders:', error)
      return { salesOrders: [], total: 0 }
    }
  },

  getSalesOrder: async (id: string): Promise<SalesOrder> => {
    try {
      const response = await apiClient.get(`/sales-orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch sales order:', error)
      throw error
    }
  },

  createSalesOrder: async (data: Partial<SalesOrder>): Promise<SalesOrder> => {
    try {
      const response = await apiClient.post('/sales-orders', data)
      return response.data
    } catch (error) {
      console.error('Failed to create sales order:', error)
      throw error
    }
  },

  updateSalesOrder: async (id: string, data: Partial<SalesOrder>): Promise<SalesOrder> => {
    try {
      const response = await apiClient.put(`/sales-orders/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Failed to update sales order:', error)
      throw error
    }
  },

  updateStatus: async (id: string, status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'): Promise<SalesOrder> => {
    try {
      const response = await apiClient.patch(`/sales-orders/${id}`, { status })
      return response.data
    } catch (error) {
      console.error('Failed to update sales order status:', error)
      throw error
    }
  },

  deleteSalesOrder: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/sales-orders/${id}`)
    } catch (error) {
      console.error('Failed to delete sales order:', error)
      throw error
    }
  },
}

// ============ Master Data Management ============

export interface Brand {
  id: string
  name: string
  description?: string
  logo?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: { name: string }
  updatedBy?: { name: string }
  _count?: { products: number }
}

export interface BrandResponse {
  brands: Brand[]
  total: number
  totalCount: number
  totalPages: number
  currentPage: number
}

export const brandService = {
  getBrands: async (params: {
    page?: number
    limit?: number
    search?: string
    isActive?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<BrandResponse> => {
    try {
      const response = await apiClient.get('/brands', { params: { page: 1, limit: 20, ...params } })
      return response.data
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      return { brands: [], total: 0, totalCount: 0, totalPages: 0, currentPage: 1 }
    }
  },

  getBrand: async (id: string): Promise<Brand> => {
    try {
      const response = await apiClient.get(`/brands/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createBrand: async (data: Partial<Brand>): Promise<Brand> => {
    try {
      const response = await apiClient.post('/brands', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateBrand: async (id: string, data: Partial<Brand>): Promise<Brand> => {
    try {
      const response = await apiClient.put(`/brands/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteBrand: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/brands/${id}`)
    } catch (error) {
      throw error
    }
  },
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

export interface CategoryResponse {
  categories: Category[]
  total: number
}

export const categoryService = {
  getCategories: async (pageOrBrandId: number | string = 1, limit: number = 50): Promise<CategoryResponse> => {
    try {
      const params = typeof pageOrBrandId === 'string'
        ? { brandId: pageOrBrandId }
        : { page: pageOrBrandId, limit }
      const response = await apiClient.get('/categories', { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      return { categories: [], total: 0 }
    }
  },

  getCategory: async (id: string): Promise<Category> => {
    try {
      const response = await apiClient.get(`/categories/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    try {
      const response = await apiClient.post('/categories', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    try {
      const response = await apiClient.put(`/categories/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/categories/${id}`)
    } catch (error) {
      throw error
    }
  },
}

export interface Size {
  id: string
  name: string
  label?: string
  description?: string
  dimensions?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  image?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

export interface CollectionResponse {
  collections: Collection[]
  total: number
}

export const collectionService = {
  getCollections: async (pageOrBrandId: number | string = 1, limitOrCategoryId?: number | string): Promise<CollectionResponse> => {
    try {
      const params = typeof pageOrBrandId === 'string'
        ? {
            brandId: pageOrBrandId,
            ...(typeof limitOrCategoryId === 'string' ? { categoryId: limitOrCategoryId } : {}),
          }
        : { page: pageOrBrandId, limit: typeof limitOrCategoryId === 'number' ? limitOrCategoryId : 50 }
      const response = await apiClient.get('/collections', { params })
      return response.data
    } catch (error: any) {
      // Endpoint may not exist on this backend — return empty silently
      if (error?.response?.status === 404) {
        return { collections: [], total: 0 }
      }
      console.error('Failed to fetch collections:', error)
      return { collections: [], total: 0 }
    }
  },

  getCollection: async (id: string): Promise<Collection> => {
    try {
      const response = await apiClient.get(`/collections/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createCollection: async (data: Partial<Collection>): Promise<Collection> => {
    try {
      const response = await apiClient.post('/collections', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateCollection: async (id: string, data: Partial<Collection>): Promise<Collection> => {
    try {
      const response = await apiClient.put(`/collections/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteCollection: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/collections/${id}`)
    } catch (error) {
      throw error
    }
  },
}

export interface SizeResponse {
  sizes: Size[]
  total: number
}

export const sizeService = {
  getSizes: async (pageOrBrandId: number | string = 1, limitOrCategoryId?: number | string): Promise<SizeResponse> => {
    try {
      const params = typeof pageOrBrandId === 'string'
        ? {
            brandId: pageOrBrandId,
            ...(typeof limitOrCategoryId === 'string' ? { categoryId: limitOrCategoryId } : {}),
          }
        : { page: pageOrBrandId, limit: typeof limitOrCategoryId === 'number' ? limitOrCategoryId : 50 }
      const response = await apiClient.get('/sizes', { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch sizes:', error)
      return { sizes: [], total: 0 }
    }
  },

  getSize: async (id: string): Promise<Size> => {
    try {
      const response = await apiClient.get(`/sizes/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createSize: async (data: Partial<Size>): Promise<Size> => {
    try {
      const response = await apiClient.post('/sizes', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateSize: async (id: string, data: Partial<Size>): Promise<Size> => {
    try {
      const response = await apiClient.put(`/sizes/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteSize: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/sizes/${id}`)
    } catch (error) {
      throw error
    }
  },
}

// ============ Notifications ============

export interface Notification {
  id: string
  type: 'order' | 'inventory' | 'alert' | 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  isRead: boolean
  read?: boolean
  timestamp?: string
  relatedEntity?: {
    type: string
    id: string
  }
  createdAt: string
  updatedAt: string
}

export interface NotificationResponse {
  notifications: Notification[]
  total: number
}

export const notificationService = {
  getNotifications: async (page = 1, limit = 20): Promise<NotificationResponse> => {
    try {
      const response = await apiClient.get('/notifications', { params: { page, limit } })
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return { notifications: [], total: 0 }
    }
  },

  getNotification: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.get(`/notifications/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch notification:', error)
      throw error
    }
  },

  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`, {})
      return response.data
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  },

  markAsUnread: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/unread`, {})
      return response.data
    } catch (error) {
      console.error('Failed to mark notification as unread:', error)
      throw error
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.patch('/notifications/read-all', {})
      return response.data
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  },

  markAllRead: async (): Promise<{ success: boolean }> => {
    return notificationService.markAllAsRead()
  },

  deleteNotification: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/${id}`)
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  },

  clearAll: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete('/notifications/clear-all')
      return response.data
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
      throw error
    }
  },
}

export interface Location {
  id: string
  name: string
  address?: string
  code?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

export interface LocationResponse {
  locations: Location[]
  total: number
}

export const locationService = {
  getLocations: async (page: number = 1, limit: number = 50): Promise<LocationResponse> => {
    try {
      const response = await apiClient.get('/locations', { params: { page, limit } })
      return response.data
    } catch (error) {
      console.error('Failed to fetch locations:', error)
      return { locations: [], total: 0 }
    }
  },

  getLocation: async (id: string): Promise<Location> => {
    try {
      const response = await apiClient.get(`/locations/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createLocation: async (data: Partial<Location>): Promise<Location> => {
    try {
      const response = await apiClient.post('/locations', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateLocation: async (id: string, data: Partial<Location>): Promise<Location> => {
    try {
      const response = await apiClient.put(`/locations/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteLocation: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/locations/${id}`)
    } catch (error) {
      throw error
    }
  },
}

// ============ Products ============

export interface Product {
  id: string
  name: string
  code: string
  description?: string
  brand: { id: string; name: string }
  category: { id: string; name: string }
  collection?: { id: string; name: string }
  size?: { id: string; name: string }
  finishType?: { id: string; name: string }
  length?: number
  width?: number
  thickness?: number
  sqftPerBox?: number
  pcsPerBox?: number
  stock?: number
  isActive?: boolean
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductResponse {
  products: Product[]
  total: number
}

export interface FinishType {
  id: string
  name: string
  isActive?: boolean
}

export interface FinishTypeResponse {
  finishTypes: FinishType[]
  total: number
}

export interface CreateProductRequest {
  name: string
  code: string
  description?: string
  brandId: string
  categoryId: string
  collectionId?: string
  sizeId?: string
  finishTypeId?: string
  length?: number
  width?: number
  thickness?: number
  sqftPerBox?: number
  pcsPerBox?: number
  locationId?: string
  batchName?: string
  stock?: number
  image?: any
}

export const productService = {
  getProducts: async (page: number = 1, limit: number = 50): Promise<ProductResponse> => {
    try {
      const response = await apiClient.get('/products', { params: { page, limit } })
      return response.data
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return { products: [], total: 0 }
    }
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post('/products', data)
    return response.data
  },

  updateProduct: async (id: string, data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data)
    return response.data
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}

export const finishTypeService = {
  getFinishTypes: async (): Promise<FinishTypeResponse> => {
    try {
      const response = await apiClient.get('/finish-types')
      return response.data
    } catch (error: any) {
      // Endpoint may not exist on this backend — return empty silently
      if (error?.response?.status === 404) {
        return { finishTypes: [], total: 0 }
      }
      console.error('Failed to fetch finish types:', error)
      return { finishTypes: [], total: 0 }
    }
  },
}

export interface DashboardStats {
  totalProducts: number
  monthlySales: number
  purchaseOrders: number
  lowStockItems: number
}

export interface SalesData {
  month: string
  amount: number
}

export interface Batch {
  id: string
  productId: string
  batchNumber: string
  quantity: number
  purchasePrice?: number
  sellingPrice?: number
  shade?: string
  expiryDate?: string
  updatedAt: string
  product: {
    id: string
    name: string
    code: string
    imageUrl?: string
    brand: { id: string; name: string }
    category: { id: string; name: string }
  }
  location: {
    id: string
    name: string
  }
}

export interface InventoryFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface EnquiryRequest {
  productId: string
  name: string
  email: string
  phone: string
  quantity?: number
  message?: string
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      return {
        totalProducts: 0,
        monthlySales: 0,
        purchaseOrders: 0,
        lowStockItems: 0,
      }
    }
  },

  getSalesData: async (): Promise<SalesData[]> => {
    try {
      const response = await apiClient.get('/dashboard/sales-data')
      return response.data
    } catch (error) {
      console.error('Failed to fetch dashboard sales data:', error)
      return []
    }
  },

  getRecentOrders: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/dashboard/recent-orders')
      return response.data
    } catch (error) {
      console.error('Failed to fetch recent orders:', error)
      return []
    }
  },

  getLowStockItems: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/dashboard/low-stock-items')
      return response.data
    } catch (error) {
      console.error('Failed to fetch low stock items:', error)
      return []
    }
  },
}

export const inventoryService = {
  getInventory: async (filters: InventoryFilters = {}): Promise<{
    inventory: Batch[]
    pagination: { page: number; pages: number; total: number }
  }> => {
    try {
      const response = await apiClient.get('/inventory', { params: filters })
      return response.data
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      return {
        inventory: [],
        pagination: { page: filters.page || 1, pages: 1, total: 0 },
      }
    }
  },
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export interface CustomerResponse {
  customers: Customer[]
  total: number
}

export const customerService = {
  getCustomers: async (page = 1, limit = 20): Promise<CustomerResponse> => {
    try {
      const response = await apiClient.get('/customers', { params: { page, limit } })
      return response.data
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      return { customers: [], total: 0 }
    }
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.post('/customers', data)
    return response.data
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${id}`, data)
    return response.data
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`)
  },
}

export const enquiryService = {
  submitEnquiry: async (data: EnquiryRequest): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post('/enquiries', data)
      return response.data
    } catch (error) {
      console.error('Failed to submit enquiry:', error)
      throw error
    }
  },
}
