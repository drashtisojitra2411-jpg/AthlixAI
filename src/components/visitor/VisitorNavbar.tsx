import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Menu, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export function VisitorNavbar({ onToggleSidebar, title }: { onToggleSidebar: () => void; title: string }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'sticky top-0 z-30 h-16 border-b border-[var(--color-border-default)]',
        'bg-bg-primary/80 backdrop-blur-2xl flex items-center px-6 gap-4',
      )}
    >
      {isMobile && (
        <button onClick={onToggleSidebar} className="text-text-muted hover:text-text-primary" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      )}

      <span className="text-sm font-semibold text-text-primary tracking-tight">{title}</span>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Badge variant="live" className="hidden sm:inline-flex">STADIUM LIVE</Badge>

        <Button
          variant="copilot"
          size="sm"
          className="gap-1.5"
          onClick={() => navigate('/visitor/events')}
        >
          <Ticket className="size-3.5" /> Book Tickets
        </Button>
      </div>
    </motion.header>
  )
}
