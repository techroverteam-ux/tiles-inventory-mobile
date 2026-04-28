import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../context/ThemeContext'
import { WebsiteHomeScreen } from '../screens/website/WebsiteHomeScreen'
import { WebsiteProductsScreen } from '../screens/website/WebsiteProductsScreen'
import { WebsiteProductDetailScreen } from '../screens/website/WebsiteProductDetailScreen'
import { WebsiteCartScreen } from '../screens/website/WebsiteCartScreen'
import { WebsiteStackParamList } from './types'

const Stack = createStackNavigator<WebsiteStackParamList>()

export const WebsiteNavigator: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Stack.Navigator
      id="WebsiteStack"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="WebsiteHome" component={WebsiteHomeScreen} />
      <Stack.Screen name="WebsiteProducts" component={WebsiteProductsScreen} />
      <Stack.Screen name="WebsiteProductDetail" component={WebsiteProductDetailScreen} />
      <Stack.Screen name="WebsiteCart" component={WebsiteCartScreen} />
    </Stack.Navigator>
  )
}
