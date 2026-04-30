import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '../../context/ThemeContext'
import { spacing, typography } from '../../theme'
import { APP_NAME, APP_TAGLINE } from '../../config/appConfig'

export const LoadingScreen: React.FC = () => {
  const { theme } = useTheme()
  const pulse = React.useRef(new Animated.Value(0)).current
  const float = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    pulseAnimation.start()
    floatAnimation.start()

    return () => {
      pulseAnimation.stop()
      floatAnimation.stop()
    }
  }, [float, pulse])

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  })

  const floatTranslate = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  })

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    glowOne: {
      position: 'absolute',
      top: -60,
      right: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: theme.primary,
      opacity: 0.12,
    },
    glowTwo: {
      position: 'absolute',
      bottom: 120,
      left: -50,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: theme.primary,
      opacity: 0.08,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    logoWrap: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      padding: spacing.lg,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    logo: {
      width: 140,
      height: 140,
      marginBottom: spacing.base,
    },
    brand: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text,
      letterSpacing: 0.4,
      textAlign: 'center',
    },
    tagLine: {
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    accentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: spacing.lg,
    },
    accentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    accentBar: {
      width: 52,
      height: 3,
      borderRadius: 999,
      backgroundColor: theme.primary,
      opacity: 0.7,
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing['3xl'],
    },
    footerText: {
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
  })

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.background, theme.surface, theme.background]}
        locations={[0, 0.5, 1]}
        style={styles.backdrop}
      />
      <Animated.View style={[styles.backdrop, styles.glowOne, { transform: [{ scale: glowScale }] }]} />
      <Animated.View style={[styles.backdrop, styles.glowTwo, { transform: [{ scale: glowScale }, { translateY: floatTranslate }] }]} />

      <View style={styles.content}>
        <Animated.View style={{ transform: [{ translateY: floatTranslate }, { scale: glowScale }] }}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/images/hot-logo-cropped.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brand}>{APP_NAME}</Text>
            <Text style={styles.tagLine}>{APP_TAGLINE}</Text>
          </View>
        </Animated.View>

        <View style={styles.accentRow}>
          <View style={styles.accentDot} />
          <View style={styles.accentBar} />
          <View style={styles.accentDot} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Preparing your catalog and stock data</Text>
        </View>
      </View>
    </View>
  )
}