import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function AuroraBackground({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className={cn(
          'absolute -inset-[50%] opacity-40',
          !reducedMotion && 'animate-[aurora-drift_90s_ease-in-out_infinite]',
        )}
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(108,99,255,0.15), transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59,130,246,0.12), transparent 50%), radial-gradient(ellipse 50% 30% at 50% 80%, rgba(108,99,255,0.08), transparent 50%)',
        }}
      />
      <div
        className={cn(
          'absolute inset-0 opacity-30',
          !reducedMotion && 'animate-[aurora-drift_120s_ease-in-out_infinite_reverse]',
        )}
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(108,99,255,0.05) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}
