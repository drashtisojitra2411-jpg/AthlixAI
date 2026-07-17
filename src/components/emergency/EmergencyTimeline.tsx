import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import type { EmergencyReport } from '@/lib/api/emergencies'
import { INCIDENT_TYPE_META } from '@/lib/emergency/incidentTypes'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  key: string
  at: number
  label: string
  detail: string
  color: string
  kind: 'reported' | 'resolved'
}

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface EmergencyTimelineProps {
  incidents: EmergencyReport[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function EmergencyTimeline({ incidents, selectedId, onSelect }: EmergencyTimelineProps) {
  const events: TimelineEvent[] = incidents
    .flatMap((incident) => {
      const meta = INCIDENT_TYPE_META[incident.type]
      const entries: TimelineEvent[] = [
        {
          key: `${incident._id}-reported`,
          at: new Date(incident.createdAt).getTime(),
          label: `${meta.label} reported`,
          detail: incident.location || 'Location unspecified',
          color: meta.color,
          kind: 'reported',
        },
      ]
      if (incident.resolvedAt) {
        entries.push({
          key: `${incident._id}-resolved`,
          at: new Date(incident.resolvedAt).getTime(),
          label: `${meta.label} resolved`,
          detail: incident.location || 'Location unspecified',
          color: '#22c55e',
          kind: 'resolved',
        })
      }
      return entries.map((entry) => ({ ...entry, id: incident._id }))
    })
    .sort((a, b) => b.at - a.at)
    .slice(0, 12)

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Inbox className="size-6 text-text-muted" />
        <p className="text-sm text-text-muted">No emergency activity recorded for this event yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event, i) => {
        const incidentId = (event as TimelineEvent & { id: string }).id
        return (
          <motion.button
            key={event.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(incidentId)}
            className="flex w-full items-start gap-3 text-left"
          >
            <div className="flex flex-col items-center shrink-0">
              <span
                className={cn('size-2.5 rounded-full ring-4', incidentId === selectedId && 'ring-accent/30')}
                style={{ background: event.color, boxShadow: `0 0 0 4px ${event.color}22` }}
              />
              {i < events.length - 1 && <div className="w-px h-6 mt-1 bg-[var(--color-border-default)]" />}
            </div>
            <div className="flex-1 min-w-0 -mt-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'text-sm truncate',
                    incidentId === selectedId ? 'text-accent font-medium' : 'text-text-secondary',
                  )}
                >
                  {event.label}
                </span>
                <span className="text-xs text-text-muted tabular-nums shrink-0">{formatTime(event.at)}</span>
              </div>
              <div className="text-xs text-text-muted mt-0.5 truncate">{event.detail}</div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
