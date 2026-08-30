import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSiteSettings } from '../../../hooks/useSettings'

const DEFAULT_PROMO = "When you record a complete track, you'll receive a complimentary studio visualizer."

export default function PromoBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const { data: settings, isLoading } = useSiteSettings()

  // If explicitly disabled in settings, don't show
  if (!isLoading && settings && settings.promo_message_enabled === false) return null

  const message = settings?.promo_message || DEFAULT_PROMO

  return (
    <section className="py-7 bg-gradient-to-r from-orange via-orange-hover to-gold overflow-hidden relative shadow-[0_0_30px_rgba(255,122,0,0.25)]">
      <div ref={ref} className="container-standard flex items-center justify-center gap-4 text-center px-4">
        <div className="hidden md:block w-8 h-[2px] bg-black/40" />
        <motion.p
          className="text-black font-heading font-bold text-base md:text-xl tracking-tight leading-snug"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {message}
        </motion.p>
        <div className="hidden md:block w-8 h-[2px] bg-black/40" />
      </div>
    </section>
  )
}
