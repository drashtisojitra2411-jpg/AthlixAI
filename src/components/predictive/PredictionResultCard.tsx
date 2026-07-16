import { motion } from 'framer-motion'
import { Car, Clock, HeartPulse, ShieldAlert, Sparkles, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { PredictionResult } from '@/lib/api/predictive'
import { RISK_LEVEL_COLORS } from '@/lib/predictive/riskLevelColors'

interface PredictionResultCardProps {
  prediction: PredictionResult
}

function RiskTile({ icon: Icon, label, riskLevel }: { icon: typeof Users; label: string; riskLevel: keyof typeof RISK_LEVEL_COLORS }) {
  const tone = RISK_LEVEL_COLORS[riskLevel]
  return (
    <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3.5">
      <div className="flex items-center gap-2 text-text-muted">
        <Icon className="size-3.5" />
        <span className="text-[11px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="mt-1.5 text-sm font-semibold" style={{ color: tone.fill }}>
        {tone.label}
      </div>
    </div>
  )
}

export function PredictionResultCard({ prediction }: PredictionResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl accent-gradient">
          <Sparkles className="size-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Prediction Summary</h3>
          <p className="text-xs text-text-muted">Simulated outcome — not live data</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">{prediction.summary}</p>

      <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3.5">
        <div className="flex items-center gap-2 text-text-muted">
          <Users className="size-3.5" />
          <span className="text-[11px] uppercase tracking-[0.14em]">Predicted Attendance</span>
        </div>
        <div className="mt-1 text-2xl font-bold text-text-primary tabular-nums">
          {prediction.predictedAttendance.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <RiskTile icon={Car} label="Parking Risk" riskLevel={prediction.parkingRisk} />
        <RiskTile icon={ShieldAlert} label="Security Risk" riskLevel={prediction.securityRisk} />
        <RiskTile icon={HeartPulse} label="Medical Risk" riskLevel={prediction.medicalRisk} />
      </div>

      <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted">
            <Clock className="size-3.5" />
            <span className="text-[11px] uppercase tracking-[0.14em]">Queue Prediction</span>
          </div>
          <Badge
            variant="outline"
            style={{ color: RISK_LEVEL_COLORS[prediction.queuePrediction.riskLevel].fill, borderColor: RISK_LEVEL_COLORS[prediction.queuePrediction.riskLevel].fill }}
          >
            {RISK_LEVEL_COLORS[prediction.queuePrediction.riskLevel].label}
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-text-secondary">{prediction.queuePrediction.estimate}</p>
      </div>

      {prediction.recommendedActions.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Recommended Actions</div>
          <div className="mt-2 space-y-2">
            {prediction.recommendedActions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-text-primary">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">
                  {i + 1}
                </span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
