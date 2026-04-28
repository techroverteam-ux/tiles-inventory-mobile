import { StyleSheet, Platform } from 'react-native'
import { Theme } from './colors'
import { withOpacity } from '../utils/colorUtils'

export const getCommonStyles = (theme: Theme) => {
  return StyleSheet.create({
    // Shadow properties identical to web's shadow-sm and shadow-premium
    shadowPremium: {
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    
    // Glassmorphism classes matching web `.glass`
    glass: {
      backgroundColor: withOpacity(theme.background, 0.95),
      borderWidth: 1,
      borderColor: withOpacity(theme.border, 0.6),
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      // Blur effect would need expo-blur or @react-native-community/blur,
      // so we simulate with semi-transparent background.
    },
    
    // Glass card matching web `.glass-card`
    glassCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    
    // Container for page padding matching `.admin-page`
    adminPage: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    
    // Header row layout matching `.page-header`
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: theme.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 10,
    },
    
    // Typography matching `.page-title`
    pageTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      letterSpacing: -0.5,
    },
    
    // Typography matching `.page-subtitle`
    pageSubtitle: {
      fontSize: 14,
      color: theme.mutedForeground,
    },
    
    // Custom scrollbar simulation (not directly applicable in RN, but we use hidesVerticalScrollIndicator)
    noScrollbar: {
      // Used to document that the scrollview shouldn't show indicator
    }
  })
}
