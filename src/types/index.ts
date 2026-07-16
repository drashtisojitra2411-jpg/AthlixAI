export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: string
}

export interface StatMetric {
  id: string
  label: string
  value: number
  trend: number
  prefix?: string
  suffix?: string
}

export interface BentoItem {
  id: string
  title: string
  description: string
  span: 'sm' | 'md' | 'lg' | 'xl'
  metric?: string
  icon: string
  accent?: 'violet' | 'blue' | 'green' | 'amber'
}

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: string
  group: 'recent' | 'navigation' | 'copilot' | 'actions'
  action: () => void
}

export type Theme = 'dark'
