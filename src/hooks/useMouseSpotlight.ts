import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

interface SpotlightPosition {
  x: number
  y: number
}

export function useMouseSpotlight(enabled = true) {
  const reducedMotion = useReducedMotion()
  const [position, setPosition] = useState<SpotlightPosition>({ x: 0, y: 0 })
  const [isActive, setIsActive] = useState(false)
  const frameRef = useRef<number | undefined>(undefined)
  const targetRef = useRef<SpotlightPosition>({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enabled || reducedMotion) return
      targetRef.current = { x: event.clientX, y: event.clientY }
      setIsActive(true)
    },
    [enabled, reducedMotion],
  )

  useEffect(() => {
    if (!enabled || reducedMotion) return

    const tick = () => {
      setPosition((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.12,
        y: prev.y + (targetRef.current.y - prev.y) * 0.12,
      }))
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', () => setIsActive(false))

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [enabled, reducedMotion, handleMouseMove])

  return { position, isActive: isActive && !reducedMotion }
}
