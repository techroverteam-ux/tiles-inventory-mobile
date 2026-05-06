import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { OrderListScreen } from '../../screens/orders/OrderListScreen'
import { OrderDetailScreen } from '../../screens/orders/OrderDetailScreen'
import { PurchaseOrderDetailScreen } from '../../screens/orders/PurchaseOrderDetailScreen'
import { SalesOrderDetailScreen } from '../../screens/orders/SalesOrderDetailScreen'
import { Header } from '../../components/navigation/Header'
import { OrdersStackParamList } from '../types'

const PurchaseStack = createStackNavigator<OrdersStackParamList>()
const SalesStack = createStackNavigator<OrdersStackParamList>()

export const PurchaseOrdersStack: React.FC<any> = () => {
  const { theme } = useTheme()
  return (
    <PurchaseStack.Navigator
      id="PurchaseOrdersStack"
      screenOptions={{
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <PurchaseStack.Screen
        name="OrderList"
        component={OrderListScreen}
        options={{ headerShown: false }}
        initialParams={{ orderType: 'purchase' }}
      />
      <PurchaseStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <PurchaseStack.Screen name="PurchaseOrderDetail" component={PurchaseOrderDetailScreen} options={{ title: 'Purchase Order Details' }} />
      <PurchaseStack.Screen name="SalesOrderDetail" component={SalesOrderDetailScreen} options={{ title: 'Sales Order Details' }} />
    </PurchaseStack.Navigator>
  )
}

export const SalesOrdersStack: React.FC<any> = () => {
  const { theme } = useTheme()
  return (
    <SalesStack.Navigator
      id="SalesOrdersStack"
      screenOptions={{
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <SalesStack.Screen
        name="OrderList"
        component={OrderListScreen}
        options={{ headerShown: false }}
        initialParams={{ orderType: 'sales' }}
      />
      <SalesStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <SalesStack.Screen name="PurchaseOrderDetail" component={PurchaseOrderDetailScreen} options={{ title: 'Purchase Order Details' }} />
      <SalesStack.Screen name="SalesOrderDetail" component={SalesOrderDetailScreen} options={{ title: 'Sales Order Details' }} />
    </SalesStack.Navigator>
  )
}

// Keep backward compat export
export const OrdersStack = PurchaseOrdersStack
