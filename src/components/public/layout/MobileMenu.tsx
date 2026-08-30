import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '../../icons/SocialIcons'
import { NAV_LINKS, STUDIO_INFO } from '../../../lib/constants'
import { cn } from '../../../lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black flex flex-col"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold blur-[100px]" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col h-full pt-28 px-8 pb-12">
            {/* Nav Links */}
            <nav className="flex-1 flex flex-col justify-center gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.href}
                    onClick={onClose}
                    className={cn(
                      'block font-heading font-bold text-4xl tracking-tight py-3 border-b border-gray-border/30 transition-colors duration-200',
                      location.pathname === link.href
                        ? 'text-orange'
                        : 'text-offwhite hover:text-orange'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom section */}
            <motion.div
              className="mt-8 flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Link
                to="/book-session"
                onClick={onClose}
                className="btn-primary w-full text-center rounded-xl py-5 text-sm"
              >
                BOOK A SESSION
              </Link>

              <div className="flex items-center gap-6">
                <a
                  href={`https://instagram.com/${STUDIO_INFO.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-offwhite/50 hover:text-orange transition-colors"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-offwhite/50 hover:text-orange transition-colors"
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-offwhite/50 hover:text-orange transition-colors"
                >
                  <YoutubeIcon className="w-5 h-5" />
                </a>
              </div>

              <p className="text-gray-muted text-sm font-body">
                {STUDIO_INFO.phone} · {STUDIO_INFO.city}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
