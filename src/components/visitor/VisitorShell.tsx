import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { VisitorSidebar } from './VisitorSidebar'
import { VisitorNavbar } from './VisitorNavbar'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

export function VisitorShell({ title, children }: { title: string; children: ReactNode }) {
  const isMobile = useIsMobile()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile)

  return (
    <div className="min-h-screen bg-bg-primary">
      <VisitorSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <motion.div
        initial={false}
        animate={{ marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="min-h-screen flex flex-col"
      >
        <VisitorNavbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} title={title} />

        <main className="flex-1 p-4 sm:p-6 space-y-6">{children}</main>
      </motion.div>
    </div>
  )
}
