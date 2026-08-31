import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SEO from '../../components/common/SEO'
import { useHomeMedia } from '../../hooks/useHomeMedia'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
}

export default function AboutPage() {
  const { data: mediaItems = [] } = useHomeMedia()
  const introMedia = mediaItems.find((m) => m.slot_key === 'home_studio_intro')
  const introImg = introMedia?.image_url || '/images/studio-placeholder.svg'

  return (
    <>
      <SEO
        title="About Patizan Records | South Florida Recording Studio"
        description="Discover the story, mission, and acoustic engineering behind Patizan Records — built for artists, producers, and creators in Tamarac, Florida."
        canonicalPath="/about"
      />
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-20 pt-40 overflow-hidden bg-black border-b border-white/10">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-charcoal/80 via-black to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,0,0.12),transparent_70%)]" />
        </div>
        <div className="container-wide relative z-10">
          <motion.p
            className="section-label mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            OUR STORY
          </motion.p>
          <motion.h1
            className="font-heading font-bold text-display-xl text-offwhite"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            BUILT FOR
            <br />
            <span className="text-gradient">ARTISTS.</span>
          </motion.h1>
        </div>
      </section>

      {/* Mission */}
      <section className="section bg-black">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ show: { transition: { staggerChildren: 0.15 } } }}
            >
              <motion.h2 variants={fadeUp} className="section-title mb-6">
                WHERE SOUND
                <br />
                BECOMES CULTURE.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-offwhite/70 font-body text-lg leading-relaxed mb-6">
                Patizan Records was founded with a single purpose: to give artists, producers,
                podcasters and creators in South Florida access to a world-class creative environment
                without compromise.
              </motion.p>
              <motion.p variants={fadeUp} className="text-offwhite/50 font-body leading-relaxed mb-8">
                Located in Tamarac, FL — just minutes from Fort Lauderdale and Miami — our studio
                is equipped with professional-grade equipment and staffed by experienced engineers
                who are passionate about music and sound.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link
                  to="/book-session"
                  className="btn-primary rounded-xl text-sm inline-flex items-center gap-2"
                >
                  BOOK YOUR SESSION
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-2xl overflow-hidden aspect-square border border-white/10 bg-charcoal shadow-2xl">
                <img
                  src={introImg}
                  alt={introMedia?.alt_text || 'Patizan Records Studio Interior'}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-navy border-y border-gray-border/30">
        <div className="container-standard">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '2020', label: 'ESTABLISHED' },
              { value: '500+', label: 'TRACKS RECORDED' },
              { value: '100+', label: 'ARTISTS SERVED' },
              { value: '7', label: 'CORE SERVICES' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="font-heading font-bold text-4xl sm:text-5xl text-orange mb-2">
                  {stat.value}
                </div>
                <div className="font-mono text-xs text-offwhite/50 tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
