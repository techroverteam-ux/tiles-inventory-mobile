import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { getCommonStyles } from '../../theme/commonStyles'

interface ScreenActionBarProps {
  title: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  itemCount: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onExport?: () => void
  onToggleFilters?: () => void
}

export const ScreenActionBar: React.FC<ScreenActionBarProps> = ({
  title,
  primaryActionLabel,
  onPrimaryAction,
  itemCount,
  viewMode,
  onViewModeChange,
  onExport,
  onToggleFilters,
}) => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      letterSpacing: -0.5,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    outlineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    outlineBtnText: {
      color: theme.text,
      fontWeight: '600',
      fontSize: 14,
    },
    primaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    primaryBtnText: {
      color: theme.primaryForeground,
      fontWeight: '700',
      fontSize: 14,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemCount: {
      color: theme.mutedForeground,
      fontSize: 14,
    },
    toggleGroup: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    toggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 6,
    },
    toggleBtnActive: {
      backgroundColor: theme.muted,
    },
    toggleText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.mutedForeground,
      letterSpacing: 0.5,
    },
    toggleTextActive: {
      color: theme.primary,
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.outlineBtn} onPress={onExport}>
          <Icon name="file-download" size={16} color={theme.text} />
          <Text style={styles.outlineBtnText}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryAction}>
          <Icon name="add" size={18} color={theme.primaryForeground} />
          <Text style={styles.primaryBtnText}>{primaryActionLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={onToggleFilters}>
          <Icon name="tune" size={16} color={theme.text} />
          <Text style={styles.outlineBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.itemCount}>{itemCount} items</Text>
        
        <View style={styles.toggleGroup}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
            onPress={() => onViewModeChange('grid')}
            activeOpacity={0.7}
          >
            <Icon name="grid-view" size={14} color={viewMode === 'grid' ? theme.primary : theme.mutedForeground} />
            <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>GRID</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => onViewModeChange('list')}
            activeOpacity={0.7}
          >
            <Icon name="view-list" size={14} color={viewMode === 'list' ? theme.primary : theme.mutedForeground} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>LIST</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
