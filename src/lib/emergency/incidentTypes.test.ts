import { describe, expect, it } from 'vitest'
import { INCIDENT_TYPE_META, INCIDENT_TYPES, SEVERITY_LABEL, SEVERITY_TO_REGION_STATUS } from './incidentTypes'

describe('INCIDENT_TYPES', () => {
  it('has metadata for every listed incident type', () => {
    for (const type of INCIDENT_TYPES) {
      expect(INCIDENT_TYPE_META[type]).toBeDefined()
      expect(INCIDENT_TYPE_META[type].label).toBeTruthy()
    }
  })

  it('lists exactly the six Command Center incident types, in order', () => {
    expect(INCIDENT_TYPES).toEqual([
      'medical',
      'security',
      'fire',
      'crowd-surge',
      'gate-blockage',
      'weather-alert',
    ])
  })
})

describe('SEVERITY_LABEL', () => {
  it('has a human-readable label for every severity level', () => {
    expect(SEVERITY_LABEL).toEqual({
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    })
  })
})

describe('SEVERITY_TO_REGION_STATUS', () => {
  it('escalates medium and high severity to the same warning ring', () => {
    expect(SEVERITY_TO_REGION_STATUS.medium).toBe('warning')
    expect(SEVERITY_TO_REGION_STATUS.high).toBe('warning')
  })

  it('maps critical severity to the critical region status', () => {
    expect(SEVERITY_TO_REGION_STATUS.critical).toBe('critical')
  })
})
