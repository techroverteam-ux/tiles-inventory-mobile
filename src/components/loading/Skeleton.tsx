import React, { useEffect } from 'react'
import { View, Animated, Easing } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '../../context/ThemeContext'
import { borderRadius } from '../../theme'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: any
  animated?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius: radius = borderRadius.sm,
  style,
  animated = true
}) => {
  const { theme } = useTheme()
  const animatedValue = new Animated.Value(0)

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false
          })
        ])
      )
      animation.start()
      return () => animation.stop()
    }
  }, [animated, animatedValue])

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100]
  })

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.skeletonBase,
          overflow: 'hidden'
        },
        style
      ]}
    >
      {animated && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateX }]
          }}
        >
          <LinearGradient
            colors={['transparent', theme.skeletonHighlight, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}
    </View>
  )
}

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} />
)

export const SkeletonText: React.FC<{ lines?: number; width?: string }> = ({ 
  lines = 1, 
  width = '100%' 
}) => (
  <View style={{ gap: 4 }}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? '75%' : width}
        height={16}
      />
    ))}
  </View>
)