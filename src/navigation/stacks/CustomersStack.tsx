import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { CustomerListScreen } from '../../screens/customers/CustomerListScreen'
import { CustomerDetailScreen } from '../../screens/customers/CustomerDetailScreen'
import { Header } from '../../components/navigation/Header'
import { CustomersStackParamList } from '../types'

const Stack = createStackNavigator<CustomersStackParamList>()

export const CustomersStack: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      id="CustomersStack"
      screenOptions={{
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen 
        name="CustomerList" 
        component={CustomerListScreen}
        options={{ title: 'Customers' }}
      />
      <Stack.Screen 
        name="CustomerDetail" 
        component={CustomerDetailScreen}
        options={{ title: 'Customer Details' }}
      />
    </Stack.Navigator>
  )
}