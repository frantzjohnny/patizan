import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { InstagramIcon, FacebookIcon, TikTokIcon } from '../../icons/SocialIcons'
import { STUDIO_INFO } from '../../../lib/constants'
import { cn } from '../../../lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const MOBILE_NAV_ITEMS = [
  { num: '01', href: '/', label: 'HOME' },
  { num: '02', href: '/about', label: 'ABOUT' },
  { num: '03', href: '/services', label: 'SERVICES' },
  { num: '04', href: '/studio', label: 'STUDIO' },
  { num: '05', href: '/gallery', label: 'GALLERY' },
  { num: '06', href: '/music', label: 'MUSIC' },
  { num: '07', href: '/blog', label: 'BLOG' },
  { num: '08', href: '/contact', label: 'CONTACT' },
] as const

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const menuContainerRef = useRef<HTMLDivElement>(null)

  // Body scroll lock with zero layout shift and scroll restoration
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight

      // Calculate scrollbar width if needed to prevent layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`
      }
      document.body.style.overflow = 'hidden'

      // Handle Escape key to close menu
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      window.addEventListener('keydown', handleKeyDown)

      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onClose])

  const handleNavClick = (href: string) => {
    onClose()
    // For hash/anchor links or standard page navigations
    if (!href.includes('#')) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.28,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: shouldReduceMotion ? 0 : 0.03,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -16,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -12,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-navigation-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          ref={menuContainerRef}
          className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col justify-between overflow-y-auto lg:hidden overscroll-contain"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF7A00] blur-[140px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#D4AF37] blur-[140px]" />
          </div>

          {/* Top spacer for header clearance */}
          <div className="h-20 shrink-0" aria-hidden="true" />

          {/* Main Navigation Area */}
          <div className="relative px-6 py-4 flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
            {/* Nav list */}
            <nav className="flex flex-col space-y-1 my-auto" aria-label="Mobile Navigation Links">
              {MOBILE_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.href

                return (
                  <motion.div key={item.href} variants={itemVariants}>
                    <Link
                      to={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        'group flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-200 select-none active:scale-[0.98]',
                        isActive ? 'bg-[#111111]/80' : 'hover:bg-[#111111]/40'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Number Index */}
                        <span
                          className={cn(
                            'font-mono text-xs tracking-widest transition-colors duration-200',
                            isActive ? 'text-[#FF7A00] font-semibold' : 'text-[#A3A3A3] group-hover:text-white'
                          )}
                        >
                          {item.num}
                        </span>

                        {/* Label */}
                        <span
                          className={cn(
                            'font-heading font-bold text-2xl tracking-wide uppercase transition-colors duration-200',
                            isActive ? 'text-[#FF7A00]' : 'text-white group-hover:text-[#FF7A00]'
                          )}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Clean Active Line Indicator (No stars/sparkles) */}
                      {isActive && (
                        <div className="w-1.5 h-5 bg-[#FF7A00] rounded-full shadow-[0_0_12px_rgba(255,122,0,0.6)]" />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* In-Menu Main Booking CTA Button */}
            <motion.div
              className="mt-6 pt-2"
              variants={itemVariants}
            >
              <Link
                to="/book-session"
                onClick={() => handleNavClick('/book-session')}
                className="group w-full h-14 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF8F1F] text-[#050505] font-heading font-bold text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,122,0,0.35)] transition-all duration-200 active:scale-[0.98]"
              >
                <span>BOOK A SESSION</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Bottom Footer Section: Social Icons + Clickable Email */}
          <motion.div
            className="relative px-6 pt-4 pb-8 max-w-md mx-auto w-full flex flex-col items-center gap-4 shrink-0 border-t border-[#2A2A2A]/40"
            variants={itemVariants}
          >
            {/* Social Media Links */}
            <div className="flex items-center gap-5">
              <a
                href={STUDIO_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:text-[#FF7A00] hover:border-[#FF7A00]/40 transition-all duration-200 active:scale-95"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={STUDIO_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:text-[#FF7A00] hover:border-[#FF7A00]/40 transition-all duration-200 active:scale-95"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={STUDIO_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:text-[#FF7A00] hover:border-[#FF7A00]/40 transition-all duration-200 active:scale-95"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Clickable Email */}
            <a
              href={`mailto:${STUDIO_INFO.email}`}
              className="text-xs text-[#A3A3A3] hover:text-[#FF7A00] font-mono tracking-wider transition-colors duration-200"
            >
              {STUDIO_INFO.email}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
