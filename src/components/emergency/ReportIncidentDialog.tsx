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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { EmergencySeverity, EmergencyReport, EmergencyType } from '@/lib/api/emergencies'
import { INCIDENT_TYPE_META, INCIDENT_TYPES, SEVERITY_LABEL } from '@/lib/emergency/incidentTypes'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'

const SEVERITIES: EmergencySeverity[] = ['low', 'medium', 'high', 'critical']

// Radix Select items can't have an empty-string value (that's reserved for
// "no selection"), so "Unspecified" needs a real sentinel value that gets
// translated back to '' at the form-state boundary.
const UNSPECIFIED_REGION_VALUE = '__unspecified__'

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
            <Select value={type} onValueChange={(value) => setType(value as EmergencyType)}>
              <SelectTrigger className="h-11 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {INCIDENT_TYPE_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Severity</label>
            <Select value={severity} onValueChange={(value) => setSeverity(value as EmergencySeverity)}>
              <SelectTrigger className="h-11 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEVERITY_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Stadium Region</label>
            <Select
              value={regionId || UNSPECIFIED_REGION_VALUE}
              onValueChange={(value) => setRegionId(value === UNSPECIFIED_REGION_VALUE ? '' : value)}
            >
              <SelectTrigger className="h-11 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSPECIFIED_REGION_VALUE}>Unspecified</SelectItem>
                {STADIUM_REGIONS.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
