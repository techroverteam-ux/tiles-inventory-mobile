# Skeleton Loading Components

## Base Skeleton Component

```typescript
// src/components/loading/Skeleton.tsx
import React from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: any
  animated?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
  animated = true
}) => {
  const animatedValue = new Animated.Value(0)

  React.useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false
          })
        ])
      )
      animation.start()
      return () => animation.stop()
    }
  }, [animated])

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100]
  })

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius
        },
        style
      ]}
    >
      {animated && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX }]
            }
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden'
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  gradient: {
    flex: 1
  }
})
```

## Dashboard Skeleton Components

```typescript
// src/components/loading/DashboardSkeleton.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Skeleton } from './Skeleton'

export const DashboardCardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.cardInfo}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
    <View style={styles.cardContent}>
      <Skeleton width={60} height={24} />
      <Skeleton width={100} height={12} style={{ marginTop: 8 }} />
    </View>
  </View>
)

export const DashboardStatsSkeleton: React.FC = () => (
  <View style={styles.statsContainer}>
    {[1, 2, 3, 4].map((item) => (
      <View key={item} style={styles.statCard}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width={40} height={20} style={{ marginTop: 8 }} />
        <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
      </View>
    ))}
  </View>
)

export const DashboardChartSkeleton: React.FC = () => (
  <View style={styles.chartContainer}>
    <View style={styles.chartHeader}>
      <Skeleton width={150} height={18} />
      <Skeleton width={80} height={14} />
    </View>
    <View style={styles.chart}>
      <Skeleton width="100%" height={200} borderRadius={8} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1
  },
  cardContent: {
    alignItems: 'flex-start'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  chartHeader: {
    marginBottom: 16
  },
  chart: {
    alignItems: 'center'
  }
})
```

## Product List Skeleton

```typescript
// src/components/loading/ProductListSkeleton.tsx
import React from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { Skeleton } from './Skeleton'

export const ProductCardSkeleton: React.FC = () => (
  <View style={styles.productCard}>
    <View style={styles.productImage}>
      <Skeleton width="100%" height={120} borderRadius={8} />
    </View>
    <View style={styles.productInfo}>
      <Skeleton width="80%" height={16} />
      <Skeleton width="60%" height={12} style={{ marginTop: 4 }} />
      <View style={styles.productMeta}>
        <Skeleton width={40} height={12} />
        <Skeleton width={60} height={12} />
      </View>
      <View style={styles.productActions}>
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
      </View>
    </View>
  </View>
)

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <FlatList
    data={Array.from({ length: count })}
    renderItem={() => <ProductCardSkeleton />}
    keyExtractor={(_, index) => index.toString()}
    numColumns={2}
    contentContainerStyle={styles.listContainer}
    showsVerticalScrollIndicator={false}
  />
)

export const ProductTableRowSkeleton: React.FC = () => (
  <View style={styles.tableRow}>
    <View style={styles.productCell}>
      <Skeleton width={40} height={40} borderRadius={4} />
      <View style={styles.productDetails}>
        <Skeleton width={120} height={14} />
        <Skeleton width={80} height={12} style={{ marginTop: 2 }} />
      </View>
    </View>
    <Skeleton width={80} height={12} />
    <Skeleton width={60} height={12} />
    <Skeleton width={70} height={12} />
    <View style={styles.actionCell}>
      <Skeleton width={24} height={24} borderRadius={12} />
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  productImage: {
    padding: 8
  },
  productInfo: {
    padding: 12
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  listContainer: {
    padding: 8
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  productCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2
  },
  productDetails: {
    marginLeft: 12
  },
  actionCell: {
    flexDirection: 'row',
    gap: 8
  }
})
```

## Inventory Table Skeleton

```typescript
// src/components/loading/InventoryTableSkeleton.tsx
import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Skeleton } from './Skeleton'

export const InventoryTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <View style={styles.container}>
    {/* Table Header */}
    <View style={styles.tableHeader}>
      <Skeleton width={120} height={14} />
      <Skeleton width={80} height={14} />
      <Skeleton width={60} height={14} />
      <Skeleton width={70} height={14} />
      <Skeleton width={80} height={14} />
      <Skeleton width={60} height={14} />
    </View>
    
    {/* Table Rows */}
    <ScrollView>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={styles.productCell}>
            <Skeleton width={32} height={32} borderRadius={4} />
            <View style={styles.productInfo}>
              <Skeleton width={100} height={12} />
              <Skeleton width={70} height={10} style={{ marginTop: 2 }} />
            </View>
          </View>
          <Skeleton width={60} height={12} />
          <Skeleton width={40} height={12} />
          <Skeleton width={50} height={12} />
          <Skeleton width={60} height={12} />
          <View style={styles.statusCell}>
            <Skeleton width={50} height={20} borderRadius={10} />
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
)

export const InventoryCardSkeleton: React.FC = () => (
  <View style={styles.inventoryCard}>
    <View style={styles.cardHeader}>
      <Skeleton width={40} height={40} borderRadius={4} />
      <View style={styles.headerInfo}>
        <Skeleton width={120} height={14} />
        <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
    
    <View style={styles.cardContent}>
      <View style={styles.stockInfo}>
        <View style={styles.stockItem}>
          <Skeleton width={40} height={10} />
          <Skeleton width={30} height={16} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.stockItem}>
          <Skeleton width={50} height={10} />
          <Skeleton width={40} height={16} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.stockItem}>
          <Skeleton width={35} height={10} />
          <Skeleton width={25} height={16} style={{ marginTop: 4 }} />
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <Skeleton width={70} height={28} borderRadius={14} />
        <Skeleton width={70} height={28} borderRadius={14} />
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  productCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  productInfo: {
    marginLeft: 8
  },
  statusCell: {
    alignItems: 'center'
  },
  inventoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12
  },
  cardContent: {
    gap: 16
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stockItem: {
    alignItems: 'center'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})
```

## Order List Skeleton

```typescript
// src/components/loading/OrderListSkeleton.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Skeleton } from './Skeleton'

export const OrderCardSkeleton: React.FC = () => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <View style={styles.orderInfo}>
        <Skeleton width={100} height={16} />
        <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
    
    <View style={styles.orderDetails}>
      <View style={styles.detailRow}>
        <Skeleton width={60} height={12} />
        <Skeleton width={100} height={12} />
      </View>
      <View style={styles.detailRow}>
        <Skeleton width={50} height={12} />
        <Skeleton width={80} height={12} />
      </View>
      <View style={styles.detailRow}>
        <Skeleton width={70} height={12} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
    
    <View style={styles.orderFooter}>
      <Skeleton width={80} height={16} />
      <View style={styles.orderActions}>
        <Skeleton width={60} height={28} borderRadius={14} />
        <Skeleton width={60} height={28} borderRadius={14} />
      </View>
    </View>
  </View>
)

export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View style={styles.container}>
    {Array.from({ length: count }).map((_, index) => (
      <OrderCardSkeleton key={index} />
    ))}
  </View>
)

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  orderInfo: {
    flex: 1
  },
  orderDetails: {
    gap: 8,
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8
  }
})
```

## Usage Examples

```typescript
// In your screens
import { ProductListSkeleton, InventoryTableSkeleton } from '../components/loading'

const ProductsScreen = () => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  
  if (loading) {
    return <ProductListSkeleton count={8} />
  }
  
  return (
    // Your actual product list
  )
}

const InventoryScreen = () => {
  const [loading, setLoading] = useState(true)
  
  if (loading) {
    return <InventoryTableSkeleton rows={10} />
  }
  
  return (
    // Your actual inventory table
  )
}
```

## Key Features

1. **Shimmer Animation**: Smooth loading animation that matches content structure
2. **Configurable**: Customizable width, height, border radius, and animation
3. **Performance Optimized**: Uses native driver for smooth animations
4. **Consistent Design**: Matches the actual content layout
5. **Responsive**: Adapts to different screen sizes
6. **Accessible**: Proper accessibility labels for screen readers