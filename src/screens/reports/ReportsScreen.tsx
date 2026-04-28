import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, RefreshControl, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { MainHeader } from '../../components/navigation/MainHeader'
import { Card } from '../../components/common/Card'
import { apiClient } from '../../services/api/ApiClient'
import { getCommonStyles } from '../../theme/commonStyles'
import { spacing, typography } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

type ReportType = 'sales' | 'purchase' | 'inventory' | 'design-stock'

interface ReportRow {
  [key: string]: any
}

interface ReportData {
  reportType: string
  columns: { key: string; label: string }[]
  rows: ReportRow[]
}

interface DesignStockItem {
  productCode: string
  productName: string
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

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const { showError, showSuccess } = useToast()
  const [activeReport, setActiveReport] = useState<ReportType>('sales')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [designStockData, setDesignStockData] = useState<DesignStockReport | null>(null)
  const commonStyles = getCommonStyles(theme)

  const loadReport = useCallback(async (type: ReportType) => {
    setLoading(true)
    try {
      if (type === 'design-stock') {
        const response = await apiClient.get<DesignStockReport>('/reports/design-stock')
        setDesignStockData(response.data)
        setReportData(null)
      } else {
        const response = await apiClient.get<ReportData>('/reports', { params: { reportType: type } })
        setReportData(response.data)
        setDesignStockData(null)
      }
    } catch {
      showError('Error', 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadReport(activeReport) }, [activeReport])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadReport(activeReport)
    setRefreshing(false)
  }

  const handleExport = () => {
    showSuccess('Export', 'Use the web portal to export reports as Excel/PDF')
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    headerArea: { paddingHorizontal: 16, paddingVertical: 16 },
    screenTitle: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 4 },
    screenSubtitle: { fontSize: 13, color: theme.mutedForeground },
    tabScroll: { paddingHorizontal: 16, paddingBottom: 8 },
    tabContainer: { flexDirection: 'row', gap: 8 },
    tab: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
      borderWidth: 1, borderColor: theme.border,
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    activeTab: { backgroundColor: theme.primary, borderColor: theme.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: theme.mutedForeground },
    activeTabText: { color: theme.primaryForeground },
    content: { flex: 1, paddingHorizontal: 16 },
    summaryCard: {
      padding: 16, borderRadius: 16, marginBottom: 12,
      backgroundColor: withOpacity(theme.primary, 0.1),
      borderWidth: 1, borderColor: withOpacity(theme.primary, 0.2),
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    summaryText: { fontSize: 14, fontWeight: '700', color: theme.primary },
    exportBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
      borderWidth: 1, borderColor: theme.border,
    },
    exportBtnText: { fontSize: 12, fontWeight: '600', color: theme.mutedForeground },
    tableCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
    tableHeader: {
      flexDirection: 'row', backgroundColor: theme.surface,
      paddingHorizontal: 12, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    tableHeaderCell: { fontSize: 10, fontWeight: '700', color: theme.mutedForeground, letterSpacing: 0.5 },
    tableRow: {
      flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: withOpacity(theme.border, 0.5),
      backgroundColor: theme.card,
    },
    tableCell: { fontSize: 12, color: theme.text },
    brandCard: { marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
    brandHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: 14, backgroundColor: theme.surface,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    brandName: { fontSize: 15, fontWeight: '800', color: theme.text },
    brandTotal: { fontSize: 13, fontWeight: '700', color: theme.primary },
    itemRow: {
      flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
      borderBottomWidth: 1, borderBottomColor: withOpacity(theme.border, 0.4),
      backgroundColor: theme.card,
    },
    itemCode: { width: 80, fontSize: 11, color: theme.mutedForeground },
    itemName: { flex: 1, fontSize: 12, color: theme.text, fontWeight: '500' },
    itemQty: { width: 50, textAlign: 'right', fontSize: 13, fontWeight: '700', color: theme.text },
    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 15, fontWeight: '700', color: theme.text, marginTop: 16 },
    emptySubtext: { fontSize: 13, color: theme.mutedForeground, marginTop: 6, textAlign: 'center' },
  })

  const TABS: { type: ReportType; label: string; icon: string }[] = [
    { type: 'sales', label: 'Sales', icon: 'trending-up' },
    { type: 'purchase', label: 'Purchase', icon: 'shopping-cart' },
    { type: 'inventory', label: 'Inventory', icon: 'layers' },
    { type: 'design-stock', label: 'Design Stock', icon: 'grid-view' },
  ]

  const renderStandardReport = () => {
    if (!reportData) return null
    const { columns, rows } = reportData
    if (rows.length === 0) {
      return (
        <View style={s.empty}>
          <Icon name="bar-chart" size={56} color={withOpacity(theme.text, 0.2)} />
          <Text style={s.emptyText}>No Data</Text>
          <Text style={s.emptySubtext}>No records found for this report.</Text>
        </View>
      )
    }

    // Show key columns only on mobile
    const mobileColumns = columns.slice(0, 4)

    return (
      <Card style={[commonStyles.glassCard, s.tableCard]}>
        <View style={s.tableHeader}>
          {mobileColumns.map(col => (
            <Text key={col.key} style={[s.tableHeaderCell, { flex: 1 }]}>{col.label.toUpperCase()}</Text>
          ))}
        </View>
        {rows.slice(0, 50).map((row, i) => (
          <View key={i} style={s.tableRow}>
            {mobileColumns.map(col => (
              <Text key={col.key} style={[s.tableCell, { flex: 1 }]} numberOfLines={1}>
                {col.key === 'date'
                  ? new Date(row[col.key]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  : col.key.includes('Price') || col.key.includes('Amount') || col.key.includes('Value')
                  ? `₹${Number(row[col.key] || 0).toLocaleString()}`
                  : String(row[col.key] ?? '')}
              </Text>
            ))}
          </View>
        ))}
      </Card>
    )
  }

  const renderDesignStock = () => {
    if (!designStockData || designStockData.brands.length === 0) {
      return (
        <View style={s.empty}>
          <Icon name="assessment" size={56} color={withOpacity(theme.text, 0.2)} />
          <Text style={s.emptyText}>No Data</Text>
          <Text style={s.emptySubtext}>No design stock data available.</Text>
        </View>
      )
    }
    return (
      <>
        <View style={s.summaryCard}>
          <Text style={s.summaryText}>Grand Total: {designStockData.grandTotal} units</Text>
          <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
            <Icon name="file-download" size={14} color={theme.mutedForeground} />
            <Text style={s.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>
        {designStockData.brands.map((brand, bi) => {
          const brandTotal = brand.items.reduce((sum, item) => sum + item.quantity, 0)
          return (
            <Card key={bi} style={[commonStyles.glassCard, s.brandCard]}>
              <View style={s.brandHeader}>
                <Text style={s.brandName}>{brand.brandName}</Text>
                <Text style={s.brandTotal}>{brandTotal} units</Text>
              </View>
              {brand.items.map((item, ii) => (
                <View key={ii} style={s.itemRow}>
                  <Text style={s.itemCode} numberOfLines={1}>{item.productCode}</Text>
                  <Text style={s.itemName} numberOfLines={1}>{item.productName}</Text>
                  <Text style={s.itemQty}>{item.quantity}</Text>
                </View>
              ))}
            </Card>
          )
        })}
      </>
    )
  }

  return (
    <SafeAreaView style={s.container} edges={['right', 'left']}>
      <MainHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
      >
        <View style={s.headerArea}>
          <Text style={s.screenTitle}>Analytics & Reports</Text>
          <Text style={s.screenSubtitle}>Generate insights for your business</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
          <View style={s.tabContainer}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.type}
                style={[s.tab, activeReport === tab.type && s.activeTab]}
                onPress={() => setActiveReport(tab.type)}
                activeOpacity={0.7}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                  color={activeReport === tab.type ? theme.primaryForeground : theme.mutedForeground}
                />
                <Text style={[s.tabText, activeReport === tab.type && s.activeTabText]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={s.content}>
          {loading ? (
            <View style={s.empty}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : activeReport === 'design-stock' ? (
            renderDesignStock()
          ) : (
            <>
              {reportData && reportData.rows.length > 0 && (
                <View style={s.summaryCard}>
                  <Text style={s.summaryText}>{reportData.rows.length} records</Text>
                  <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
                    <Icon name="file-download" size={14} color={theme.mutedForeground} />
                    <Text style={s.exportBtnText}>Export</Text>
                  </TouchableOpacity>
                </View>
              )}
              {renderStandardReport()}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
