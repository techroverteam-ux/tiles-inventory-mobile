import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { apiClient } from '../../services/api/ApiClient'
import { spacing, typography } from '../../theme'

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const { user } = useSession()
  const { showError, showSuccess } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { showError('Validation', 'Name is required'); return }
    setLoading(true)
    try {
      await apiClient.put('/auth/profile', { name })
      showSuccess('Success', 'Profile updated')
    } catch {
      showError('Error', 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: spacing.base },
    avatarContainer: { alignItems: 'center', paddingVertical: spacing.xl },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 32, fontWeight: typography.fontWeight.bold, color: theme.textInverse },
    userName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: theme.text, marginTop: spacing.base },
    userRole: { fontSize: typography.fontSize.sm, color: theme.textSecondary, marginTop: spacing.xs },
    label: { fontSize: typography.fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, marginTop: spacing.base },
    readOnly: { fontSize: typography.fontSize.sm, color: theme.textSecondary, paddingVertical: spacing.sm },
  })

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile" showBack navigation={navigation} />
      <ScrollView style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userRole}>{user?.role || 'User'}</Text>
        </View>

        <Card>
          <Text style={styles.label}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.readOnly}>{email}</Text>
          <View style={{ marginTop: spacing.base }}>
            <LoadingButton title="Save Changes" onPress={handleSave} loading={loading} variant="primary" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}
