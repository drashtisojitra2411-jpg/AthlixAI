import { cn } from '@/lib/utils'
import { useMouseSpotlight } from '@/hooks/useMouseSpotlight'
import { useIsMobile } from '@/hooks/useMediaQuery'

export function MouseSpotlight({ className }: { className?: string }) {
  const isMobile = useIsMobile()
  const { position, isActive } = useMouseSpotlight(!isMobile)

  if (isMobile) return null

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-[1]', className)}
      aria-hidden="true"
      style={{
        background: isActive
          ? `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 70%)`
          : 'none',
        transition: 'background 0.15s ease',
      }}
    />
  )
}
