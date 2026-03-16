import React from 'react'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { useSession } from '../context/SessionContext'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import { LoadingScreen } from '../screens/LoadingScreen'
import { RootStackParamList } from './types'

const Stack = createStackNavigator<RootStackParamList>()

export const AppNavigator: React.FC = () => {
  const { theme, isDark } = useTheme()
  const { isAuthenticated, isLoading } = useSession()

  // Create custom navigation theme
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}