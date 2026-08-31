import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useServices } from '../../hooks/useServices'
import { useServicePackages } from '../../hooks/useServices'
import { formatCurrency } from '../../lib/utils'
import type { Service } from '../../types'
import SEO from '../../components/common/SEO'

const DEFAULT_SERVICE_IMAGES: Record<string, string> = {
  recording: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1600&q=85&auto=format&fit=crop',
  podcast: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1000&q=80&auto=format&fit=crop',
  'voice-over': 'https://images.unsplash.com/photo-1589903188900-85dae523342b?w=1000&q=80&auto=format&fit=crop',
  'mixing-mastering': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&q=80&auto=format&fit=crop',
  'beat-production': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&q=80&auto=format&fit=crop',
  streaming: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000&q=80&auto=format&fit=crop',
  jingle: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=1000&q=80&auto=format&fit=crop',
  'dj-tag': 'https://images.unsplash.com/photo-1571266028243-d220c6a3adc0?w=1000&q=80&auto=format&fit=crop',
  'commercial-spot': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1000&q=80&auto=format&fit=crop',
}

function ServiceDetail({ service, index }: { service: Service; index: number }) {
  const { data: packages = [] } = useServicePackages(service.id)
  const imgSrc = service.image_url || DEFAULT_SERVICE_IMAGES[service.slug] || DEFAULT_SERVICE_IMAGES.recording

  return (
    <motion.div
      id={service.slug}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center py-16 md:py-20 border-b border-white/10 last:border-b-0"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7 }}
    >
      {/* Photography Column */}
      <div className={`lg:col-span-6 rounded-2xl overflow-hidden aspect-[16/11] relative shadow-2xl border border-white/10 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
        <img
          src={imgSrc}
          alt={service.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-offwhite/70">
          SERVICE 0{index + 1}
        </div>
        {service.starting_price && (
          <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-orange/40 text-offwhite font-heading font-bold text-sm">
            FROM {formatCurrency(service.starting_price)}
          </div>
        )}
      </div>

      {/* Editorial Content Column */}
      <div className={`lg:col-span-6 ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-orange" />
          <span className="text-xs font-heading font-bold tracking-widest text-orange uppercase">
            PATIZAN STUDIO
          </span>
        </div>

        <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-offwhite mb-4 leading-tight">
          {service.name}
        </h2>

        <p className="text-offwhite/70 font-body text-base leading-relaxed mb-6">
          {service.description || service.short_description}
        </p>

        {/* Rate Cards Strip */}
        {packages.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-charcoal/70 border border-white/10 space-y-3">
            <p className="text-[11px] font-heading font-bold tracking-widest uppercase text-gold">
              AVAILABLE SESSION PACKAGES
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/book-session?package=${pkg.id}&service=${service.id}`}
                  className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-orange/50 hover:bg-black/80 transition-all flex items-center justify-between text-xs group"
                >
                  <div>
                    <p className="font-heading font-semibold text-offwhite group-hover:text-orange transition-colors">
                      {pkg.name}
                    </p>
                    <p className="text-offwhite/50 text-[10px]">
                      {pkg.duration_hours} Hour{pkg.duration_hours > 1 ? 's' : ''} {pkg.engineer_included ? '• Engineer incl.' : ''}
                    </p>
                  </div>
                  <span className="font-heading font-bold text-orange text-sm">
                    {formatCurrency(pkg.price)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 items-center">
          <Link
            to={`/book-session?service=${service.id}`}
            className="btn-primary rounded-xl px-7 py-3.5 text-xs md:text-sm font-heading font-bold tracking-wider uppercase inline-flex items-center gap-2 group/btn"
          >
            <span>BOOK THIS SERVICE</span>
            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices(true)

  return (
    <>
      <SEO
        title="Recording & Music Production Services | Patizan Records"
        description="Explore professional studio services in Tamarac, FL: vocal tracking, commercial audio, podcast recording desk, analog mixing, and mastering."
        canonicalPath="/services"
      />
      {/* Hero Header */}
      <section className="relative min-h-[48vh] flex items-end pb-16 pt-36 bg-black overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1920&q=85&auto=format&fit=crop"
            alt="Patizan Records Studio"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>

        <div className="container-wide relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-orange/40 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange" />
              <span className="font-heading font-bold text-xs tracking-widest text-orange uppercase">
                WHAT WE OFFER
              </span>
            </div>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-offwhite tracking-tight leading-none mb-4">
              STUDIO
              <br />
              <span className="text-gradient">SERVICES.</span>
            </h1>

            <p className="text-offwhite/70 font-body text-base md:text-lg leading-relaxed">
              Full-service music production, audio engineering, podcast recording, and creative media services in South Florida.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Breakdown */}
      <section className="bg-black py-8 md:py-16">
        <div className="container-wide">
          {isLoading ? (
            <div className="space-y-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-80 bg-charcoal rounded-2xl animate-pulse border border-white/10" />
              ))}
            </div>
          ) : (
            services.map((service, index) => (
              <ServiceDetail key={service.id} service={service} index={index} />
            ))
          )}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="section bg-[#0c0c0c] border-t border-white/10">
        <div className="container-standard text-center">
          <p className="text-xs font-heading font-bold tracking-widest text-orange uppercase mb-3">
            TAKE YOUR SOUND TO THE NEXT LEVEL
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-offwhite mb-6">
            READY TO RECORD?
          </h2>
          <p className="text-offwhite/60 font-body text-sm md:text-base max-w-xl mx-auto mb-8">
            Book your studio session today. Our engineers and facilities are ready to bring your project to life.
          </p>
          <Link
            to="/book-session"
            className="btn-primary rounded-xl px-8 py-4 text-xs md:text-sm font-heading font-bold tracking-wider uppercase inline-flex items-center gap-2 group"
          >
            <span>BOOK A STUDIO SESSION</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
