import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { withOpacity } from '../../utils/colorUtils'

interface QuickAction {
  title: string
  subtitle: string
  icon: string
  screen: string
  params?: object
}

const quickActions: QuickAction[] = [
  { title: 'Brand', subtitle: 'NEW PARTNER', icon: 'people', screen: 'BrandManagement' },
  { title: 'Product', subtitle: 'NEW ITEM', icon: 'inventory-2', screen: 'Products', params: { screen: 'ProductForm' } },
  { title: 'Stock', subtitle: 'ADD BATCH', icon: 'tag', screen: 'Inventory' },
  { title: 'Location', subtitle: 'WAREHOUSE', icon: 'location-on', screen: 'LocationManagement' },
  { title: 'Purchase', subtitle: 'RESTOCK', icon: 'shopping-cart', screen: 'PurchaseOrders' },
  { title: 'Sale', subtitle: 'CHECKOUT', icon: 'trending-up', screen: 'SalesOrders' },
]

interface QuickAddPanelProps {
  navigation: any
}

export const QuickAddPanel: React.FC<QuickAddPanelProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [visible, setVisible] = useState(false)

  const handleAction = (action: QuickAction) => {
    setVisible(false)
    setTimeout(() => {
      if (action.params) {
        navigation.navigate(action.screen, action.params)
      } else {
        navigation.navigate(action.screen)
      }
    }, 200)
  }

  return (
    <>
      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <Icon name="add" size={28} color={theme.primaryForeground} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.card }]} onPress={() => {}}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>Quick Actions</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.mutedForeground }]}>
                  WHAT WOULD YOU LIKE TO DO?
                </Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Icon name="close" size={22} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {quickActions.map(action => (
                <TouchableOpacity
                  key={action.title}
                  style={[styles.actionCard, { backgroundColor: withOpacity(theme.primary, 0.08), borderColor: theme.border }]}
                  onPress={() => handleAction(action)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: withOpacity(theme.primary, 0.15) }]}>
                    <Icon name={action.icon} size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.actionTitle, { color: theme.text }]}>{action.title}</Text>
                  <Text style={[styles.actionSubtitle, { color: theme.mutedForeground }]}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
})
