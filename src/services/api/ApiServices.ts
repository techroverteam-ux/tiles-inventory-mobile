import { apiClient } from './ApiClient'

// ============= AUTHENTICATION SERVICE =============
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: User
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
    return response
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async verify(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/verify')
  }
}

// ============= DASHBOARD SERVICE =============
export interface DashboardStats {
  totalProducts: number
  monthlySales: number
  purchaseOrders: number
  lowStockItems: number
  totalInventory?: number
  totalSalesOrders?: number
  totalBrands?: number
  totalCategories?: number
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

  async getSalesData(): Promise<SalesData[]> {
    return apiClient.get<SalesData[]>('/dashboard/sales-data')
  }

  async getRecentOrders(): Promise<any[]> {
    return apiClient.get<any[]>('/dashboard/recent-orders')
  }

  async getLowStockItems(): Promise<any[]> {
    return apiClient.get<any[]>('/dashboard/low-stock')
  }

  // Alternative endpoints that might exist
  async getOverview(): Promise<any> {
    return apiClient.get<any>('/dashboard')
  }

  async getAnalytics(): Promise<any> {
    return apiClient.get<any>('/analytics')
  }
}

// ============= PRODUCTS SERVICE =============
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
  brand: { id: string; name: string }
  category: { id: string; name: string }
  size?: { id: string; name: string }
  finishType: { id: string; name: string }
  batches?: Batch[]
}

export interface CreateProductRequest {
  name: string
  code: string
  brandId: string
  categoryId: string
  sizeId?: string
  finishTypeId: string
  sqftPerBox: number
  pcsPerBox: number
  locationId: string
  batchName: string
  stock: number
  image?: File
}

class ProductService {
  async getProducts(): Promise<{ products: Product[] }> {
    return apiClient.get<{ products: Product[] }>('/products')
  }

  async getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`)
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, value.toString())
        }
      }
    })
    return apiClient.uploadFile<Product>('/products', formData)
  }

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, data)
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  }
}

// ============= INVENTORY SERVICE =============
export interface Batch {
  id: string
  productId: string
  locationId: string
  batchNumber: string
  shade?: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  expiryDate?: string
  createdAt: string
  updatedAt: string
  product: Product
  location: Location
}

export interface InventoryFilters {
  page?: number
  limit?: number
  search?: string
  locationId?: string
  brandId?: string
  categoryId?: string
  lowStock?: 'low' | 'out'
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface InventoryResponse {
  inventory: Batch[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

class InventoryService {
  async getInventory(filters?: InventoryFilters): Promise<InventoryResponse> {
    return apiClient.get<InventoryResponse>('/inventory', { params: filters })
  }

  async getBatch(id: string): Promise<Batch> {
    return apiClient.get<Batch>(`/inventory/${id}`)
  }

  async createBatch(data: {
    productId: string
    locationId: string
    batchNumber: string
    shade?: string
    quantity: number
    purchasePrice: number
    sellingPrice: number
    expiryDate?: string
  }): Promise<Batch> {
    return apiClient.post<Batch>('/inventory', data)
  }

  async updateBatch(id: string, data: Partial<Batch>): Promise<Batch> {
    return apiClient.put<Batch>(`/inventory/${id}`, data)
  }

  async deleteBatch(id: string): Promise<void> {
    await apiClient.delete(`/inventory/${id}`)
  }
}

// ============= BRANDS SERVICE =============
export interface Brand {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

class BrandService {
  async getBrands(): Promise<{ brands: Brand[] }> {
    return apiClient.get<{ brands: Brand[] }>('/brands')
  }

  async getBrand(id: string): Promise<Brand> {
    return apiClient.get<Brand>(`/brands/${id}`)
  }

  async createBrand(data: { name: string; description?: string }): Promise<Brand> {
    return apiClient.post<Brand>('/brands', data)
  }

  async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
    return apiClient.put<Brand>(`/brands/${id}`, data)
  }

  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/brands/${id}`)
  }
}

// ============= CATEGORIES SERVICE =============
export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

class CategoryService {
  async getCategories(brandId?: string): Promise<{ categories: Category[] }> {
    const params = brandId ? { brandId } : undefined
    return apiClient.get<{ categories: Category[] }>('/categories', { params })
  }

  async getCategory(id: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`)
  }

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    return apiClient.post<Category>('/categories', data)
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return apiClient.put<Category>(`/categories/${id}`, data)
  }

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  }
}

// ============= SIZES SERVICE =============
export interface Size {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

class SizeService {
  async getSizes(brandId?: string, categoryId?: string): Promise<{ sizes: Size[] }> {
    const params: any = {}
    if (brandId) params.brandId = brandId
    if (categoryId) params.categoryId = categoryId
    return apiClient.get<{ sizes: Size[] }>('/sizes', { params })
  }

  async getSize(id: string): Promise<Size> {
    return apiClient.get<Size>(`/sizes/${id}`)
  }

  async createSize(data: { name: string; description?: string }): Promise<Size> {
    return apiClient.post<Size>('/sizes', data)
  }

  async updateSize(id: string, data: Partial<Size>): Promise<Size> {
    return apiClient.put<Size>(`/sizes/${id}`, data)
  }

  async deleteSize(id: string): Promise<void> {
    await apiClient.delete(`/sizes/${id}`)
  }
}

// ============= FINISH TYPES SERVICE =============
export interface FinishType {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

class FinishTypeService {
  async getFinishTypes(): Promise<{ finishTypes: FinishType[] }> {
    return apiClient.get<{ finishTypes: FinishType[] }>('/finish-types')
  }

  async getFinishType(id: string): Promise<FinishType> {
    return apiClient.get<FinishType>(`/finish-types/${id}`)
  }

  async createFinishType(data: { name: string; description?: string }): Promise<FinishType> {
    return apiClient.post<FinishType>('/finish-types', data)
  }

  async updateFinishType(id: string, data: Partial<FinishType>): Promise<FinishType> {
    return apiClient.put<FinishType>(`/finish-types/${id}`, data)
  }

  async deleteFinishType(id: string): Promise<void> {
    await apiClient.delete(`/finish-types/${id}`)
  }
}

// ============= LOCATIONS SERVICE =============
export interface Location {
  id: string
  name: string
  address?: string
  isActive: boolean
  createdAt: string
}

class LocationService {
  async getLocations(): Promise<{ locations: Location[] }> {
    return apiClient.get<{ locations: Location[] }>('/locations')
  }

  async getLocation(id: string): Promise<Location> {
    return apiClient.get<Location>(`/locations/${id}`)
  }

  async createLocation(data: { name: string; address?: string }): Promise<Location> {
    return apiClient.post<Location>('/locations', data)
  }

  async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
    return apiClient.put<Location>(`/locations/${id}`, data)
  }

  async deleteLocation(id: string): Promise<void> {
    await apiClient.delete(`/locations/${id}`)
  }
}

// ============= SALES ORDERS SERVICE =============
export interface SalesOrder {
  id: string
  orderNumber: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  status: 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
  orderDate: string
  deliveryDate?: string
  totalAmount: number
  notes?: string
  createdAt: string
  items: SalesOrderItem[]
}

export interface SalesOrderItem {
  id: string
  salesOrderId: string
  batchId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  batch: Batch
}

class SalesOrderService {
  async getSalesOrders(): Promise<{ salesOrders: SalesOrder[] }> {
    return apiClient.get<{ salesOrders: SalesOrder[] }>('/sales-orders')
  }

  async getSalesOrder(id: string): Promise<SalesOrder> {
    return apiClient.get<SalesOrder>(`/sales-orders/${id}`)
  }

  async createSalesOrder(data: {
    customerName: string
    customerEmail?: string
    customerPhone?: string
    deliveryDate?: string
    notes?: string
    items: Array<{
      batchId: string
      quantity: number
      unitPrice: number
    }>
  }): Promise<SalesOrder> {
    return apiClient.post<SalesOrder>('/sales-orders', data)
  }

  async updateSalesOrder(id: string, data: Partial<SalesOrder>): Promise<SalesOrder> {
    return apiClient.put<SalesOrder>(`/sales-orders/${id}`, data)
  }

  async deleteSalesOrder(id: string): Promise<void> {
    await apiClient.delete(`/sales-orders/${id}`)
  }
}

// ============= PURCHASE ORDERS SERVICE =============
export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierName: string
  supplierEmail?: string
  supplierPhone?: string
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
  orderDate: string
  expectedDelivery?: string
  totalAmount: number
  notes?: string
  createdAt: string
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  batchNumber: string
  product: Product
}

class PurchaseOrderService {
  async getPurchaseOrders(): Promise<{ purchaseOrders: PurchaseOrder[] }> {
    return apiClient.get<{ purchaseOrders: PurchaseOrder[] }>('/purchase-orders')
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`)
  }

  async createPurchaseOrder(data: {
    supplierName: string
    supplierEmail?: string
    supplierPhone?: string
    expectedDelivery?: string
    notes?: string
    items: Array<{
      productId: string
      quantity: number
      unitPrice: number
      batchNumber: string
    }>
  }): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>('/purchase-orders', data)
  }

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return apiClient.put<PurchaseOrder>(`/purchase-orders/${id}`, data)
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    await apiClient.delete(`/purchase-orders/${id}`)
  }

  async deliverPurchaseOrder(id: string, locationId: string): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/deliver`, { locationId })
  }

  async updateStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    return apiClient.put<PurchaseOrder>(`/purchase-orders/${id}/status`, { status })
  }
}

// ============= UPLOAD SERVICE =============
class UploadService {
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.uploadFile<{ url: string }>('/upload', formData)
  }
}

// ============= EXPORT SERVICES =============
export const authService = new AuthService()
export const dashboardService = new DashboardService()
export const productService = new ProductService()
export const inventoryService = new InventoryService()
export const brandService = new BrandService()
export const categoryService = new CategoryService()
export const sizeService = new SizeService()
export const finishTypeService = new FinishTypeService()
export const locationService = new LocationService()
export const salesOrderService = new SalesOrderService()
export const purchaseOrderService = new PurchaseOrderService()
export const uploadService = new UploadService()