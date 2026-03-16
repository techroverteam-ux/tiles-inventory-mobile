# Feature Module Architecture

## Clean Architecture Implementation

### Layer Structure
```
Feature Module (e.g., Inventory)
├── Presentation Layer (Screens & Components)
├── Domain Layer (Business Logic & Hooks)
├── Data Layer (Services & API)
└── Infrastructure Layer (Storage & Utils)
```

## MVVM Pattern Implementation

### Model-View-ViewModel Structure
```
src/screens/inventory/
├── models/                     # Data models
│   ├── InventoryItem.ts       # Domain entities
│   ├── InventoryFilter.ts     # Filter models
│   └── InventoryStats.ts      # Statistics models
├── viewmodels/                # Business logic
│   ├── InventoryListViewModel.ts
│   ├── InventoryDetailViewModel.ts
│   └── InventoryFormViewModel.ts
├── views/                     # UI components
│   ├── InventoryListScreen.tsx
│   ├── InventoryDetailScreen.tsx
│   └── InventoryFormScreen.tsx
├── components/                # Feature-specific components
│   ├── InventoryCard.tsx
│   ├── InventoryFilters.tsx
│   └── InventorySkeleton.tsx
├── hooks/                     # Custom hooks
│   ├── useInventoryList.ts
│   ├── useInventoryDetail.ts
│   └── useInventoryForm.ts
└── services/                  # Data services
    ├── InventoryService.ts
    └── InventoryRepository.ts
```

## Repository Pattern Implementation

### Data Access Layer
```typescript
// Base Repository Interface
interface IRepository<T> {
  getAll(filters?: any): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(item: Omit<T, 'id'>): Promise<T>
  update(id: string, item: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
}

// Inventory Repository
class InventoryRepository implements IRepository<InventoryItem> {
  constructor(private apiService: ApiService) {}
  
  async getAll(filters?: InventoryFilters): Promise<InventoryItem[]> {
    return this.apiService.get('/inventory', { params: filters })
  }
  
  async getById(id: string): Promise<InventoryItem | null> {
    return this.apiService.get(`/inventory/${id}`)
  }
  
  async create(item: CreateInventoryRequest): Promise<InventoryItem> {
    return this.apiService.post('/inventory', item)
  }
  
  async update(id: string, item: UpdateInventoryRequest): Promise<InventoryItem> {
    return this.apiService.put(`/inventory/${id}`, item)
  }
  
  async delete(id: string): Promise<boolean> {
    await this.apiService.delete(`/inventory/${id}`)
    return true
  }
}
```

## Service Layer Architecture

### Business Logic Services
```typescript
// Inventory Service
class InventoryService {
  constructor(
    private repository: InventoryRepository,
    private sessionService: SessionService
  ) {}
  
  async getInventoryList(filters: InventoryFilters): Promise<InventoryListResponse> {
    // Business logic for fetching inventory
    const items = await this.repository.getAll(filters)
    const stats = await this.calculateStats(items)
    
    return {
      items,
      stats,
      totalCount: items.length
    }
  }
  
  async updateStock(id: string, quantity: number): Promise<void> {
    // Business logic for stock updates
    const item = await this.repository.getById(id)
    if (!item) throw new Error('Item not found')
    
    const updatedItem = {
      ...item,
      quantity,
      lastUpdated: new Date(),
      updatedBy: this.sessionService.getCurrentUser()?.id
    }
    
    await this.repository.update(id, updatedItem)
  }
  
  private async calculateStats(items: InventoryItem[]): Promise<InventoryStats> {
    // Calculate low stock, total value, etc.
    return {
      totalItems: items.length,
      lowStockItems: items.filter(item => item.quantity < item.minStock).length,
      totalValue: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    }
  }
}
```

## Hook-Based State Management

### Custom Hooks for Each Feature
```typescript
// useInventoryList.ts
export const useInventoryList = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [stats, setStats] = useState<InventoryStats | null>(null)
  
  const inventoryService = useService(InventoryService)
  
  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await inventoryService.getInventoryList(filters)
      setItems(response.items)
      setStats(response.stats)
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false)
    }
  }, [filters, inventoryService])
  
  const updateFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])
  
  const refreshData = useCallback(() => {
    fetchItems()
  }, [fetchItems])
  
  useEffect(() => {
    fetchItems()
  }, [fetchItems])
  
  return {
    items,
    loading,
    filters,
    stats,
    updateFilters,
    refreshData
  }
}
```

## Dependency Injection Pattern

### Service Container
```typescript
// ServiceContainer.ts
class ServiceContainer {
  private services = new Map<string, any>()
  
  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory)
  }
  
  resolve<T>(key: string): T {
    const factory = this.services.get(key)
    if (!factory) throw new Error(`Service ${key} not found`)
    return factory()
  }
}

// Service registration
const container = new ServiceContainer()

container.register('ApiService', () => new ApiService())
container.register('SessionService', () => new SessionService())
container.register('InventoryRepository', () => 
  new InventoryRepository(container.resolve('ApiService'))
)
container.register('InventoryService', () => 
  new InventoryService(
    container.resolve('InventoryRepository'),
    container.resolve('SessionService')
  )
)

// Hook for service resolution
export const useService = <T>(serviceClass: new (...args: any[]) => T): T => {
  return container.resolve(serviceClass.name)
}
```

## Error Handling Architecture

### Centralized Error Management
```typescript
// ErrorBoundary for each feature
class InventoryErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    ErrorService.logError(error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

// Error handling in hooks
const useErrorHandler = () => {
  const { showToast } = useToast()
  
  return useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context}:`, error)
    showToast(error.message || 'An error occurred', 'error')
  }, [showToast])
}
```

## Feature Module Benefits

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Easy to unit test individual components and services
3. **Maintainability**: Changes in one layer don't affect others
4. **Reusability**: Services and hooks can be reused across features
5. **Scalability**: Easy to add new features following the same pattern
6. **Type Safety**: Full TypeScript support across all layers