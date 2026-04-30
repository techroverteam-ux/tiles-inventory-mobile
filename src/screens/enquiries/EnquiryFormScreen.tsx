import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Card } from '../../components/common/Card'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { enquiryService, EnquiryRequest } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'

interface EnquiryFormRouteProp {
  productId?: string
  productName?: string
}

export const EnquiryFormScreen: React.FC = () => {
  const { theme } = useTheme()
  const { showToast, showSuccess } = useToast()
  const navigation = useNavigation()
  const route = useRoute<RouteProp<{ params: EnquiryFormRouteProp }, 'params'>>()
  const { productId, productName } = route.params || {}

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: spacing.base,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.base,
      textAlign: 'center',
    },
    productInfo: {
      backgroundColor: theme.primary + '10',
      padding: spacing.base,
      borderRadius: 8,
      marginBottom: spacing.lg,
    },
    productName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.primary,
      textAlign: 'center',
    },
    formCard: {
      marginBottom: spacing.base,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.base,
      marginTop: spacing.lg,
    },
    cancelButton: {
      flex: 1,
    },
    submitButton: {
      flex: 1,
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = 'Invalid phone format'

    if (formData.quantity && isNaN(parseInt(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors and try again', 'error')
      return
    }

    if (!productId) {
      showToast('Product information is missing', 'error')
      return
    }

    setSubmitting(true)
    try {
      const enquiryData: EnquiryRequest = {
        productId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        message: formData.message.trim() || undefined,
      }

      await enquiryService.submitEnquiry(enquiryData)

      showSuccess('Enquiry Submitted', 'Your enquiry has been submitted successfully. We will contact you soon.')
      navigation.goBack()
    } catch (error) {
      showToast('Failed to submit enquiry', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Product Enquiry</Text>

        {productName && (
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
          </View>
        )}

        <Card style={styles.formCard} padding="lg">
          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Enter your full name"
            required
            error={errors.name}
          />

          <TextInput
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            required
            error={errors.email}
          />

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            required
            error={errors.phone}
          />

          <TextInput
            label="Quantity (Optional)"
            value={formData.quantity}
            onChangeText={(value) => updateFormData('quantity', value)}
            placeholder="Enter required quantity"
            keyboardType="number-pad"
            error={errors.quantity}
          />

          <TextInput
            label="Message (Optional)"
            value={formData.message}
            onChangeText={(value) => updateFormData('message', value)}
            placeholder="Enter any additional details or questions"
            multiline
            numberOfLines={4}
          />

          <View style={styles.actionButtons}>
            <LoadingButton
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
              disabled={submitting}
            />
            <LoadingButton
              title="Submit Enquiry"
              onPress={handleSubmit}
              variant="primary"
              loading={submitting}
              style={styles.submitButton}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  )
}