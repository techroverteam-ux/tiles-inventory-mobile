import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { LoadingButton } from '../../components/common/LoadingButton'
import { Skeleton } from '../../components/loading/Skeleton'
import { inventoryService, Batch } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'

export const InventoryDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const { showError } = useToast()
  const { productId } = route.params
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const response = await inventoryService.getInventory({ search: productId, limit: 50 })
      setBatches(response.inventory.filter(b => b.productId === productId))
    } catch {
      showError('Error', 'Failed to load inventory details')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const product = batches[0]?.product
  const totalQty = batches.reduce((sum, b) => sum + b.quantity, 0)

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: spacing.base },
    sectionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.text, marginBottom: spacing.sm, marginTop: spacing.base },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
    label: { fontSize: typography.fontSize.sm, color: theme.textSecondary },
    value: { fontSize: typography.fontSize.sm, color: theme.text, fontWeight: typography.fontWeight.medium },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    batchCard: { marginBottom: spacing.sm },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Inventory Detail" showBack navigation={navigation} />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[theme.primary]} />}
      >
        {loading ? (
          <>
            <Skeleton height={20} width="60%" style={{ marginBottom: spacing.sm }} />
            <Skeleton height={16} width="40%" style={{ marginBottom: spacing.xs }} />
            <Skeleton height={100} style={{ marginTop: spacing.base }} />
          </>
        ) : (
          <>
            {product && (
              <Card>
                <Text style={styles.sectionTitle}>{product.name}</Text>
                <View style={styles.row}><Text style={styles.label}>Code</Text><Text style={styles.value}>{product.code}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Brand</Text><Text style={styles.value}>{product.brand.name}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Category</Text><Text style={styles.value}>{product.category.name}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Total Stock</Text><Text style={[styles.value, { color: totalQty < 10 ? theme.warning : theme.success }]}>{totalQty} units</Text></View>
              </Card>
            )}

            <Text style={styles.sectionTitle}>Batches ({batches.length})</Text>
            {batches.map(batch => (
              <Card key={batch.id} style={styles.batchCard}>
                <View style={styles.row}><Text style={styles.label}>Batch #</Text><Text style={styles.value}>{batch.batchNumber}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>{batch.location.name}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Quantity</Text><Text style={styles.value}>{batch.quantity}</Text></View>
                {batch.purchasePrice != null && <View style={styles.row}><Text style={styles.label}>Purchase Price</Text><Text style={styles.value}>${batch.purchasePrice.toFixed(2)}</Text></View>}
                {batch.sellingPrice != null && <View style={styles.row}><Text style={styles.label}>Selling Price</Text><Text style={styles.value}>${batch.sellingPrice.toFixed(2)}</Text></View>}
                {batch.shade && <View style={styles.row}><Text style={styles.label}>Shade</Text><Text style={styles.value}>{batch.shade}</Text></View>}
                <LoadingButton title="Update Stock" onPress={() => navigation.navigate('StockUpdate', { productId })} variant="outline" style={{ marginTop: spacing.sm }} />
              </Card>
            ))}

            {batches.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
                <Icon name="inventory" size={48} color={theme.textSecondary} />
                <Text style={{ color: theme.textSecondary, marginTop: spacing.sm }}>No batches found</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
