import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, CalendarDays, Users, Briefcase, DollarSign,
  Image, Music, ListMusic, Mic2, MessageSquareQuote, FileText, Clock, Ban, Building2,
  Settings, Shield, X, Layers, Activity,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { ADMIN_NAV } from '../../../lib/constants'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Calendar, CalendarDays, Users, Briefcase, DollarSign,
  Image, Music, ListMusic, Mic2, MessageSquareQuote, FileText, Clock, Ban, Building2,
  Settings, Shield, Layers, Activity,
}

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-border/50 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-heading font-bold text-lg tracking-widest text-offwhite uppercase">PATIZAN</span>
          <span className="font-heading font-light text-xs tracking-ultra-wide text-orange uppercase">RECORDS</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-muted hover:text-offwhite transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {ADMIN_NAV.map((section) => (
          <div key={section.section}>
            <p className="text-[10px] font-heading font-semibold tracking-ultra-wide uppercase text-gray-muted/60 mb-2 px-3">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon]
                const isActive = location.pathname === item.href ||
                  (item.href !== '/admin' && location.pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading font-medium transition-all duration-200',
                      isActive
                        ? 'bg-orange text-black'
                        : 'text-gray-muted hover:text-offwhite hover:bg-charcoal'
                    )}
                  >
                    {Icon && <Icon size={16} />}
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-border/50">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-muted hover:text-orange transition-colors"
        >
          ← Public Website
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-navy border-r border-gray-border/50 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-navy border-r border-gray-border/50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
