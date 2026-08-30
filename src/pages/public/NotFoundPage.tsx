import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '../../components/common/SEO'

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-black relative px-6 py-32 overflow-hidden">
      <SEO
        title="Page Not Found | Patizan Records"
        description="The page you are looking for does not exist or has been moved. Return to Patizan Records homepage or book a studio session."
        canonicalPath="/404"
      />

      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-orange/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 max-w-xl text-center"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-mono text-xs text-orange uppercase tracking-[0.3em] font-semibold block mb-4">
          ERROR 404
        </span>

        <h1 className="font-heading font-bold text-6xl sm:text-7xl md:text-8xl text-offwhite tracking-tight leading-none mb-6">
          THIS TRACK
          <br />
          <span className="text-gradient">DOESN'T EXIST.</span>
        </h1>

        <div className="h-px w-16 bg-orange/60 mx-auto mb-6" />

        <p className="text-offwhite/70 font-body text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          The page you're looking for could not be found or has been moved to another studio frequency.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="btn-primary rounded-xl px-8 py-4 text-xs font-heading font-bold tracking-wider uppercase w-full sm:w-auto"
          >
            BACK TO HOME
          </Link>
          <Link
            to="/book-session"
            className="btn-secondary rounded-xl px-8 py-4 text-xs font-heading font-semibold tracking-wider uppercase w-full sm:w-auto hover:border-orange hover:text-orange"
          >
            BOOK A SESSION
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
