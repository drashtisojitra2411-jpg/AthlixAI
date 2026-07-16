import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function GradientMesh({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className={cn(
          'absolute size-[600px] -left-32 -top-32 rounded-full opacity-20 blur-[100px]',
          !reducedMotion && 'animate-[aurora-drift_60s_ease-in-out_infinite]',
        )}
        style={{ background: '#6C63FF' }}
      />
      <div
        className={cn(
          'absolute size-[500px] -right-24 top-1/3 rounded-full opacity-15 blur-[100px]',
          !reducedMotion && 'animate-[aurora-drift_80s_ease-in-out_infinite_reverse]',
        )}
        style={{ background: '#3B82F6' }}
      />
      <div
        className={cn(
          'absolute size-[400px] bottom-0 left-1/3 rounded-full opacity-10 blur-[80px]',
          !reducedMotion && 'animate-[aurora-drift_70s_ease-in-out_infinite]',
        )}
        style={{ background: '#6C63FF' }}
      />
    </div>
  )
}
