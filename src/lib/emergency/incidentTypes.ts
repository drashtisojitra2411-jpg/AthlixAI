import {
  CloudLightning,
  DoorClosed,
  Flame,
  HeartPulse,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { EmergencySeverity, EmergencyType } from '@/lib/api/emergencies'
import type { RegionStatus } from '@/lib/heatmap/statusColors'

export interface IncidentTypeMeta {
  label: string
  icon: LucideIcon
  color: string
  /** Facility region this incident type maps to when no location text is set. */
  defaultRegionId: string | null
}

/** The six incident types the Emergency Command Center supports, in display order. */
export const INCIDENT_TYPES: EmergencyType[] = [
  'medical',
  'security',
  'fire',
  'crowd-surge',
  'gate-blockage',
  'weather-alert',
]

export const INCIDENT_TYPE_META: Record<EmergencyType, IncidentTypeMeta> = {
  medical: { label: 'Medical', icon: HeartPulse, color: '#ef4444', defaultRegionId: 'medical-center' },
  security: { label: 'Security', icon: ShieldAlert, color: '#f97316', defaultRegionId: 'security-control-room' },
  fire: { label: 'Fire', icon: Flame, color: '#dc2626', defaultRegionId: null },
  'crowd-surge': { label: 'Crowd Surge', icon: Users, color: '#eab308', defaultRegionId: null },
  'gate-blockage': { label: 'Gate Blockage', icon: DoorClosed, color: '#3b82f6', defaultRegionId: null },
  'weather-alert': { label: 'Weather Alert', icon: CloudLightning, color: '#6366f1', defaultRegionId: null },
  // Legacy type predating the Command Center's 6 supported types — kept so
  // older EmergencyReport records still render instead of crashing.
  'lost-child': { label: 'Lost Child', icon: Users, color: '#8b5cf6', defaultRegionId: null },
}

export const SEVERITY_LABEL: Record<EmergencySeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const SEVERITY_BADGE_VARIANT: Record<EmergencySeverity, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
}

/** Maps a report's stored severity to the heatmap's region-status color scale, for the overlay ring. */
export const SEVERITY_TO_REGION_STATUS: Record<EmergencySeverity, RegionStatus> = {
  low: 'elevated',
  medium: 'warning',
  high: 'warning',
  critical: 'critical',
}

export const STATUS_LABEL: Record<string, string> = {
  reported: 'Reported',
  dispatched: 'Dispatched',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
}
