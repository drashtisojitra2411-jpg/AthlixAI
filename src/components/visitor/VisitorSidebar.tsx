import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Zap, Home, CalendarSearch, Ticket, Map, Car, UtensilsCrossed,
  Sparkles, LifeBuoy, User2, PanelLeftClose, PanelLeft, LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const VISITOR_NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/visitor' },
  { icon: CalendarSearch, label: 'Browse Events', path: '/visitor/events' },
  { icon: Ticket, label: 'My Tickets', path: '/visitor/tickets' },
  { icon: Map, label: 'Stadium Map', path: '/visitor/stadium' },
  { icon: Car, label: 'Parking', path: '/visitor/parking' },
  { icon: UtensilsCrossed, label: 'Food & Drinks', path: '/visitor/food' },
  { icon: Sparkles, label: 'AI Assistant', path: '/visitor/assistant' },
  { icon: LifeBuoy, label: 'Emergency Help', path: '/visitor/emergency' },
  { icon: User2, label: 'Profile', path: '/visitor/profile' },
]

export function VisitorSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const initials = user
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—'

  return (
    <>
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-bg-primary/80 backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed && !isMobile ? 72 : 260, x: isMobile && collapsed ? -260 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col border-r border-[var(--color-border-default)]',
          'bg-bg-primary/80 backdrop-blur-2xl',
          isMobile && 'shadow-2xl',
        )}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-[var(--color-border-default)]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl accent-gradient">
              <Zap className="size-5 text-white" />
            </div>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-semibold text-text-primary tracking-tight whitespace-nowrap overflow-hidden"
                >
                  ATHLIX
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={onToggle}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] text-text-muted transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed && !isMobile ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {VISITOR_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-[var(--color-surface-hover)]',
                )}
                title={collapsed && !isMobile ? item.label : undefined}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="size-5 shrink-0" />
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 text-left whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-[var(--color-border-default)] p-3">
          <div className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5',
            collapsed && !isMobile ? 'justify-center' : '',
          )}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full accent-gradient text-white text-xs font-semibold">
              {initials}
            </div>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <div className="text-sm font-medium text-text-primary truncate">{user?.fullName ?? 'Guest'}</div>
                  <div className="text-xs text-text-muted truncate">Visitor</div>
                </motion.div>
              )}
            </AnimatePresence>
            {(!collapsed || isMobile) && (
              <button
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
