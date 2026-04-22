import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'

interface HeaderProps {
  title: string
  showBack?: boolean
  navigation?: any
  rightComponent?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  navigation,
  rightComponent,
}) => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      marginRight: 12,
      padding: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightComponent && (
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      )}
    </View>
  )
}