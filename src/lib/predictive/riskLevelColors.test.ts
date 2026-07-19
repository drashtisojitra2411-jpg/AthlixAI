import { describe, expect, it } from 'vitest'
import { RISK_LEVEL_COLORS } from './riskLevelColors'

describe('RISK_LEVEL_COLORS', () => {
  it('defines an entry for every risk level the copilot can emit', () => {
    expect(Object.keys(RISK_LEVEL_COLORS).sort()).toEqual(['Critical', 'High', 'Low', 'Moderate'].sort())
  })

  it('gives each level a distinct fill color', () => {
    const fills = Object.values(RISK_LEVEL_COLORS).map((entry) => entry.fill)
    expect(new Set(fills).size).toBe(fills.length)
  })

  it('labels each entry with its own level name', () => {
    expect(RISK_LEVEL_COLORS.Critical.label).toBe('Critical')
    expect(RISK_LEVEL_COLORS.Low.label).toBe('Low')
  })
})
