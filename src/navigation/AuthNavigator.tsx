import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../context/ThemeContext'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'
import { AuthStackParamList } from './types'

const Stack = createStackNavigator<AuthStackParamList>()

export const AuthNavigator: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}