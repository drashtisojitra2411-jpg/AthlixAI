import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

interface UseCountUpOptions {
  duration?: number
  decimals?: number
  startOnMount?: boolean
}

export function useCountUp(
  end: number,
  { duration = 1200, decimals = 0, startOnMount = true }: UseCountUpOptions = {},
) {
  const reducedMotion = useReducedMotion()
  const [value, setValue] = useState(reducedMotion ? end : 0)
  const frameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!startOnMount) return

    if (reducedMotion) {
      setValue(end)
      return
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(end * eased)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setValue(end)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [end, duration, reducedMotion, startOnMount])

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value)
}
