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
import { LoadingButton } from '../../components/common/LoadingButton'
import { LoadingSpinner } from '../../components/loading'
import { purchaseOrderService, salesOrderService } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'

interface OrderDetailScreenProps {
  route: any
  navigation: any
}

export const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ route, navigation }) => {
  const { theme, isDark } = useTheme()
  const { showToast } = useToast()
  const { orderId, orderType = 'purchase' } = route.params || {}
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrderDetails()
  }, [orderId])

  const loadOrderDetails = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID is missing')
      navigation.goBack()
      return
    }

    try {
      const response = orderType === 'purchase'
        ? await purchaseOrderService.getPurchaseOrder(orderId)
        : await salesOrderService.getSalesOrder(orderId)
      setOrder(response)
    } catch (error) {
      console.error('Failed to load order details:', error)
      showToast('Failed to load order details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrderDetails()
    setRefreshing(false)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Change order status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setUpdating(true)
            try {
              const service = orderType === 'purchase' ? purchaseOrderService : salesOrderService
              await service.updateStatus(orderId, newStatus as any)
              showToast('Status updated successfully', 'success')
              await loadOrderDetails()
            } catch (error) {
              console.error('Failed to update status:', error)
              showToast('Failed to update status', 'error')
            } finally {
              setUpdating(false)
            }
          },
        },
      ]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return theme.warning
      case 'confirmed':
        return theme.info
      case 'delivered':
      case 'shipped':
        return theme.success
      case 'cancelled':
        return theme.error
      default:
        return theme.textSecondary
    }
  }

  const getNextStatuses = (currentStatus: string) => {
    const statusMap: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['delivered', 'cancelled'],
      delivered: [],
      shipped: ['delivered'],
      cancelled: [],
    }
    return statusMap[currentStatus?.toLowerCase()] || []
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: spacing.base,
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
    },
    statusBadge: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: '#fff',
      textTransform: 'uppercase',
    },
    itemsSection: {
      marginTop: spacing.base,
    },
    itemCard: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginBottom: spacing.base,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.border,
    },
    itemName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    itemDetail: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
    },
    actionButtons: {
      marginTop: spacing.lg,
      gap: spacing.base,
    },
    button: {
      backgroundColor: theme.primary,
      padding: spacing.base,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    buttonText: {
      color: '#fff',
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.base,
    },
    notesSection: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      borderWidth: 1,
      borderColor: theme.border,
    },
    notesText: {
      color: theme.text,
      fontSize: typography.fontSize.base,
      lineHeight: 20,
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Order Details" onBack={() => navigation.goBack()} />
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Order Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text }}>Order not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const nextStatuses = getNextStatuses(order.status)

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`Order #${order.orderNumber}`} onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <Card>
            <View style={styles.row}>
              <Text style={styles.label}>Order Number</Text>
              <Text style={styles.value}>{order.orderNumber}</Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.label}>
                {orderType === 'purchase' ? 'Brand' : 'Customer'}
              </Text>
              <Text style={styles.value}>
                {orderType === 'purchase'
                  ? (order.brand?.name || order.supplierName || 'N/A')
                  : (order.customerName || 'N/A')}
              </Text>
            </View>
          </Card>
        </View>

        {/* Date Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <Card>
            <View style={styles.row}>
              <Text style={styles.label}>Order Date</Text>
              <Text style={styles.value}>
                {new Date(order.orderDate).toLocaleDateString()}
              </Text>
            </View>
            {order.expectedDelivery && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Expected Delivery</Text>
                <Text style={styles.value}>
                  {new Date(order.expectedDelivery).toLocaleDateString()}
                </Text>
              </View>
            )}
            {!order.expectedDelivery && (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={styles.label}>Expected Delivery</Text>
                <Text style={styles.value}>Not specified</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Amount Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <Card>
            {orderType === 'sales' && order.discount && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Subtotal</Text>
                  <Text style={styles.value}>₹{(order.totalAmount + order.discount).toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Discount</Text>
                  <Text style={[styles.value, { color: theme.success }]}>-₹{order.discount.toFixed(2)}</Text>
                </View>
              </>
            )}
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.label}>Total Amount</Text>
              <Text style={[styles.value, { fontSize: typography.fontSize.lg }]}>
                ₹{order.totalAmount.toFixed(2)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.itemCard}>
                <Text style={styles.itemName}>{item.productName || item.name}</Text>
                <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemDetail}>
                  Unit Price: ₹{item.unitPrice?.toFixed(2) || item.price?.toFixed(2)}
                </Text>
                <Text style={styles.itemDetail}>
                  Total: ₹{(item.quantity * (item.unitPrice || item.price)).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesSection}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Status Update Actions */}
        {nextStatuses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.actionButtons}>
              {nextStatuses.map((status: string) => (
                <LoadingButton
                  key={status}
                  title={`Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  loading={updating}
                  onPress={() => handleStatusUpdate(status)}
                  style={{
                    backgroundColor: getStatusColor(status),
                    padding: spacing.base,
                    borderRadius: borderRadius.base,
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
