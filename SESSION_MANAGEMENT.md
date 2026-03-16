# Session Management Architecture

## Overview
Robust session management system that mirrors the web portal's functionality with mobile-specific optimizations.

## Core Components

### 1. Session Context Provider
```typescript
// src/context/SessionContext.tsx
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

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Session configuration
  const IDLE_TIMEOUT = 20 * 60 * 1000 // 20 minutes
  const WARNING_TIMEOUT = 18 * 60 * 1000 // 18 minutes
  const REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry
  
  // Implementation details...
}
```

### 2. Secure Token Storage
```typescript
// src/services/storage/SecureStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { encrypt, decrypt } from '../utils/encryption'

class SecureStorage {
  private static readonly AUTH_TOKEN_KEY = 'auth_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly USER_DATA_KEY = 'user_data'
  private static readonly SESSION_EXPIRY_KEY = 'session_expiry'
  
  static async storeAuthToken(token: string): Promise<void> {
    const encryptedToken = encrypt(token)
    await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, encryptedToken)
  }
  
  static async getAuthToken(): Promise<string | null> {
    const encryptedToken = await AsyncStorage.getItem(this.AUTH_TOKEN_KEY)
    return encryptedToken ? decrypt(encryptedToken) : null
  }
  
  static async storeRefreshToken(token: string): Promise<void> {
    const encryptedToken = encrypt(token)
    await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedToken)
  }
  
  static async getRefreshToken(): Promise<string | null> {
    const encryptedToken = await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY)
    return encryptedToken ? decrypt(encryptedToken) : null
  }
  
  static async storeUserData(user: User): Promise<void> {
    const encryptedData = encrypt(JSON.stringify(user))
    await AsyncStorage.setItem(this.USER_DATA_KEY, encryptedData)
  }
  
  static async getUserData(): Promise<User | null> {
    const encryptedData = await AsyncStorage.getItem(this.USER_DATA_KEY)
    if (!encryptedData) return null
    
    try {
      const decryptedData = decrypt(encryptedData)
      return JSON.parse(decryptedData)
    } catch {
      return null
    }
  }
  
  static async clearAll(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(this.USER_DATA_KEY),
      AsyncStorage.removeItem(this.SESSION_EXPIRY_KEY)
    ])
  }
  
  static async storeSessionExpiry(expiry: Date): Promise<void> {
    await AsyncStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toISOString())
  }
  
  static async getSessionExpiry(): Promise<Date | null> {
    const expiryString = await AsyncStorage.getItem(this.SESSION_EXPIRY_KEY)
    return expiryString ? new Date(expiryString) : null
  }
}
```

### 3. Authentication Interceptor
```typescript
// src/services/api/AuthInterceptor.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { SecureStorage } from '../storage/SecureStorage'
import { SessionService } from '../session/SessionService'

class AuthInterceptor {
  private api: AxiosInstance
  private sessionService: SessionService
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []
  
  constructor(api: AxiosInstance, sessionService: SessionService) {
    this.api = api
    this.sessionService = sessionService
    this.setupInterceptors()
  }
  
  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        const token = await SecureStorage.getAuthToken()
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // Response interceptor - Handle token expiration
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return this.api(originalRequest)
            }).catch(err => Promise.reject(err))
          }
          
          originalRequest._retry = true
          this.isRefreshing = true
          
          try {
            const newToken = await this.sessionService.refreshToken()
            this.processQueue(null, newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.api(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError, null)
            await this.sessionService.logout()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }
        
        return Promise.reject(error)
      }
    )
  }
  
  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })
    
    this.failedQueue = []
  }
}
```

### 4. Session Service
```typescript
// src/services/session/SessionService.ts
import { AppState, AppStateStatus } from 'react-native'
import { SecureStorage } from '../storage/SecureStorage'
import { ApiService } from '../api/ApiService'

class SessionService {
  private apiService: ApiService
  private idleTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private appStateSubscription: any = null
  
  private readonly IDLE_TIMEOUT = 20 * 60 * 1000 // 20 minutes
  private readonly WARNING_TIMEOUT = 18 * 60 * 1000 // 18 minutes
  
  constructor(apiService: ApiService) {
    this.apiService = apiService
    this.setupAppStateListener()
  }
  
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.apiService.post('/auth/login', {
        email,
        password
      })
      
      const { token, refreshToken, user, expiresIn } = response.data
      
      // Store tokens securely
      await SecureStorage.storeAuthToken(token)
      await SecureStorage.storeRefreshToken(refreshToken)
      await SecureStorage.storeUserData(user)
      
      // Calculate and store session expiry
      const expiry = new Date(Date.now() + expiresIn * 1000)
      await SecureStorage.storeSessionExpiry(expiry)
      
      // Start idle timer
      this.startIdleTimer()
      
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }
  
  async logout(): Promise<void> {
    try {
      // Call logout API
      await this.apiService.post('/auth/logout')
    } catch (error) {
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear all stored data
      await SecureStorage.clearAll()
      this.clearTimers()
    }
  }
  
  async refreshToken(): Promise<string> {
    const refreshToken = await SecureStorage.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await this.apiService.post('/auth/refresh', {
        refreshToken
      })
      
      const { token, refreshToken: newRefreshToken, expiresIn } = response.data
      
      // Store new tokens
      await SecureStorage.storeAuthToken(token)
      if (newRefreshToken) {
        await SecureStorage.storeRefreshToken(newRefreshToken)
      }
      
      // Update session expiry
      const expiry = new Date(Date.now() + expiresIn * 1000)
      await SecureStorage.storeSessionExpiry(expiry)
      
      return token
    } catch (error) {
      // Refresh failed, clear all data
      await SecureStorage.clearAll()
      throw error
    }
  }
  
  async verifySession(): Promise<User | null> {
    try {
      const token = await SecureStorage.getAuthToken()
      if (!token) return null
      
      // Check if token is expired
      const expiry = await SecureStorage.getSessionExpiry()
      if (expiry && new Date() > expiry) {
        // Try to refresh token
        await this.refreshToken()
      }
      
      // Verify with server
      const response = await this.apiService.get('/auth/verify')
      return response.data.user
    } catch (error) {
      // Session invalid
      await SecureStorage.clearAll()
      return null
    }
  }
  
  private startIdleTimer(): void {
    this.clearTimers()
    
    // Warning timer (18 minutes)
    this.warningTimer = setTimeout(() => {
      this.showIdleWarning()
    }, this.WARNING_TIMEOUT)
    
    // Logout timer (20 minutes)
    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout()
    }, this.IDLE_TIMEOUT)
  }
  
  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
  }
  
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    )
  }
  
  private async handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
    if (nextAppState === 'active') {
      // App became active, verify session
      const user = await this.verifySession()
      if (user) {
        this.startIdleTimer()
      }
    } else if (nextAppState === 'background') {
      // App went to background, clear timers
      this.clearTimers()
    }
  }
  
  private showIdleWarning(): void {
    // Emit event for UI to show warning
    DeviceEventEmitter.emit('sessionWarning')
  }
  
  private async handleIdleTimeout(): Promise<void> {
    await this.logout()
    DeviceEventEmitter.emit('sessionExpired')
  }
  
  resetIdleTimer(): void {
    this.startIdleTimer()
  }
  
  destroy(): void {
    this.clearTimers()
    if (this.appStateSubscription) {
      this.appStateSubscription.remove()
    }
  }
}
```

### 5. Session Hook
```typescript
// src/hooks/useSession.ts
import { useContext, useEffect } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { SessionContext } from '../context/SessionContext'
import { useToast } from './useToast'

export const useSession = () => {
  const context = useContext(SessionContext)
  const { showToast } = useToast()
  
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  
  useEffect(() => {
    // Listen for session events
    const warningListener = DeviceEventEmitter.addListener(
      'sessionWarning',
      () => {
        showToast('Your session will expire in 2 minutes', 'warning')
      }
    )
    
    const expiredListener = DeviceEventEmitter.addListener(
      'sessionExpired',
      () => {
        showToast('Session expired due to inactivity', 'error')
      }
    )
    
    return () => {
      warningListener.remove()
      expiredListener.remove()
    }
  }, [showToast])
  
  return context
}
```

## Key Features

1. **Secure Token Storage**: Encrypted storage of authentication tokens
2. **Automatic Token Refresh**: Seamless token renewal before expiration
3. **Idle Timeout Management**: 20-minute idle timeout with 2-minute warning
4. **App State Handling**: Session verification when app becomes active
5. **Multi-Device Safety**: Server-side session validation
6. **Automatic Logout**: On 401 responses and session expiry
7. **Background Safety**: Timers cleared when app goes to background
8. **Error Recovery**: Graceful handling of network errors and token issues

## Security Considerations

1. **Token Encryption**: All tokens encrypted before storage
2. **Secure Communication**: HTTPS only for all API calls
3. **Token Rotation**: Refresh tokens rotated on each use
4. **Session Validation**: Server-side session state verification
5. **Automatic Cleanup**: All data cleared on logout or session expiry