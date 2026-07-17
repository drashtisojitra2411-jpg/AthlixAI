import { motion } from 'framer-motion'
import { AlertTriangle, Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { EmergencyReport } from '@/lib/api/emergencies'
import { INCIDENT_TYPE_META, SEVERITY_BADGE_VARIANT, SEVERITY_LABEL, STATUS_LABEL } from '@/lib/emergency/incidentTypes'
import { cn } from '@/lib/utils'

const SEVERITY_SLA_MINUTES: Record<EmergencyReport['severity'], number> = {
  critical: 5,
  high: 15,
  medium: 30,
  low: 60,
}

function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
}

function relativeTime(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}

interface IncidentListProps {
  incidents: EmergencyReport[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function IncidentList({ incidents, selectedId, onSelect }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Inbox className="size-6 text-text-muted" />
        <p className="text-sm text-text-muted">No active incidents. All clear.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      {incidents.map((incident, i) => {
        const meta = INCIDENT_TYPE_META[incident.type]
        const elapsed = minutesSince(incident.createdAt)
        const slaMinutes = SEVERITY_SLA_MINUTES[incident.severity]
        const breached = incident.status !== 'resolved' && elapsed > slaMinutes
        const selected = incident._id === selectedId

        return (
          <motion.button
            key={incident._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(incident._id)}
            className={cn(
              'w-full rounded-2xl border p-3 text-left transition-all',
              selected
                ? 'border-accent/40 bg-accent/10'
                : 'border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] hover:bg-[var(--color-surface-hover)]',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${meta.color}22` }}
                >
                  <meta.icon className="size-4" style={{ color: meta.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{meta.label}</div>
                  <div className="text-xs text-text-muted truncate">
                    {incident.location || 'Location unspecified'}
                  </div>
                </div>
              </div>
              <Badge variant={SEVERITY_BADGE_VARIANT[incident.severity]} className="shrink-0 text-[10px]">
                {SEVERITY_LABEL[incident.severity]}
              </Badge>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-text-muted">{STATUS_LABEL[incident.status] ?? incident.status}</span>
              <span className="text-text-muted">{relativeTime(elapsed)}</span>
            </div>

            {breached && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-error">
                <AlertTriangle className="size-3" />
                SLA breached ({slaMinutes}m target)
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
