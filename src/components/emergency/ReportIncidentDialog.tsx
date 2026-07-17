import { useState } from 'react'
import { AlertCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { EmergencySeverity, EmergencyReport, EmergencyType } from '@/lib/api/emergencies'
import { INCIDENT_TYPE_META, INCIDENT_TYPES, SEVERITY_LABEL } from '@/lib/emergency/incidentTypes'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'

const SEVERITIES: EmergencySeverity[] = ['low', 'medium', 'high', 'critical']

const selectClassName =
  'h-11 w-full rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.03)] border border-[var(--color-border-default)] px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]'

interface ReportIncidentDialogProps {
  onCreated: (report: EmergencyReport) => void
  onSubmit: (input: {
    type: EmergencyType
    severity: EmergencySeverity
    location: string
    description: string
  }) => Promise<EmergencyReport>
}

export function ReportIncidentDialog({ onCreated, onSubmit }: ReportIncidentDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<EmergencyType>('medical')
  const [severity, setSeverity] = useState<EmergencySeverity>('medium')
  const [regionId, setRegionId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setType('medical')
    setSeverity('medium')
    setRegionId('')
    setDescription('')
    setError(null)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const region = STADIUM_REGIONS.find((r) => r.id === regionId)
      const report = await onSubmit({
        type,
        severity,
        location: region?.label ?? '',
        description,
      })
      onCreated(report)
      setOpen(false)
      reset()
    } catch {
      setError('Failed to report incident. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" className="gap-1.5 text-xs">
          <Plus className="size-3.5" /> Report Incident
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>Logs a new emergency report for this event.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Incident Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as EmergencyType)} className={selectClassName}>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {INCIDENT_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as EmergencySeverity)}
              className={selectClassName}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {SEVERITY_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Stadium Region</label>
            <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className={selectClassName}>
              <option value="">Unspecified</option>
              {STADIUM_REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Description</label>
            <Input
              placeholder="Short description of the incident"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} loading={submitting}>
            Report Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
