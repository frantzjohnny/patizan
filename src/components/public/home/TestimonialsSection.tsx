import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Testimonial } from '../../../types'
import { getInitials } from '../../../lib/utils'

function TestimonialCard({ testimonial, delay, isInView }: {
  testimonial: Testimonial
  delay: number
  isInView: boolean
}) {
  return (
    <motion.div
      className="bg-charcoal border border-gray-border rounded-2xl p-8 flex flex-col hover:border-orange/20 transition-all duration-300"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Quote icon */}
      <Quote size={28} className="text-orange/40 mb-6" />

      {/* Text */}
      <p className="text-offwhite/80 font-body text-sm leading-relaxed flex-1 mb-8 italic">
        "{testimonial.testimonial}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {testimonial.photo_url ? (
          <img
            src={testimonial.photo_url}
            alt={testimonial.name}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center">
            <span className="font-heading font-bold text-sm text-orange">
              {getInitials(testimonial.name)}
            </span>
          </div>
        )}
        <div>
          <p className="font-heading font-semibold text-sm text-offwhite">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-xs text-gray-muted">{testimonial.role}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-featured'],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('display_order')
        .limit(4)
      if (error) throw error
      return data || []
    },
  })

  if (testimonials.length === 0) return null

  return (
    <section className="section bg-black overflow-hidden">
      <div ref={ref} className="container-wide">
        <div className="text-center mb-16">
          <motion.p
            className="section-label mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            WHAT ARTISTS SAY
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            VOICES FROM
            <br />
            THE BOOTH.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} delay={0.1 + i * 0.1} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  )
}
