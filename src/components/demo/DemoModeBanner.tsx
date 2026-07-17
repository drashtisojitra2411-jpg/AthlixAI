import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'
import { DEMO_SCRIPT } from '@/lib/demo/script'
import { cn } from '@/lib/utils'

interface DemoModeBannerProps {
  stageIndex: number
  stageLabel: string
  stageElapsedMs: number
  stageDurationMs: number
}

export function DemoModeBanner({ stageIndex, stageLabel, stageElapsedMs, stageDurationMs }: DemoModeBannerProps) {
  const stageProgress = stageDurationMs === 0 ? 0 : Math.min(100, (stageElapsedMs / stageDurationMs) * 100)

  return (
    <div className="sticky top-0 z-40 border-b border-error/25 bg-error/10 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-error px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            <Radio className="size-3 animate-pulse" /> Demo Mode
          </span>
          <span className="text-xs text-text-secondary">
            Simulated presentation scenario — no live data is created, modified, or deleted.
          </span>
          <span className="ml-auto text-xs font-medium text-text-primary">{stageLabel}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {DEMO_SCRIPT.map((stage, i) => (
            <div key={stage.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
              <motion.div
                className={cn('h-full rounded-full', i <= stageIndex ? 'bg-error' : 'bg-transparent')}
                initial={false}
                animate={{
                  width: i < stageIndex ? '100%' : i === stageIndex ? `${stageProgress}%` : '0%',
                }}
                transition={{ ease: 'linear', duration: 0.15 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
