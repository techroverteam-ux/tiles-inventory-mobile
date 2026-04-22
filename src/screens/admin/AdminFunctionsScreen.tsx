import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Header } from '../../components/navigation/Header'
import { apiClient } from '../../services/api/ApiClient'
import { spacing, typography, borderRadius } from '../../theme'

interface AdminFunctionsScreenProps {
  navigation?: any
}

export const AdminFunctionsScreen: React.FC<AdminFunctionsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [dangerLoading, setDangerLoading] = useState(false)

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
    warningCard: {
      backgroundColor: theme.warning + '10',
      borderColor: theme.warning,
      borderWidth: 1,
      marginBottom: spacing.lg,
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    warningTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.warning,
      marginLeft: spacing.sm,
    },
    warningText: {
      fontSize: typography.fontSize.base,
      color: theme.text,
      lineHeight: 22,
    },
    functionCard: {
      marginBottom: spacing.base,
    },
    functionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    functionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.base,
    },
    cleanupIcon: {
      backgroundColor: theme.info + '20',
    },
    dangerIcon: {
      backgroundColor: theme.error + '20',
    },
    functionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    functionDescription: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: spacing.base,
    },
    dangerDescription: {
      color: theme.error,
    },
    functionButton: {
      marginTop: spacing.sm,
    },
    cleanupButton: {
      backgroundColor: theme.info,
    },
    dangerButton: {
      backgroundColor: theme.error,
    },
  })

  const handleCleanup = () => {
    Alert.alert(
      'Cleanup Confirmation',
      'This will permanently delete all soft-deleted records (items with _del_ in their names). This action cannot be undone.\n\nAre you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: performCleanup,
        },
      ]
    )
  }

  const performCleanup = async () => {
    setCleanupLoading(true)
    try {
      const response = await apiClient.post('/admin/cleanup')
      
      Alert.alert(
        'Cleanup Complete',
        `Successfully cleaned up:\n• ${response.deleted.brands} brands\n• ${response.deleted.categories} categories\n• ${response.deleted.sizes} sizes\n• ${response.deleted.products} products`,
        [{ text: 'OK' }]
      )
      
      showToast('Cleanup completed successfully', 'success')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Cleanup failed'
      showToast(message, 'error')
    } finally {
      setCleanupLoading(false)
    }
  }

  const handleDangerOperation = () => {
    Alert.alert(
      '⚠️ DANGER ZONE ⚠️',
      'This is a dangerous operation that could affect your entire database. Only proceed if you know exactly what you are doing.\n\nThis action is IRREVERSIBLE!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand',
          style: 'destructive',
          onPress: confirmDangerOperation,
        },
      ]
    )
  }

  const confirmDangerOperation = () => {
    Alert.alert(
      'Final Confirmation',
      'Are you absolutely sure? This will perform a dangerous database operation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute',
          style: 'destructive',
          onPress: performDangerOperation,
        },
      ]
    )
  }

  const performDangerOperation = async () => {
    setDangerLoading(true)
    try {
      const response = await apiClient.post('/admin/danger')
      
      Alert.alert(
        'Operation Complete',
        response.message || 'Danger operation completed',
        [{ text: 'OK' }]
      )
      
      showToast('Danger operation completed', 'success')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Operation failed'
      showToast(message, 'error')
    } finally {
      setDangerLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Admin Functions" 
        showBack={true}
        navigation={navigation}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        <Card style={styles.warningCard} padding="lg">
          <View style={styles.warningHeader}>
            <Icon name="warning" size={24} color={theme.warning} />
            <Text style={styles.warningTitle}>Important Notice</Text>
          </View>
          <Text style={styles.warningText}>
            These are administrative functions that can permanently modify or delete data. 
            Please ensure you have proper backups and understand the consequences before proceeding.
          </Text>
        </Card>

        {/* Cleanup Function */}
        <Card style={styles.functionCard} padding="lg">
          <View style={styles.functionHeader}>
            <View style={[styles.functionIcon, styles.cleanupIcon]}>
              <Icon name="cleaning-services" size={20} color={theme.info} />
            </View>
            <Text style={styles.functionTitle}>Database Cleanup</Text>
          </View>
          
          <Text style={styles.functionDescription}>
            Permanently delete all soft-deleted records from the database. This includes brands, 
            categories, sizes, and products that have been marked for deletion (contain "_del_" in their names).
          </Text>
          
          <LoadingButton
            title="Run Cleanup"
            onPress={handleCleanup}
            loading={cleanupLoading}
            variant="primary"
            style={[styles.functionButton, styles.cleanupButton]}
            disabled={dangerLoading}
          />
        </Card>

        {/* Danger Operation */}
        <Card style={styles.functionCard} padding="lg">
          <View style={styles.functionHeader}>
            <View style={[styles.functionIcon, styles.dangerIcon]}>
              <Icon name="dangerous" size={20} color={theme.error} />
            </View>
            <Text style={styles.functionTitle}>Danger Zone</Text>
          </View>
          
          <Text style={[styles.functionDescription, styles.dangerDescription]}>
            ⚠️ CRITICAL OPERATION ⚠️
            {'\n'}This performs dangerous database operations that could affect your entire system. 
            Only use this if you are absolutely certain about what you are doing.
          </Text>
          
          <LoadingButton
            title="Execute Danger Operation"
            onPress={handleDangerOperation}
            loading={dangerLoading}
            variant="primary"
            style={[styles.functionButton, styles.dangerButton]}
            disabled={cleanupLoading}
          />
        </Card>
      </ScrollView>
    </View>
  )
}