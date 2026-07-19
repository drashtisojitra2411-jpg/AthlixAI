import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCountUp } from './useCountUp'

function stubMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('useCountUp', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('jumps straight to the end value when reduced motion is preferred', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useCountUp(120))
    expect(result.current).toBe(120)
  })

  it('formats the reduced-motion value with the requested decimal places', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useCountUp(50.5, { decimals: 1 }))
    expect(result.current).toBe('50.5')
  })

  it('starts at 0 and animates up to the end value across frames', () => {
    stubMatchMedia(false)
    let now = 0
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    const { result } = renderHook(() => useCountUp(100, { duration: 1000 }))
    expect(result.current).toBe(0)

    act(() => {
      while (rafCallbacks.length > 0) {
        const cb = rafCallbacks.shift()!
        now += 250
        cb(now)
      }
    })

    expect(result.current).toBe(100)
  })

  it('does not start the animation when startOnMount is false', () => {
    stubMatchMedia(false)
    vi.stubGlobal('requestAnimationFrame', vi.fn())
    const { result } = renderHook(() => useCountUp(100, { startOnMount: false }))
    expect(result.current).toBe(0)
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })
})
