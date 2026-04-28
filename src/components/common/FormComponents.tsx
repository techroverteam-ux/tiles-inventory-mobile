import React from 'react'
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps extends TextInputProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  leftIcon?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  leftIcon,
  style,
  ...props
}) => {
  const { theme } = useTheme()
  const [focused, setFocused] = React.useState(false)

  const s = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 },
    req: { color: theme.error },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: error ? theme.error : focused ? theme.primary : theme.border,
      borderRadius: 10,
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      minHeight: 48,
    },
    icon: { marginRight: 8 },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      paddingVertical: 10,
    },
    error: { fontSize: 12, color: theme.error, marginTop: 4 },
    hint: { fontSize: 11, color: theme.mutedForeground, marginTop: 4 },
  })

  return (
    <View style={s.container}>
      {label && (
        <Text style={s.label}>
          {label}
          {required && <Text style={s.req}> *</Text>}
        </Text>
      )}
      <View style={s.inputWrap}>
        {leftIcon && (
          <Icon name={leftIcon} size={18} color={theme.mutedForeground} style={s.icon} />
        )}
        <RNTextInput
          style={[s.input, style]}
          placeholderTextColor={theme.mutedForeground}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      {hint && !error ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  )
}

// ─── FormRow ──────────────────────────────────────────────────────────────────
export const FormRow: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 12,
}) => (
  <View style={{ flexDirection: 'row', gap }}>{children}</View>
)

// ─── ActiveStatusToggle ───────────────────────────────────────────────────────
interface ActiveStatusToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  subtitle?: string
}

export const ActiveStatusToggle: React.FC<ActiveStatusToggleProps> = ({
  value,
  onChange,
  subtitle = 'Visible in product selection',
}) => {
  const { theme } = useTheme()

  const s = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      marginBottom: 20,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: value ? theme.primary : theme.border,
      backgroundColor: value ? theme.primary : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: { flex: 1 },
    label: { fontSize: 14, fontWeight: '600', color: theme.text },
    sub: { fontSize: 12, color: theme.mutedForeground, marginTop: 1 },
  })

  return (
    <TouchableOpacity style={s.row} onPress={() => onChange(!value)} activeOpacity={0.7}>
      <View style={s.checkbox}>
        {value && <Icon name="check" size={14} color="#fff" />}
      </View>
      <View style={s.textWrap}>
        <Text style={s.label}>Active Status</Text>
        <Text style={s.sub}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}

// ─── FormActions ──────────────────────────────────────────────────────────────
interface FormActionsProps {
  onSubmit: () => void
  onCancel: () => void
  onAddMore?: () => void
  submitLabel: string
  loading?: boolean
}

export const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  onAddMore,
  submitLabel,
  loading,
}) => {
  const { theme } = useTheme()

  const s = StyleSheet.create({
    row: { flexDirection: 'row', gap: 10, paddingTop: 4, paddingBottom: 8 },
    addMore: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    addMoreText: { fontSize: 13, fontWeight: '600', color: theme.text },
    submit: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderRadius: 10,
      backgroundColor: theme.primary,
      opacity: loading ? 0.7 : 1,
    },
    submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    cancel: {
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: { fontSize: 14, fontWeight: '600', color: theme.text },
  })

  return (
    <View style={s.row}>
      {onAddMore && (
        <TouchableOpacity style={s.addMore} onPress={onAddMore}>
          <Icon name="add" size={16} color={theme.text} />
          <Text style={s.addMoreText}>Add More</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={s.submit} onPress={onSubmit} disabled={loading}>
        <Text style={s.submitText}>{loading ? 'Saving...' : submitLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.cancel} onPress={onCancel}>
        <Text style={s.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── SectionBox ───────────────────────────────────────────────────────────────
export const SectionBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme()
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        padding: 14,
        backgroundColor: theme.surface,
        marginBottom: 16,
      }}
    >
      {children}
    </View>
  )
}
