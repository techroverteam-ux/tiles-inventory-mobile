import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'
import { spacing, typography } from '../theme'

interface PlaceholderScreenProps {
  title: string
  description?: string
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ 
  title, 
  description = 'This screen is under development.' 
}) => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.base,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    description: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </SafeAreaView>
  )
}

// Export specific placeholder screens
export const DashboardScreen: React.FC = () => (
  <PlaceholderScreen 
    title="Dashboard" 
    description="Welcome to Tiles Inventory Mobile App!" 
  />
)

export const InventoryListScreen: React.FC = () => (
  <PlaceholderScreen title="Inventory" />
)

export const InventoryDetailScreen: React.FC = () => (
  <PlaceholderScreen title="Inventory Details" />
)

export const StockUpdateScreen: React.FC = () => (
  <PlaceholderScreen title="Stock Update" />
)

export const OrderListScreen: React.FC = () => (
  <PlaceholderScreen title="Orders" />
)

export const OrderDetailScreen: React.FC = () => (
  <PlaceholderScreen title="Order Details" />
)

export const CustomerListScreen: React.FC = () => (
  <PlaceholderScreen title="Customers" />
)

export const CustomerDetailScreen: React.FC = () => (
  <PlaceholderScreen title="Customer Details" />
)

export const CustomerFormScreen: React.FC = () => (
  <PlaceholderScreen title="Customer Form" />
)

export const ProductFormScreen: React.FC = () => (
  <PlaceholderScreen title="Product Form" />
)

export const OrderFormScreen: React.FC = () => (
  <PlaceholderScreen title="Order Form" />
)

export const ReportsScreen: React.FC = () => (
  <PlaceholderScreen title="Reports" />
)

export const SettingsScreen: React.FC = () => (
  <PlaceholderScreen title="Settings" />
)

export const ProfileScreen: React.FC = () => (
  <PlaceholderScreen title="Profile" />
)

export const ThemeSettingsScreen: React.FC = () => (
  <PlaceholderScreen title="Theme Settings" />
)

export const AboutScreen: React.FC = () => (
  <PlaceholderScreen title="About" />
)

export const NotificationsScreen: React.FC = () => (
  <PlaceholderScreen title="Notifications" />
)