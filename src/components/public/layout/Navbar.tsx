import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../../../lib/constants'
import { cn } from '../../../lib/utils'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 transition-all duration-300',
          isMobileMenuOpen ? 'z-[101] bg-[#050505] border-b border-gray-border/40' : 'z-50',
          !isMobileMenuOpen && (
            isTransparent
              ? 'bg-transparent'
              : 'bg-black/95 backdrop-blur-md border-b border-gray-border/50'
          )
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none focus:ring-1 focus:ring-orange/50 rounded-lg"
              onClick={() => {
                setIsMobileMenuOpen(false)
                window.scrollTo({ top: 0, behavior: 'instant' })
              }}
              aria-label="Patizan Records Home"
            >
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-xl tracking-widest text-offwhite uppercase group-hover:text-orange transition-colors duration-300">
                  PATIZAN
                </span>
                <span className="font-heading font-light text-xs tracking-ultra-wide text-orange uppercase">
                  RECORDS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main Desktop Navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'font-heading font-medium text-xs tracking-wider uppercase transition-colors duration-200 focus:outline-none focus:text-orange',
                    location.pathname === link.href
                      ? 'text-orange'
                      : 'text-offwhite/70 hover:text-offwhite'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                className={cn(
                  'font-heading font-medium text-xs tracking-wider uppercase transition-colors duration-200 focus:outline-none focus:text-orange',
                  location.pathname === '/contact'
                    ? 'text-orange'
                    : 'text-offwhite/70 hover:text-offwhite'
                )}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop CTA + Mobile Hamburger */}
            <div className="flex items-center gap-4">
              {/* Desktop Only CTA */}
              <div className="hidden lg:block">
                <Link
                  to="/book-session"
                  className="btn-primary text-xs py-3 px-6 rounded-lg font-heading font-bold tracking-wider uppercase shadow-glow-orange hover:bg-orange-hover transition-all"
                >
                  BOOK A SESSION
                </Link>
              </div>

              {/* Mobile Modern Hamburger Toggle Button (44x44px min touch target) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  'lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange/50',
                  isMobileMenuOpen
                    ? 'bg-charcoal border-orange/50 text-orange shadow-glow-orange'
                    : 'bg-charcoal/80 border-gray-border/60 text-offwhite hover:text-orange hover:border-orange/50'
                )}
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={22} className="text-orange" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={22} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modern App-Style Mobile Navigation Panel */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  )
}
