export const APP_NAME = 'House Of Tiles'
export const APP_TAGLINE = 'Powered by Techrover'
export const APP_VERSION = '1.2.0'

export const API_BASE_URL = 'https://tiles-inventory.vercel.app/api'
export const WEB_BASE_URL = 'https://tiles-inventory.vercel.app'

export const resolvePublicUrl = (value?: string | null) => {
  if (!value) return null
  if (value.startsWith('http')) return value
  return `${WEB_BASE_URL}${value.startsWith('/') ? value : `/${value}`}`
}