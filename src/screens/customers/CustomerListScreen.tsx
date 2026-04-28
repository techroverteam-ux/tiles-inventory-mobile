import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { LoadingSpinner } from '../../components/loading'
import { spacing, typography, borderRadius } from '../../theme'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  totalOrders: number
  totalAmount: number
  lastOrderDate?: string
  createdAt: string
}

export const CustomerListScreen: React.FC = () => {
  const { theme } = useTheme()
  const { showToast } = useToast()
  const navigation = useNavigation<any>()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.surface,
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.base,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing.base,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: theme.text,
      paddingVertical: spacing.sm,
      marginLeft: spacing.sm,
    },
    listContainer: {
      flex: 1,
    },
    customerCard: {
      backgroundColor: theme.surface,
      marginHorizontal: spacing.base,
      marginVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.base,
    },
    customerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    customerInfo: {
      flex: 1,
    },
    customerName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    customerContact: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
    },
    customerStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    statLabel: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
    actionButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: theme.primary + '20',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.lg,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.base,
    },
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchQuery])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const { customerService } = await import('../../services/api/ApiServices')
      const response = await customerService.getCustomers()
      setCustomers((response.customers || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        totalOrders: c.totalOrders || 0,
        totalAmount: c.totalAmount || 0,
        lastOrderDate: c.lastOrderDate,
        createdAt: c.createdAt || new Date().toISOString(),
      })))
    } catch (error) {
      showToast('Failed to load customers', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      )
      setFilteredCustomers(filtered)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCustomers()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.customerCard} onPress={() => (navigation as any).navigate('CustomerDetail', { customerId: item.id })}>
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          {item.email && (
            <Text style={styles.customerContact}>{item.email}</Text>
          )}
          {item.phone && (
            <Text style={styles.customerContact}>{item.phone}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="more-vert" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.customerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(item.totalAmount)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {item.lastOrderDate ? formatDate(item.lastOrderDate) : 'Never'}
          </Text>
          <Text style={styles.statLabel}>Last Order</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <View style={styles.container}>
      <MainHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity
          onPress={() => {
            const { exportToExcel } = require('../../utils/exportUtils')
            exportToExcel({
              data: customers,
              columns: [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Address' },
                { key: 'createdAt', label: 'Created', format: (v: string) => v ? new Date(v).toLocaleDateString() : '' },
              ],
              filename: 'customers_export',
              reportTitle: 'Customers Report',
            })
          }}
          style={{ padding: 8, backgroundColor: theme.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
        >
          <Icon name="file-download" size={20} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('CustomerForm')}
          style={{ padding: 8, backgroundColor: theme.primary, borderRadius: 8 }}
        >
          <Icon name="add" size={20} color={theme.primaryForeground} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.listContainer}>
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="people" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No customers found matching your search.' : 'No customers yet.\nCustomers will appear here when orders are created.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCustomers}
            renderItem={renderCustomer}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}