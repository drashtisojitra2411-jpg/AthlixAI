import { describe, expect, it } from 'vitest'
import { loginSchema, signupSchema } from './auth'

describe('loginSchema', () => {
  it('accepts a valid email and an 8+ character password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter a valid email address')
    }
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 8 characters')
    }
  })
})

describe('signupSchema', () => {
  const valid = {
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  }

  it('accepts matching passwords with a valid name and email', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = signupSchema.safeParse({ ...valid, name: 'J' })
    expect(result.success).toBe(false)
  })

  it('rejects when confirmPassword does not match password', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'different123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const mismatch = result.error.issues.find((issue) => issue.path.join('.') === 'confirmPassword')
      expect(mismatch?.message).toBe('Passwords do not match')
    }
  })

  it('rejects an invalid email even when passwords match', () => {
    const result = signupSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})
