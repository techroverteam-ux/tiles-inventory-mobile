import React, { useState, useEffect, useCallback } from 'react'
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { DrawerActions, useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { apiClient } from '../../services/api/ApiClient'
import { MainStackParamList } from '../../navigation/types'

export const MainHeader: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user } = useSession()
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  const insets = useSafeAreaInsets()
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await apiClient.get('/notifications')
      const notifs = res.data?.notifications || []
      setUnreadCount(notifs.filter((n: any) => !n.read && !n.isRead).length)
    } catch {}
  }, [])

  useFocusEffect(useCallback(() => { fetchUnread() }, [fetchUnread]))

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: insets.top + 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
    },
    leftSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuButton: { padding: 4 },
    logo: { height: 32, width: 90, resizeMode: 'contain', alignSelf: 'center' },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconButton: { padding: 4 },
    bellContainer: { position: 'relative' },
    badge: {
      position: 'absolute', top: 0, right: 0,
      backgroundColor: theme.error,
      minWidth: 14, height: 14, borderRadius: 7,
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 2,
    },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    avatar: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: theme.primaryForeground, fontWeight: 'bold', fontSize: 13 },
  })

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/hot-logo-cropped.png')}
          style={styles.logo}
          onError={() => {}}
        />
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('GlobalSearch')}>
          <Icon name="search" size={24} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
          <Icon name={isDark ? 'dark-mode' : 'light-mode'} size={22} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.bellContainer]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications-none" size={24} color={theme.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('GlobalSearch')}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
