export type RegionCategory = 'field' | 'stand' | 'gate' | 'parking' | 'facility'

export interface RegionConfig {
  id: string
  label: string
  category: RegionCategory
  /** Normalized alias strings a live backend record's name may fuzzy-match against. */
  aliases: string[]
  description: string
  /** What "Current People" / "Capacity" actually count for this region. */
  unit: 'people' | 'vehicles'
}

export const STADIUM_REGIONS: RegionConfig[] = [
  {
    id: 'field',
    label: 'Field',
    category: 'field',
    aliases: ['field', 'ground', 'outfield'],
    description: 'The playing outfield.',
    unit: 'people',
  },
  {
    id: 'pitch',
    label: 'Pitch',
    category: 'field',
    aliases: ['pitch', 'wicket'],
    description: 'The central cricket pitch.',
    unit: 'people',
  },
  {
    id: 'north-stand',
    label: 'North Stand',
    category: 'stand',
    aliases: ['north stand', 'north'],
    description: 'General seating stand on the north side of the ground.',
    unit: 'people',
  },
  {
    id: 'south-stand',
    label: 'South Stand',
    category: 'stand',
    aliases: ['south stand', 'south'],
    description: 'General seating stand on the south side of the ground.',
    unit: 'people',
  },
  {
    id: 'east-stand',
    label: 'East Stand',
    category: 'stand',
    aliases: ['east stand', 'east'],
    description: 'General seating stand on the east side of the ground.',
    unit: 'people',
  },
  {
    id: 'west-stand',
    label: 'West Stand',
    category: 'stand',
    aliases: ['west stand', 'west'],
    description: 'General seating stand on the west side of the ground.',
    unit: 'people',
  },
  {
    id: 'premium-stand',
    label: 'Premium Stand',
    category: 'stand',
    aliases: ['premium stand', 'premium'],
    description: 'Premium-tier seating with enhanced sightlines.',
    unit: 'people',
  },
  {
    id: 'vip-lounge',
    label: 'VIP Lounge',
    category: 'stand',
    aliases: ['vip lounge', 'vip'],
    description: 'VIP hospitality lounge.',
    unit: 'people',
  },
  {
    id: 'corporate-boxes',
    label: 'Corporate Boxes',
    category: 'stand',
    aliases: ['corporate boxes', 'corporate box', 'corporate'],
    description: 'Private corporate hospitality boxes.',
    unit: 'people',
  },
  {
    id: 'media-box',
    label: 'Media Box',
    category: 'stand',
    aliases: ['media box', 'press box', 'media'],
    description: 'Media and broadcast box.',
    unit: 'people',
  },
  {
    id: 'family-stand',
    label: 'Family Stand',
    category: 'stand',
    aliases: ['family stand', 'family'],
    description: 'Family-friendly seating stand.',
    unit: 'people',
  },
  {
    id: 'student-stand',
    label: 'Student Stand',
    category: 'stand',
    aliases: ['student stand', 'student'],
    description: 'Discounted seating stand for students.',
    unit: 'people',
  },
  {
    id: 'gate-a',
    label: 'Gate A',
    category: 'gate',
    aliases: ['gate a'],
    description: 'Spectator entry/exit gate A.',
    unit: 'people',
  },
  {
    id: 'gate-b',
    label: 'Gate B',
    category: 'gate',
    aliases: ['gate b'],
    description: 'Spectator entry/exit gate B.',
    unit: 'people',
  },
  {
    id: 'gate-c',
    label: 'Gate C',
    category: 'gate',
    aliases: ['gate c'],
    description: 'Spectator entry/exit gate C.',
    unit: 'people',
  },
  {
    id: 'gate-d',
    label: 'Gate D',
    category: 'gate',
    aliases: ['gate d'],
    description: 'Spectator entry/exit gate D.',
    unit: 'people',
  },
  {
    id: 'parking-a',
    label: 'Parking A',
    category: 'parking',
    aliases: ['parking a', 'lot a'],
    description: 'Vehicle parking lot A.',
    unit: 'vehicles',
  },
  {
    id: 'parking-b',
    label: 'Parking B',
    category: 'parking',
    aliases: ['parking b', 'lot b'],
    description: 'Vehicle parking lot B.',
    unit: 'vehicles',
  },
  {
    id: 'food-court',
    label: 'Food Court',
    category: 'facility',
    aliases: ['food court', 'food'],
    description: 'Concessions and dining facility.',
    unit: 'people',
  },
  {
    id: 'medical-center',
    label: 'Medical Center',
    category: 'facility',
    aliases: ['medical center', 'medical centre', 'medical', 'first aid'],
    description: 'On-site medical facility.',
    unit: 'people',
  },
  {
    id: 'security-control-room',
    label: 'Security Control Room',
    category: 'facility',
    aliases: ['security control room', 'control room', 'security'],
    description: 'Central security monitoring room.',
    unit: 'people',
  },
]
