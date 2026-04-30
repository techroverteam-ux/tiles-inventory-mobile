import React from 'react'
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { spacing, typography } from '../../theme'
import { APP_NAME, APP_VERSION } from '../../config/appConfig'

export const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: spacing.base },
    logoContainer: { alignItems: 'center', paddingVertical: spacing.xl },
    logo: { width: 100, height: 100, borderRadius: 20 },
    appName: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: theme.text, marginTop: spacing.base },
    version: { fontSize: typography.fontSize.sm, color: theme.textSecondary, marginTop: spacing.xs },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.border },
    label: { fontSize: typography.fontSize.sm, color: theme.textSecondary },
    value: { fontSize: typography.fontSize.sm, color: theme.text, fontWeight: typography.fontWeight.medium },
    sectionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.text, marginBottom: spacing.sm, marginTop: spacing.base },
    description: { fontSize: typography.fontSize.sm, color: theme.textSecondary, lineHeight: 22 },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header title="About" showBack navigation={navigation} />
      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/hot-logo-cropped.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>

        <Card>
          <View style={styles.row}><Text style={styles.label}>App Name</Text><Text style={styles.value}>{APP_NAME}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Version</Text><Text style={styles.value}>{APP_VERSION}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Platform</Text><Text style={styles.value}>React Native</Text></View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}><Text style={styles.label}>Developer</Text><Text style={styles.value}>TechRover Team</Text></View>
        </Card>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          A comprehensive mobile application for managing House Of Tiles inventory. Track products, manage stock levels, handle purchase and sales orders, and generate reports — all from your mobile device.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Card>
          <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>support@techrover.com</Text></View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}><Text style={styles.label}>Website</Text><Text style={styles.value}>techrover.com</Text></View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}
