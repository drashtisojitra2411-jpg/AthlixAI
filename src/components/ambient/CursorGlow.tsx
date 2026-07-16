import { cn } from '@/lib/utils'
import { useMouseSpotlight } from '@/hooks/useMouseSpotlight'
import { useIsMobile } from '@/hooks/useMediaQuery'

export function CursorGlow({ className }: { className?: string }) {
  const isMobile = useIsMobile()
  const { position, isActive } = useMouseSpotlight(!isMobile)

  if (isMobile || !isActive) return null

  return (
    <div
      className={cn('pointer-events-none fixed z-[500] mix-blend-screen', className)}
      aria-hidden="true"
      style={{
        left: position.x - 12,
        top: position.y - 12,
        width: 24,
        height: 24,
        background: 'radial-gradient(circle, rgba(108,99,255,0.4) 0%, transparent 70%)',
        transition: 'left 0.1s ease, top 0.1s ease',
      }}
    />
  )
}
