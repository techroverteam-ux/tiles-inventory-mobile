import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'
import { getCommonStyles } from '../theme/commonStyles'
import { mainTabItems } from './tabConfig'
import { BottomTabParamList } from './types'

const Tab = createBottomTabNavigator<BottomTabParamList>()

interface BottomTabNavigatorProps {
  showTabBar?: boolean
}

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({ showTabBar = false }) => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      id="BottomTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: showTabBar
          ? [
              commonStyles.glass,
              {
                backgroundColor: theme.surface,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                height: 60 + insets.bottom,
                paddingBottom: insets.bottom + 4,
                paddingTop: 8,
                borderWidth: 0,
              },
            ]
          : { display: 'none' },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      {mainTabItems.map((item) => (
        <Tab.Screen
          key={item.routeName}
          name={item.routeName}
          component={item.component}
          initialParams={item.initialParams}
          options={{
            tabBarLabel: item.label,
            tabBarIcon: ({ color }) => (
              <Icon name={item.icon} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  )
}
