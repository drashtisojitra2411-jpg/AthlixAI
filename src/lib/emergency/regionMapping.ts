import type { EmergencyReport } from '@/lib/api/emergencies'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'
import { INCIDENT_TYPE_META } from './incidentTypes'

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Resolves the stadium region an incident affects, for highlighting on the
 * shared StadiumMap. Tries an exact label/alias match against the incident's
 * free-text location first (same alias catalogue heatmap matching uses),
 * then falls back to the incident type's default facility region (e.g.
 * Medical -> Medical Center). Returns null rather than guessing when
 * neither resolves — an incident with an unrecognized location simply
 * doesn't highlight a region.
 */
export function mapIncidentToRegionId(incident: Pick<EmergencyReport, 'type' | 'location'>): string | null {
  const location = incident.location?.trim()
  if (location) {
    const normalizedLocation = normalize(location)
    const match = STADIUM_REGIONS.find(
      (region) =>
        normalize(region.label) === normalizedLocation ||
        region.aliases.some((alias) => normalize(alias) === normalizedLocation),
    )
    if (match) return match.id
  }

  return INCIDENT_TYPE_META[incident.type]?.defaultRegionId ?? null
}
