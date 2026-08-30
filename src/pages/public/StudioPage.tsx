import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SEO from '../../components/common/SEO'

const STUDIO_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80', label: 'Control Room', desc: 'The nerve center of every session.' },
  { src: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80', label: 'Mixing Console', desc: 'Analog warmth meets digital precision.' },
  { src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', label: 'Live Room', desc: 'Acoustically treated for perfect recordings.' },
  { src: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80', label: 'Podcast Booth', desc: 'Broadcast-ready setup for content creators.' },
  { src: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80', label: 'Production Suite', desc: 'Beat making and composition space.' },
  { src: 'https://images.unsplash.com/photo-1571266028243-d220c6a3adc0?w=800&q=80', label: 'Equipment', desc: 'Industry-standard gear for every project.' },
]

export default function StudioPage() {
  return (
    <>
      <SEO
        title="Patizan Records Studio | Tamarac, Florida"
        description="Tour our state-of-the-art recording facilities in Tamarac, FL. Industry-grade microphones, vocal booths, production suites, and acoustics."
        canonicalPath="/studio"
      />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end pb-20 pt-40 overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80"
            alt="Patizan Records Studio"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black" />
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
            {STUDIO_IMAGES.map((room, i) => (
              <motion.div
                key={room.label}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
              >
                <div className={`rounded-2xl overflow-hidden aspect-[16/10] ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img
                    src={room.src}
                    alt={room.label}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <p className="section-label mb-3">{`0${i + 1}`}</p>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl text-offwhite mb-4">{room.label}</h2>
                  <div className="h-px w-12 bg-orange mb-6" />
                  <p className="text-offwhite/60 font-body text-lg leading-relaxed">{room.desc}</p>
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
          <Link to="/book-session" className="btn-primary rounded-xl text-sm">BOOK A SESSION</Link>
        </div>
      </section>
    </>
  )
}
