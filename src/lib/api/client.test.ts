import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiRequestError,
  apiRequest,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from './client'

describe('token storage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('returns null when no token has been stored', () => {
    expect(getStoredToken()).toBeNull()
  })

  it('round-trips a stored token', () => {
    setStoredToken('abc123')
    expect(getStoredToken()).toBe('abc123')
  })

  it('clears the stored token', () => {
    setStoredToken('abc123')
    clearStoredToken()
    expect(getStoredToken()).toBeNull()
  })
})

describe('ApiRequestError', () => {
  it('carries status, message and errors', () => {
    const error = new ApiRequestError(422, 'Validation failed', ['email is required'])
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiRequestError')
    expect(error.status).toBe(422)
    expect(error.message).toBe('Validation failed')
    expect(error.errors).toEqual(['email is required'])
  })

  it('defaults errors to an empty array', () => {
    const error = new ApiRequestError(500, 'Server error')
    expect(error.errors).toEqual([])
  })
})

describe('apiRequest', () => {
  beforeEach(() => {
    localStorage.clear()
    setUnauthorizedHandler(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the envelope data on a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'ok', data: { id: '1' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiRequest<{ id: string }>('/things/1')
    expect(result).toEqual({ id: '1' })
  })

  it('attaches an Authorization header when a token is stored', async () => {
    setStoredToken('my-token')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'ok', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/protected')

    const [, requestInit] = fetchMock.mock.calls[0]
    expect(requestInit.headers.Authorization).toBe('Bearer my-token')
  })

  it('omits the Authorization header when no token is stored', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'ok', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/public')

    const [, requestInit] = fetchMock.mock.calls[0]
    expect(requestInit.headers.Authorization).toBeUndefined()
  })

  it('serializes a request body and defaults the method to GET when unspecified', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'ok', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/things', { method: 'POST', body: { name: 'Gate A' } })
    const [, postInit] = fetchMock.mock.calls[0]
    expect(postInit.method).toBe('POST')
    expect(postInit.body).toBe(JSON.stringify({ name: 'Gate A' }))

    await apiRequest('/things')
    const [, getInit] = fetchMock.mock.calls[1]
    expect(getInit.method).toBe('GET')
    expect(getInit.body).toBeUndefined()
  })

  it('includes only defined, non-empty query params in the request URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'ok', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/things', {
      query: { status: 'active', page: 2, keyword: undefined, search: '' },
    })

    const [requestedUrl] = fetchMock.mock.calls[0]
    expect(requestedUrl).toContain('status=active')
    expect(requestedUrl).toContain('page=2')
    expect(requestedUrl).not.toContain('keyword')
    expect(requestedUrl).not.toContain('search=')
  })

  it('throws ApiRequestError with the envelope message on a failed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, message: 'Bad input', data: null, errors: ['name is required'] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest('/things')).rejects.toMatchObject({
      status: 400,
      message: 'Bad input',
      errors: ['name is required'],
    })
  })

  it('falls back to the default message and empty errors when a failed response has no parseable JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input')
      },
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest('/things')).rejects.toMatchObject({
      status: 500,
      message: 'Request failed',
      errors: [],
    })
  })

  it('clears the stored token and notifies the unauthorized handler on a 401', async () => {
    setStoredToken('stale-token')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: 'Unauthorized', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest('/me')).rejects.toBeInstanceOf(ApiRequestError)
    expect(getStoredToken()).toBeNull()
    expect(handler).toHaveBeenCalledOnce()
  })
})
