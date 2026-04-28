import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'

interface FormModalProps {
  visible: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  scrollable?: boolean
}

export const FormModal: React.FC<FormModalProps> = ({
  visible,
  title,
  onClose,
  children,
  scrollable = true,
}) => {
  const { theme } = useTheme()

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '92%',
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.primary,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      padding: 20,
    },
  })

  const content = scrollable ? (
    <ScrollView
      style={s.body}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={s.body}>{children}</View>
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={s.overlay} onPress={onClose}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.header}>
              <Text style={s.title}>{title}</Text>
              <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                <Icon name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            {content}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
