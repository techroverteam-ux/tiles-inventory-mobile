import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { InventoryListScreen } from '../../screens/inventory/InventoryListScreen'
import { InventoryDetailScreen } from '../../screens/inventory/InventoryDetailScreen'
import { StockUpdateScreen } from '../../screens/inventory/StockUpdateScreen'
import { Header } from '../../components/navigation/Header'
import { InventoryStackParamList } from '../types'

const Stack = createStackNavigator<InventoryStackParamList>()

export const InventoryStack: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      id="InventoryStack"
      screenOptions={{
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen 
        name="InventoryList" 
        component={InventoryListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="InventoryDetail" 
        component={InventoryDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen 
        name="StockUpdate" 
        component={StockUpdateScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}