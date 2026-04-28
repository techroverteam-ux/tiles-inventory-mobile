import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { DrawerActions, useNavigation, NavigationProp } from '@react-navigation/native'
import { useTheme } from '../../context/ThemeContext'
import { MainStackParamList } from '../../navigation/types'

export const MainHeader: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme()
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  const insets = useSafeAreaInsets()

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer())
  }

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
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuButton: {
      padding: 4,
    },
    logo: {
      height: 32,
      width: 90,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    iconButton: {
      padding: 4,
    },
    bellContainer: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: theme.error,
      width: 14,
      height: 14,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
    },
    avatarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: theme.primaryForeground,
      fontWeight: 'bold',
      fontSize: 14,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
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
          <Icon name={isDark ? "dark-mode" : "light-mode"} size={22} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconButton, styles.bellContainer]}>
          <Icon name="notifications-none" size={24} color={theme.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>6</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Icon name="expand-more" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
