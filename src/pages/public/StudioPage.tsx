import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SEO from '../../components/common/SEO'
import { useHomeMedia } from '../../hooks/useHomeMedia'

const DEFAULT_ROOMS = [
  { slot_key: 'home_showcase_1', label: 'Control Room', desc: 'The nerve center of every session with professional audio routing and precision monitoring.' },
  { slot_key: 'home_showcase_2', label: 'Mixing Console', desc: 'Analog warmth meets digital precision for pristine track separation and stereo balance.' },
  { slot_key: 'home_showcase_3', label: 'Live Room & Vocal Booth', desc: 'Acoustically isolated and tuned for clean vocal tracking and instrument capture.' },
  { slot_key: 'home_showcase_4', label: 'Podcast & Content Lounge', desc: 'Multi-microphone broadcast setup tailored for high-engagement creator media.' },
  { slot_key: 'home_showcase_5', label: 'Equipment & Outboard Gear', desc: 'Industry-standard microphones, converters, and analog hardware processing.' },
]

export default function StudioPage() {
  const { data: mediaItems = [] } = useHomeMedia()

  const heroItem = mediaItems.find((m) => m.slot_key === 'home_studio_intro')
  const heroImage = heroItem?.image_url || '/images/studio-placeholder.svg'

  return (
    <>
      <SEO
        title="Patizan Records Studio | Tamarac, Florida"
        description="Tour our state-of-the-art recording facilities in Tamarac, FL. Industry-grade microphones, vocal booths, production suites, and acoustics."
        canonicalPath="/studio"
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

      {/* Studio rooms */}
      <section className="section bg-black">
        <div className="container-wide">
          <div className="space-y-24">
            {DEFAULT_ROOMS.map((room, i) => {
              const cmsMedia = mediaItems.find((m) => m.slot_key === room.slot_key)
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
