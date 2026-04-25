import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingSpinner } from '../../components/loading'
import { apiClient } from '../../services/api/ApiClient'
import { spacing, typography, borderRadius } from '../../theme'

interface ReportsScreenProps {
  navigation: any
}

interface DesignStockItem {
  productCode: string
  productName: string
  imageUrl?: string
  size: string
  category: string
  finish: string
  quantity: number
  batchNumber: string
  location: string
}

interface BrandReport {
  brandName: string
  items: DesignStockItem[]
}

interface DesignStockReport {
  brands: BrandReport[]
  grandTotal: number
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { showSuccess, showError, showInfo } = useToast()
  const [activeReport, setActiveReport] = useState<'overview' | 'design-stock'>('overview')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [designStockData, setDesignStockData] = useState<DesignStockReport | null>(null)

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
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderRadius: borderRadius.base,
      padding: spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: theme.primary,
    },
    tabText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.textSecondary,
    },
    activeTabText: {
      color: theme.textInverse,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    overviewCard: {
      marginBottom: spacing.base,
    },
    overviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    overviewIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.base,
    },
    overviewTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    overviewDescription: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      marginBottom: spacing.base,
    },
    generateButton: {
      backgroundColor: theme.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.base,
      alignItems: 'center',
    },
    generateButtonText: {
      color: theme.textInverse,
      fontWeight: typography.fontWeight.semibold,
    },
    summaryCard: {
      backgroundColor: theme.primary + '10',
      marginBottom: spacing.base,
    },
    summaryText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.primary,
      textAlign: 'center',
    },
    brandCard: {
      marginBottom: spacing.base,
    },
    brandHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    brandName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
    },
    brandTotal: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.primary,
    },
    itemRow: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemCode: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text,
    },
    itemName: {
      flex: 2,
      fontSize: typography.fontSize.sm,
      color: theme.text,
    },
    itemQuantity: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.primary,
      textAlign: 'right',
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
    if (activeReport === 'design-stock') {
      loadDesignStockReport()
    }
  }, [activeReport])

  const loadDesignStockReport = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<DesignStockReport>('/reports/design-stock')
      setDesignStockData(response.data)
    } catch (error) {
      showError('Failed to load design stock report')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (activeReport === 'design-stock') {
      setRefreshing(true)
      await loadDesignStockReport()
      setRefreshing(false)
    }
  }

  const renderOverviewReports = () => {
    const reports = [
      {
        id: 'inventory',
        title: 'Inventory Report',
        description: 'Complete inventory status with stock levels',
        icon: 'inventory',
      },
      {
        id: 'sales',
        title: 'Sales Report',
        description: 'Sales performance and order analytics',
        icon: 'trending-up',
      },
      {
        id: 'purchase',
        title: 'Purchase Report',
        description: 'Purchase order history and supplier analytics',
        icon: 'shopping-cart',
      },
      {
        id: 'low-stock',
        title: 'Low Stock Alert',
        description: 'Products running low on inventory',
        icon: 'warning',
      },
    ]

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
          />
        }
      >
        {reports.map((report) => (
          <Card key={report.id} style={styles.overviewCard} padding="lg">
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIcon}>
                <Icon name={report.icon} size={20} color={theme.primary} />
              </View>
              <Text style={styles.overviewTitle}>{report.title}</Text>
            </View>
            <Text style={styles.overviewDescription}>{report.description}</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => showInfo(`${report.title} - Coming Soon`)}
            >
              <Text style={styles.generateButtonText}>Generate Report</Text>
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    )
  }

  const renderBrandReport = ({ item }: { item: BrandReport }) => {
    const brandTotal = item.items.reduce((sum, product) => sum + product.quantity, 0)

    return (
      <Card style={styles.brandCard} padding="lg">
        <View style={styles.brandHeader}>
          <Text style={styles.brandName}>{item.brandName}</Text>
          <Text style={styles.brandTotal}>{brandTotal} units</Text>
        </View>
        
        {item.items.map((product, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemCode}>{product.productCode}</Text>
            <Text style={styles.itemName}>{product.productName}</Text>
            <Text style={styles.itemQuantity}>{product.quantity}</Text>
          </View>
        ))}
      </Card>
    )
  }

  const renderDesignStockReport = () => {
    if (loading) {
      return <LoadingSpinner />
    }

    if (!designStockData || designStockData.brands.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="assessment" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyText}>
            No design stock data available.
          </Text>
        </View>
      )
    }

    return (
      <>
        <Card style={styles.summaryCard} padding="lg">
          <Text style={styles.summaryText}>
            Total Stock: {designStockData.grandTotal} units
          </Text>
        </Card>
        
        <FlatList
          data={designStockData.brands}
          renderItem={renderBrandReport}
          keyExtractor={(item) => item.brandName}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
            />
          }
        />
      </>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Reports"
        showBack
        navigation={navigation}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {/* Theme Toggle */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={18} color={theme.text} />
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={isDark ? theme.primary : theme.textSecondary}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
            
            {/* Export Button */}
            <TouchableOpacity onPress={() => showSuccess('Export feature coming soon!')}>
              <Icon name="download" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeReport === 'overview' && styles.activeTab,
            ]}
            onPress={() => setActiveReport('overview')}
          >
            <Text
              style={[
                styles.tabText,
                activeReport === 'overview' && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeReport === 'design-stock' && styles.activeTab,
            ]}
            onPress={() => setActiveReport('design-stock')}
          >
            <Text
              style={[
                styles.tabText,
                activeReport === 'design-stock' && styles.activeTabText,
              ]}
            >
              Design Stock
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {activeReport === 'overview'
          ? renderOverviewReports()
          : renderDesignStockReport()}
      </View>
    </SafeAreaView>
  )
}