import { motion } from 'framer-motion'
import { Gauge } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { PredictionResult } from '@/lib/api/predictive'

interface PredictionConfidenceCardProps {
  prediction: PredictionResult
}

export function PredictionConfidenceCard({ prediction }: PredictionConfidenceCardProps) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl accent-gradient">
          <Gauge className="size-4 text-white" />
        </div>
        <h3 className="font-semibold text-text-primary">Prediction Confidence</h3>
      </div>

      <div className="flex items-end gap-2">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold tabular-nums text-text-primary"
        >
          {prediction.confidence}%
        </motion.span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${prediction.confidence}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full accent-gradient"
        />
      </div>

      {prediction.confidenceFactors.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Factors Considered</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prediction.confidenceFactors.map((factor) => (
              <Badge key={factor} variant="copilot">{factor}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3.5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Why This Prediction</div>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{prediction.summary}</p>
      </div>
    </div>
  )
}
