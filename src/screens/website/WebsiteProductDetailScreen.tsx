import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { getCommonStyles } from '../../theme/commonStyles'
import { Header } from '../../components/navigation/Header'

export const WebsiteProductDetailScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)
  const productId = route.params?.productId

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }
  })

  return (
    <View style={styles.container}>
      <Header title="Product Details" showBack navigation={navigation} />
      <View style={styles.content}>
        <Text style={{ color: theme.text }}>Product ID: {productId}</Text>
      </View>
    </View>
  )
}
