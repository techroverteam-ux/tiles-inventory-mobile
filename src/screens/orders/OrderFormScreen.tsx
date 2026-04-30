import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { spacing, typography } from '../../theme'

interface OrderFormScreenProps {
  navigation: any
  route?: any
}

export const OrderFormScreen: React.FC<OrderFormScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryDate: '',
    notes: '',
  })

  const handleSubmit = async () => {
    if (!formData.customerName.trim()) {
      showError('Error', 'Customer name is required')
      return
    }

    setLoading(true)
    try {
      // TODO: Implement order creation logic
      showSuccess('Success', 'Order created successfully')
      navigation.goBack()
    } catch (error) {
      showError('Error', 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    formCard: {
      marginBottom: spacing.base,
    },
    formTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.base,
    },
    formActions: {
      flexDirection: 'row',
      gap: spacing.base,
      marginTop: spacing.lg,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="New Order"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard} padding="lg">
          <Text style={styles.formTitle}>Order Information</Text>
          
          <TextInput
            label="Customer Name"
            value={formData.customerName}
            onChangeText={(text) => setFormData({ ...formData, customerName: text })}
            placeholder="Enter customer name"
            required
          />
          
          <TextInput
            label="Customer Email"
            value={formData.customerEmail}
            onChangeText={(text) => setFormData({ ...formData, customerEmail: text })}
            placeholder="Enter customer email"
            keyboardType="email-address"
          />
          
          <TextInput
            label="Customer Phone"
            value={formData.customerPhone}
            onChangeText={(text) => setFormData({ ...formData, customerPhone: text })}
            placeholder="Enter customer phone"
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Delivery Date"
            value={formData.deliveryDate}
            onChangeText={(text) => setFormData({ ...formData, deliveryDate: text })}
            placeholder="Enter delivery date"
          />
          
          <TextInput
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Enter order notes (optional)"
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.formActions}>
            <LoadingButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={{ flex: 1 }}
            />
            <LoadingButton
              title="Create Order"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}