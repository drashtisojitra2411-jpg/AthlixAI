import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Flame, HeartPulse, Inbox, Loader2, ShieldAlert, Siren, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useBookedEventSelector } from '@/hooks/useBookedEventSelector'
import { reportEmergency } from '@/lib/api/emergencies'
import type { EmergencyType } from '@/lib/api/emergencies'
import { ApiRequestError } from '@/lib/api/client'
import { EventSelect } from '@/components/shared/EventSelect'

const INCIDENT_TYPES: Array<{ type: EmergencyType; label: string; icon: typeof HeartPulse }> = [
  { type: 'medical', label: 'Medical', icon: HeartPulse },
  { type: 'fire', label: 'Fire', icon: Flame },
  { type: 'security', label: 'Security', icon: Siren },
  { type: 'lost-child', label: 'Lost Child', icon: UserX },
  { type: 'crowd-surge', label: 'Crowd Surge', icon: ShieldAlert },
  { type: 'gate-blockage', label: 'Gate Blockage', icon: AlertCircle },
]

export function VisitorEmergencyPage() {
  useEffect(() => {
    document.title = 'Emergency Help · ATHLIX'
  }, [])

  const { events, selectedEventId, selectEvent, loading: eventsLoading, error: eventsError } = useBookedEventSelector()
  const [type, setType] = useState<EmergencyType>('medical')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!selectedEventId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await reportEmergency({ event: selectedEventId, type, location: location || undefined, description: description || undefined })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof ApiRequestError ? err.message : 'Failed to send your report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <VisitorShell title="Emergency Help">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Emergency Help</h1>
          <p className="mt-0.5 text-sm text-text-muted">Alert on-site staff about an incident immediately.</p>
        </div>
        <EventSelect
          events={events}
          value={selectedEventId}
          onChange={(id) => {
            selectEvent(id)
            setSubmitted(false)
          }}
        />
      </motion.div>

      <div className="flex items-center gap-2 rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-3 text-sm text-warning">
        <AlertCircle className="size-4 shrink-0" /> For life-threatening emergencies, alert the nearest staff member or steward directly in addition to submitting this report.
      </div>

      {eventsLoading && (
        <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" /> Loading your events…
        </div>
      )}

      {!eventsLoading && eventsError && (
        <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {eventsError}
        </div>
      )}

      {!eventsLoading && !eventsError && events.length === 0 && (
        <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-3">
          <Inbox className="size-8 text-text-muted" />
          <h3 className="font-semibold text-text-primary">No upcoming events</h3>
          <p className="max-w-sm text-sm text-text-muted">You can report an incident once you've booked a ticket to an event.</p>
          <Link to="/visitor/events" className="text-sm text-accent hover:underline">Browse Events</Link>
        </div>
      )}

      {!eventsLoading && !eventsError && events.length > 0 && (
        <div className="glass-card rounded-2xl p-5 max-w-xl space-y-4">
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <CheckCircle2 className="size-10 text-success" />
              <h3 className="font-semibold text-text-primary">Report submitted</h3>
              <p className="text-sm text-text-muted">Event staff have been notified and will respond shortly.</p>
              <Button variant="ghost" onClick={() => { setSubmitted(false); setLocation(''); setDescription('') }}>
                Report another incident
              </Button>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Incident Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INCIDENT_TYPES.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => setType(option.type)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        type === option.type
                          ? 'border-error/40 bg-error/10 text-text-primary'
                          : 'border-[var(--color-border-default)] text-text-muted hover:bg-[var(--color-surface-hover)]'
                      }`}
                    >
                      <option.icon className="size-4 shrink-0" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="loc" className="mb-1.5 block text-sm font-medium text-text-secondary">Location (optional)</label>
                <input
                  id="loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. North Stand, Gate 4"
                  className="h-10 w-full rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] px-3.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                />
              </div>

              <div>
                <label htmlFor="desc" className="mb-1.5 block text-sm font-medium text-text-secondary">Description (optional)</label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What's happening?"
                  className="w-full resize-none rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] p-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                />
              </div>

              {submitError && (
                <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-2.5 text-sm text-error">
                  <AlertCircle className="size-4 shrink-0" /> {submitError}
                </div>
              )}

              <Button variant="danger" className="w-full" loading={submitting} onClick={handleSubmit}>
                Send Emergency Report
              </Button>
            </>
          )}
        </div>
      )}
    </VisitorShell>
  )
}
