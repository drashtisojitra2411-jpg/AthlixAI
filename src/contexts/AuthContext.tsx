import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '@/lib/api/auth'
import type { AuthUser } from '@/lib/api/auth'
import {
  ApiRequestError,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from '@/lib/api/client'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
  }, [])

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    authApi
      .getMe()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => clearStoredToken())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const { user: loggedInUser, token } = await authApi.login(email, password)
      setStoredToken(token)
      setUser(loggedInUser)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Unable to sign in')
      throw err
    }
  }, [])

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    setError(null)
    try {
      const { user: registeredUser, token } = await authApi.register(fullName, email, password)
      setStoredToken(token)
      setUser(registeredUser)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Unable to create account')
      throw err
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, isLoading, error, login, register, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
