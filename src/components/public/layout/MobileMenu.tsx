import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { InstagramIcon, FacebookIcon, TikTokIcon } from '../../icons/SocialIcons'
import { STUDIO_INFO } from '../../../lib/constants'
import { cn } from '../../../lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'HOME' },
  { href: '/about', label: 'ABOUT' },
  { href: '/services', label: 'SERVICES' },
  { href: '/studio', label: 'STUDIO' },
  { href: '/gallery', label: 'GALLERY' },
  { href: '/music', label: 'MUSIC' },
  { href: '/blog', label: 'BLOG' },
  { href: '/contact', label: 'CONTACT' },
] as const

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation()

  // Prevent background body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleNavClick = () => {
    onClose()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[95] bg-[#050505] flex flex-col justify-between overflow-y-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange blur-[120px]" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#D4AF37] blur-[120px]" />
          </div>

          {/* Navigation Items List */}
          <div className="relative pt-24 px-6 pb-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <nav className="space-y-1">
              {MOBILE_NAV_ITEMS.map((item, idx) => {
                const isActive = location.pathname === item.href

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * idx, duration: 0.25 }}
                  >
                    <Link
                      to={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center justify-between py-3.5 px-4 rounded-2xl font-heading font-bold text-xl tracking-wider transition-all duration-200',
                        isActive
                          ? 'bg-charcoal text-orange border-l-4 border-orange'
                          : 'text-offwhite hover:text-orange hover:bg-charcoal/50'
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-orange shadow-glow-orange" />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* In-Menu Prominent CTA */}
            <motion.div
              className="mt-6 pt-4 border-t border-gray-border/40"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              <Link
                to="/book-session"
                onClick={handleNavClick}
                className="w-full py-4 px-6 rounded-xl bg-orange hover:bg-orange-hover text-black font-heading font-bold text-sm tracking-wider uppercase flex items-center justify-center shadow-glow-orange transition-all active:scale-98"
              >
                BOOK A SESSION
              </Link>
            </motion.div>
          </div>

          {/* Bottom Social Links & Studio Info */}
          <div className="relative px-6 pb-8 pt-4 max-w-md mx-auto w-full border-t border-gray-border/20 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a
                href={STUDIO_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-charcoal border border-gray-border flex items-center justify-center text-offwhite/70 hover:text-orange hover:border-orange/40 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href={STUDIO_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-charcoal border border-gray-border flex items-center justify-center text-offwhite/70 hover:text-orange hover:border-orange/40 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href={STUDIO_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-charcoal border border-gray-border flex items-center justify-center text-offwhite/70 hover:text-orange hover:border-orange/40 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>

            <p className="text-xs text-gray-muted font-body text-center">
              {STUDIO_INFO.phone} · {STUDIO_INFO.city}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
