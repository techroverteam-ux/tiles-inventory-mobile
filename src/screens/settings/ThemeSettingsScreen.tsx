import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../context/ThemeContext'
import { Header } from '../../components/navigation/Header'
import { Card } from '../../components/common/Card'
import { spacing, typography } from '../../theme'

export const ThemeSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme()

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: spacing.base },
    option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.base },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
    optionText: { fontSize: typography.fontSize.base, color: theme.text },
    optionSubtext: { fontSize: typography.fontSize.sm, color: theme.textSecondary },
    divider: { height: 1, backgroundColor: theme.border },
    activeIndicator: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Theme" showBack navigation={navigation} />
      <View style={styles.content}>
        <Card>
          <TouchableOpacity style={styles.option} onPress={() => isDark && toggleTheme()}>
            <View style={styles.optionLeft}>
              <Icon name="wb-sunny" size={24} color={!isDark ? theme.primary : theme.textSecondary} />
              <View>
                <Text style={styles.optionText}>Light Mode</Text>
                <Text style={styles.optionSubtext}>Bright and clean interface</Text>
              </View>
            </View>
            {!isDark && <View style={styles.activeIndicator}><Icon name="check" size={14} color={theme.textInverse} /></View>}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option} onPress={() => !isDark && toggleTheme()}>
            <View style={styles.optionLeft}>
              <Icon name="nightlight-round" size={24} color={isDark ? theme.primary : theme.textSecondary} />
              <View>
                <Text style={styles.optionText}>Dark Mode</Text>
                <Text style={styles.optionSubtext}>Easy on the eyes at night</Text>
              </View>
            </View>
            {isDark && <View style={styles.activeIndicator}><Icon name="check" size={14} color={theme.textInverse} /></View>}
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  )
}
