import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Mic2, Users, Clock, Trophy } from 'lucide-react'
import SEO from '../../components/common/SEO'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Patizan Records | South Florida Recording Studio"
        description="Discover the story, mission, and acoustic engineering behind Patizan Records — built for artists, producers, and creators in Tamarac, Florida."
        canonicalPath="/about"
      />
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-20 pt-40 overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1920&q=80"
            alt="Studio"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black" />
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
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80"
                  alt="Patizan Records Studio Interior"
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
              { icon: Trophy, value: '500+', label: 'Sessions Completed' },
              { icon: Users, value: '200+', label: 'Artists Served' },
              { icon: Mic2, value: '9', label: 'Services Available' },
              { icon: Clock, value: '7 days', label: 'A Week Open' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Icon size={28} className="text-orange mx-auto mb-3" />
                  <div className="font-heading font-bold text-4xl text-offwhite mb-2">{stat.value}</div>
                  <div className="text-gray-muted text-xs tracking-wider uppercase">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-black">
        <div className="container-standard text-center">
          <h2 className="section-title mb-6">READY TO RECORD?</h2>
          <p className="text-offwhite/50 mb-8 max-w-md mx-auto font-body">
            Your sound, your vision — let's make it happen together.
          </p>
          <Link to="/book-session" className="btn-primary rounded-xl text-sm inline-flex">
            BOOK A SESSION
          </Link>
        </div>
      </section>
    </>
  )
}
