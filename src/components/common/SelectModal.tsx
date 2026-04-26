import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { spacing, typography, borderRadius } from '../../theme'
import { TextInput } from './TextInput'

export interface SelectOption {
  id: string
  name: string
}

interface SelectModalProps {
  label?: string
  value: string
  options: SelectOption[]
  onSelect: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  searchable?: boolean
}

export const SelectModal: React.FC<SelectModalProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  searchable = true,
}) => {
  const { theme } = useTheme()
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')

  const selectedLabel = options.find(o => o.id === value)?.name

  const filtered = useMemo(() => {
    if (!search.trim()) return options
    return options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
  }, [options, search])

  const handleSelect = (id: string) => {
    onSelect(id)
    setVisible(false)
    setSearch('')
  }

  const handleOpen = () => {
    if (!disabled) {
      setSearch('')
      setVisible(true)
    }
  }

  const styles = StyleSheet.create({
    container: { marginBottom: spacing.base },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    required: { color: theme.danger },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: error ? theme.danger : theme.border,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: disabled ? theme.gray100 : theme.surface,
      minHeight: 48,
      opacity: disabled ? 0.6 : 1,
    },
    triggerText: {
      fontSize: typography.fontSize.base,
      color: selectedLabel ? theme.text : theme.textSecondary,
      flex: 1,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: theme.danger,
      marginTop: spacing.xs,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingTop: spacing.base,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sheetTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    searchContainer: {
      paddingHorizontal: spacing.base,
      paddingTop: spacing.base,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemText: {
      fontSize: typography.fontSize.base,
      color: theme.text,
      flex: 1,
    },
    itemTextSelected: {
      color: theme.primary,
      fontWeight: typography.fontWeight.semibold,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.textSecondary,
      padding: spacing.xl,
      fontSize: typography.fontSize.sm,
    },
    clearItem: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    clearText: {
      fontSize: typography.fontSize.sm,
      color: theme.danger,
    },
  })

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity style={styles.trigger} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {selectedLabel || placeholder}
        </Text>
        <Icon name="arrow-drop-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Icon name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <TextInput
                  placeholder="Search..."
                  value={search}
                  onChangeText={setSearch}
                  leftIcon="search"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            )}

            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              ListHeaderComponent={
                !required && value ? (
                  <TouchableOpacity style={styles.clearItem} onPress={() => handleSelect('')}>
                    <Text style={styles.clearText}>Clear selection</Text>
                  </TouchableOpacity>
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => handleSelect(item.id)}>
                  <Text style={[styles.itemText, item.id === value && styles.itemTextSelected]}>
                    {item.name}
                  </Text>
                  {item.id === value && (
                    <Icon name="check" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No options found</Text>}
              keyboardShouldPersistTaps="handled"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
