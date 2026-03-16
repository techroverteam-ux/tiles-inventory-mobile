// Light and Dark Theme Colors Configuration
export const lightTheme = {
  // Primary Colors (from web portal branding)
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  
  // Secondary Colors
  secondary: '#64748B',
  secondaryLight: '#94A3B8',
  secondaryDark: '#475569',
  
  // Background Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerDark: '#DC2626',
  
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // Gray Scale
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  black: '#000000',
  
  // Border Colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Input Colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputPlaceholder: '#94A3B8',
  
  // Tab Colors
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',
  tabBackground: '#FFFFFF',
  
  // Skeleton Colors
  skeletonBase: '#E2E8F0',
  skeletonHighlight: 'rgba(255, 255, 255, 0.8)',
}

export const darkTheme = {
  // Primary Colors (same brand colors but adjusted for dark theme)
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  
  // Secondary Colors
  secondary: '#94A3B8',
  secondaryLight: '#CBD5E1',
  secondaryDark: '#64748B',
  
  // Background Colors
  background: '#0F172A',
  surface: '#1E293B',
  card: '#334155',
  
  // Text Colors
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  
  // Status Colors
  success: '#34D399',
  successLight: '#6EE7B7',
  successDark: '#10B981',
  
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  warningDark: '#F59E0B',
  
  danger: '#F87171',
  dangerLight: '#FCA5A5',
  dangerDark: '#EF4444',
  
  info: '#60A5FA',
  infoLight: '#93C5FD',
  infoDark: '#3B82F6',
  
  // Gray Scale (inverted for dark theme)
  white: '#0F172A',
  gray50: '#1E293B',
  gray100: '#334155',
  gray200: '#475569',
  gray300: '#64748B',
  gray400: '#94A3B8',
  gray500: '#CBD5E1',
  gray600: '#E2E8F0',
  gray700: '#F1F5F9',
  gray800: '#F8FAFC',
  gray900: '#FFFFFF',
  black: '#FFFFFF',
  
  // Border Colors
  border: '#475569',
  borderLight: '#334155',
  borderDark: '#64748B',
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Input Colors
  inputBackground: '#334155',
  inputBorder: '#475569',
  inputPlaceholder: '#94A3B8',
  
  // Tab Colors
  tabActive: '#3B82F6',
  tabInactive: '#94A3B8',
  tabBackground: '#1E293B',
  
  // Skeleton Colors
  skeletonBase: '#475569',
  skeletonHighlight: 'rgba(255, 255, 255, 0.1)',
}

export type Theme = typeof lightTheme
export type ThemeColors = keyof Theme