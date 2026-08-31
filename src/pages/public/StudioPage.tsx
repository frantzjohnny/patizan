import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import SEO from '../../components/common/SEO'
import {
  STUDIO_ROOM_IMAGES,
  DEFAULT_STUDIO_SEO_IMAGE,
  handleStudioImageError,
} from '../../data/studioImages'

export default function StudioPage() {
  const heroRoom = STUDIO_ROOM_IMAGES[0]

  return (
    <>
      <SEO
        title="Patizan Records Studio | Tamarac, Florida"
        description="Tour our state-of-the-art recording facilities in Tamarac, FL. Industry-grade microphones, vocal booths, production suites, and acoustics."
        canonicalPath="/studio"
        ogImage={DEFAULT_STUDIO_SEO_IMAGE}
      />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end pb-20 pt-40 overflow-hidden bg-black border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src={heroRoom.imageSrc}
            alt="Patizan Records Studio Facility Tamarac"
            onError={handleStudioImageError}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,0,0.12),transparent_70%)]" />
        </div>
        <div className="container-wide relative z-10">
          <motion.p className="section-label mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            THE SPACE
          </motion.p>
          <motion.h1
            className="font-heading font-bold text-display-xl text-offwhite"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            INSIDE
            <br />
            <span className="text-gradient">PATIZAN.</span>
          </motion.h1>
        </div>
      </section>

      {/* Studio rooms gallery */}
      <section className="section bg-black">
        <div className="container-wide">
          <div className="space-y-24">
            {STUDIO_ROOM_IMAGES.map((room, i) => (
              <motion.div
                key={room.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
              >
                <div
                  className={`rounded-2xl overflow-hidden aspect-[16/10] border border-white/10 bg-charcoal shadow-2xl relative group ${
                    i % 2 === 1 ? 'lg:order-2' : ''
                  }`}
                >
                  <img
                    src={room.imageSrc}
                    alt={room.altText}
                    onError={handleStudioImageError}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-offwhite/80">
                    {room.category}
                  </div>
                  {room.isFeatured && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-gold/90 text-black text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Sparkles size={11} className="fill-black" />
                      FEATURED
                    </div>
                  )}
                </div>

                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <p className="section-label mb-3">{`0${i + 1}`}</p>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl text-offwhite mb-4">
                    {room.name}
                  </h2>
                  <div className="h-px w-12 bg-orange mb-6" />
                  <p className="text-offwhite/70 font-body text-lg leading-relaxed mb-6">
                    {room.description}
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/book-session"
                      className="inline-flex items-center gap-2 font-heading font-semibold text-xs tracking-widest text-orange uppercase hover:text-orange-hover transition-colors group"
                    >
                      <span>BOOK SESSION IN THIS SPACE</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy border-t border-gray-border/30">
        <div className="container-standard text-center">
          <h2 className="section-title mb-6">EXPERIENCE IT YOURSELF.</h2>
          <Link to="/book-session" className="btn-primary rounded-xl text-sm">
            BOOK A SESSION
          </Link>
        </div>
      </section>
    </>
  )
}
