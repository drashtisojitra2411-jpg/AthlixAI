import { describe, expect, it } from 'vitest'
import type { CrowdZoneInput, ParkingInput } from '@/lib/copilot/engine'
import { matchStadiumRegions } from './matchRegions'
import type { RegionConfig } from './regions.config'

function region(overrides: Partial<RegionConfig> = {}): RegionConfig {
  return {
    id: 'north-stand',
    label: 'North Stand',
    category: 'stand',
    aliases: ['north'],
    description: 'General seating on the north side.',
    unit: 'people',
    ...overrides,
  }
}

function crowdZone(overrides: Partial<CrowdZoneInput> = {}): CrowdZoneInput {
  return { zone: 'North Stand', capacity: 60, count: 500, max: 1000, status: 'normal', ...overrides }
}

function parkingLot(overrides: Partial<ParkingInput> = {}): ParkingInput {
  return {
    lot: 'Lot A',
    total: 200,
    occupied: 50,
    status: 'available',
    walkingMinutes: 5,
    gate: 'A',
    trafficLevel: 'Low',
    ...overrides,
  }
}

describe('matchStadiumRegions', () => {
  it('always returns NO_DATA for field-category regions, regardless of matching records', () => {
    const [result] = matchStadiumRegions(
      [region({ category: 'field', label: 'Field', aliases: ['field'] })],
      [crowdZone({ zone: 'Field' })],
      [],
      null,
    )
    expect(result.dataSource).toBe('NO_DATA')
    expect(result.status).toBe('no-data')
  })

  it('aggregates matching crowd zones into a live stand/gate/facility region', () => {
    const [result] = matchStadiumRegions(
      [region()],
      [crowdZone({ zone: 'North Stand', count: 300, max: 500 }), crowdZone({ zone: 'North Overflow', count: 100, max: 200 })],
      [],
      '2026-01-01T00:00:00Z',
    )
    // "North Overflow" must NOT match "North Stand" — anchored matching prevents unrelated zones that merely share a word from over-matching.
    expect(result.dataSource).toBe('LIVE')
    expect(result.currentPeople).toBe(300)
    expect(result.capacity).toBe(500)
    expect(result.occupancyPercent).toBe(60)
  })

  it('returns NO_DATA for a stand region with no matching crowd zone', () => {
    const [result] = matchStadiumRegions([region()], [crowdZone({ zone: 'Unrelated Zone' })], [], null)
    expect(result.dataSource).toBe('NO_DATA')
  })

  it('matches parking regions against parking lot records, not crowd zones', () => {
    const [result] = matchStadiumRegions(
      [region({ id: 'lot-a', label: 'Lot A', category: 'parking', aliases: [] })],
      [],
      [parkingLot({ lot: 'Lot A', occupied: 80, total: 200 })],
      null,
    )
    expect(result.dataSource).toBe('LIVE')
    expect(result.currentPeople).toBe(80)
    expect(result.capacity).toBe(200)
    expect(result.occupancyPercent).toBe(40)
  })

  it('derives status from the computed occupancy percentage', () => {
    const [result] = matchStadiumRegions(
      [region()],
      [crowdZone({ zone: 'North Stand', count: 950, max: 1000 })],
      [],
      null,
    )
    expect(result.occupancyPercent).toBe(95)
    expect(result.status).toBe('critical')
  })
})
