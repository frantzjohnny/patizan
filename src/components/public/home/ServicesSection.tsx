import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useServices } from '../../../hooks/useServices'
import { formatCurrency } from '../../../lib/utils'
import type { Service } from '../../../types'

const DEFAULT_SERVICE_IMAGES: Record<string, string> = {
  recording: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&q=85&auto=format&fit=crop',
  podcast: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1000&q=80&auto=format&fit=crop',
  'voice-over': 'https://images.unsplash.com/photo-1589903188900-85dae523342b?w=1000&q=80&auto=format&fit=crop',
  'mixing-mastering': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&q=80&auto=format&fit=crop',
  'beat-production': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&q=80&auto=format&fit=crop',
  streaming: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000&q=80&auto=format&fit=crop',
  jingle: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=1000&q=80&auto=format&fit=crop',
  'dj-tag': 'https://images.unsplash.com/photo-1571266028243-d220c6a3adc0?w=1000&q=80&auto=format&fit=crop',
  'commercial-spot': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1000&q=80&auto=format&fit=crop',
}

function getServiceImage(service: Service): string {
  return service.image_url || DEFAULT_SERVICE_IMAGES[service.slug] || DEFAULT_SERVICE_IMAGES.recording
}

// ─── Featured Main Service Card (Editorial Hero Format) ───
function FeaturedServiceCard({ service, index }: { service: Service; index: number }) {
  const imgSrc = getServiceImage(service)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-orange/40 bg-charcoal transition-all duration-500 flex flex-col justify-between min-h-[440px] md:min-h-[500px] lg:min-h-[540px] shadow-2xl"
    >
      {/* Background Photography with Zoom Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={imgSrc}
          alt={service.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
        {/* Editorial Multi-layer Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 md:via-black/60 to-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
      </div>

      {/* Top Bar / Category Tag & Price */}
      <div className="relative z-20 p-6 md:p-8 flex items-start justify-between gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-orange/40">
          <span className="w-1.5 h-1.5 rounded-full bg-orange" />
          <span className="font-heading font-bold text-[10px] md:text-xs tracking-widest text-orange uppercase">
            PRIMARY STUDIO SERVICE
          </span>
        </div>

        {service.starting_price && (
          <div className="text-right">
            <span className="text-[10px] font-heading tracking-widest uppercase text-offwhite/50 block">
              STARTING AT
            </span>
            <span className="font-heading font-bold text-xl md:text-2xl text-offwhite">
              {formatCurrency(service.starting_price)}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-20 p-6 md:p-10 max-w-2xl">
        <p className="text-xs md:text-sm font-heading font-medium tracking-widest text-gold uppercase mb-2">
          YOUR SOUND STARTS HERE
        </p>

        <h3 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-offwhite tracking-tight leading-none mb-4 group-hover:text-orange transition-colors duration-300">
          {service.name}
        </h3>

        <p className="text-offwhite/75 font-body text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
          {service.description || service.short_description}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Link
            to={`/book-session?service=${service.id}`}
            className="btn-primary rounded-xl px-7 py-3.5 text-xs md:text-sm font-heading font-bold tracking-wider uppercase text-center inline-flex items-center justify-center gap-2 group/btn"
          >
            <span>BOOK A SESSION</span>
            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            to={`/services#${service.slug}`}
            className="px-6 py-3.5 rounded-xl border border-white/20 hover:border-orange/60 bg-black/40 backdrop-blur-md text-offwhite/80 hover:text-orange text-xs md:text-sm font-heading font-semibold tracking-wider uppercase text-center transition-all duration-200"
          >
            LEARN MORE
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Standard Editorial Service Card ───
function StandardServiceCard({ service, index }: { service: Service; index: number }) {
  const imgSrc = getServiceImage(service)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: 0.05 + index * 0.06 }}
      className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-orange/40 bg-charcoal flex flex-col justify-between transition-all duration-300 shadow-lg"
    >
      {/* Cinematic Photography Frame */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imgSrc}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-black/40 to-transparent" />

        {service.starting_price && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-offwhite font-heading font-bold text-xs">
            From {formatCurrency(service.starting_price)}
          </div>
        )}

        <div className="absolute top-3 left-3 text-[10px] font-mono text-offwhite/50 tracking-wider">
          0{index + 2}
        </div>
      </div>

      {/* Editorial Content */}
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-heading font-bold text-xl text-offwhite group-hover:text-orange transition-colors duration-200 mb-2">
            {service.name}
          </h4>
          <p className="text-offwhite/60 text-xs sm:text-sm font-body leading-relaxed line-clamp-2 mb-6">
            {service.short_description || service.description}
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <Link
            to={`/services#${service.slug}`}
            className="text-xs font-heading font-semibold tracking-wider uppercase text-offwhite/60 hover:text-offwhite transition-colors"
          >
            Details
          </Link>
          <Link
            to={`/book-session?service=${service.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-heading font-bold tracking-wider uppercase text-orange hover:text-[#FFA043] group/cta"
          >
            <span>Book Session</span>
            <span className="group-hover/cta:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { data: services = [], isLoading } = useServices(true)

  // Identify featured service: explicit is_featured === true, or first 'recording' service, or first service
  const featuredService =
    services.find((s) => s.is_featured) ||
    services.find((s) => s.slug === 'recording') ||
    services[0]

  const otherServices = services.filter((s) => s.id !== featuredService?.id)

  return (
    <section className="section bg-[#080808] overflow-hidden border-t border-white/5">
      <div className="container-wide">
        {/* Section Header */}
        <div ref={ref} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="section-label mb-3 text-orange tracking-widest text-xs font-heading font-bold uppercase">
              WHAT WE OFFER
            </p>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-offwhite tracking-tight leading-none mb-4">
              STUDIO
              <br />
              SERVICES.
            </h2>
            <p className="text-offwhite/60 font-body text-sm sm:text-base leading-relaxed">
              Professional sound, production and creative services built around your project.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link
              to="/services"
              className="inline-flex items-center gap-2 font-heading font-semibold text-xs md:text-sm tracking-widest uppercase text-offwhite/70 hover:text-orange transition-colors group"
            >
              <span>VIEW ALL SERVICES</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-orange" />
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Editorial Grid */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-charcoal border border-gray-border animate-pulse h-96" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-charcoal border border-gray-border animate-pulse h-64" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* Featured Primary Service (Full-width prominence) */}
            {featuredService && (
              <FeaturedServiceCard service={featuredService} index={0} />
            )}

            {/* Asymmetric / Editorial Supporting Grid */}
            {otherServices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {otherServices.map((service, index) => (
                  <StandardServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
