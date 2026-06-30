import { create } from 'zustand'
import { authApi } from '../api/auth'

const TOKEN_KEY = 'cp_token'

const useAuthStore = create((set, get) => ({
  user:        null,
  token:       localStorage.getItem(TOKEN_KEY) || null,
  loading:     true,
  initialized: false,

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ token })
  },

  // Hydrate user from stored token on app boot
  hydrate: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      set({ loading: false, initialized: true })
      return
    }
    try {
      const user = await authApi.me()   // GET /auth/me
      set({ user, token, loading: false, initialized: true })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, token: null, loading: false, initialized: true })
    }
  },

  // Login — accepts { email, password } object
  login: async ({ email, password }) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    set({ user: data.user, token: data.access_token })
  },

  // Register — accepts full payload object
  register: async (payload) => {
    const data = await authApi.register(payload)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    set({ user: data.user, token: data.access_token })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null })
  },

  updateUser: (patch) =>
    set((state) => ({ user: { ...state.user, ...patch } })),

  isAdmin:      () => ['admin', 'superadmin'].includes(get().user?.role),
  isOfficer:    () => get().user?.role === 'department_officer',
  isSuperAdmin: () => get().user?.role === 'superadmin',
}))

export default useAuthStore
