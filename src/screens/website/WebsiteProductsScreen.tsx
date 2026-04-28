import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { getCommonStyles } from '../../theme/commonStyles'
import { Header } from '../../components/navigation/Header'

export const WebsiteProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme()
  const commonStyles = getCommonStyles(theme)

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }
  })

  return (
    <View style={styles.container}>
      <Header title="All Products" showBack navigation={navigation} />
      <View style={styles.content}>
        <Text style={{ color: theme.text }}>Products Grid Goes Here</Text>
      </View>
    </View>
  )
}
