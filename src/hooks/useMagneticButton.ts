import { useCallback, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

interface MagneticOffset {
  x: number
  y: number
}

export function useMagneticButton(strength = 0.3, radius = 80) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const offsetRef = useRef<MagneticOffset>({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (reducedMotion || !ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = event.clientX - centerX
      const deltaY = event.clientY - centerY
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)

      if (distance < radius) {
        const factor = (1 - distance / radius) * strength
        offsetRef.current = { x: deltaX * factor, y: deltaY * factor }
        ref.current.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`
      }
    },
    [reducedMotion, radius, strength],
  )

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    offsetRef.current = { x: 0, y: 0 }
    ref.current.style.transform = 'translate(0, 0)'
  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}
