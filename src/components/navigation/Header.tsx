import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { getCommonStyles } from '../../theme/commonStyles'

interface HeaderProps {
  title: string
  showBack?: boolean
  navigation?: any
  onBackPress?: () => void
  onBack?: () => void
  rightComponent?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  navigation,
  onBackPress,
  onBack,
  rightComponent,
}) => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
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
    <View style={[commonStyles.glass, styles.container, { borderWidth: 0, borderBottomWidth: 1 }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (onBackPress) {
                onBackPress()
                return
              }
              if (onBack) {
                onBack()
                return
              }
              navigation?.goBack()
            }}
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