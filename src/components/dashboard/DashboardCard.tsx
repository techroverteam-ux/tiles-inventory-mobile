import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getCommonStyles } from '../../theme/commonStyles';
import { withOpacity } from '../../utils/colorUtils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  style?: StyleProp<ViewStyle>;
  hasIconBg?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  onPress,
  color = 'primary',
  style,
  hasIconBg = false,
}) => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  
  // Resolve the Lucide icon by string name
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.HelpCircle;

  // Determine colors based on the color prop
  const getColorValue = () => {
    switch (color) {
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      case 'destructive': return theme.error;
      case 'info': return theme.info || theme.primary;
      case 'primary':
      default:
        return theme.primary;
    }
  };

  const colorValue = getColorValue();
  const iconBgColor = withOpacity(colorValue, 0.1);

  const styles = StyleSheet.create({
    card: {
      padding: 20,
      paddingTop: 16,
      borderRadius: 24,
      position: 'relative',
      overflow: 'hidden',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22, // Full circle if background exists
      backgroundColor: hasIconBg ? iconBgColor : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      color: withOpacity(theme.mutedForeground, 0.8),
      marginBottom: 6,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    value: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 10,
      fontWeight: '500',
      color: withOpacity(theme.mutedForeground, 0.6),
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[commonStyles.glassCard, styles.card, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <IconComponent size={hasIconBg ? 20 : 22} color={colorValue} strokeWidth={hasIconBg ? 2.5 : 2} />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
