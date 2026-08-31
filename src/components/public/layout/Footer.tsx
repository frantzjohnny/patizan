import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '../../icons/SocialIcons'
import { STUDIO_INFO, NAV_LINKS } from '../../../lib/constants'

const SERVICES = [
  { label: 'Recording', href: '/services#recording' },
  { label: 'Podcast', href: '/services#podcast' },
  { label: 'Mixing & Mastering', href: '/services#mixing-mastering' },
  { label: 'Beat Production', href: '/services#beat-production' },
  { label: 'Voice Over', href: '/services#voice-over' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy border-t border-gray-border/30">
      {/* CTA Banner */}
      <div className="border-b border-gray-border/30 py-16">
        <div className="container-standard text-center">
          <p className="section-label mb-4">READY TO CREATE?</p>
          <h2 className="font-heading font-bold text-display-lg text-offwhite mb-6 text-balance">
            YOUR SOUND STARTS HERE.
          </h2>
          <Link to="/book-session" className="btn-primary rounded-lg text-sm inline-flex">
            BOOK A SESSION
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <span className="font-heading font-bold text-2xl tracking-widest text-offwhite uppercase block">
                PATIZAN
              </span>
              <span className="font-heading font-light text-sm tracking-ultra-wide text-orange uppercase">
                RECORDS
              </span>
            </div>
            <p className="text-gray-muted text-sm font-body leading-relaxed mb-6">
              Built for artists.
              <br />
              Designed for sound.
            </p>
            <div className="flex items-center gap-4">
              <a
                href={`https://instagram.com/${STUDIO_INFO.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-charcoal border border-gray-border flex items-center justify-center text-offwhite/50 hover:text-orange hover:border-orange/30 transition-all duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-charcoal border border-gray-border flex items-center justify-center text-offwhite/50 hover:text-orange hover:border-orange/30 transition-all duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-charcoal border border-gray-border flex items-center justify-center text-offwhite/50 hover:text-orange hover:border-orange/30 transition-all duration-200"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-xs tracking-widest uppercase text-offwhite mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-muted text-sm hover:text-orange transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/book-session"
                  className="text-orange text-sm hover:text-orange-hover transition-colors duration-200 font-medium"
                >
                  Book Session →
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-xs tracking-widest uppercase text-offwhite mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link
                    to={s.href}
                    className="text-gray-muted text-sm hover:text-orange transition-colors duration-200"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-xs tracking-widest uppercase text-offwhite mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-orange mt-0.5 shrink-0" />
                <span className="text-gray-muted text-sm leading-relaxed">
                  {STUDIO_INFO.address}
                  <br />
                  {STUDIO_INFO.city}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-orange shrink-0" />
                <a
                  href={`tel:${STUDIO_INFO.phone.replace(/\s/g, '')}`}
                  className="text-gray-muted text-sm hover:text-orange transition-colors"
                >
                  {STUDIO_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-orange shrink-0" />
                <a
                  href={`mailto:${STUDIO_INFO.email}`}
                  className="text-gray-muted text-sm hover:text-orange transition-colors break-all"
                >
                  {STUDIO_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <InstagramIcon className="w-4 h-4 text-orange shrink-0" />
                <a
                  href={`https://instagram.com/${STUDIO_INFO.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-muted text-sm hover:text-orange transition-colors"
                >
                  {STUDIO_INFO.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-border/30 py-6">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs font-body text-center sm:text-left text-gray-muted">
            <p>
              © {year} {STUDIO_INFO.name}. All rights reserved.
            </p>
            <span className="hidden sm:inline text-gray-border">·</span>
            <p>
              Desenvolvido por{' '}
              <a
                href="mailto:hello@johnnyfrantz.com"
                className="text-offwhite/80 hover:text-orange transition-colors font-medium underline underline-offset-4 decoration-orange/40 hover:decoration-orange"
                title="Send email to Johnny Frantz"
              >
                Johnny Frantz
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs font-body">
            <Link to="/contact" className="text-gray-muted hover:text-orange transition-colors">
              Contact
            </Link>
            <span className="text-gray-border">·</span>
            <Link to="/admin" className="text-gray-muted hover:text-orange transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
