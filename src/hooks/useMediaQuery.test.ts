import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useIsDesktop, useIsMobile, useIsTablet, useMediaQuery } from './useMediaQuery'

function stubMatchMedia(matchesFor: (query: string) => boolean) {
  const listeners = new Map<string, Array<(event: MediaQueryListEvent) => void>>()
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matchesFor(query),
    media: query,
    addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) => {
      listeners.set(query, [...(listeners.get(query) ?? []), handler])
    },
    removeEventListener: vi.fn(),
  }))
  return {
    fire: (query: string, matches: boolean) =>
      listeners.get(query)?.forEach((handler) => handler({ matches } as MediaQueryListEvent)),
  }
}

describe('useMediaQuery', () => {
  it('returns the current match state for the given query', () => {
    stubMatchMedia((query) => query === '(min-width: 1024px)')
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(true)
  })

  it('updates when the query change event fires', () => {
    const { fire } = stubMatchMedia(() => false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(false)

    act(() => fire('(max-width: 767px)', true))
    expect(result.current).toBe(true)
  })
})

describe('useIsMobile / useIsDesktop', () => {
  it('useIsMobile queries the mobile breakpoint', () => {
    stubMatchMedia((query) => query === '(max-width: 767px)')
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('useIsDesktop queries the desktop breakpoint', () => {
    stubMatchMedia((query) => query === '(min-width: 1024px)')
    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(true)
  })

  it('useIsTablet queries the tablet breakpoint range', () => {
    stubMatchMedia((query) => query === '(min-width: 768px) and (max-width: 1023px)')
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(true)
  })
})
