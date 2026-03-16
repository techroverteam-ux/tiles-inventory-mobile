import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { ProductListScreen } from '../../screens/products/ProductListScreen'
import { ProductFormScreen } from '../../screens/products/ProductFormScreen'
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
    </Stack.Navigator>
  )
}