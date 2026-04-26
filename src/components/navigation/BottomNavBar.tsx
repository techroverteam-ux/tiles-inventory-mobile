import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useNavigation, useNavigationState } from '@react-navigation/native'
import { DrawerActions } from '@react-navigation/native'

const tabs = [
  { name: 'Dashboard', icon: 'dashboard', screen: 'Dashboard' },
  { name: 'Products', icon: 'inventory-2', screen: 'Products' },
  { name: 'Inventory', icon: 'layers', screen: 'Inventory' },
  { name: 'Purchase', icon: 'shopping-cart', screen: 'PurchaseOrders' },
  { name: 'Sales', icon: 'trending-up', screen: 'SalesOrders' },
]

export const BottomNavBar: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<any>()

  const currentRoute = useNavigationState(state => {
    try {
      const drawerState = state?.routes?.find(r => r.name === 'Drawer')?.state
      if (drawerState) {
        const activeRoute = drawerState.routes[drawerState.index ?? 0]
        return activeRoute?.name
      }
    } catch {}
    return 'Dashboard'
  })

  const handlePress = (screen: string) => {
    navigation.navigate('Drawer', { screen })
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      {tabs.map(tab => {
        const isActive = currentRoute === tab.screen
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && { backgroundColor: theme.accent }]}
            onPress={() => handlePress(tab.screen)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? theme.primary : theme.mutedForeground}
            />
            <Text style={[
              styles.label,
              { color: isActive ? theme.primary : theme.mutedForeground },
              isActive && styles.labelActive
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    borderRadius: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
})
