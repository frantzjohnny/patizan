import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { InstagramIcon } from '../../components/icons/InstagramIcon'
import { STUDIO_INFO } from '../../lib/constants'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactFormSchema, type ContactFormData } from '../../lib/validations'
import { Link } from 'react-router-dom'
import SEO from '../../components/common/SEO'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Message sent! We\'ll be in touch soon.')
    reset()
    setSubmitted(true)
  }

  return (
    <>
      <SEO
        title="Contact Patizan Records | Tamarac, FL"
        description="Get in touch with Patizan Records recording studio in Tamarac, Florida. Address, directions, phone, email, and studio tour inquiries."
        canonicalPath="/contact"
      />
      {/* Hero */}
      <section className="pt-32 pb-16 bg-black">
        <div className="container-wide">
          <motion.p className="section-label mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            GET IN TOUCH
          </motion.p>
          <motion.h1
            className="font-heading font-bold text-display-xl text-offwhite"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
          >
            CONTACT US.
          </motion.h1>
        </div>
      </section>

      <section className="section bg-black">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <h2 className="font-heading font-bold text-2xl text-offwhite mb-8">Studio Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-charcoal border border-gray-border rounded-2xl">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-orange" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-offwhite mb-1">Location</p>
                    <p className="text-gray-muted text-sm font-body">{STUDIO_INFO.address}</p>
                    <p className="text-gray-muted text-sm font-body">{STUDIO_INFO.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-charcoal border border-gray-border rounded-2xl">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-orange" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-offwhite mb-1">Phone</p>
                    <a href={`tel:${STUDIO_INFO.phone}`} className="text-gray-muted text-sm hover:text-orange transition-colors">
                      {STUDIO_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-charcoal border border-gray-border rounded-2xl">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-orange" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-offwhite mb-1">Email</p>
                    <a href={`mailto:${STUDIO_INFO.email}`} className="text-gray-muted text-sm hover:text-orange transition-colors break-all">
                      {STUDIO_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-charcoal border border-gray-border rounded-2xl">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-5 h-5 text-orange" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-offwhite mb-1">Instagram</p>
                    <a
                      href={`https://instagram.com/${STUDIO_INFO.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-muted text-sm hover:text-orange transition-colors"
                    >
                      {STUDIO_INFO.instagram}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-charcoal border border-gray-border rounded-2xl">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-orange" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-offwhite mb-1">Hours</p>
                    <p className="text-gray-muted text-sm">Monday – Sunday</p>
                    <p className="text-gray-muted text-sm">9:00 AM – 11:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Book CTA */}
              <div className="mt-8 p-6 bg-orange rounded-2xl">
                <h3 className="font-heading font-bold text-xl text-black mb-2">Ready to Record?</h3>
                <p className="text-black/70 text-sm mb-4">Book your session in minutes.</p>
                <Link to="/book-session" className="inline-block bg-black text-white font-heading font-bold text-sm px-6 py-3 rounded-xl hover:bg-charcoal transition-colors tracking-wider uppercase">
                  BOOK A SESSION
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-heading font-bold text-2xl text-offwhite mb-8">Send a Message</h2>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-orange text-5xl mb-4">✓</div>
                  <h3 className="font-heading font-bold text-xl text-offwhite mb-2">Message Sent!</h3>
                  <p className="text-gray-muted text-sm">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="label-field">Your Name</label>
                    <input {...register('name')} placeholder="Full Name" className="input-field rounded-xl" />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label-field">Email</label>
                    <input {...register('email')} type="email" placeholder="your@email.com" className="input-field rounded-xl" />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label-field">Phone (Optional)</label>
                    <input {...register('phone')} type="tel" placeholder="(555) 123-4567" className="input-field rounded-xl" />
                  </div>
                  <div>
                    <label className="label-field">Message</label>
                    <textarea {...register('message')} rows={6} placeholder="Tell us about your project..." className="input-field rounded-xl resize-none" />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary rounded-xl w-full text-sm disabled:opacity-60"
                  >
                    {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-16 rounded-2xl overflow-hidden border border-gray-border h-72 bg-charcoal flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-orange mx-auto mb-3" />
              <p className="text-gray-muted text-sm">3900 W Commercial Blvd, Suite 230, Tamarac, FL 33309</p>
              <a
                href="https://maps.google.com/?q=3900+W+Commercial+Blvd+Tamarac+FL"
                target="_blank"
                rel="noreferrer"
                className="text-orange text-sm mt-2 inline-block hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
