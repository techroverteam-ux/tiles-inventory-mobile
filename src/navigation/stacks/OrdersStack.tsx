import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { OrderListScreen } from '../../screens/orders/OrderListScreen'
import { OrderDetailScreen } from '../../screens/orders/OrderDetailScreen'
import { PurchaseOrderDetailScreen } from '../../screens/orders/PurchaseOrderDetailScreen'
import { SalesOrderDetailScreen } from '../../screens/orders/SalesOrderDetailScreen'
import { Header } from '../../components/navigation/Header'
import { OrdersStackParamList } from '../types'

const Stack = createStackNavigator<OrdersStackParamList>()

export const OrdersStack: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen 
        name="OrderList" 
        component={OrderListScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen
        name="PurchaseOrderDetail"
        component={PurchaseOrderDetailScreen}
        initialParams={{ orderType: 'purchase' } as any}
        options={{ title: 'Purchase Order Details' }}
      />
      <Stack.Screen
        name="SalesOrderDetail"
        component={SalesOrderDetailScreen}
        initialParams={{ orderType: 'sales' } as any}
        options={{ title: 'Sales Order Details' }}
      />
    </Stack.Navigator>
  )
}