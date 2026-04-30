import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { SecureStorage } from '../storage/SecureStorage'
import { API_BASE_URL } from '../../config/appConfig'

class ApiClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
    
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
      async (config: InternalAxiosRequestConfig) => {
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
          // Suppress 404 errors for optional endpoints that may not exist on this backend
          const url = error.config?.url || ''
          const is404 = error.response?.status === 404
          const isOptionalEndpoint = ['/collections', '/finish-types'].some(ep => url.includes(ep))
          if (!(is404 && isOptionalEndpoint)) {
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`)
          }
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
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config)
  }

  async uploadFile<T = any>(url: string, file: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, file, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export const apiClient = new ApiClient()