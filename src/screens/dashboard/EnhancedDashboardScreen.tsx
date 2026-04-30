import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import * as LucideIcons from 'lucide-react-native'
import { useTheme } from '../../context/ThemeContext'
import { useNavigation } from '@react-navigation/native'
import { MainHeader } from '../../components/navigation/MainHeader'
import { DashboardCard } from '../../components/dashboard/DashboardCard'
import { getCommonStyles } from '../../theme/commonStyles'
import { withOpacity } from '../../utils/colorUtils'
import { apiClient } from '../../services/api/ApiClient'

import { useToast } from '../../context/ToastContext'

const { width: screenWidth } = Dimensions.get('window')
const CARD_WIDTH = (screenWidth - 44) / 2

interface DashboardStats {
  totalBrands: number
  totalCategories: number
  totalSizes: number
  totalProducts: number
  purchaseOrders: number
  salesOrders: number
  lowStockItems: number
  monthlySales: number
}

interface ChartBar {
  month: string
  sales: number
  purchases: number
}

interface RecentOrder {
  id: string
  type: 'Sales' | 'Purchase'
  customer?: string
  brand?: string
  amount: number
  status: string
}

const statCards = [
  { key: 'totalBrands', title: 'BRANDS', subtitle: 'Active Partners', icon: 'Users', screen: 'BrandManagement', iconBg: true },
  { key: 'totalCategories', title: 'CATEGORIES', subtitle: 'Types of products', icon: 'Palette', screen: 'CategoryManagement' },
  { key: 'totalSizes', title: 'SIZES', subtitle: 'Variations available', icon: 'Ruler', screen: 'SizeManagement' },
  { key: 'totalProducts', title: 'PRODUCTS', subtitle: 'Total items in catalog', icon: 'Package', screen: 'Tabs', params: { screen: 'ProductsTab' } },
  { key: 'totalProducts', title: 'INVENTORY', subtitle: 'In-stock units', icon: 'Package', screen: 'Tabs', params: { screen: 'InventoryTab' }, iconBg: true },
  { key: 'purchaseOrders', title: 'PURCHASE ORDERS', subtitle: 'Incoming stock orders', icon: 'ShoppingCart', screen: 'Tabs', params: { screen: 'PurchaseTab' } },
  { key: 'salesOrders', title: 'SALES ORDERS', subtitle: 'Total transactions', icon: 'TrendingUp', screen: 'Tabs', params: { screen: 'SalesTab' } },
  { key: 'lowStockItems', title: 'LOW STOCK', subtitle: 'Items need attention', icon: 'AlertTriangle', screen: 'Tabs', params: { screen: 'InventoryTab' }, isAlert: true, iconBg: true },
]

const CHART_HEIGHT = 160
const CHART_MAX_BARS = 6

export const EnhancedDashboardScreen: React.FC = () => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)
  const navigation = useNavigation<any>()
  const { showInfo } = useToast()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalBrands: 0, totalCategories: 0, totalSizes: 0, totalProducts: 0,
    purchaseOrders: 0, salesOrders: 0, lowStockItems: 0, monthlySales: 0,
  })
  const [chartData, setChartData] = useState<ChartBar[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, salesRes, ordersRes, notifRes] = await Promise.allSettled([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/dashboard/sales-data'),
        apiClient.get('/dashboard/recent-orders'),
        apiClient.get('/notifications?page=1&limit=1'),
      ])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
      if (salesRes.status === 'fulfilled') setChartData((salesRes.value.data || []).slice(-CHART_MAX_BARS))
      if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value.data || [])
      if (notifRes.status === 'fulfilled') {
        const notifData = notifRes.value.data
        const notifs = notifData?.notifications || []
        const unread = notifs.filter((n: any) => !n.read && !n.isRead).length
        setNotificationCount(Math.min(unread, 99))
      }
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 140 },

    // Header row: Dashboard title + Generate Report
    headerRow: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dashboardTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: theme.primary,
      letterSpacing: -0.5,
    },
    generateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
    generateBtnText: { fontSize: 12, fontWeight: '700', color: theme.text },

    // Stats grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
    card: {
      width: (screenWidth - 44) / 2, // 16 * 2 (padding) + 12 (gap) = 44
    },
    cardIconWrap: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    cardTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: theme.mutedForeground, marginBottom: 4 },
    cardValueRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
    cardValue: { fontSize: 24, fontWeight: '800', color: theme.text },
    cardSubtitle: { fontSize: 12, color: theme.mutedForeground, marginLeft: 4 },
    cardArrow: { position: 'absolute', top: 14, right: 14 },

    // Chart section
    chartCard: {
      marginHorizontal: 16, marginBottom: 16,
      padding: 20, borderRadius: 24, borderWidth: 1,
      borderColor: theme.border, backgroundColor: theme.card,
    },
    chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    chartIconWrap: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: withOpacity(theme.primary, 0.12),
    },
    chartTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
    chartAreaContainer: { position: 'relative' },
    chartArea: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', marginLeft: 40 },
    chartBarsContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    chartBarGroup: { flex: 1, alignItems: 'center', gap: 2, zIndex: 10 },
    chartBarSales: { width: '35%', borderRadius: 3, backgroundColor: theme.primary },
    chartBarPurchases: { width: '35%', borderRadius: 3, backgroundColor: withOpacity(theme.primary, 0.35) },
    chartBarsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, flex: 1 },
    chartLabel: { fontSize: 9, color: theme.mutedForeground, marginTop: 4, textAlign: 'center' },
    chartYAxis: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 6 },
    chartYLabel: { fontSize: 9, color: theme.mutedForeground, marginTop: -6 },
    chartGridLines: { position: 'absolute', left: 40, right: 0, top: 0, bottom: 0, justifyContent: 'space-between' },
    chartGridLine: { height: 1, borderTopWidth: 1, borderTopColor: withOpacity(theme.border, 0.5), borderStyle: 'dashed' },

    // Transactions
    transCard: {
      marginHorizontal: 16, marginBottom: 24,
      borderRadius: 24, borderWidth: 1,
      borderColor: theme.border, backgroundColor: theme.card, overflow: 'hidden',
    },
    transHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    transHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    transIconWrap: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: withOpacity(theme.info || theme.primary, 0.12),
    },
    transTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
    exploreBtn: { fontSize: 11, fontWeight: '700', color: theme.mutedForeground, letterSpacing: 0.5 },
    transItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: withOpacity(theme.border, 0.5),
    },
    transItemIcon: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    transItemContent: { flex: 1 },
    transItemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    transItemId: { fontSize: 13, fontWeight: '700', color: theme.text },
    transTypeBadge: {
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
      backgroundColor: theme.card, // Fallback if no specific logic
    },
    transTypeBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
    transItemSub: { fontSize: 11, color: theme.mutedForeground },
    transItemRight: { alignItems: 'flex-end' },
    transAmount: { fontSize: 14, fontWeight: '800', color: theme.text, marginBottom: 4 },
    statusBadge: {
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    statusText: { fontSize: 9, fontWeight: '800' },
  })

  const getChartMax = () => {
    if (!chartData.length) return 1
    return Math.max(...chartData.flatMap(d => [d.sales, d.purchases]), 1)
  }

  const renderChart = () => {
    if (!chartData.length) return null
    const max = getChartMax()
    const maxRounded = Math.ceil(max / 10000) * 10000 || 40000 // Force nice round numbers
    const yLabels = [maxRounded, Math.round(maxRounded * 0.75), Math.round(maxRounded * 0.5), Math.round(maxRounded * 0.25), 0]

    return (
      <View style={[commonStyles.glassCard, s.chartCard]}>
        <View style={s.chartHeader}>
          <View style={s.chartIconWrap}>
            <LucideIcons.TrendingUp size={18} color={theme.primary} strokeWidth={2.5} />
          </View>
          <Text style={s.chartTitle}>Financial Performance Over Time</Text>
        </View>
        <View style={s.chartAreaContainer}>
          <View style={s.chartGridLines}>
            {yLabels.map((_, i) => <View key={i} style={s.chartGridLine} />)}
          </View>
          <View style={s.chartYAxis}>
            {yLabels.map((v, i) => (
              <Text key={i} style={s.chartYLabel}>{v}</Text>
            ))}
          </View>
          <View style={s.chartArea}>
            {chartData.map((d, i) => {
              const salesH = Math.max((d.sales / maxRounded) * CHART_HEIGHT, 2)
              const purchH = Math.max((d.purchases / maxRounded) * CHART_HEIGHT, 2)
              return (
                <View key={i} style={s.chartBarGroup}>
                  <View style={s.chartBarsRow}>
                    <View style={[s.chartBarSales, { height: salesH }]} />
                    <View style={[s.chartBarPurchases, { height: purchH }]} />
                  </View>
                </View>
              )
            })}
          </View>
          <View style={{ flexDirection: 'row', marginLeft: 40 }}>
            {chartData.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={s.chartLabel}>{d.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <MainHeader />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard header row */}
        <View style={s.headerRow}>
          <Text style={s.dashboardTitle}>Dashboard</Text>
          <TouchableOpacity 
            style={s.generateBtn} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Reports')}
          >
            <LucideIcons.Download size={16} color={theme.text} strokeWidth={2.5} />
            <Text style={s.generateBtnText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={s.grid}>
          {statCards.map((card, idx) => {
            const value = stats[card.key as keyof DashboardStats] ?? 0
            const isAlert = card.isAlert && value > 0
            const iconColor = isAlert ? theme.error : theme.primary
            const iconBgColor = isAlert
              ? withOpacity(theme.error, 0.15)
              : card.iconBg
              ? withOpacity(theme.primary, 0.2)
              : withOpacity(theme.primary, 0.1)

            let cardColor: 'primary' | 'success' | 'warning' | 'destructive' | 'info' = 'primary'
            if (isAlert) cardColor = 'destructive'
            else if (card.key === 'salesOrders' || card.key === 'totalProducts') cardColor = 'success'
            else if (card.key === 'totalCategories' || card.key === 'purchaseOrders') cardColor = 'info'
            else if (card.key === 'totalSizes') cardColor = 'warning'

            return (
              <DashboardCard
                key={idx}
                title={card.title}
                value={value}
                subtitle={card.subtitle}
                icon={card.icon}
                onPress={() => card.params ? navigation.navigate(card.screen, card.params) : navigation.navigate(card.screen)}
                color={cardColor}
                style={s.card}
                hasIconBg={card.iconBg}
              />
            )
          })}
        </View>

        {/* Financial Chart */}
        {renderChart()}

        {/* Latest Transactions */}
        {recentOrders.length > 0 && (
          <View style={[commonStyles.glassCard, s.transCard]}>
            <View style={s.transHeader}>
              <View style={s.transHeaderLeft}>
                <View style={s.transIconWrap}>
                  <LucideIcons.ShoppingCart size={18} color={theme.info || theme.primary} strokeWidth={2.5} />
                </View>
                <Text style={s.transTitle}>Latest Transactions</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('SalesOrders')} activeOpacity={0.7}>
                <Text style={s.exploreBtn}>EXPLORE HISTORY</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order, idx) => {
              const isSales = order.type === 'Sales'
              const iconColor = isSales ? theme.success : (theme.info || theme.primary)
              const badgeBg = isSales ? withOpacity(theme.mutedForeground, 0.25) : withOpacity(theme.mutedForeground, 0.25)
              
              const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED'
              const statusBg = isDelivered ? withOpacity(theme.mutedForeground, 0.3) : withOpacity(theme.mutedForeground, 0.1)
              const statusColor = isDelivered ? '#cbd5e1' : theme.mutedForeground

              return (
                <TouchableOpacity
                  key={idx}
                  style={[s.transItem, idx === recentOrders.length - 1 && { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate(isSales ? 'SalesOrders' : 'PurchaseOrders')}
                >
                  <View style={[s.transItemIcon, { backgroundColor: withOpacity(iconColor, 0.12) }]}>
                    {isSales ? <LucideIcons.TrendingUp size={18} color={iconColor} /> : <LucideIcons.ShoppingCart size={18} color={iconColor} />}
                  </View>
                  <View style={s.transItemContent}>
                    <View style={s.transItemRow}>
                      <Text style={s.transItemId} numberOfLines={1}>{order.id}</Text>
                      <View style={[s.transTypeBadge, { backgroundColor: badgeBg }]}>
                        <Text style={s.transTypeBadgeText}>{order.type.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={s.transItemSub} numberOfLines={1}>
                      {isSales ? (order.customer || 'Customer') : (order.brand || 'Supplier')}
                    </Text>
                  </View>
                  <View style={s.transItemRight}>
                    <Text style={s.transAmount}>₹{Number(order.amount).toLocaleString()}</Text>
                    <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[s.statusText, { color: statusColor }]}>{(order.status || '').toUpperCase()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* global QuickAddPanel is mounted in MainNavigator; do not render here */}
    </View>
  )
}
