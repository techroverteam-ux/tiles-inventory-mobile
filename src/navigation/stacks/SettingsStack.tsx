import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../../context/ThemeContext'
import { SettingsScreen } from '../../screens/settings/SettingsScreen'
import { ProfileScreen } from '../../screens/settings/ProfileScreen'
import { ThemeSettingsScreen } from '../../screens/settings/ThemeSettingsScreen'
import { AboutScreen } from '../../screens/settings/AboutScreen'
import { Header } from '../../components/navigation/Header'
import { SettingsStackParamList } from '../types'

const Stack = createStackNavigator<SettingsStackParamList>()

export const SettingsStack: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="ThemeSettings" 
        component={ThemeSettingsScreen}
        options={{ title: 'Theme' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ title: 'About' }}
      />
    </Stack.Navigator>
  )
}