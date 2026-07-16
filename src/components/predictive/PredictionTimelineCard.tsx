import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import type { PredictionTimelineEntry } from '@/lib/api/predictive'
import { RISK_LEVEL_COLORS } from '@/lib/predictive/riskLevelColors'

interface PredictionTimelineCardProps {
  timeline: PredictionTimelineEntry[]
}

export function PredictionTimelineCard({ timeline }: PredictionTimelineCardProps) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl accent-gradient">
          <Clock className="size-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Prediction Timeline</h3>
          <p className="text-xs text-text-muted">Expected crowd conditions across the event window</p>
        </div>
      </div>

      <div className="relative flex items-start justify-between">
        <div className="absolute left-0 right-0 top-[15px] h-px bg-[var(--color-border-default)]" />
        {timeline.map((entry, i) => {
          const tone = RISK_LEVEL_COLORS[entry.riskLevel]
          return (
            <motion.div
              key={entry.time}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
            >
              <span
                className="size-[14px] rounded-full ring-4"
                style={{ background: tone.fill, boxShadow: `0 0 0 4px ${tone.fill}22` }}
              />
              <span className="mt-3 text-xs font-medium text-text-primary">{entry.time}</span>
              <span className="mt-1 text-lg font-bold tabular-nums text-text-primary">
                {entry.occupancyLevel}%
              </span>
              <span className="mt-0.5 text-[11px]" style={{ color: tone.fill }}>
                {tone.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
