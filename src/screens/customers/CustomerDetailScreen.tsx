import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingSpinner } from '../../components/loading'
import { spacing, typography, borderRadius } from '../../theme'

interface CustomerDetailScreenProps {
  route: any
  navigation: any
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  gstin?: string
  totalOrders?: number
  totalOrderValue?: number
  createdAt?: string
}

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const { customerId } = route.params || {}
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCustomerDetails()
  }, [customerId])

  const loadCustomerDetails = async () => {
    if (!customerId) {
      Alert.alert('Error', 'Customer ID is missing')
      navigation.goBack()
      return
    }

    try {
      // Mock data for now - in production, call customerService.getCustomer(customerId)
      setCustomer({
        id: customerId,
        name: 'Customer Name',
        email: 'customer@example.com',
        phone: '+91-XXXXXXXXXX',
        address: '123 Main Street',
        city: 'City Name',
        state: 'State',
        country: 'India',
        pincode: '123456',
        gstin: 'XX XXXXXXXXXXXXXXX',
        totalOrders: 5,
        totalOrderValue: 50000,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to load customer details:', error)
      showToast('Failed to load customer details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCustomerDetails()
    setRefreshing(false)
  }

  const handleContactCustomer = (type: 'email' | 'phone') => {
    if (type === 'email' && customer?.email) {
      showToast('Email feature coming soon', 'info')
    } else if (type === 'phone' && customer?.phone) {
      showToast('Phone feature coming soon', 'info')
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: spacing.base,
    },
    profileSection: {
      backgroundColor: theme.primary + '10',
      borderRadius: borderRadius.base,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.primary + '30',
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.base,
    },
    avatarText: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: '#fff',
    },
    customerName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      textAlign: 'center',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.base,
      marginTop: spacing.base,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginBottom: spacing.base,
      borderWidth: 1,
      borderColor: theme.border,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      flex: 1,
    },
    value: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      flex: 1,
      textAlign: 'right',
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: theme.primary,
      borderRadius: borderRadius.base,
      marginBottom: spacing.base,
    },
    contactButtonText: {
      color: '#fff',
      fontWeight: typography.fontWeight.semibold,
      marginLeft: spacing.sm,
      flex: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: spacing.base,
      marginBottom: spacing.lg,
    },
    statBox: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    statValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.primary,
    },
    statLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    addressSection: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      borderWidth: 1,
      borderColor: theme.border,
    },
    addressText: {
      fontSize: typography.fontSize.base,
      color: theme.text,
      lineHeight: 20,
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Customer Details" onBack={() => navigation.goBack()} />
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Customer Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text }}>Customer not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const fullAddress = [
    customer.address,
    customer.city,
    customer.state,
    customer.country,
    customer.pincode
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <SafeAreaView style={styles.container}>
      <Header title={customer.name} onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{customer.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{(customer.totalOrderValue || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {customer.email && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactCustomer('email')}
            >
              <Icon name="email" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>{customer.email}</Text>
            </TouchableOpacity>
          )}
          {customer.phone && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactCustomer('phone')}
            >
              <Icon name="phone" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>{customer.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address Information */}
        {fullAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressSection}>
              <Text style={styles.addressText}>{fullAddress}</Text>
            </View>
          </View>
        )}

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <Card>
            {customer.gstin && (
              <View style={styles.row}>
                <Text style={styles.label}>GSTIN</Text>
                <Text style={styles.value}>{customer.gstin}</Text>
              </View>
            )}
            {customer.createdAt && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Customer Since</Text>
                <Text style={styles.value}>
                  {new Date(customer.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
