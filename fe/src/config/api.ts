// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  data: `${API_URL}/api/v1/data`,
  forecast: `${API_URL}/api/v1/forecast`,
  quote: {
    calculate: `${API_URL}/api/v1/quote/calcular-envio`,
    total: `${API_URL}/api/v1/quote/total`,
  },
  locations: {
    regions: `${API_URL}/api/v1/locations/regions`,
    municipalities: (regionId: number) => `${API_URL}/api/v1/locations/regions/${regionId}/municipalities`,
  },
}
