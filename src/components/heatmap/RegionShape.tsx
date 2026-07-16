import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { RegionShapeGeometry } from '@/lib/heatmap/geometry'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import type { PredictedRegionOverlay } from '@/lib/heatmap/overlay'
import { FIELD_COLOR, PITCH_COLOR, STATUS_COLORS } from '@/lib/heatmap/statusColors'

interface RegionShapeProps {
  region: StadiumRegionData
  geometry: RegionShapeGeometry
  onSelect: (id: string) => void
  /** Optional predicted-value ring (Predictive Operations). Omit for live-only rendering — unchanged from before. */
  overlay?: PredictedRegionOverlay
}

function fillFor(region: StadiumRegionData): string {
  if (region.id === 'field') return FIELD_COLOR
  if (region.id === 'pitch') return PITCH_COLOR
  return STATUS_COLORS[region.status].fill
}

function isDecorative(region: StadiumRegionData): boolean {
  return region.id === 'field' || region.id === 'pitch'
}

function overlayRingFor(geometry: RegionShapeGeometry, color: string) {
  const ringProps = {
    fill: 'none',
    stroke: color,
    strokeWidth: 3,
    strokeDasharray: '5 4',
    style: { pointerEvents: 'none' as const },
  }

  if (geometry.type === 'ellipse') {
    return <motion.ellipse cx={geometry.cx} cy={geometry.cy} rx={geometry.rx + 4} ry={geometry.ry + 4} {...ringProps} />
  }
  if (geometry.type === 'rect') {
    return (
      <motion.rect
        x={geometry.x - 4}
        y={geometry.y - 4}
        width={geometry.width + 8}
        height={geometry.height + 8}
        rx={geometry.rx + 4}
        {...ringProps}
      />
    )
  }
  if (geometry.type === 'circle') {
    return <motion.circle cx={geometry.cx} cy={geometry.cy} r={geometry.r + 4} {...ringProps} />
  }
  return <motion.path d={geometry.d} {...ringProps} />
}

export function RegionShape({ region, geometry, onSelect, overlay }: RegionShapeProps) {
  const [hovered, setHovered] = useState(false)

  const fill = fillFor(region)
  const decorative = isDecorative(region)
  const dashed = !decorative && region.status === 'no-data'
  const glowColor = decorative ? 'rgba(255,255,255,0.35)' : STATUS_COLORS[region.status].glow

  const shapeStyle: React.CSSProperties = {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    filter: hovered ? `drop-shadow(0 0 10px ${glowColor})` : 'none',
    transition: 'filter 200ms ease',
    cursor: 'pointer',
  }

  const commonProps = {
    fill: decorative ? fill : `${fill}CC`,
    stroke: dashed ? STATUS_COLORS['no-data'].fill : fill,
    strokeWidth: 2,
    strokeDasharray: dashed ? '6 4' : undefined,
    style: shapeStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick: () => onSelect(region.id),
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 320, damping: 20 } as const,
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': `${region.label}: ${region.dataSource === 'LIVE' ? `${region.occupancyPercent}% occupied` : 'No live data'}`,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(region.id)
      }
    },
  }

  let shape: React.ReactNode
  if (geometry.type === 'ellipse') {
    shape = (
      <motion.ellipse
        cx={geometry.cx}
        cy={geometry.cy}
        rx={geometry.rx}
        ry={geometry.ry}
        {...commonProps}
      />
    )
  } else if (geometry.type === 'rect') {
    shape = (
      <motion.rect
        x={geometry.x}
        y={geometry.y}
        width={geometry.width}
        height={geometry.height}
        rx={geometry.rx}
        {...commonProps}
      />
    )
  } else if (geometry.type === 'circle') {
    shape = <motion.circle cx={geometry.cx} cy={geometry.cy} r={geometry.r} {...commonProps} />
  } else {
    shape = <motion.path d={geometry.d} {...commonProps} />
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>{shape}</TooltipTrigger>
        <TooltipContent side="top">
          <div className="flex items-center gap-1.5 font-medium text-text-primary">
            {region.dataSource === 'LIVE' ? '🟢 LIVE' : '⚪ NO LIVE DATA'}
            <span className="text-text-muted">· {region.label}</span>
          </div>
          {region.dataSource === 'LIVE' ? (
            <div className="mt-1 space-y-0.5 text-text-secondary">
              <div>Occupancy: {region.occupancyPercent}%</div>
              <div>
                {region.unit === 'vehicles' ? 'Vehicles' : 'People'}: {region.currentPeople} / {region.capacity}
              </div>
              <div>Status: {STATUS_COLORS[region.status].label}</div>
            </div>
          ) : (
            <div className="mt-1 text-text-muted">No live operational data available for this area.</div>
          )}
          {overlay && (
            <div className="mt-1 font-medium text-accent">🔮 Predicted: {overlay.predictedOccupancy}%</div>
          )}
        </TooltipContent>
      </Tooltip>
      <AnimatePresence>
        {overlay && (
          <motion.g
            key="prediction-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center', pointerEvents: 'none' }}
          >
            {overlayRingFor(geometry, STATUS_COLORS[overlay.status].fill)}
          </motion.g>
        )}
      </AnimatePresence>
    </>
  )
}
