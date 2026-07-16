import { memo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Lightbulb, ShieldAlert, Sparkles, Target, TrendingUp, User2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CopilotAskResult, RiskLevel } from '@/lib/api/copilot'
import { cn } from '@/lib/utils'
import { TypingIndicator } from './TypingIndicator'

export interface ConversationTurn {
  id: string
  prompt: string
  status: 'pending' | 'done' | 'error'
  result?: CopilotAskResult
  errorMessage?: string
}

function riskBadgeVariant(risk: RiskLevel): 'success' | 'warning' | 'error' {
  if (risk === 'Low') return 'success'
  if (risk === 'Moderate') return 'warning'
  return 'error'
}

function ActionCard({ result }: { result: CopilotAskResult }) {
  const { actionCard } = result

  return (
    <div className="gradient-border rounded-2xl bg-[var(--color-copilot-surface)]/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          <Target className="size-3.5" />
          Action Card
        </div>
        <Badge variant={riskBadgeVariant(actionCard.riskLevel)}>{actionCard.riskLevel} Risk</Badge>
      </div>

      <div className="mt-3 space-y-2">
        {actionCard.topActions.map((action, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-text-primary">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">
              {i + 1}
            </span>
            <span>{action}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-[rgba(255,255,255,0.04)] p-3">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-text-muted">
          <TrendingUp className="size-3.5" /> Expected Operational Impact
        </div>
        <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{actionCard.expectedImpact}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Confidence</span>
        <span className="text-lg font-bold text-text-primary tabular-nums">{actionCard.confidence}%</span>
      </div>
    </div>
  )
}

function ConversationCardBase({ turn }: { turn: ConversationTurn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-end gap-2">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md border border-accent/20 bg-accent/10 px-4 py-2.5 text-sm text-text-primary">
          {turn.prompt}
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-card)]">
          <User2 className="size-4 text-text-primary" />
        </div>
      </div>

      {turn.status === 'pending' && <TypingIndicator />}

      {turn.status === 'error' && (
        <div className="flex items-center gap-2 rounded-2xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error">
          <AlertTriangle className="size-4 shrink-0" />
          {turn.errorMessage ?? 'Something went wrong. Please try again.'}
        </div>
      )}

      {turn.status === 'done' && turn.result && (
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl accent-gradient">
            <Sparkles className="size-4 text-white" />
          </div>
          <div className="min-w-0 flex-1 space-y-3 rounded-3xl border border-[var(--color-copilot-border)]/25 bg-[rgba(255,255,255,0.02)] p-4">
            <p className="text-sm leading-relaxed text-text-primary">{turn.result.summary}</p>

            {turn.result.insights.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-text-muted">
                  <Lightbulb className="size-3.5" /> Key Insights
                </div>
                <ul className="mt-2 space-y-1.5">
                  {turn.result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {turn.result.risks.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-text-muted">
                  <ShieldAlert className="size-3.5" /> Risks
                </div>
                <ul className="mt-2 space-y-1.5">
                  {turn.result.risks.map((risk, i) => (
                    <li key={i} className={cn('flex items-start gap-2 text-sm text-text-secondary')}>
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ActionCard result={turn.result} />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export const ConversationCard = memo(ConversationCardBase)
