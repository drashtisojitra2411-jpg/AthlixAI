import { describe, expect, it } from 'vitest'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import { pickCongestionRegion } from './pickCongestionRegion'

function liveRegion(overrides: Partial<StadiumRegionData> = {}): StadiumRegionData {
  return {
    id: 'south-stand',
    label: 'South Stand',
    category: 'stand',
    description: '',
    unit: 'people',
    dataSource: 'LIVE',
    status: 'elevated',
    occupancyPercent: 70,
    ...overrides,
  }
}

describe('pickCongestionRegion', () => {
  it('picks the highest-occupancy live region that is not normal status', () => {
    const result = pickCongestionRegion([
      liveRegion({ id: 'a', occupancyPercent: 70, status: 'elevated' }),
      liveRegion({ id: 'b', occupancyPercent: 95, status: 'critical' }),
      liveRegion({ id: 'c', occupancyPercent: 82, status: 'warning' }),
    ])
    expect(result.id).toBe('b')
    expect(result.occupancyPercent).toBe(95)
    expect(result.isLive).toBe(true)
  })

  it('ignores live regions at normal status', () => {
    const result = pickCongestionRegion([
      liveRegion({ id: 'normal-one', occupancyPercent: 99, status: 'normal' }),
    ])
    expect(result.isLive).toBe(false)
    expect(result.id).toBe('north-stand')
  })

  it('falls back to the scripted demo region when there are no elevated live regions', () => {
    const result = pickCongestionRegion([])
    expect(result).toEqual({ id: 'north-stand', label: 'North Stand', occupancyPercent: 92, isLive: false })
  })

  it('ignores NO_DATA regions even if present alongside live ones', () => {
    const result = pickCongestionRegion([
      { id: 'x', label: 'X', category: 'stand', description: '', unit: 'people', dataSource: 'NO_DATA', status: 'no-data' },
      liveRegion({ id: 'live', occupancyPercent: 88, status: 'warning' }),
    ])
    expect(result.id).toBe('live')
  })
})
