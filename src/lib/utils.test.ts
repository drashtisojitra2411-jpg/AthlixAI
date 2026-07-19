import { describe, expect, it } from 'vitest'
import { cn, formatNumber, formatPercent, formatRelativeTime } from './utils'

describe('cn', () => {
  it('joins simple class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    const disabled = false
    expect(cn('a', disabled && 'b', undefined, null, 'c')).toBe('a c')
  })

  it('resolves conflicting tailwind utilities to the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('merges conditional object syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })
})

describe('formatNumber', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('formats small numbers unchanged', () => {
    expect(formatNumber(42)).toBe('42')
  })
})

describe('formatPercent', () => {
  it('prefixes positive values with a plus sign', () => {
    expect(formatPercent(4.567)).toBe('+4.6%')
  })

  it('does not double up the minus sign for negative values', () => {
    expect(formatPercent(-3.2)).toBe('-3.2%')
  })

  it('prefixes exactly zero with a plus sign', () => {
    expect(formatPercent(0)).toBe('+0.0%')
  })
})

describe('formatRelativeTime', () => {
  it('formats sub-minute durations in seconds', () => {
    const date = new Date(Date.now() - 30 * 1000)
    expect(formatRelativeTime(date)).toBe('30s ago')
  })

  it('formats sub-hour durations in minutes', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(date)).toBe('5m ago')
  })

  it('formats sub-day durations in hours', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(date)).toBe('3h ago')
  })

  it('formats multi-day durations in days', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(date)).toBe('2d ago')
  })
})
