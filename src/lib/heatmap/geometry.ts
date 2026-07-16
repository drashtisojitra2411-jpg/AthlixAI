export const VIEW_BOX = '0 0 1000 900'

export interface Point {
  x: number
  y: number
}

export type RegionShapeGeometry =
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; label: Point }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx: number; label: Point }
  | { type: 'circle'; cx: number; cy: number; r: number; label: Point }
  | { type: 'wedge'; d: string; label: Point }

const BOWL_CENTER: Point = { x: 500, y: 380 }
const FIELD_RADIUS = 230
const STAND_INNER_RADIUS = 250
const STAND_OUTER_RADIUS = 390
const GATE_RADIUS = 430

function polarToCartesian(center: Point, radius: number, angleDeg: number): Point {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y + radius * Math.sin(angleRad),
  }
}

function describeWedge(innerR: number, outerR: number, startAngle: number, endAngle: number): string {
  const startOuter = polarToCartesian(BOWL_CENTER, outerR, endAngle)
  const endOuter = polarToCartesian(BOWL_CENTER, outerR, startAngle)
  const startInner = polarToCartesian(BOWL_CENTER, innerR, startAngle)
  const endInner = polarToCartesian(BOWL_CENTER, innerR, endAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

// 10 stand/box regions as evenly-spaced 36° wedges around the field, in a
// fixed clockwise order starting at top (North). This is a schematic
// diagram, not a literal architectural drawing — wedge order/width is a
// visual choice only and carries no meaning beyond legibility.
const WEDGE_ORDER = [
  'north-stand',
  'premium-stand',
  'east-stand',
  'media-box',
  'corporate-boxes',
  'south-stand',
  'student-stand',
  'west-stand',
  'family-stand',
  'vip-lounge',
]

const WEDGE_ANGLE = 36
const WEDGE_START_OFFSET = -18

function wedgeGeometry(index: number): RegionShapeGeometry {
  const startAngle = WEDGE_START_OFFSET + index * WEDGE_ANGLE
  const endAngle = startAngle + WEDGE_ANGLE
  const midAngle = (startAngle + endAngle) / 2
  const midRadius = (STAND_INNER_RADIUS + STAND_OUTER_RADIUS) / 2
  const label = polarToCartesian(BOWL_CENTER, midRadius, midAngle)

  return {
    type: 'wedge',
    d: describeWedge(STAND_INNER_RADIUS, STAND_OUTER_RADIUS, startAngle, endAngle),
    label,
  }
}

const GATE_ANGLES: Record<string, number> = {
  'gate-a': 36,
  'gate-b': 126,
  'gate-c': 216,
  'gate-d': 306,
}

function gateGeometry(id: string): RegionShapeGeometry {
  const center = polarToCartesian(BOWL_CENTER, GATE_RADIUS, GATE_ANGLES[id])
  return { type: 'circle', cx: center.x, cy: center.y, r: 22, label: { x: center.x, y: center.y + 38 } }
}

const FACILITY_ROW_Y = 770
const FACILITY_HEIGHT = 90
const FACILITY_WIDTH = 150
const FACILITY_GAP = 20
const FACILITY_ORDER = ['parking-a', 'parking-b', 'food-court', 'medical-center', 'security-control-room']
const FACILITY_ROW_START_X =
  BOWL_CENTER.x - (FACILITY_ORDER.length * FACILITY_WIDTH + (FACILITY_ORDER.length - 1) * FACILITY_GAP) / 2

function facilityGeometry(id: string): RegionShapeGeometry {
  const index = FACILITY_ORDER.indexOf(id)
  const x = FACILITY_ROW_START_X + index * (FACILITY_WIDTH + FACILITY_GAP)
  return {
    type: 'rect',
    x,
    y: FACILITY_ROW_Y,
    width: FACILITY_WIDTH,
    height: FACILITY_HEIGHT,
    rx: 14,
    label: { x: x + FACILITY_WIDTH / 2, y: FACILITY_ROW_Y + FACILITY_HEIGHT / 2 },
  }
}

export const REGION_GEOMETRY: Record<string, RegionShapeGeometry> = {
  field: {
    type: 'ellipse',
    cx: BOWL_CENTER.x,
    cy: BOWL_CENTER.y,
    rx: FIELD_RADIUS,
    ry: FIELD_RADIUS,
    label: { x: BOWL_CENTER.x, y: BOWL_CENTER.y - FIELD_RADIUS + 40 },
  },
  pitch: {
    type: 'rect',
    x: BOWL_CENTER.x - 70,
    y: BOWL_CENTER.y - 30,
    width: 140,
    height: 60,
    rx: 8,
    label: { x: BOWL_CENTER.x, y: BOWL_CENTER.y },
  },
  ...Object.fromEntries(WEDGE_ORDER.map((id, index) => [id, wedgeGeometry(index)])),
  'gate-a': gateGeometry('gate-a'),
  'gate-b': gateGeometry('gate-b'),
  'gate-c': gateGeometry('gate-c'),
  'gate-d': gateGeometry('gate-d'),
  ...Object.fromEntries(FACILITY_ORDER.map((id) => [id, facilityGeometry(id)])),
}
