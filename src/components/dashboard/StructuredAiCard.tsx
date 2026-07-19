import { CheckCircle2, Copy, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CopilotInsightCardProps } from '@/lib/copilot/schema'
import { cn } from '@/lib/utils'

interface StructuredAiCardProps {
  insight: CopilotInsightCardProps
  title?: string
  compact?: boolean
  markdownOverride?: string
  onCopy?: () => void
  onRegenerate?: () => void
}

function renderInlineMarkdown(text: string) {
  const segments = text.split(/(\*\*.*?\*\*)/g)

  return segments.map((segment, index) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {segment.slice(2, -2)}
        </strong>
      )
    }

    return <span key={index}>{segment}</span>
  })
}

function MarkdownBlock({ content }: { content: string }) {
  const lines = content.split('\n')
  const groups: Array<{ type: 'h2' | 'list' | 'p'; items: string[] }> = []
  let currentList: string[] = []

  const flushList = () => {
    if (currentList.length > 0) {
      groups.push({ type: 'list', items: currentList })
      currentList = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushList()
      continue
    }

    if (line.startsWith('- ')) {
      currentList.push(line.slice(2))
      continue
    }

    flushList()

    if (line.startsWith('## ')) {
      groups.push({ type: 'h2', items: [line.slice(3)] })
      continue
    }

    groups.push({ type: 'p', items: [line] })
  }

  flushList()

  return (
    <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
      {groups.map((group, index) => {
        if (group.type === 'h2') {
          return (
            <h4 key={index} className="text-sm font-semibold uppercase tracking-[0.18em] text-text-primary">
              {group.items[0]}
            </h4>
          )
        }

        if (group.type === 'list') {
          return (
            <ul key={index} className="space-y-2">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 rounded-full bg-accent" />
                  <span>{renderInlineMarkdown(item)}</span>
                </li>
              ))}
            </ul>
          )
        }

        return <p key={index}>{renderInlineMarkdown(group.items[0])}</p>
      })}
    </div>
  )
}

export function StructuredAiCard({
  insight,
  title = 'AI Recommendation',
  compact = false,
  markdownOverride,
  onCopy,
  onRegenerate,
}: StructuredAiCardProps) {
  return (
    <Card className={cn('border border-[var(--color-copilot-border)]/25', compact ? 'rounded-2xl' : '')}>
      <CardHeader className={cn(compact ? 'p-4 pb-3' : '')}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl accent-gradient">
              <Sparkles className="size-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base text-text-primary">{title}</CardTitle>
              <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                <Badge variant="copilot">Confidence {insight.confidence}%</Badge>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  Structured response
                </span>
              </div>
            </div>
          </div>

          {(onCopy || onRegenerate) && (
            <div className="flex items-center gap-2">
              {onCopy && (
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={onCopy}>
                  <Copy className="size-3.5" /> Copy
                </Button>
              )}
              {onRegenerate && (
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={onRegenerate}>
                  <RefreshCw className="size-3.5" /> Regenerate
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-4', compact ? 'p-4 pt-0' : '')}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-[var(--color-copilot-surface)]/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-accent">Recommendation</div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-text-primary">
              {insight.recommendation}
            </p>
          </div>

          <div className="rounded-2xl bg-[rgba(255,255,255,0.04)] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Prediction</div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {insight.prediction ?? 'Prediction unavailable for this scenario.'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-muted">
            <CheckCircle2 className="size-3.5 text-success" />
            Why this recommendation
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{insight.reasoning}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {insight.suggestedActions.map((action) => (
            <div
              key={action.action}
              className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4"
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Suggested Action</div>
              <div className="mt-2 text-sm font-medium text-text-primary">{action.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-text-muted">
                {action.variant === 'primary'
                  ? 'Execute immediately for the highest operational impact.'
                  : action.variant === 'secondary'
                    ? 'Queue this action after the lead response has started.'
                    : 'Optional follow-up for communication and audit trail.'}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Summary</div>
          <div className="mt-3">
            <MarkdownBlock content={markdownOverride ?? insight.summary} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
