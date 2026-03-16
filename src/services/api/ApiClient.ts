import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { SecureStorage } from '../storage/SecureStorage'

class ApiClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor() {
    // Use production API for tiles inventory
    this.baseURL = 'https://tiles-inventory.vercel.app/api'
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true, // Enable cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // Check if user is authenticated (simple flag-based auth)
        const authFlag = await SecureStorage.getAuthToken()
        if (authFlag === 'authenticated') {
          // This API doesn't use JWT tokens, so we just ensure the user is logged in
          // The server likely uses session cookies or other authentication methods
        }
        
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        
        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
        }
        return response
      },
      async (error) => {
        if (__DEV__) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`)
        }

        // For this API, we don't handle token refresh since there are no tokens
        // Just return the error for the calling code to handle
        return Promise.reject(error)
      }
    )
  }

  private async logout(): Promise<void> {
    try {
      await this.instance.post('/auth/logout')
    } finally {
      await SecureStorage.clearAll()
    }
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  async uploadFile<T>(url: string, file: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, file, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export const apiClient = new ApiClient()