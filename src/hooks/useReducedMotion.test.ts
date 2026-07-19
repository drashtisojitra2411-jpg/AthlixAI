import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

function stubMatchMedia(matches: boolean) {
  const listeners: Array<(event: MediaQueryListEvent) => void> = []
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) => listeners.push(handler),
    removeEventListener: vi.fn(),
  }))
  return {
    fire: (next: boolean) => listeners.forEach((handler) => handler({ matches: next } as MediaQueryListEvent)),
  }
}

describe('useReducedMotion', () => {
  it('reflects the initial matchMedia state', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('defaults to false when the media query does not match', () => {
    stubMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('updates when the media query change event fires', () => {
    const { fire } = stubMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    act(() => fire(true))
    expect(result.current).toBe(true)
  })
})
