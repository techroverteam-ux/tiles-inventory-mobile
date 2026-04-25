import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Card } from '../../components/common/Card'
import { authService } from '../../services/api/ApiServices'
import { spacing, typography } from '../../theme'

export const ForgotPasswordScreen: React.FC = () => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const navigation = useNavigation()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address', 'warning')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'warning')
      return
    }

    setLoading(true)
    try {
      const response = await authService.forgotPassword(email)
      if (response.success) {
        setEmailSent(true)
        showToast('Password reset link sent to your email', 'success')
      } else {
        showToast(response.message || 'Failed to send reset email', 'error')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      showToast('Failed to send reset email. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigation.goBack()
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.base,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing['4xl'],
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: 0,
      padding: spacing.sm,
    },
    iconContainer: {
      width: 80,
      height: 80,
      backgroundColor: theme.primary,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    },
    formCard: {
      marginTop: spacing.xl,
    },
    form: {
      gap: spacing.base,
    },
    resetButton: {
      marginTop: spacing.base,
    },
    successContainer: {
      alignItems: 'center',
      padding: spacing.lg,
    },
    successIcon: {
      width: 60,
      height: 60,
      backgroundColor: theme.success,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    successTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    successMessage: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
      marginBottom: spacing.xl,
    },
    backToLoginButton: {
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    backToLoginText: {
      fontSize: typography.fontSize.base,
      color: theme.primary,
      fontWeight: typography.fontWeight.medium,
    },
  })

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.formCard}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name="check" size={30} color={theme.textInverse} />
              </View>
              
              <Text style={styles.successTitle}>Email Sent!</Text>
              
              <Text style={styles.successMessage}>
                We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
              </Text>
              
              <LoadingButton
                title="Back to Login"
                onPress={handleBackToLogin}
                variant="primary"
                size="large"
                fullWidth
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Icon name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Icon name="lock-reset" size={40} color={theme.textInverse} />
            </View>
            
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <Card style={styles.formCard} padding="lg">
            <View style={styles.form}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="email"
                required
              />

              <LoadingButton
                title="Send Reset Link"
                onPress={handleResetPassword}
                loading={loading}
                variant="primary"
                size="large"
                fullWidth
                style={styles.resetButton}
              />
            </View>
          </Card>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backToLoginText}>
              Remember your password? Sign In
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
