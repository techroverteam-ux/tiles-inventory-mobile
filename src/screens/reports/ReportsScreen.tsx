import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { Card } from '../../components/common/Card'
import { LoadingSpinner } from '../../components/loading'
import { apiClient } from '../../services/api/ApiClient'
import { getCommonStyles } from '../../theme/commonStyles'
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
  const { theme } = useTheme()
  const { showError, showInfo } = useToast()
  const [activeReport, setActiveReport] = useState<'standard' | 'design-stock'>('standard')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [designStockData, setDesignStockData] = useState<DesignStockReport | null>(null)
  const commonStyles = getCommonStyles(theme)

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
      // showError('Failed to load design stock report')
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerArea: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    screenTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    screenSubtitle: {
      fontSize: 14,
      color: theme.mutedForeground,
      marginBottom: 16,
    },
    filterBtnFull: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    filterBtnFullText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 14,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 20,
      gap: 12,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderWidth: 1,
      borderColor: theme.border,
    },
    activeTab: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.mutedForeground,
    },
    activeTabText: {
      color: theme.primaryForeground,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    reportCard: {
      padding: 0,
      borderRadius: 24,
      overflow: 'hidden',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    exportBtnText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.mutedForeground,
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyIconWrap: {
      marginBottom: 20,
      opacity: 0.2,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.mutedForeground,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: '80%',
    },
    fab: {
      position: 'absolute',
      right: spacing.base,
      bottom: spacing.base,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    // Design Stock Styles
    brandCard: {
      marginBottom: 16,
    },
    brandHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    brandName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    brandTotal: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: 'bold',
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemCode: {
      flex: 1,
      fontSize: 12,
      color: theme.mutedForeground,
    },
    itemName: {
      flex: 2,
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    itemQuantity: {
      width: 40,
      textAlign: 'right',
      fontSize: 14,
      color: theme.text,
      fontWeight: 'bold',
    },
    summaryCard: {
      marginBottom: 16,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: theme.primary,
    },
    summaryText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
      textAlign: 'center',
    },
  })

  const renderStandardReports = () => {
    return (
      <Card style={[commonStyles.glassCard, styles.reportCard]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIconBox}>
              <Icon name="bar-chart" size={20} color="#60a5fa" />
            </View>
            <Text style={styles.cardTitle}>Sales Report</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn}>
            <Icon name="file-download" size={14} color={theme.mutedForeground} />
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconWrap}>
            <Icon name="pie-chart" size={64} color={theme.text} />
          </View>
          <Text style={styles.emptyTitle}>No Data to Display</Text>
          <Text style={styles.emptySubtitle}>
            Configure your filters and click 'Generate Report'.
          </Text>
        </View>
      </Card>
    )
  }

  const renderBrandReport = ({ item }: { item: BrandReport }) => {
    const brandTotal = item.items.reduce((sum, product) => sum + product.quantity, 0)
    return (
      <Card style={[commonStyles.glassCard, styles.brandCard]} padding="lg">
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
    if (loading) return <LoadingSpinner />
    if (!designStockData || designStockData.brands.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconWrap}>
            <Icon name="assessment" size={64} color={theme.text} />
          </View>
          <Text style={styles.emptyTitle}>No Data to Display</Text>
          <Text style={styles.emptySubtitle}>
            No design stock data is available for the selected filters.
          </Text>
        </View>
      )
    }

    return (
      <FlatList
        data={designStockData.brands}
        renderItem={renderBrandReport}
        keyExtractor={(item) => item.brandName}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <Card style={[commonStyles.glassCard, styles.summaryCard]} padding="lg">
            <Text style={styles.summaryText}>
              Total Stock: {designStockData.grandTotal} units
            </Text>
          </Card>
        }
      />
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <MainHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.headerArea}>
          <Text style={styles.screenTitle}>Analytics & Reports</Text>
          <Text style={styles.screenSubtitle}>
            <Icon name="trending-up" size={14} color={theme.primary} style={{ marginRight: 4 }} /> Generate insights and export data for your business
          </Text>
          <TouchableOpacity style={styles.filterBtnFull}>
            <Icon name="filter-alt" size={16} color={theme.text} />
            <Text style={styles.filterBtnFullText}>Show Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeReport === 'standard' && styles.activeTab]}
            onPress={() => setActiveReport('standard')}
          >
            <Icon 
              name="bar-chart" 
              size={18} 
              color={activeReport === 'standard' ? theme.primaryForeground : theme.mutedForeground} 
            />
            <Text style={[styles.tabText, activeReport === 'standard' && styles.activeTabText]}>
              Standard Reports
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeReport === 'design-stock' && styles.activeTab]}
            onPress={() => setActiveReport('design-stock')}
          >
            <Icon 
              name="grid-view" 
              size={18} 
              color={activeReport === 'design-stock' ? theme.primaryForeground : theme.mutedForeground} 
            />
            <Text style={[styles.tabText, activeReport === 'design-stock' && styles.activeTabText]}>
              Design Stock Report
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeReport === 'standard' ? renderStandardReports() : renderDesignStockReport()}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => showInfo('New Report')}
      >
        <Icon name="add" size={24} color="#0f172a" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}