import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EmergencyAiRecommendation } from '@/lib/api/emergencies'
import { cn } from '@/lib/utils'

const RISK_BADGE_VARIANT: Record<EmergencyAiRecommendation['severity'], 'default' | 'info' | 'warning' | 'error'> = {
  Low: 'default',
  Moderate: 'info',
  High: 'warning',
  Critical: 'error',
}

const PRIORITY_BADGE_VARIANT: Record<EmergencyAiRecommendation['deploymentPriority'], 'default' | 'info' | 'warning' | 'error'> = {
  Low: 'default',
  Medium: 'info',
  High: 'warning',
  Immediate: 'error',
}

interface AiResponseRecommendationsProps {
  recommendation: EmergencyAiRecommendation | null
  loading: boolean
  error: string | null
  disabled: boolean
  onGenerate: () => void
}

export function AiResponseRecommendations({
  recommendation,
  loading,
  error,
  disabled,
  onGenerate,
}: AiResponseRecommendationsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl accent-gradient">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">AI Response Recommendations</div>
            <div className="text-xs text-text-muted">Powered by Athlix AI (Gemini)</div>
          </div>
        </div>
        <Button
          variant="copilot"
          size="sm"
          className="text-xs h-8 px-2.5 gap-1.5"
          disabled={disabled}
          loading={loading}
          onClick={onGenerate}
        >
          {recommendation ? <RefreshCw className="size-3.5" /> : <Sparkles className="size-3.5" />}
          {recommendation ? 'Regenerate' : 'Generate'}
        </Button>
      </div>

      {disabled && !recommendation && (
        <p className="text-sm text-text-muted">Select an incident to generate AI recommendations.</p>
      )}

      {loading && !recommendation && (
        <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" /> Analyzing incident context…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {recommendation && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[var(--color-copilot-surface)]/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-accent">Incident Summary</div>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{recommendation.incidentSummary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Severity</div>
              <Badge variant={RISK_BADGE_VARIANT[recommendation.severity]} className="mt-1.5">
                {recommendation.severity}
              </Badge>
            </div>
            <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Deployment Priority</div>
              <Badge variant={PRIORITY_BADGE_VARIANT[recommendation.deploymentPriority]} className="mt-1.5">
                {recommendation.deploymentPriority}
              </Badge>
            </div>
            <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Est. Resolution</div>
              <div className="mt-1.5 text-sm font-semibold text-text-primary tabular-nums">
                {recommendation.estimatedResolutionMinutes}m
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Confidence</div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
                  <div
                    className={cn('h-full rounded-full accent-gradient')}
                    style={{ width: `${recommendation.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-text-primary tabular-nums">
                  {recommendation.confidence}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Recommended Actions</div>
            <ul className="mt-2 space-y-2">
              {recommendation.recommendedActions.map((action) => (
                <li key={action} className="flex items-start gap-2 text-sm text-text-secondary">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
