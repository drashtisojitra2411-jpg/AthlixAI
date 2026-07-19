import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, type Location } from 'react-router-dom'
import * as ReactRouter from 'react-router-dom'
import type { AuthUser } from '@/lib/api/auth'
import { useAuth } from '@/contexts/useAuth'
import { LoginPage } from './LoginPage'

vi.mock('@/contexts/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})

const mockedUseAuth = vi.mocked(useAuth)
const mockedUseNavigate = vi.mocked(ReactRouter.useNavigate)

const testUser: AuthUser = {
  id: '1',
  fullName: 'Test Organizer',
  email: 'user@example.com',
  role: 'Organizer',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function renderLoginPage(initialEntry: string | Partial<Location> = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  const login = vi.fn()
  const clearError = vi.fn()
  const navigate = vi.fn()

  beforeEach(() => {
    login.mockReset().mockResolvedValue(testUser)
    clearError.mockReset()
    navigate.mockReset()
    mockedUseNavigate.mockReturnValue(navigate)
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login,
      register: vi.fn(),
      logout: vi.fn(),
      clearError,
    })
  })

  it('renders email and password fields with accessible labels', () => {
    renderLoginPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('submits the entered credentials to login()', async () => {
    renderLoginPage()
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(login).toHaveBeenCalledWith('user@example.com', 'password123'))
  })

  it('clears any previous auth error before submitting', async () => {
    renderLoginPage()
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(clearError).toHaveBeenCalled())
  })

  it('navigates a non-Visitor to /dashboard after a successful submit', async () => {
    renderLoginPage()
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
  })

  it('navigates a Visitor to /visitor after a successful submit', async () => {
    login.mockResolvedValue({ ...testUser, role: 'Visitor' })
    renderLoginPage()
    await userEvent.type(screen.getByLabelText('Email'), 'visitor@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/visitor', { replace: true }))
  })

  it('does not navigate when login() rejects, leaving the error to surface via useAuth().error', async () => {
    login.mockRejectedValue(new Error('Invalid credentials'))
    renderLoginPage()
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(login).toHaveBeenCalled())
    expect(navigate).not.toHaveBeenCalled()
  })

  it('redirects an already-authenticated non-Visitor straight to the dashboard on mount', () => {
    mockedUseAuth.mockReturnValue({
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login,
      register: vi.fn(),
      logout: vi.fn(),
      clearError,
    })
    renderLoginPage()
    expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('redirects an already-authenticated Visitor to /visitor on mount', () => {
    mockedUseAuth.mockReturnValue({
      user: { ...testUser, role: 'Visitor' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login,
      register: vi.fn(),
      logout: vi.fn(),
      clearError,
    })
    renderLoginPage()
    expect(navigate).toHaveBeenCalledWith('/visitor', { replace: true })
  })

  it('redirects to the deep-link target from location state instead of the role default', () => {
    mockedUseAuth.mockReturnValue({
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login,
      register: vi.fn(),
      logout: vi.fn(),
      clearError,
    })
    renderLoginPage({ pathname: '/login', state: { from: '/dashboard/emergency' } })
    expect(navigate).toHaveBeenCalledWith('/dashboard/emergency', { replace: true })
  })

  it('does not redirect on mount when not authenticated', () => {
    renderLoginPage()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('toggles password visibility via the show/hide button', async () => {
    renderLoginPage()
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument()
  })

  it('prevents the default action and does not call login for the not-yet-implemented Google/GitHub buttons', async () => {
    renderLoginPage()
    await userEvent.click(screen.getByRole('button', { name: /google/i }))
    await userEvent.click(screen.getByRole('button', { name: /github/i }))
    expect(login).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('surfaces an auth error message returned by useAuth', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid credentials',
      login,
      register: vi.fn(),
      logout: vi.fn(),
      clearError,
    })
    renderLoginPage()
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('requires email and password before the form can be submitted', () => {
    renderLoginPage()
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Password')).toBeRequired()
  })
})
