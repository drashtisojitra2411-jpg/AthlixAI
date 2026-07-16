import type { RiskLevel } from '@/lib/api/copilot'

// Local to the Predictive Operations feature only — mirrors the same hues
// used by the heatmap's status scale for visual consistency, without
// importing/touching src/lib/heatmap/statusColors.ts (that file stays
// scoped to live occupancy data).
export const RISK_LEVEL_COLORS: Record<RiskLevel, { fill: string; label: string }> = {
  Low: { fill: '#22c55e', label: 'Low' },
  Moderate: { fill: '#eab308', label: 'Moderate' },
  High: { fill: '#f97316', label: 'High' },
  Critical: { fill: '#ef4444', label: 'Critical' },
}
