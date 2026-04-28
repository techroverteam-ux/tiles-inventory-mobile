import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { EnhancedDashboardScreen } from '../../screens/dashboard/EnhancedDashboardScreen'
import { NotificationsScreen } from '../../screens/notifications/NotificationsScreen'
import { Header } from '../../components/navigation/Header'
import { DashboardStackParamList } from '../types'

const Stack = createStackNavigator<DashboardStackParamList>()

export const DashboardStack: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      id="DashboardStack"
      screenOptions={{
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={EnhancedDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  )
}