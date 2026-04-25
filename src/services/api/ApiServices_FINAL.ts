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
  orderDate: string
  expectedDelivery?: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
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
  createdAt?: string
  updatedAt?: string
}

export interface BrandResponse {
  brands: Brand[]
  total: number
}

export const brandService = {
  getBrands: async (page: number = 1, limit: number = 50): Promise<BrandResponse> => {
    try {
      const response = await apiClient.get('/brands', { params: { page, limit } })
      return response.data
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      return { brands: [], total: 0 }
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
  createdAt?: string
  updatedAt?: string
}

export interface CategoryResponse {
  categories: Category[]
  total: number
}

export const categoryService = {
  getCategories: async (page: number = 1, limit: number = 50): Promise<CategoryResponse> => {
    try {
      const response = await apiClient.get('/categories', { params: { page, limit } })
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
  label: string
  dimensions?: string
  createdAt?: string
  updatedAt?: string
}

export interface SizeResponse {
  sizes: Size[]
  total: number
}

export const sizeService = {
  getSizes: async (page: number = 1, limit: number = 50): Promise<SizeResponse> => {
    try {
      const response = await apiClient.get('/sizes', { params: { page, limit } })
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

export interface Location {
  id: string
  name: string
  address?: string
  code?: string
  createdAt?: string
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
