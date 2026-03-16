import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../context/ToastContext'
import { TextInput } from '../../components/common/TextInput'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Card } from '../../components/common/Card'
import { spacing, typography } from '../../theme'

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme()
  const { login } = useSession()
  const { showError, showSuccess } = useToast()
  
  const [email, setEmail] = useState('admin@tiles.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError('Validation Error', 'Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const success = await login(email.trim(), password)
      if (!success) {
        showError('Login Failed', 'Invalid email or password')
      } else {
        showSuccess('Login Successful', 'Welcome back!')
      }
    } catch (error) {
      showError('Error', 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      minHeight: '100%',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      paddingTop: spacing.lg,
    },
    logo: {
      width: 180,
      height: 140,
      marginBottom: spacing.sm,
    },
    logoPlaceholder: {
      width: 80,
      height: 80,
      backgroundColor: theme.primary,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.base,
    },
    logoText: {
      color: theme.textInverse,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    formCard: {
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    form: {
      gap: spacing.lg,
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.base,
    },
    rememberMeText: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginLeft: spacing.sm,
    },
    loginButton: {
      marginTop: spacing.base,
    },
    forgotPassword: {
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    forgotPasswordText: {
      fontSize: typography.fontSize.sm,
      color: theme.primary,
      textDecorationLine: 'underline',
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing['2xl'],
      paddingBottom: spacing.base,
    },
    footerText: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  })

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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/hot-logo-cropped.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
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

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                showPasswordToggle
                leftIcon="lock"
                required
              />

              <LoadingButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                size="large"
                fullWidth
                style={styles.loginButton}
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure & Reliable{'\n'}
              Version 1.0.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}