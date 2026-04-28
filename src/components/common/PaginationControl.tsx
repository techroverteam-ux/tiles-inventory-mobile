import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { typography, spacing, borderRadius } from '../../theme'

interface PaginationControlProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const { theme } = useTheme()
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      gap: spacing.md,
    },
    text: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      fontWeight: typography.fontWeight.medium,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    button: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {startItem}-{endItem} of {totalItems}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, currentPage === 1 && styles.buttonDisabled]}
          disabled={currentPage === 1}
          onPress={() => onPageChange(currentPage - 1)}
        >
          <Icon name="chevron-left" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, currentPage >= totalPages && styles.buttonDisabled]}
          disabled={currentPage >= totalPages}
          onPress={() => onPageChange(currentPage + 1)}
        >
          <Icon name="chevron-right" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
