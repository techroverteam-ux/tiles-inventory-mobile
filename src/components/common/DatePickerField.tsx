import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

interface DatePickerFieldProps {
  label?: string
  required?: boolean
  value: string // ISO date string YYYY-MM-DD or ''
  onChange: (date: string) => void
  placeholder?: string
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  required,
  value,
  onChange,
  placeholder = 'Select date',
}) => {
  const { theme } = useTheme()
  const [visible, setVisible] = useState(false)

  const parsed = value ? new Date(value) : null
  const today = new Date()

  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth())

  const displayValue = parsed
    ? `${String(parsed.getDate()).padStart(2, '0')}-${MONTHS[parsed.getMonth()]}-${parsed.getFullYear()}`
    : ''

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    onChange(iso)
    setVisible(false)
  }

  const isSelected = (day: number) =>
    parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === day

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day

  const s = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 },
    req: { color: theme.error },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      minHeight: 48,
      gap: 8,
    },
    triggerText: { flex: 1, fontSize: 15, color: displayValue ? theme.text : theme.mutedForeground },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    calendar: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      width: '100%',
      maxWidth: 340,
      borderWidth: 1,
      borderColor: theme.border,
    },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    navBtn: { padding: 6 },
    monthYear: { fontSize: 16, fontWeight: '700', color: theme.text },
    daysRow: { flexDirection: 'row', marginBottom: 6 },
    dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: theme.mutedForeground },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    cellSelected: { backgroundColor: theme.primary, borderRadius: 8 },
    cellToday: { borderWidth: 1, borderColor: theme.primary, borderRadius: 8 },
    cellText: { fontSize: 13, color: theme.text },
    cellTextSelected: { color: '#fff', fontWeight: '700' },
    cellTextToday: { color: theme.primary, fontWeight: '700' },
    clearRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border },
    clearBtn: { paddingHorizontal: 12, paddingVertical: 6 },
    clearText: { fontSize: 13, color: theme.error, fontWeight: '600' },
  })

  return (
    <View style={s.container}>
      {label && (
        <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
      )}
      <TouchableOpacity style={s.trigger} onPress={() => setVisible(true)} activeOpacity={0.7}>
        <Icon name="calendar-today" size={18} color={theme.mutedForeground} />
        <Text style={s.triggerText}>{displayValue || placeholder}</Text>
        <Icon name="arrow-drop-down" size={20} color={theme.mutedForeground} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={s.overlay} onPress={() => setVisible(false)}>
          <Pressable style={s.calendar} onPress={() => {}}>
            <View style={s.navRow}>
              <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
                <Icon name="chevron-left" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={s.monthYear}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
                <Icon name="chevron-right" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={s.daysRow}>
              {DAYS.map(d => <Text key={d} style={s.dayLabel}>{d}</Text>)}
            </View>

            <View style={s.grid}>
              {cells.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.cell, day && isSelected(day) ? s.cellSelected : day && isToday(day) ? s.cellToday : null]}
                  onPress={() => day && selectDay(day)}
                  disabled={!day}
                  activeOpacity={0.7}
                >
                  {day ? (
                    <Text style={[s.cellText, isSelected(day) ? s.cellTextSelected : isToday(day) ? s.cellTextToday : null]}>
                      {day}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>

            {value ? (
              <View style={s.clearRow}>
                <TouchableOpacity style={s.clearBtn} onPress={() => { onChange(''); setVisible(false) }}>
                  <Text style={s.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
