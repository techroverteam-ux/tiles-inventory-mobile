import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AppState, AppStateStatus, DeviceEventEmitter } from 'react-native'
import { SecureStorage } from '../services/storage/SecureStorage'
import { apiClient } from '../services/api/ApiClient'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface SessionContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  resetIdleTimer: () => void
  sessionExpiry: Date | null
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const IDLE_TIMEOUT = 20 * 60 * 1000 // 20 minutes
const WARNING_TIMEOUT = 18 * 60 * 1000 // 18 minutes

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null)
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null)
  const [showIdleWarning, setShowIdleWarning] = useState(false)

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (idleTimer) {
      clearTimeout(idleTimer)
      setIdleTimer(null)
    }
    if (warningTimer) {
      clearTimeout(warningTimer)
      setWarningTimer(null)
    }
    setShowIdleWarning(false)
  }, [idleTimer, warningTimer])

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    clearTimers()
    
    if (isAuthenticated) {
      // Set warning timer (18 minutes)
      const newWarningTimer = setTimeout(() => {
        setShowIdleWarning(true)
        DeviceEventEmitter.emit('sessionWarning')
      }, WARNING_TIMEOUT)
      
      // Set logout timer (20 minutes)
      const newIdleTimer = setTimeout(async () => {
        console.log('Session expired due to inactivity')
        await logout()
        DeviceEventEmitter.emit('sessionExpired')
      }, IDLE_TIMEOUT)
      
      setWarningTimer(newWarningTimer)
      setIdleTimer(newIdleTimer)
    }
  }, [isAuthenticated, clearTimers])

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await apiClient.post('/auth/login', { email, password })
      console.log('Login response:', response)
      
      // Handle the actual API response structure
      let userData
      
      if (response.user) {
        userData = response.user
      } else if (response.data?.user) {
        userData = response.data.user
      }
      
      console.log('Extracted user data:', userData)
      
      if (!userData) {
        console.error('Missing user data in response')
        return false
      }
      
      // Store user data (no tokens needed for this API)
      await SecureStorage.storeUserData(userData)
      
      // Set a default session expiry (24 hours)
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await SecureStorage.storeSessionExpiry(expiry)
      
      // Store a simple auth flag since there's no token
      await SecureStorage.storeAuthToken('authenticated')
      
      setUser(userData)
      setIsAuthenticated(true)
      setSessionExpiry(expiry)
      
      // Start idle timer
      resetIdleTimer()
      
      return true
    } catch (error: any) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [resetIdleTimer])

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      clearTimers()
      
      // Call logout API
      await apiClient.post('/auth/logout')
      
      // Clear local state
      setUser(null)
      setIsAuthenticated(false)
      setSessionExpiry(null)
      
      // Clear localStorage
      await SecureStorage.clearAll()
      
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clearTimers])

  // Refresh session - disabled for now since it's causing infinite loop
  const refreshSession = useCallback(async () => {
    try {
      // For now, just validate that we have stored user data
      const storedUser = await SecureStorage.getUserData()
      if (storedUser) {
        setUser(storedUser)
        setIsAuthenticated(true)
        resetIdleTimer()
      } else {
        await logout()
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      await logout()
    }
  }, [resetIdleTimer, logout])

  // Initialize session on mount - simplified to prevent memory leaks
  useEffect(() => {
    let isMounted = true
    
    const initializeSession = async () => {
      try {
        setIsLoading(true)
        
        // Check if we have stored authentication data
        const authFlag = await SecureStorage.getAuthToken()
        
        if (isMounted && authFlag === 'authenticated') {
          const storedUser = await SecureStorage.getUserData()
          const expiry = await SecureStorage.getSessionExpiry()
          
          if (storedUser && isMounted) {
            // Check if session is expired
            if (expiry && new Date() > expiry) {
              console.log('Session expired, clearing data')
              await SecureStorage.clearAll()
            } else {
              // Use stored data
              setUser(storedUser)
              setIsAuthenticated(true)
              setSessionExpiry(expiry)
              resetIdleTimer()
            }
          }
        }
        
      } catch (error) {
        console.error('Session initialization error:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeSession()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated) {
        // App became active, check if session is still valid
        const expiry = await SecureStorage.getSessionExpiry()
        if (expiry && new Date() > expiry) {
          await logout()
          return
        }
        resetIdleTimer()
      } else if (nextAppState === 'background') {
        // App went to background, clear timers
        clearTimers()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription?.remove()
  }, [isAuthenticated, logout, resetIdleTimer, clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const value: SessionContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
    resetIdleTimer,
    sessionExpiry
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}