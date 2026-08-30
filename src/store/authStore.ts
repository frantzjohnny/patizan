import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '../types'

interface AuthStore {
  user: Profile | null
  isAdmin: boolean
  isLoading: boolean
  setUser: (user: Profile | null) => void
  setIsAdmin: (isAdmin: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('patizan_admin_session')
        set({ user: null, isAdmin: false })
      },
    }),
    {
      name: 'patizan_auth_storage',
    }
  )
)
