import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeProvider } from './src/context/ThemeContext'
import { SessionProvider } from './src/context/SessionContext'
import { ToastProvider } from './src/context/ToastContext'
import { AppNavigator } from './src/navigation/AppNavigator'

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <SessionProvider>
              <AppNavigator />
            </SessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default App