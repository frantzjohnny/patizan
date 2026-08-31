import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  STUDIO_ROOM_IMAGES,
  handleStudioImageError,
} from '../../../data/studioImages'

export default function StudioShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  // First 5 studio spaces for the asymmetric showcase grid
  const showcaseRooms = STUDIO_ROOM_IMAGES.slice(0, 5)

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
          {showcaseRooms.map((room, i) => (
            <motion.div
              key={room.id}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                room.homepageSpan || ''
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/studio" className="block w-full h-full">
                <div className={`aspect-square ${i === 0 ? 'lg:aspect-auto lg:h-full min-h-[300px]' : ''}`}>
                  <img
                    src={room.imageSrc}
                    alt={room.altText}
                    onError={handleStudioImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-orange/0 group-hover:bg-orange/5 transition-colors duration-300" />

                  {/* Label */}
                  <div className="absolute bottom-4 left-4">
                    <span className="font-heading font-semibold text-sm text-offwhite/80 group-hover:text-offwhite transition-colors">
                      {room.name}
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
