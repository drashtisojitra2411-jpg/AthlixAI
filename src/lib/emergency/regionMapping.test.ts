import { describe, expect, it } from 'vitest'
import { mapIncidentToRegionId } from './regionMapping'

describe('mapIncidentToRegionId', () => {
  it('matches an exact region label', () => {
    expect(mapIncidentToRegionId({ type: 'security', location: 'North Stand' })).toBe('north-stand')
  })

  it('matches case-insensitively and ignores punctuation/whitespace', () => {
    expect(mapIncidentToRegionId({ type: 'security', location: '  north-STAND  ' })).toBe('north-stand')
  })

  it('matches a configured alias', () => {
    expect(mapIncidentToRegionId({ type: 'security', location: 'north' })).toBe('north-stand')
  })

  it('falls back to the incident type default region when location is blank', () => {
    expect(mapIncidentToRegionId({ type: 'medical', location: '' })).toBe('medical-center')
  })

  it('falls back to the incident type default region when location does not resolve', () => {
    expect(mapIncidentToRegionId({ type: 'medical', location: 'Somewhere unrecognized' })).toBe('medical-center')
  })

  it('returns null when neither location nor incident type default resolves', () => {
    expect(mapIncidentToRegionId({ type: 'fire', location: 'Somewhere unrecognized' })).toBeNull()
  })
})
