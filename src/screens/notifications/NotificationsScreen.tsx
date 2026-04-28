import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { notificationService, Notification } from '../../services/api/ApiServices'
import { withOpacity } from '../../utils/colorUtils'

interface NotificationsScreenProps {
  navigation: any
}

const formatTimestamp = (value: string) => {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][date.getMonth()]
  const year = date.getFullYear()
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${day}-${month}-${year} ${time}`
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'warning': return { icon: 'warning', color: '#f59e0b' }
    case 'error': return { icon: 'error', color: '#ef4444' }
    case 'success': return { icon: 'check-circle', color: '#22c55e' }
    default: return { icon: 'info', color: '#3b82f6' }
  }
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications(1, 50)
      setNotifications(res.notifications || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, read: true } : n))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })))
    } catch {}
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {}
  }

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll()
      setNotifications([])
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    backBtn: { padding: 4, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.text, flex: 1 },
    topSection: {
      padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    unreadLabel: {
      fontSize: 10, fontWeight: '700', letterSpacing: 0.8,
      color: theme.mutedForeground, marginBottom: 12,
    },
    actionRow: { flexDirection: 'row', gap: 10 },
    actionBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 8, borderWidth: 1, borderColor: theme.border,
      backgroundColor: theme.card,
    },
    actionBtnText: { fontSize: 13, fontWeight: '600', color: theme.text },
    readAllText: { color: theme.primary },
    item: {
      flexDirection: 'row', alignItems: 'flex-start',
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: withOpacity(theme.border, 0.5),
      backgroundColor: theme.card,
    },
    itemUnread: { backgroundColor: withOpacity(theme.primary, 0.04) },
    itemIconWrap: {
      width: 40, height: 40, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 12, flexShrink: 0,
    },
    itemContent: { flex: 1 },
    itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
    itemTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
    itemTitleRead: { fontWeight: '500', color: theme.mutedForeground },
    unreadDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary,
    },
    itemMessage: { fontSize: 12, color: theme.mutedForeground, lineHeight: 18, marginBottom: 4 },
    itemTime: { fontSize: 10, fontWeight: '700', color: withOpacity(theme.mutedForeground, 0.6), letterSpacing: 0.3 },
    deleteBtn: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: theme.error,
      alignItems: 'center', justifyContent: 'center',
      marginLeft: 10, flexShrink: 0, alignSelf: 'center',
    },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 16, fontWeight: '700', color: theme.text, marginTop: 16 },
    emptySubtext: { fontSize: 13, color: theme.mutedForeground, marginTop: 6, textAlign: 'center' },
  })

  const renderItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.isRead && !item.read
    const { icon, color } = getTypeIcon(item.type)
    return (
      <TouchableOpacity
        style={[s.item, isUnread && s.itemUnread]}
        onPress={() => isUnread && handleMarkRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[s.itemIconWrap, { backgroundColor: withOpacity(color, 0.12) }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <View style={s.itemContent}>
          <View style={s.itemTitleRow}>
            <Text style={[s.itemTitle, !isUnread && s.itemTitleRead]}>{item.title}</Text>
            {isUnread && <View style={s.unreadDot} />}
          </View>
          <Text style={s.itemMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={s.itemTime}>{formatTimestamp(item.timestamp || item.createdAt)}</Text>
        </View>
        <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
          <Icon name="delete" size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
      </View>

      {/* Actions */}
      <View style={s.topSection}>
        <Text style={s.unreadLabel}>{unreadCount} UNREAD</Text>
        <View style={s.actionRow}>
          {unreadCount > 0 && (
            <TouchableOpacity style={s.actionBtn} onPress={handleMarkAllRead} activeOpacity={0.7}>
              <Icon name="done" size={16} color={theme.primary} />
              <Text style={[s.actionBtnText, s.readAllText]}>Read all</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.actionBtn} onPress={handleClearAll} activeOpacity={0.7}>
            <Icon name="delete-outline" size={16} color={theme.text} />
            <Text style={s.actionBtnText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={s.empty}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={s.empty}>
          <Icon name="notifications-none" size={56} color={theme.mutedForeground} />
          <Text style={s.emptyText}>All caught up!</Text>
          <Text style={s.emptySubtext}>No new notifications to show right now.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}
