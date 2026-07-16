import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function MorphingBlobs({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) return null

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className="absolute left-[10%] top-[20%] size-64 animate-[blob-morph_60s_ease-in-out_infinite] opacity-10 blur-3xl"
        style={{ background: 'linear-gradient(135deg, #6C63FF, #3B82F6)' }}
      />
      <div
        className="absolute right-[15%] top-[50%] size-48 animate-[blob-morph_80s_ease-in-out_infinite_reverse] opacity-10 blur-3xl"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #6C63FF)' }}
      />
    </div>
  )
}
