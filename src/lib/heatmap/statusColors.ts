export type RegionStatus = 'normal' | 'elevated' | 'warning' | 'critical' | 'no-data'

export const STATUS_COLORS: Record<RegionStatus, { fill: string; glow: string; label: string }> = {
  normal: { fill: '#22c55e', glow: 'rgba(34, 197, 94, 0.55)', label: 'Normal' },
  elevated: { fill: '#eab308', glow: 'rgba(234, 179, 8, 0.55)', label: 'Elevated' },
  warning: { fill: '#f97316', glow: 'rgba(249, 115, 22, 0.55)', label: 'Warning' },
  critical: { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.55)', label: 'Critical' },
  'no-data': { fill: '#6b7280', glow: 'rgba(107, 114, 128, 0.35)', label: 'No Live Data' },
}

// Decorative-only colors for the field/pitch — deliberately distinct from the
// status scale above so "turf green" is never mistaken for "normal occupancy".
export const FIELD_COLOR = '#14532d'
export const PITCH_COLOR = '#c9a66b'

export function occupancyToStatus(percent: number): Exclude<RegionStatus, 'no-data'> {
  if (percent <= 60) return 'normal'
  if (percent <= 80) return 'elevated'
  if (percent <= 90) return 'warning'
  return 'critical'
}
