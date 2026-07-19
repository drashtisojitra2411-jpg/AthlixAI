import { createContext } from 'react'
import type { AuthUser, UserRole } from '@/lib/api/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  register: (fullName: string, email: string, password: string, role?: UserRole) => Promise<AuthUser>
  logout: () => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
