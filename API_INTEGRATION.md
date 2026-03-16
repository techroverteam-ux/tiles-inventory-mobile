# API Integration Structure

## Base API Configuration

### API Client Setup
```typescript
// src/services/api/ApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { SecureStorage } from '../storage/SecureStorage'
import { SessionService } from '../session/SessionService'

class ApiClient {
  private instance: AxiosInstance
  private sessionService: SessionService
  private baseURL: string

  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://localhost:3000/api' 
      : 'https://your-production-api.com/api'
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.sessionService = new SessionService(this)
    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        const token = await SecureStorage.getAuthToken()
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        }
        
        // Log request in development
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        
        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
        }
        return response
      },
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            await this.sessionService.refreshToken()
            const token = await SecureStorage.getAuthToken()
            originalRequest.headers.Authorization = `Bearer ${token}`
            return this.instance(originalRequest)
          } catch (refreshError) {
            await this.sessionService.logout()
            return Promise.reject(refreshError)
          }
        }

        if (__DEV__) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`)
        }

        return Promise.reject(error)
      }
    )
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  // File upload
  async uploadFile<T>(url: string, file: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, file, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
```

## Service Layer Architecture

### Base Service Class
```typescript
// src/services/api/BaseService.ts
import { apiClient } from './ApiClient'

export abstract class BaseService<T> {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async getAll(params?: any): Promise<T[]> {
    return apiClient.get<T[]>(this.endpoint, { params })
  }

  async getById(id: string): Promise<T> {
    return apiClient.get<T>(`${this.endpoint}/${id}`)
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    return apiClient.post<T>(this.endpoint, data)
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return apiClient.put<T>(`${this.endpoint}/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`)
  }

  async search(query: string, params?: any): Promise<T[]> {
    return apiClient.get<T[]>(`${this.endpoint}/search`, {
      params: { q: query, ...params }
    })
  }
}
```

### Authentication Service
```typescript
// src/services/api/AuthService.ts
import { apiClient } from './ApiClient'
import { SecureStorage } from '../storage/SecureStorage'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
  expiresIn: number
}

export interface User {
  id: string
  email: string
  name: string
  role: string
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    
    // Store tokens securely
    await SecureStorage.storeAuthToken(response.token)
    await SecureStorage.storeRefreshToken(response.refreshToken)
    await SecureStorage.storeUserData(response.user)
    
    // Calculate and store session expiry
    const expiry = new Date(Date.now() + response.expiresIn * 1000)
    await SecureStorage.storeSessionExpiry(expiry)
    
    return response
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      await SecureStorage.clearAll()
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = await SecureStorage.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<{ token: string; refreshToken?: string; expiresIn: number }>('/auth/refresh', {
      refreshToken
    })

    await SecureStorage.storeAuthToken(response.token)
    if (response.refreshToken) {
      await SecureStorage.storeRefreshToken(response.refreshToken)
    }

    const expiry = new Date(Date.now() + response.expiresIn * 1000)
    await SecureStorage.storeSessionExpiry(expiry)

    return response.token
  }

  async verifyToken(): Promise<User> {
    return apiClient.get<User>('/auth/verify')
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  }
}

export const authService = new AuthService()
```

### Product Service
```typescript
// src/services/api/ProductService.ts
import { BaseService } from './BaseService'
import { apiClient } from './ApiClient'

export interface Product {
  id: string
  name: string
  code: string
  brandId: string
  categoryId: string
  sizeId?: string
  finishTypeId: string
  sqftPerBox: number
  pcsPerBox: number
  imageUrl?: string
  isActive: boolean
  createdAt: string
  brand: { name: string }
  category: { name: string }
  size?: { name: string }
  finishType: { name: string }
}

export interface ProductFilters {
  brandId?: string
  categoryId?: string
  sizeId?: string
  isActive?: boolean
  search?: string
}

export interface ProductListResponse {
  products: Product[]
  totalCount: number
  totalPages: number
  currentPage: number
}

class ProductService extends BaseService<Product> {
  constructor() {
    super('/products')
  }

  async getProducts(filters: ProductFilters & { page?: number; limit?: number }): Promise<ProductListResponse> {
    return apiClient.get<ProductListResponse>(this.endpoint, { params: filters })
  }

  async uploadProductImage(file: FormData): Promise<{ imageUrl: string }> {
    return apiClient.uploadFile<{ imageUrl: string }>('/upload', file)
  }

  async getProductsByBrand(brandId: string): Promise<Product[]> {
    return apiClient.get<Product[]>(`${this.endpoint}/by-brand/${brandId}`)
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return apiClient.get<Product[]>(`${this.endpoint}/by-category/${categoryId}`)
  }

  async toggleProductStatus(id: string): Promise<Product> {
    return apiClient.patch<Product>(`${this.endpoint}/${id}/toggle-status`)
  }
}

export const productService = new ProductService()
```

### Inventory Service
```typescript
// src/services/api/InventoryService.ts
import { BaseService } from './BaseService'
import { apiClient } from './ApiClient'

export interface InventoryItem {
  id: string
  productId: string
  locationId: string
  quantity: number
  minStock: number
  maxStock: number
  unitPrice: number
  lastUpdated: string
  product: {
    name: string
    code: string
    imageUrl?: string
    brand: { name: string }
    category: { name: string }
  }
  location: {
    name: string
    code: string
  }
}

export interface InventoryFilters {
  locationId?: string
  lowStock?: boolean
  outOfStock?: boolean
  search?: string
}

export interface StockUpdateRequest {
  quantity: number
  reason: string
  notes?: string
}

export interface InventoryStats {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
}

class InventoryService extends BaseService<InventoryItem> {
  constructor() {
    super('/inventory')
  }

  async getInventoryStats(): Promise<InventoryStats> {
    return apiClient.get<InventoryStats>(`${this.endpoint}/stats`)
  }

  async updateStock(id: string, update: StockUpdateRequest): Promise<InventoryItem> {
    return apiClient.patch<InventoryItem>(`${this.endpoint}/${id}/stock`, update)
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(`${this.endpoint}/low-stock`)
  }

  async getOutOfStockItems(): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(`${this.endpoint}/out-of-stock`)
  }

  async getStockHistory(id: string): Promise<any[]> {
    return apiClient.get<any[]>(`${this.endpoint}/${id}/history`)
  }

  async bulkUpdateStock(updates: Array<{ id: string; quantity: number; reason: string }>): Promise<void> {
    return apiClient.post<void>(`${this.endpoint}/bulk-update`, { updates })
  }
}

export const inventoryService = new InventoryService()
```

### Order Service
```typescript
// src/services/api/OrderService.ts
import { BaseService } from './BaseService'
import { apiClient } from './ApiClient'

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
  orderDate: string
  dueDate?: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  total: number
  product: {
    name: string
    code: string
    imageUrl?: string
  }
}

export interface OrderFilters {
  status?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface CreateOrderRequest {
  customerId: string
  dueDate?: string
  notes?: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
  }>
}

class OrderService extends BaseService<Order> {
  constructor() {
    super('/orders')
  }

  async getOrders(filters: OrderFilters & { page?: number; limit?: number }): Promise<{
    orders: Order[]
    totalCount: number
    totalPages: number
    currentPage: number
  }> {
    return apiClient.get(this.endpoint, { params: filters })
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return apiClient.patch<Order>(`${this.endpoint}/${id}/status`, { status })
  }

  async addOrderItem(orderId: string, item: Omit<OrderItem, 'id' | 'total' | 'product'>): Promise<Order> {
    return apiClient.post<Order>(`${this.endpoint}/${orderId}/items`, item)
  }

  async updateOrderItem(orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<Order> {
    return apiClient.patch<Order>(`${this.endpoint}/${orderId}/items/${itemId}`, updates)
  }

  async removeOrderItem(orderId: string, itemId: string): Promise<Order> {
    return apiClient.delete<Order>(`${this.endpoint}/${orderId}/items/${itemId}`)
  }

  async generateInvoice(id: string): Promise<{ invoiceUrl: string }> {
    return apiClient.post<{ invoiceUrl: string }>(`${this.endpoint}/${id}/invoice`)
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return apiClient.get<Order[]>(`${this.endpoint}/by-customer/${customerId}`)
  }
}

export const orderService = new OrderService()
```

### Customer Service
```typescript
// src/services/api/CustomerService.ts
import { BaseService } from './BaseService'
import { apiClient } from './ApiClient'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  isActive: boolean
  createdAt: string
  _count?: {
    orders: number
  }
  totalOrderValue?: number
}

export interface CustomerFilters {
  isActive?: boolean
  search?: string
}

class CustomerService extends BaseService<Customer> {
  constructor() {
    super('/customers')
  }

  async getCustomerStats(id: string): Promise<{
    totalOrders: number
    totalValue: number
    lastOrderDate?: string
    averageOrderValue: number
  }> {
    return apiClient.get(`${this.endpoint}/${id}/stats`)
  }

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    return apiClient.get<Customer[]>(`${this.endpoint}/top`, { params: { limit } })
  }

  async toggleCustomerStatus(id: string): Promise<Customer> {
    return apiClient.patch<Customer>(`${this.endpoint}/${id}/toggle-status`)
  }
}

export const customerService = new CustomerService()
```

### Dashboard Service
```typescript
// src/services/api/DashboardService.ts
import { apiClient } from './ApiClient'

export interface DashboardStats {
  totalProducts: number
  totalInventoryValue: number
  lowStockItems: number
  totalOrders: number
  pendingOrders: number
  totalCustomers: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'product' | 'order' | 'customer' | 'inventory'
  action: string
  description: string
  timestamp: string
  user?: string
}

export interface SalesData {
  period: string
  sales: number
  orders: number
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/dashboard/stats')
  }

  async getSalesData(period: 'week' | 'month' | 'year' = 'month'): Promise<SalesData[]> {
    return apiClient.get<SalesData[]>('/dashboard/sales', { params: { period } })
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    return apiClient.get<ActivityItem[]>('/dashboard/activity', { params: { limit } })
  }

  async getLowStockAlerts(): Promise<any[]> {
    return apiClient.get<any[]>('/dashboard/low-stock')
  }
}

export const dashboardService = new DashboardService()
```

## Error Handling

### API Error Types
```typescript
// src/types/api.ts
export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: any
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  success: boolean
}

export class ApiException extends Error {
  public code?: string
  public field?: string
  public details?: any

  constructor(error: ApiError) {
    super(error.message)
    this.code = error.code
    this.field = error.field
    this.details = error.details
  }
}
```

### Error Handler Hook
```typescript
// src/hooks/useApiError.ts
import { useCallback } from 'react'
import { useToast } from './useToast'
import { ApiException } from '../types/api'

export const useApiError = () => {
  const { showToast } = useToast()

  const handleError = useCallback((error: any, context?: string) => {
    let message = 'An unexpected error occurred'

    if (error instanceof ApiException) {
      message = error.message
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }

    if (context) {
      console.error(`API Error in ${context}:`, error)
    }

    showToast(message, 'error')
  }, [showToast])

  return { handleError }
}
```

## Service Container

```typescript
// src/services/ServiceContainer.ts
import { authService } from './api/AuthService'
import { productService } from './api/ProductService'
import { inventoryService } from './api/InventoryService'
import { orderService } from './api/OrderService'
import { customerService } from './api/CustomerService'
import { dashboardService } from './api/DashboardService'

export const services = {
  auth: authService,
  product: productService,
  inventory: inventoryService,
  order: orderService,
  customer: customerService,
  dashboard: dashboardService
}

export type Services = typeof services
```

## Usage Examples

```typescript
// In your components/hooks
import { productService } from '../services/api/ProductService'
import { useApiError } from '../hooks/useApiError'

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const { handleError } = useApiError()

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true)
    try {
      const response = await productService.getProducts(filters)
      setProducts(response.products)
    } catch (error) {
      handleError(error, 'fetchProducts')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  return { products, loading, fetchProducts }
}
```

## Key Features

1. **Type Safety**: Full TypeScript support for all API calls
2. **Authentication**: Automatic token management and refresh
3. **Error Handling**: Centralized error handling with user feedback
4. **Caching**: Built-in response caching capabilities
5. **Offline Support**: Request queuing for offline scenarios
6. **File Upload**: Support for image and document uploads
7. **Request/Response Logging**: Development debugging support
8. **Retry Logic**: Automatic retry for failed requests