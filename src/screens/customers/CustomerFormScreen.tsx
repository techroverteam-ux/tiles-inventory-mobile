import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { customerService } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'

export const CustomerFormScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const { showError, showSuccess } = useToast()
  const customer = route?.params?.customer
  const [name, setName] = useState(customer?.name || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [address, setAddress] = useState(customer?.address || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) { showError('Validation', 'Name is required'); return }
    setLoading(true)
    try {
      if (customer?.id) {
        await customerService.updateCustomer(customer.id, { name, email, phone, address })
        showSuccess('Success', 'Customer updated')
      } else {
        await customerService.createCustomer({ name, email, phone, address })
        showSuccess('Success', 'Customer created')
      }
      navigation.goBack()
    } catch {
      showError('Error', 'Failed to save customer')
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: spacing.base },
    label: { fontSize: typography.fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, marginTop: spacing.base },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header title={customer ? 'Edit Customer' : 'New Customer'} showBack navigation={navigation} />
      <ScrollView style={styles.content}>
        <Text style={styles.label}>Name *</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Customer name" />
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" />
        <Text style={styles.label}>Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
        <Text style={styles.label}>Address</Text>
        <TextInput value={address} onChangeText={setAddress} placeholder="Address" multiline />
        <View style={{ marginTop: spacing.xl }}>
          <LoadingButton title={customer ? 'Update Customer' : 'Create Customer'} onPress={handleSubmit} loading={loading} variant="primary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
