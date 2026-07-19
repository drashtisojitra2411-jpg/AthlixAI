import { describe, expect, it } from 'vitest'
import { occupancyToStatus, STATUS_COLORS } from './statusColors'

describe('occupancyToStatus', () => {
  it('classifies 0-60% as normal', () => {
    expect(occupancyToStatus(0)).toBe('normal')
    expect(occupancyToStatus(60)).toBe('normal')
  })

  it('classifies 61-80% as elevated', () => {
    expect(occupancyToStatus(61)).toBe('elevated')
    expect(occupancyToStatus(80)).toBe('elevated')
  })

  it('classifies 81-90% as warning', () => {
    expect(occupancyToStatus(81)).toBe('warning')
    expect(occupancyToStatus(90)).toBe('warning')
  })

  it('classifies over 90% as critical', () => {
    expect(occupancyToStatus(91)).toBe('critical')
    expect(occupancyToStatus(150)).toBe('critical')
  })
})

describe('STATUS_COLORS', () => {
  it('has a color entry for every possible occupancyToStatus output plus no-data', () => {
    expect(Object.keys(STATUS_COLORS).sort()).toEqual(
      ['normal', 'elevated', 'warning', 'critical', 'no-data'].sort(),
    )
  })
})
