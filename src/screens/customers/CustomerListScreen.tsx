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
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
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
      // Mock data - replace with actual API call
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St, City',
          totalOrders: 5,
          totalAmount: 15000,
          lastOrderDate: '2024-01-15',
          createdAt: '2023-12-01',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567891',
          totalOrders: 3,
          totalAmount: 8500,
          lastOrderDate: '2024-01-10',
          createdAt: '2023-11-15',
        },
      ]
      setCustomers(mockCustomers)
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
    <TouchableOpacity style={styles.customerCard}>
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
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
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