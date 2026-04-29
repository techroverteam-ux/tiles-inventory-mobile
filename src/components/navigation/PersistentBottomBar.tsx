import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { CommonActions, useNavigation, useNavigationState } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { getCommonStyles } from '../../theme/commonStyles'
import { getMainTabNavigationTarget, mainTabItems, MainTabRouteName } from '../../navigation/tabConfig'

const getActiveRouteNames = (state: any): string[] => {
  if (!state?.routes?.length) {
    return []
  }

  const currentRoute = state.routes[state.index ?? 0]
  const childRouteNames = currentRoute?.state ? getActiveRouteNames(currentRoute.state) : []

  return [currentRoute?.name, ...childRouteNames].filter(Boolean)
}

export const PersistentBottomBar: React.FC = () => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const navigationState = useNavigationState((state) => state)

  const activeRouteNames = getActiveRouteNames(navigationState)
  const activeTab = mainTabItems.find((item) => activeRouteNames.includes(item.routeName))?.routeName ?? 'DashboardTab'

  const styles = StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
      paddingTop: 8,
      paddingBottom: insets.bottom + 8,
      paddingHorizontal: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      borderRadius: 14,
      minHeight: 48,
    },
    label: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: '700',
    },
  })

  const goToTab = (routeName: MainTabRouteName) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Main',
        params: {
          screen: 'Drawer',
          params: getMainTabNavigationTarget(routeName),
        },
      })
    )
  }

  return (
    <View style={[commonStyles.glass, styles.container, { borderWidth: 0, borderTopWidth: 1 }]}>
      <View style={styles.row}>
        {mainTabItems.map((item) => {
          const isActive = activeTab === item.routeName
          const tintColor = isActive ? theme.primary : theme.mutedForeground

          return (
            <TouchableOpacity
              key={item.routeName}
              style={styles.item}
              onPress={() => goToTab(item.routeName)}
              activeOpacity={0.75}
            >
              <Icon name={item.icon} size={22} color={tintColor} />
              <Text style={[styles.label, { color: tintColor }]}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
