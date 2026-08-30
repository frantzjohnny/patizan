import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useServicePackages, useServices } from '../../../hooks/useServices'
import { useSiteSettings } from '../../../hooks/useSettings'
import { formatCurrency } from '../../../lib/utils'
import type { ServicePackage } from '../../../types'

function RateCard({
  pkg,
  index,
  serviceId,
}: {
  pkg: ServicePackage
  index: number
  serviceId?: string
}) {
  const isFeatured = pkg.is_featured

  // Clean package name formatting
  const rawName = pkg.name.replace(/—.*$/, '').trim()
  const durationLabel =
    pkg.duration_hours === 1
      ? '1 HOUR'
      : pkg.duration_hours < 1
      ? `${pkg.duration_hours * 60} MINUTES`
      : `${pkg.duration_hours} HOURS`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: 0.08 + index * 0.08 }}
      className={`group relative rounded-2xl p-7 md:p-8 flex flex-col justify-between transition-all duration-300 ${
        isFeatured
          ? 'bg-[#141414] border-2 border-orange shadow-[0_0_35px_rgba(255,122,0,0.15)]'
          : 'bg-[#0e0e0e] border border-white/10 hover:border-orange/40 hover:bg-[#121212]'
      }`}
    >
      {/* Top Header: Editorial Number & Optional Featured Label */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-6">
          <span className="font-mono text-xs text-offwhite/40 tracking-widest">
            0{index + 1}
          </span>
          {isFeatured && (
            <span className="px-2.5 py-1 rounded-full bg-orange/15 border border-orange/40 text-orange text-[10px] font-heading font-bold tracking-widest uppercase">
              FEATURED
            </span>
          )}
        </div>

        {/* Package Name & Duration */}
        <div className="mb-6">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-gold mb-1.5">
            {durationLabel}
          </p>
          <h3 className="font-heading font-bold text-2xl md:text-3xl text-offwhite uppercase tracking-tight group-hover:text-orange transition-colors duration-200">
            {rawName}
          </h3>
        </div>

        {/* Dominant Price Typography */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-offwhite tracking-tight">
              {formatCurrency(pkg.price)}
            </span>
          </div>
          {pkg.engineer_included && (
            <p className="text-[11px] font-heading font-semibold tracking-wider text-orange uppercase mt-2">
              ENGINEER INCLUDED
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-offwhite/65 font-body text-xs sm:text-sm leading-relaxed mb-8">
          {pkg.description || 'Professional studio session with high-end microphones and acoustic treatment.'}
        </p>
      </div>

      {/* CTA Button */}
      <div>
        <Link
          to={`/book-session?package=${pkg.id}&service=${pkg.service_id || serviceId || ''}`}
          className={`w-full text-center py-4 rounded-xl font-heading font-bold text-xs md:text-sm tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all duration-200 ${
            isFeatured
              ? 'bg-orange text-black hover:bg-[#FFA043] shadow-[0_0_20px_rgba(255,122,0,0.35)]'
              : 'bg-white/5 border border-white/15 text-offwhite hover:border-orange hover:text-orange hover:bg-black/60'
          }`}
        >
          <span>BOOK THIS SESSION</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  )
}

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { data: services = [] } = useServices()
  const { data: settings } = useSiteSettings()

  const recordingService = services.find((s) => s.slug === 'recording') || services[0]
  const { data: packages = [], isLoading } = useServicePackages(recordingService?.id)

  const depositText =
    settings?.booking_deposit_text ||
    '50% DEPOSIT REQUIRED TO CONFIRM YOUR BOOKING. NO REFUNDS AFTER RESERVATION.'

  return (
    <section className="section bg-black overflow-hidden border-t border-white/5">
      <div className="container-wide">
        {/* Section Header */}
        <div ref={ref} className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <motion.p
            className="text-xs font-heading font-bold tracking-widest text-orange uppercase mb-3"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            SESSION PACKAGES
          </motion.p>
          <motion.h2
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-offwhite tracking-tight leading-none mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            TRANSPARENT
            <br />
            PRICING.
          </motion.h2>
          <motion.p
            className="text-offwhite/60 font-body text-sm sm:text-base leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Choose the session that fits your project.
          </motion.p>
        </div>

        {/* Rate Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-charcoal border border-white/10 animate-pulse h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {packages.map((pkg, i) => (
              <RateCard
                key={pkg.id}
                pkg={pkg}
                index={i}
                serviceId={recordingService?.id}
              />
            ))}
          </div>
        )}

        {/* Studio Deposit & Cancellation Notice */}
        <motion.div
          className="mt-12 pt-8 border-t border-white/10 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[11px] sm:text-xs font-heading tracking-widest text-offwhite/50 uppercase">
            {depositText}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
