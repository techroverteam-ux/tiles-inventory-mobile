import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { Header } from '../../components/navigation/Header'
import { LoadingSpinner } from '../../components/loading'
import { notificationService, Notification } from '../../services/api/ApiServices'
import { spacing, typography, borderRadius } from '../../theme'
import { withOpacity } from '../../utils/colorUtils'

interface NotificationsScreenProps {
  navigation: any
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
    },
    actionButtons: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: spacing.sm,
      marginLeft: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: withOpacity(theme.primary, 0.12),
    },
    clearButton: {
      backgroundColor: withOpacity(theme.error, 0.12),
    },
    listContainer: {
      flex: 1,
    },
    notificationCard: {
      backgroundColor: theme.surface,
      marginHorizontal: spacing.base,
      marginVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    unreadCard: {
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    notificationContent: {
      padding: spacing.base,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    notificationTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    notificationTime: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
    notificationMessage: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    notificationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    typeBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    infoBadge: {
      backgroundColor: withOpacity(theme.info, 0.12),
    },
    successBadge: {
      backgroundColor: withOpacity(theme.success, 0.12),
    },
    warningBadge: {
      backgroundColor: withOpacity(theme.warning, 0.12),
    },
    errorBadge: {
      backgroundColor: withOpacity(theme.error, 0.12),
    },
    typeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'uppercase',
    },
    infoText: {
      color: theme.info,
    },
    successText: {
      color: theme.success,
    },
    warningText: {
      color: theme.warning,
    },
    errorText: {
      color: theme.error,
    },
    readIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    readText: {
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginLeft: spacing.xs,
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
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications()
      setNotifications(response.notifications)
    } catch (error) {
      showToast('Failed to load notifications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      showToast('All notifications marked as read', 'success')
    } catch (error) {
      showToast('Failed to mark notifications as read', 'error')
    }
  }

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    )
  }

  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAll()
      setNotifications([])
      showToast('All notifications cleared', 'success')
    } catch (error) {
      showToast('Failed to clear notifications', 'error')
    }
  }

  const getTypeBadgeStyle = (type: Notification['type']) => {
    switch (type) {
      case 'info': return [styles.typeBadge, styles.infoBadge]
      case 'success': return [styles.typeBadge, styles.successBadge]
      case 'warning': return [styles.typeBadge, styles.warningBadge]
      case 'error': return [styles.typeBadge, styles.errorBadge]
      default: return [styles.typeBadge, styles.infoBadge]
    }
  }

  const getTypeTextStyle = (type: Notification['type']) => {
    switch (type) {
      case 'info': return [styles.typeText, styles.infoText]
      case 'success': return [styles.typeText, styles.successText]
      case 'warning': return [styles.typeText, styles.warningText]
      case 'error': return [styles.typeText, styles.errorText]
      default: return [styles.typeText, styles.infoText]
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[
      styles.notificationCard,
      !item.read && styles.unreadCard
    ]}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        <View style={styles.notificationFooter}>
          <View style={getTypeBadgeStyle(item.type)}>
            <Text style={getTypeTextStyle(item.type)}>{item.type}</Text>
          </View>
          
          <View style={styles.readIndicator}>
            <Icon 
              name={item.read ? 'visibility' : 'visibility-off'} 
              size={16} 
              color={theme.textSecondary} 
            />
            <Text style={styles.readText}>
              {item.read ? 'Read' : 'Unread'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notifications"
        showBack
        navigation={navigation}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {/* Theme Toggle */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={{ padding: spacing.sm }}
            >
              <Icon name={isDark ? 'wb-sunny' : 'nightlight-round'} size={22} color={theme.text} />
            </TouchableOpacity>
            </View>
            
            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAllRead}
            >
              <Icon name="done-all" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClearAll}
            >
              <Icon name="clear-all" size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.listContainer}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              No notifications yet.{' \n'}You'll see important updates here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
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
    </SafeAreaView>
  )
}