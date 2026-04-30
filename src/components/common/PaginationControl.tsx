import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { typography, spacing, borderRadius } from '../../theme'

interface PaginationControlProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  itemsPerPageOptions?: number[]
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsPerPageOptions = [5, 10, 20, 50, 0],
  onPageChange,
  onItemsPerPageChange,
}) => {
  const { theme } = useTheme()
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  const selectedItemsPerPage = itemsPerPage === 0 ? totalItems : itemsPerPage

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
    pageSizeRow: {
      marginTop: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    pageSizeGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    pageSizeButton: {
      minWidth: 40,
      height: 30,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      backgroundColor: 'transparent',
    },
    pageSizeButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    pageSizeText: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      fontWeight: typography.fontWeight.medium,
    },
    pageSizeTextActive: {
      color: theme.primaryForeground,
      fontWeight: typography.fontWeight.semibold,
    },
  })

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>
          {startItem}-{endItem} of {totalItems}
        </Text>
        {onItemsPerPageChange ? (
          <View style={styles.pageSizeRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageSizeGroup}>
              {itemsPerPageOptions.map((option) => {
                const optionValue = option === 0 ? totalItems : option
                const isActive = selectedItemsPerPage === optionValue
                const label = option === 0 ? 'All' : String(option)
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.pageSizeButton, isActive && styles.pageSizeButtonActive]}
                    onPress={() => onItemsPerPageChange(option)}
                  >
                    <Text style={[styles.pageSizeText, isActive && styles.pageSizeTextActive]}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>
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
