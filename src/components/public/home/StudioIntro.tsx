import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useHomeMedia } from '../../../hooks/useHomeMedia'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

const DEFAULT_IMAGE = '/images/studio-placeholder.svg'
const DEFAULT_ALT = 'Patizan Records Recording Studio'

export default function StudioIntro() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { data: mediaItems } = useHomeMedia()

  const studioIntroItem = mediaItems?.find((item) => item.slot_key === 'home_studio_intro')
  const imageUrl = studioIntroItem?.image_url || DEFAULT_IMAGE
  const imageAlt = studioIntroItem?.alt_text || DEFAULT_ALT

  return (
    <section className="section bg-black overflow-hidden">
      <div className="container-wide">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text side */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.p variants={fadeUp} className="section-label mb-4">
              ABOUT PATIZAN RECORDS
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title mb-6">
              MORE THAN
              <br />
              A STUDIO.
            </motion.h2>
            <motion.div variants={fadeUp} className="h-px w-16 bg-orange mb-8" />
            <motion.p variants={fadeUp} className="text-offwhite/70 font-body text-lg leading-relaxed mb-6">
              Patizan Records is a creative recording environment built for artists, producers,
              podcasters, voice talents and brands looking for professional sound and an inspiring space.
            </motion.p>
            <motion.p variants={fadeUp} className="text-offwhite/50 font-body leading-relaxed mb-10">
              From your first single to your debut album — we provide the space, the sound,
              and the team to help your vision come to life. Located in Tamarac, FL, serving
              artists across South Florida.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 font-heading font-semibold text-sm tracking-widest uppercase text-orange hover:text-orange-hover transition-colors group"
              >
                DISCOVER THE STUDIO
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Image side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              className="absolute -bottom-6 -left-6 bg-charcoal border border-gray-border rounded-2xl p-6 shadow-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="font-heading font-bold text-3xl text-orange mb-1">$40</div>
              <div className="text-offwhite/60 text-xs font-body">Starting from / hour</div>
            </motion.div>

            {/* Orange accent box */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange/10 rounded-2xl border border-orange/20" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
