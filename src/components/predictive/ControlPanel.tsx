import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MatchImportance, PredictiveControls } from '@/lib/api/predictive'

interface ControlPanelProps {
  controls: PredictiveControls
  onChange: (controls: PredictiveControls) => void
  onRun: () => void
  running: boolean
  disabled?: boolean
}

const WEATHER_OPTIONS = ['Clear', 'Partly Cloudy', 'Rain', 'Heatwave', 'Storm', 'Windy']
const MATCH_IMPORTANCE_OPTIONS: MatchImportance[] = ['Low', 'Medium', 'High', 'Critical']

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs font-semibold text-text-primary tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-accent"
      />
    </div>
  )
}

export function ControlPanel({ controls, onChange, onRun, running, disabled }: ControlPanelProps) {
  const set = <K extends keyof PredictiveControls>(key: K, value: PredictiveControls[K]) => {
    onChange({ ...controls, [key]: value })
  }

  return (
    <div className="glass-card rounded-3xl p-5 space-y-5">
      <div>
        <h2 className="font-semibold text-text-primary">Simulation Controls</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Adjust hypothetical conditions, then run a prediction against the live baseline.
        </p>
      </div>

      <RangeField
        label="Attendance Change"
        value={controls.attendanceChangePercent}
        min={-50}
        max={100}
        step={5}
        suffix="%"
        onChange={(value) => set('attendanceChangePercent', value)}
      />

      <div>
        <Label>Weather</Label>
        <Select value={controls.weather} onValueChange={(value) => set('weather', value)}>
          <SelectTrigger className="mt-2 h-10 w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEATHER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Match Importance</Label>
        <Select
          value={controls.matchImportance}
          onValueChange={(value) => set('matchImportance', value as MatchImportance)}
        >
          <SelectTrigger className="mt-2 h-10 w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MATCH_IMPORTANCE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RangeField
        label="Open Gates"
        value={controls.openGates}
        min={0}
        max={4}
        step={1}
        onChange={(value) => set('openGates', value)}
      />

      <RangeField
        label="Parking Availability"
        value={controls.parkingAvailabilityPercent}
        min={0}
        max={100}
        step={5}
        suffix="%"
        onChange={(value) => set('parkingAvailabilityPercent', value)}
      />

      <div>
        <Label>Security Staff</Label>
        <Input
          type="number"
          min={0}
          className="mt-2"
          value={controls.securityStaffCount}
          onChange={(event) => set('securityStaffCount', Math.max(0, Number(event.target.value) || 0))}
        />
      </div>

      <div>
        <Label>Medical Staff</Label>
        <Input
          type="number"
          min={0}
          className="mt-2"
          value={controls.medicalStaffCount}
          onChange={(event) => set('medicalStaffCount', Math.max(0, Number(event.target.value) || 0))}
        />
      </div>

      <Button className="w-full gap-2" onClick={onRun} loading={running} disabled={disabled}>
        <Sparkles className="size-4" />
        {running ? 'Running Prediction…' : 'Run Prediction'}
      </Button>
    </div>
  )
}
