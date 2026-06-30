import axios from 'axios'

// Trim trailing slash to prevent double-slash in URLs like //complaints/my
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://civicpulse-backend-ii1e.onrender.com/api/v1').replace(/\/$/, '')

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: false,  // we use Bearer token, not cookies
})

// ── Request: attach JWT token ─────────────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Let axios auto-set multipart boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response: unwrap .data, handle errors cleanly ─────────────
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Network error (backend down, CORS, no internet)
    if (!error.response) {
      console.error('Network error:', error.message)
      return Promise.reject(new Error(
        'Cannot reach the server. Check that the backend is running and ALLOWED_ORIGINS includes your frontend URL.'
      ))
    }

    const { status, data } = error.response

    // 401 — token expired or invalid, force logout
    if (status === 401) {
      localStorage.removeItem('cp_token')
      // Avoid redirect loop if already on /login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(new Error('Session expired. Please login again.'))
    }

    // 403 — insufficient role
    if (status === 403) {
      return Promise.reject(new Error(data?.detail || 'Access denied for your role.'))
    }

    // 422 — FastAPI validation error (show the first field error)
    if (status === 422) {
      const firstError = data?.detail?.[0]
      const msg = firstError
        ? `${firstError.loc?.slice(-1)[0]}: ${firstError.msg}`
        : 'Validation error — check your inputs'
      return Promise.reject(new Error(msg))
    }

    // All other errors
    const message =
      data?.detail ||
      data?.message ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  }
)

export default client
