import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStudioPhotos } from '../../../hooks/useStudioPhotos'
import { useHomeMedia } from '../../../hooks/useHomeMedia'

const DEFAULT_SLOTS = [
  {
    slot_key: 'home_showcase_1',
    src: '/images/studio-placeholder.svg',
    label: 'Control Room',
    alt: 'Control Room',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    slot_key: 'home_showcase_2',
    src: '/images/studio-placeholder.svg',
    label: 'Mixing Console',
    alt: 'Mixing Console',
    span: '',
  },
  {
    slot_key: 'home_showcase_3',
    src: '/images/studio-placeholder.svg',
    label: 'Recording Booth',
    alt: 'Recording Booth',
    span: '',
  },
  {
    slot_key: 'home_showcase_4',
    src: '/images/studio-placeholder.svg',
    label: 'Podcast Setup',
    alt: 'Podcast Setup',
    span: '',
  },
  {
    slot_key: 'home_showcase_5',
    src: '/images/studio-placeholder.svg',
    label: 'Equipment',
    alt: 'Equipment',
    span: '',
  },
]

export default function StudioShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const { data: studioPhotos = [] } = useStudioPhotos(true)
  const { data: mediaItems = [] } = useHomeMedia()

  // Build dynamic grid items: prioritize studio_photos, fallback to home_media slots
  const items = studioPhotos.length > 0
    ? studioPhotos.slice(0, 5).map((photo, i) => ({
        id: photo.id,
        src: photo.image_url,
        label: photo.title,
        alt: photo.title,
        span: i === 0 ? 'lg:col-span-2 lg:row-span-2' : '',
      }))
    : DEFAULT_SLOTS.map((slot) => {
        const found = mediaItems.find((m) => m.slot_key === slot.slot_key)
        return {
          id: slot.slot_key,
          src: found?.image_url || slot.src,
          label: found?.title?.replace(/^Studio Showcase \d+ — /, '') || slot.label,
          alt: found?.alt_text || slot.alt,
          span: slot.span,
        }
      })

  return (
    <section className="section bg-black overflow-hidden">
      <div ref={ref} className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
          >
            <p className="section-label mb-3">INSIDE PATIZAN</p>
            <h2 className="section-title">
              THE SPACE
              <br />
              ITSELF.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 text-orange text-sm font-heading font-semibold tracking-widest uppercase hover:text-orange-hover transition-colors group"
            >
              FULL TOUR
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id || item.label}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.span}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/studio" className="block w-full h-full">
                <div className={`aspect-square ${i === 0 ? 'lg:aspect-auto lg:h-full min-h-[300px]' : ''}`}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-orange/0 group-hover:bg-orange/5 transition-colors duration-300" />

                  {/* Label */}
                  <div className="absolute bottom-4 left-4">
                    <span className="font-heading font-semibold text-sm text-offwhite/80 group-hover:text-offwhite transition-colors">
                      {item.label}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
