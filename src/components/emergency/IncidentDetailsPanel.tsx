import { useState } from 'react'
import { AlertCircle, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EmergencyReport, EmergencyStatus } from '@/lib/api/emergencies'
import { INCIDENT_TYPE_META, SEVERITY_BADGE_VARIANT, SEVERITY_LABEL, STATUS_LABEL } from '@/lib/emergency/incidentTypes'
import { cn } from '@/lib/utils'

const SEVERITY_SLA_MINUTES: Record<EmergencyReport['severity'], number> = {
  critical: 5,
  high: 15,
  medium: 30,
  low: 60,
}

const STATUS_FLOW: EmergencyStatus[] = ['reported', 'dispatched', 'in-progress', 'resolved']

function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

interface IncidentDetailsPanelProps {
  incident: EmergencyReport | null
  regionLabel: string | null
  onUpdateStatus: (status: EmergencyStatus) => Promise<void>
  updating: boolean
}

export function IncidentDetailsPanel({ incident, regionLabel, onUpdateStatus, updating }: IncidentDetailsPanelProps) {
  const [statusError, setStatusError] = useState<string | null>(null)

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <AlertCircle className="size-6 text-text-muted" />
        <p className="text-sm text-text-muted">Select an incident to view details.</p>
      </div>
    )
  }

  const meta = INCIDENT_TYPE_META[incident.type]
  const elapsed = minutesSince(incident.createdAt)
  const slaMinutes = SEVERITY_SLA_MINUTES[incident.severity]
  const breached = incident.status !== 'resolved' && elapsed > slaMinutes
  const currentStepIndex = STATUS_FLOW.indexOf(incident.status)
  const nextStatus = incident.status === 'resolved' ? null : STATUS_FLOW[currentStepIndex + 1]

  const handleAdvance = async () => {
    if (!nextStatus) return
    setStatusError(null)
    try {
      await onUpdateStatus(nextStatus)
    } catch {
      setStatusError('Failed to update status. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: `${meta.color}22` }}>
            <meta.icon className="size-5" style={{ color: meta.color }} />
          </div>
          <div>
            <div className="text-base font-semibold text-text-primary">{meta.label}</div>
            <div className="text-xs text-text-muted">{STATUS_LABEL[incident.status] ?? incident.status}</div>
          </div>
        </div>
        <Badge variant={SEVERITY_BADGE_VARIANT[incident.severity]}>{SEVERITY_LABEL[incident.severity]}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-text-muted">
            <MapPin className="size-3" /> Location
          </div>
          <div className="mt-1 text-sm font-medium text-text-primary">
            {regionLabel ?? incident.location ?? 'Unspecified'}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-text-muted">
            <Clock className="size-3" /> Elapsed
          </div>
          <div className={cn('mt-1 text-sm font-medium', breached ? 'text-error' : 'text-text-primary')}>
            {elapsed}m / {slaMinutes}m SLA
          </div>
        </div>
      </div>

      {breached && (
        <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3 py-2 text-xs text-error">
          <AlertCircle className="size-3.5 shrink-0" />
          SLA breached — this incident has exceeded its {slaMinutes}-minute response target.
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Description</div>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          {incident.description || 'No description provided.'}
        </p>
      </div>

      <div className="text-xs text-text-muted">Reported {formatTimestamp(incident.createdAt)}</div>
      {incident.resolvedAt && (
        <div className="text-xs text-text-muted">Resolved {formatTimestamp(incident.resolvedAt)}</div>
      )}

      {statusError && <div className="text-xs text-error">{statusError}</div>}

      {nextStatus && (
        <Button variant="secondary" size="sm" className="w-full" loading={updating} onClick={handleAdvance}>
          Mark as {STATUS_LABEL[nextStatus] ?? nextStatus}
        </Button>
      )}
    </div>
  )
}
