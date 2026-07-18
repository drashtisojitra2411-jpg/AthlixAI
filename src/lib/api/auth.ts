import { apiRequest } from './client'

export type UserRole = 'Admin' | 'Organizer' | 'Visitor'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  avatar?: string | null
  createdAt: string
  updatedAt: string
}

interface AuthPayload {
  user: AuthUser
  token: string
}

export function login(email: string, password: string): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function register(
  fullName: string,
  email: string,
  password: string,
  role?: UserRole,
): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/register', {
    method: 'POST',
    body: role ? { fullName, email, password, role } : { fullName, email, password },
  })
}

export function getMe(): Promise<{ user: AuthUser }> {
  return apiRequest<{ user: AuthUser }>('/auth/me')
}
