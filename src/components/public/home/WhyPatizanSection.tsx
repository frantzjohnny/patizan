import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Headphones, Award, Zap, Music, Clock, Users } from 'lucide-react'

const BENEFITS = [
  {
    icon: Headphones,
    title: 'Professional Equipment',
    description: 'Industry-standard microphones, preamps, converters, and monitoring systems for pristine results.',
  },
  {
    icon: Award,
    title: 'Experienced Engineers',
    description: 'Seasoned audio professionals with deep knowledge of all genres and recording techniques.',
  },
  {
    icon: Zap,
    title: 'Creative Environment',
    description: 'A space designed to inspire creativity and bring out the best in every artist.',
  },
  {
    icon: Music,
    title: 'High-Quality Production',
    description: 'Consistently delivering broadcast-ready, commercially competitive audio across all formats.',
  },
  {
    icon: Clock,
    title: 'Flexible Sessions',
    description: 'Book by the hour or the full day. We adapt to your schedule and creative process.',
  },
  {
    icon: Users,
    title: 'Professional Atmosphere',
    description: 'A professional, welcoming environment where artists thrive and great music gets made.',
  },
]

export default function WhyPatizanSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="section bg-navy overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
          <img
            src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=60"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-navy" />
        </div>
      </div>

      <div ref={ref} className="container-wide relative z-10">
        <div className="max-w-xl mb-16">
          <motion.p
            className="section-label mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            WHY CHOOSE US
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            WHERE SOUND
            <br />
            BECOMES CULTURE.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                className="p-6 rounded-2xl border border-gray-border bg-black/30 backdrop-blur-sm hover:border-orange/30 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center mb-5 group-hover:bg-orange/20 transition-colors">
                  <Icon size={22} className="text-orange" />
                </div>
                <h3 className="font-heading font-bold text-lg text-offwhite mb-3 group-hover:text-orange transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-offwhite/50 text-sm font-body leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
