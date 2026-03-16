import AsyncStorage from '@react-native-async-storage/async-storage'

class SecureStorage {
  private static readonly AUTH_TOKEN_KEY = 'tiles_auth_token'
  private static readonly REFRESH_TOKEN_KEY = 'tiles_refresh_token'
  private static readonly USER_DATA_KEY = 'tiles_user_data'
  private static readonly SESSION_EXPIRY_KEY = 'tiles_session_expiry'

  static async storeAuthToken(token: string): Promise<void> {
    try {
      if (!token) {
        console.warn('Attempting to store empty auth token')
        return
      }
      await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, token)
    } catch (error) {
      console.error('Error storing auth token:', error)
      throw error
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.AUTH_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  static async storeRefreshToken(token: string): Promise<void> {
    try {
      if (!token) {
        console.warn('Attempting to store empty refresh token')
        return
      }
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, token)
    } catch (error) {
      console.error('Error storing refresh token:', error)
      throw error
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting refresh token:', error)
      return null
    }
  }

  static async storeUserData(user: any): Promise<void> {
    try {
      if (!user) {
        console.warn('Attempting to store empty user data')
        return
      }
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Error storing user data:', error)
      throw error
    }
  }

  static async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(this.USER_DATA_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(this.USER_DATA_KEY),
        AsyncStorage.removeItem(this.SESSION_EXPIRY_KEY)
      ])
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }

  static async storeSessionExpiry(expiry: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toISOString())
    } catch (error) {
      console.error('Error storing session expiry:', error)
      throw error
    }
  }

  static async getSessionExpiry(): Promise<Date | null> {
    try {
      const expiryString = await AsyncStorage.getItem(this.SESSION_EXPIRY_KEY)
      return expiryString ? new Date(expiryString) : null
    } catch (error) {
      console.error('Error getting session expiry:', error)
      return null
    }
  }
}

export { SecureStorage }