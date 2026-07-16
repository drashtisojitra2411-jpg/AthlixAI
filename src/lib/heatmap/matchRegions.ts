import type { CrowdZoneInput, ParkingInput } from '@/lib/copilot/engine'
import type { RegionConfig } from './regions.config'
import { occupancyToStatus, type RegionStatus } from './statusColors'

export type DataSource = 'LIVE' | 'NO_DATA'

export interface StadiumRegionData {
  id: string
  label: string
  category: RegionConfig['category']
  description: string
  unit: RegionConfig['unit']
  dataSource: DataSource
  status: RegionStatus
  occupancyPercent?: number
  currentPeople?: number
  capacity?: number
  /** Backend-generated timestamp (EventOperationalSummary.generatedAt). Only ever set for LIVE regions. */
  lastUpdated?: string
  /** Names of the underlying zone/lot record(s) that fed this region, for drawer transparency. */
  matchedSources?: string[]
}

export interface MatchRegionsOptions {
  /**
   * Reserved for a future AI Simulation Mode. Only 'live' exists today, it is
   * the default, and it does not alter any matching/aggregation logic below —
   * this option is a placeholder so callers don't need to change their API
   * when simulation mode ships.
   */
  mode?: 'live'
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Below this normalized length, a name (e.g. "north", "vip") is too generic
// to safely anchor a startsWith/endsWith match — it would also match
// unrelated names that merely begin or end with the same word (e.g. "North
// Overflow"). Short names are still matchable, just only via an exact match
// (tiers 1-2), never via tiers 3-4.
const MIN_ANCHOR_LENGTH = 6

/**
 * Alias-first matching, in priority order — no generic "contains anywhere"
 * substring matching, which is what previously let unrelated names like
 * "North Overflow" accidentally match "North Stand":
 *   1. Exact normalized match against the region's canonical label
 *   2. Exact normalized match against one of the region's configured aliases
 *   3. Record name starts with a sufficiently specific label/alias
 *   4. Record name ends with a sufficiently specific label/alias
 */
function isRegionMatch(recordName: string, region: RegionConfig): boolean {
  const normalizedRecord = normalize(recordName)
  if (!normalizedRecord) return false

  const normalizedLabel = normalize(region.label)
  const normalizedAliases = region.aliases.map(normalize).filter(Boolean)

  // Tier 1: exact match against the canonical label.
  if (normalizedRecord === normalizedLabel) return true

  // Tier 2: exact match against any alias.
  if (normalizedAliases.includes(normalizedRecord)) return true

  const anchors = [normalizedLabel, ...normalizedAliases].filter(
    (candidate) => candidate.length >= MIN_ANCHOR_LENGTH,
  )

  // Tier 3: record name starts with a specific label/alias.
  if (anchors.some((anchor) => normalizedRecord.startsWith(anchor))) return true

  // Tier 4: record name ends with a specific label/alias.
  if (anchors.some((anchor) => normalizedRecord.endsWith(anchor))) return true

  return false
}

function noData(region: RegionConfig): StadiumRegionData {
  return {
    id: region.id,
    label: region.label,
    category: region.category,
    description: region.description,
    unit: region.unit,
    dataSource: 'NO_DATA',
    status: 'no-data',
  }
}

function liveRegion(
  region: RegionConfig,
  currentPeople: number,
  capacity: number,
  matchedSources: string[],
  generatedAt: string | null,
): StadiumRegionData {
  const occupancyPercent = capacity > 0 ? Math.round((currentPeople / capacity) * 100) : 0

  return {
    id: region.id,
    label: region.label,
    category: region.category,
    description: region.description,
    unit: region.unit,
    dataSource: 'LIVE',
    status: occupancyToStatus(occupancyPercent),
    occupancyPercent,
    currentPeople,
    capacity,
    lastUpdated: generatedAt ?? undefined,
    matchedSources,
  }
}

/**
 * Pure function: maps every configured stadium region to live data by fuzzy
 * name-matching against the event's real CrowdPrediction/ParkingPrediction
 * records. Regions with no matching record — including every region with no
 * backend occupancy concept at all (field/pitch/facilities) — get an honest
 * NO_DATA result. Nothing is ever fabricated.
 */
export function matchStadiumRegions(
  regions: RegionConfig[],
  crowd: CrowdZoneInput[],
  parking: ParkingInput[],
  generatedAt: string | null,
  _options: MatchRegionsOptions = {},
): StadiumRegionData[] {
  return regions.map((region) => {
    // Only field/pitch are exempt from occupancy matching entirely — a
    // playing surface has no spectator-occupancy concept. Facilities
    // (Food Court, Medical Center, Security Control Room) DO still try to
    // match a real CrowdPrediction zone named after them (e.g. an operator
    // tracking Food Court queue congestion as a zone) — per the rule that
    // any region with matching backend data shows real values, regardless
    // of category.
    if (region.category === 'field') {
      return noData(region)
    }

    if (region.category === 'stand' || region.category === 'gate' || region.category === 'facility') {
      const matches = crowd.filter((zone) => isRegionMatch(zone.zone, region))
      if (matches.length === 0) return noData(region)

      const currentPeople = matches.reduce((sum, zone) => sum + zone.count, 0)
      const capacity = matches.reduce((sum, zone) => sum + zone.max, 0)
      return liveRegion(
        region,
        currentPeople,
        capacity,
        matches.map((zone) => zone.zone),
        generatedAt,
      )
    }

    // region.category === 'parking'
    const matches = parking.filter((lot) => isRegionMatch(lot.lot, region))
    if (matches.length === 0) return noData(region)

    const currentPeople = matches.reduce((sum, lot) => sum + lot.occupied, 0)
    const capacity = matches.reduce((sum, lot) => sum + lot.total, 0)
    return liveRegion(
      region,
      currentPeople,
      capacity,
      matches.map((lot) => lot.lot),
      generatedAt,
    )
  })
}
