import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightTheme, darkTheme, Theme } from '../theme/colors'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'app_theme_mode'

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  )

  // Determine if dark theme should be active
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark')
  const theme = isDark ? darkTheme : lightTheme

  // Load saved theme mode on app start
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode)
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error)
      }
    }
    loadThemeMode()
  }, [])

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme)
    })
    return () => subscription?.remove()
  }, [])

  // Save theme mode when it changes
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode)
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch (error) {
      console.error('Failed to save theme mode:', error)
    }
  }

  // Toggle between light and dark (not system)
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
  }

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}