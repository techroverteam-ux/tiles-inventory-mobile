import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { ProductListScreen } from '../../screens/products/ProductListScreen'
import { ProductFormScreen } from '../../screens/products/ProductFormScreen'
import { ProductDetailScreen } from '../../screens/products/ProductDetailScreen'
import { BrandDetailScreen } from '../../screens/products/BrandDetailScreen'
import { CategoryDetailScreen } from '../../screens/products/CategoryDetailScreen'
import { ProductsStackParamList } from '../types'

const Stack = createStackNavigator<ProductsStackParamList>()

export const ProductsStack: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="BrandDetail"
        component={BrandDetailScreen}
        options={{ title: 'Brand Details' }}
      />
      <Stack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={{ title: 'Category Details' }}
      />
    </Stack.Navigator>
  )
}