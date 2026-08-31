import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import SEO from '../../components/common/SEO'
import { useStudioPhotos } from '../../hooks/useStudioPhotos'
import { useHomeMedia } from '../../hooks/useHomeMedia'

const CATEGORY_NAMES: Record<string, string> = {
  'control-room': 'Control Room',
  'recording-booth': 'Recording Booth',
  'podcast-setup': 'Podcast Setup',
  'equipment': 'Equipment & Gear',
  'live-room': 'Live Room',
  'studio-interior': 'Studio Interior',
  'studio-exterior': 'Studio Exterior',
  'other': 'Studio Space',
}

const DEFAULT_FALLBACK_ROOMS = [
  { label: 'Control Room', desc: 'The nerve center of every session with professional audio routing and precision monitoring.' },
  { label: 'Mixing Console', desc: 'Analog warmth meets digital precision for pristine track separation and stereo balance.' },
  { label: 'Live Room & Vocal Booth', desc: 'Acoustically isolated and tuned for clean vocal tracking and instrument capture.' },
  { label: 'Podcast & Content Lounge', desc: 'Multi-microphone broadcast setup tailored for high-engagement creator media.' },
  { label: 'Equipment & Outboard Gear', desc: 'Industry-standard microphones, converters, and analog hardware processing.' },
]

export default function StudioPage() {
  const { data: studioPhotos = [], isLoading } = useStudioPhotos(true)
  const { data: mediaItems = [] } = useHomeMedia()

  // Determine hero backdrop: SEO studio photo -> first studio photo -> home_studio_intro -> local placeholder
  const seoPhoto = studioPhotos.find((p) => p.is_seo_image)
  const firstPhoto = studioPhotos[0]
  const homeIntro = mediaItems.find((m) => m.slot_key === 'home_studio_intro')

  const heroImage =
    seoPhoto?.image_url ||
    firstPhoto?.image_url ||
    homeIntro?.image_url ||
    '/images/studio-placeholder.svg'

  return (
    <>
      <SEO
        title="Patizan Records Studio | Tamarac, Florida"
        description="Tour our state-of-the-art recording facilities in Tamarac, FL. Industry-grade microphones, vocal booths, production suites, and acoustics."
        canonicalPath="/studio"
        ogImage={seoPhoto?.image_url}
      />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end pb-20 pt-40 overflow-hidden bg-black border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Patizan Records Studio"
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
          {isLoading ? (
            <div className="space-y-24">
              {[1, 2, 3].map((n) => (
                <div key={n} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-pulse">
                  <div className="rounded-2xl aspect-[16/10] bg-charcoal border border-white/10" />
                  <div className="space-y-4">
                    <div className="h-4 w-12 bg-white/10 rounded" />
                    <div className="h-8 w-2/3 bg-white/10 rounded" />
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-4/5 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : studioPhotos.length > 0 ? (
            <div className="space-y-24">
              {studioPhotos.map((photo, i) => {
                const categoryLabel = CATEGORY_NAMES[photo.category] || photo.category

                return (
                  <motion.div
                    key={photo.id}
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
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-offwhite/80">
                        {categoryLabel}
                      </div>
                      {photo.is_seo_image && (
                        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-gold/90 text-black text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                          <Sparkles size={11} className="fill-black" />
                          FEATURED
                        </div>
                      )}
                    </div>

                    <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                      <p className="section-label mb-3">{`0${i + 1}`}</p>
                      <h2 className="font-heading font-bold text-3xl md:text-4xl text-offwhite mb-4">
                        {photo.title}
                      </h2>
                      <div className="h-px w-12 bg-orange mb-6" />
                      {photo.description && (
                        <p className="text-offwhite/70 font-body text-lg leading-relaxed mb-6">
                          {photo.description}
                        </p>
                      )}
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
                )
              })}
            </div>
          ) : (
            /* Fallback to clean studio showcase slots when 0 photos uploaded */
            <div className="space-y-24">
              {DEFAULT_FALLBACK_ROOMS.map((room, i) => {
                const cmsMedia = mediaItems.find((m) => m.slot_key === `home_showcase_${i + 1}`)
                const imgSrc = cmsMedia?.image_url || '/images/studio-placeholder.svg'

                return (
                  <motion.div
                    key={room.label}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className={`rounded-2xl overflow-hidden aspect-[16/10] border border-white/10 bg-charcoal shadow-2xl ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <img
                        src={imgSrc}
                        alt={cmsMedia?.alt_text || room.label}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                    <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                      <p className="section-label mb-3">{`0${i + 1}`}</p>
                      <h2 className="font-heading font-bold text-3xl md:text-4xl text-offwhite mb-4">
                        {cmsMedia?.title?.replace(/^Studio Showcase \d+ — /, '') || room.label}
                      </h2>
                      <div className="h-px w-12 bg-orange mb-6" />
                      <p className="text-offwhite/60 font-body text-lg leading-relaxed">
                        {cmsMedia?.description || room.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy border-t border-gray-border/30">
        <div className="container-standard text-center">
          <h2 className="section-title mb-6">EXPERIENCE IT YOURSELF.</h2>
          <Link to="/book-session" className="btn-primary rounded-xl text-sm">BOOK A SESSION</Link>
        </div>
      </section>
    </>
  )
}
