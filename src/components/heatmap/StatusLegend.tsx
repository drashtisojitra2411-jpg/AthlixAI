import { STATUS_COLORS, type RegionStatus } from '@/lib/heatmap/statusColors'

const LEGEND_ORDER: RegionStatus[] = ['normal', 'elevated', 'warning', 'critical', 'no-data']

export function StatusLegend() {
  return (
    <div className="glass-card flex flex-wrap items-center gap-4 rounded-2xl px-4 py-3">
      {LEGEND_ORDER.map((status) => {
        const tone = STATUS_COLORS[status]
        return (
          <div key={status} className="flex items-center gap-2 text-xs text-text-secondary">
            <span
              className="size-3 rounded-full"
              style={{
                background: status === 'no-data' ? 'transparent' : tone.fill,
                border: status === 'no-data' ? `1.5px dashed ${tone.fill}` : 'none',
              }}
            />
            {tone.label}
            {status !== 'no-data' && (
              <span className="text-text-muted">
                {status === 'normal' && '(0-60%)'}
                {status === 'elevated' && '(61-80%)'}
                {status === 'warning' && '(81-90%)'}
                {status === 'critical' && '(91-100%)'}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
