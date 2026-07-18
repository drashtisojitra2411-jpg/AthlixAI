import { describe, expect, it } from 'vitest'
import { deriveAttendanceForecast, generateSeatRecommendations, type CrowdZoneInput } from './engine'

function zone(overrides: Partial<CrowdZoneInput> = {}): CrowdZoneInput {
  return { zone: 'A', capacity: 60, count: 1000, max: 2000, status: 'normal', ...overrides }
}

describe('deriveAttendanceForecast', () => {
  it('classifies below-70% average capacity as Low risk', () => {
    const forecast = deriveAttendanceForecast([zone({ capacity: 60, count: 1000 })])
    expect(forecast.riskLevel).toBe('Low')
    expect(forecast.nextWaveEtaMinutes).toBe(24)
    expect(forecast.projectedPeak).toBe(1030)
  })

  it('classifies 70-84% average capacity as Moderate risk', () => {
    const forecast = deriveAttendanceForecast([zone({ capacity: 75, count: 1000 })])
    expect(forecast.riskLevel).toBe('Moderate')
    expect(forecast.nextWaveEtaMinutes).toBe(18)
    expect(forecast.projectedPeak).toBe(1050)
  })

  it('classifies 85%+ average capacity as High risk', () => {
    const forecast = deriveAttendanceForecast([zone({ capacity: 90, count: 1000 })])
    expect(forecast.riskLevel).toBe('High')
    expect(forecast.nextWaveEtaMinutes).toBe(12)
    expect(forecast.projectedPeak).toBe(1070)
  })

  it('sums attendance across all zones', () => {
    const forecast = deriveAttendanceForecast([
      zone({ zone: 'A', capacity: 50, count: 500 }),
      zone({ zone: 'B', capacity: 50, count: 700 }),
    ])
    expect(forecast.current).toBe(1200)
  })
})

describe('generateSeatRecommendations', () => {
  const baseInput = { budget: 'premium' as const, groupSize: 4, accessibility: false, vip: false, coveredSeating: false }

  it('returns exactly 3 recommendations sorted by fitScore descending', () => {
    const recommendations = generateSeatRecommendations(baseInput)
    expect(recommendations).toHaveLength(3)
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1].fitScore).toBeGreaterThanOrEqual(recommendations[i].fitScore)
    }
  })

  it('keeps every fitScore within the documented 52-98 bounds', () => {
    const recommendations = generateSeatRecommendations(baseInput)
    for (const rec of recommendations) {
      expect(rec.fitScore).toBeGreaterThanOrEqual(52)
      expect(rec.fitScore).toBeLessThanOrEqual(98)
    }
  })

  it('produces a different recommendation set for a tight value budget than an elite budget', () => {
    const valuePicks = generateSeatRecommendations({ ...baseInput, budget: 'value' }).map((r) => r.id)
    const elitePicks = generateSeatRecommendations({ ...baseInput, budget: 'elite' }).map((r) => r.id)
    expect(valuePicks).not.toEqual(elitePicks)
  })
})
