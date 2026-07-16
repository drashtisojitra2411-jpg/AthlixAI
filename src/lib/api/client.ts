const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api'
const TOKEN_STORAGE_KEY = 'athlix_token'

export class ApiRequestError extends Error {
  status: number
  errors: string[]

  constructor(status: number, message: string, errors: string[] = []) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.errors = errors
  }
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errors?: string[]
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getStoredToken()

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken()
      unauthorizedHandler?.()
    }
    throw new ApiRequestError(
      response.status,
      payload?.message ?? 'Request failed',
      payload?.errors ?? [],
    )
  }

  return (payload as ApiEnvelope<T>).data
}
