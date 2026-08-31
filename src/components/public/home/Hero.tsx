import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Disc, MapPin, ArrowDown } from 'lucide-react'
import { useHeroSlides } from '../../../hooks/useHeroSlides'
import { INITIAL_HERO_SLIDES } from '../../../lib/mockData'
import type { HeroSlide } from '../../../types'

const SLIDE_DURATION = 6000 // 6 seconds per slide

// Equalizer wave animation
function LiveStudioWave() {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[12, 22, 16, 26, 14, 20, 10, 24, 18, 12].map((h, i) => (
        <motion.div
          key={i}
          className="w-[2px] bg-orange rounded-full"
          animate={{
            height: [4, h, 4],
          }}
          transition={{
            duration: 1 + (i % 4) * 0.25,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: i * 0.08,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  const { data: fetchedSlides } = useHeroSlides(true)
  const shouldReduceMotion = useReducedMotion()

  // Use fetched slides if available, otherwise fallback to defaults
  const slides: HeroSlide[] =
    fetchedSlides && fetchedSlides.length > 0 ? fetchedSlides : INITIAL_HERO_SLIDES

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressIntervalRef = useRef<number | null>(null)
  const heroRef = useRef<HTMLElement>(null)

  // Ensure current index is within bounds if slides length changes
  const activeIndex = currentIndex >= slides.length ? 0 : currentIndex
  const currentSlide = slides[activeIndex] || INITIAL_HERO_SLIDES[0]

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }, [slides.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setProgress(0)
  }, [])

  // Auto-advance timer with progress bar
  useEffect(() => {
    if (isPaused || shouldReduceMotion) return

    const stepMs = 50
    const stepIncrement = (stepMs / SLIDE_DURATION) * 100

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext()
          return 0
        }
        return prev + stepIncrement
      })
    }, stepMs)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPaused, shouldReduceMotion, goToNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev])

  // Split title lines
  const titleLines = currentSlide.title ? currentSlide.title.split('\n') : ['YOUR SOUND.', 'YOUR SPACE.']

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight * 0.92,
      behavior: 'smooth',
    })
  }

  return (
    <section
      ref={heroRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Patizan Records Hero Slider"
      className="relative w-full min-h-[88vh] md:min-h-[92vh] lg:min-h-[96vh] flex flex-col justify-between overflow-hidden bg-black select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ─── BACKGROUND IMAGE SLIDER WITH SEAMLESS CROSSFADE ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-live={isPaused ? 'polite' : 'off'}>
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide.id || activeIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: [0.25, 1, 0.5, 1] },
              scale: { duration: 7, ease: 'easeOut' },
            }}
          >
            {currentSlide.background_image ? (
              <img
                src={currentSlide.background_image}
                alt={currentSlide.title ? currentSlide.title.replace(/\n/g, ' ') : 'Patizan Records Studio'}
                className="w-full h-full object-cover transform-gpu"
                style={{ objectPosition: currentSlide.image_position || 'center' }}
                loading={activeIndex === 0 ? 'eager' : 'lazy'}
                fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#141414] via-[#0a0a0a] to-black" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── CINEMATIC OVERLAYS & CONTRAST GRADIENTS ─── */}
        {/* Left-to-right directional scrim for strong editorial text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 md:via-black/60 to-black/35 z-10" />

        {/* Top vignette to seamlessly integrate fixed navbar */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10" />

        {/* Bottom smooth fade to next section and persistent music player room */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

        {/* Atmospheric ambient orange & gold subtle glow */}
        <div className="absolute top-1/4 left-1/12 w-96 h-96 bg-orange/10 rounded-full blur-[140px] pointer-events-none z-10" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none z-10" />

        {/* Subtle grid accent lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-10 opacity-60" />
      </div>

      {/* ─── INDEPENDENT DYNAMIC HTML/UI CONTENT LAYER ─── */}
      <div className="relative z-20 container-wide flex-1 flex flex-col justify-center pt-28 md:pt-32 lg:pt-36 pb-20 md:pb-24">
        <div className="w-full max-w-[720px] text-left">
          {/* Subtitle / Studio Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`subtitle-${activeIndex}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-4 md:mb-5 flex-wrap"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-orange/30 shadow-[0_0_20px_rgba(255,122,0,0.15)]">
                <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                <span className="font-heading font-bold text-xs tracking-widest text-orange uppercase">
                  {currentSlide.subtitle || 'PATIZAN RECORDS'}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-offwhite/60 text-xs font-heading font-medium tracking-wider">
                <MapPin size={13} className="text-gold" />
                <span>TAMARAC, SOUTH FLORIDA</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Large Bold Editorial Headline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-${activeIndex}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 md:mb-6"
            >
              <h1 className="font-heading font-bold text-[2.75rem] leading-[0.95] sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.25rem] text-offwhite tracking-tight">
                {titleLines.map((line, idx) => (
                  <span key={idx} className="block overflow-hidden">
                    <span className="block drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                      {line}
                    </span>
                  </span>
                ))}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* Description Copy */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${activeIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              className="text-offwhite/80 font-body text-sm sm:text-base md:text-lg max-w-[580px] mb-8 md:mb-10 leading-relaxed font-normal drop-shadow-sm"
            >
              {currentSlide.description ||
                'A professional recording environment built for artists, producers, podcasters and creators in South Florida.'}
            </motion.p>
          </AnimatePresence>

          {/* Dynamic CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {currentSlide.primary_button_text && (
              <Link
                to={currentSlide.primary_button_link || '/book-session'}
                className="btn-primary group relative overflow-hidden rounded-xl text-xs md:text-sm px-8 py-4 text-center font-heading font-bold tracking-wider uppercase transition-all duration-300 transform active:scale-95 shadow-[0_0_25px_rgba(255,122,0,0.35)]"
                aria-label={currentSlide.primary_button_text}
              >
                <span className="relative z-10 flex items-center justify-center">
                  <span>{currentSlide.primary_button_text}</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange to-[#FFA043] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            )}

            {currentSlide.secondary_button_text && (
              <Link
                to={currentSlide.secondary_button_link || '/studio'}
                className="btn-secondary rounded-xl text-xs md:text-sm px-8 py-4 text-center font-heading font-semibold tracking-wider uppercase bg-black/40 backdrop-blur-md border border-white/30 text-offwhite hover:border-orange hover:text-orange hover:bg-black/60 transition-all duration-300 transform active:scale-95"
                aria-label={currentSlide.secondary_button_text}
              >
                <span>{currentSlide.secondary_button_text}</span>
              </Link>
            )}
          </motion.div>

          {/* Quick Studio Highlights Strip */}
          <motion.div
            className="flex items-center gap-6 mt-8 sm:mt-10 pt-6 border-t border-white/10 text-[11px] sm:text-xs font-heading tracking-wider uppercase text-offwhite/50 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <LiveStudioWave />
              <span className="text-offwhite/80 font-medium">Dolby Atmos Ready</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Disc size={13} className="text-orange" />
              <span className="text-offwhite/80 font-medium">SSL Hybrid Console</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-white/20" />
            <div>
              <span className="text-gold font-bold">24/7</span> SESSIONS AVAILABLE
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── CINEMATIC SLIDER CONTROLS & ANIMATED PROGRESS BAR ─── */}
      <div className="relative z-30 container-wide pb-6 md:pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Slide Indicators with Progress Line */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Current Slide Number */}
          <span className="font-heading font-bold text-sm md:text-base text-orange tracking-widest">
            0{activeIndex + 1}
          </span>

          {/* Active Animated Progress Bar */}
          <div className="relative w-28 sm:w-44 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-orange to-gold rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* Total Slides Number */}
          <span className="font-heading font-bold text-sm md:text-base text-offwhite/50 tracking-widest">
            0{slides.length}
          </span>

          {/* Quick Slide Select Dots/Pills for Desktop */}
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/15">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-6 bg-orange shadow-[0_0_10px_rgba(255,122,0,0.6)]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Jump to slide ${i + 1}`}
                aria-current={i === activeIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={goToPrev}
            className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/90 border border-white/20 hover:border-orange/60 text-offwhite hover:text-orange flex items-center justify-center transition-all duration-200 backdrop-blur-md active:scale-95 shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNext}
            className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/90 border border-white/20 hover:border-orange/60 text-offwhite hover:text-orange flex items-center justify-center transition-all duration-200 backdrop-blur-md active:scale-95 shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>

          {/* Scroll Down Arrow */}
          <button
            onClick={scrollToNextSection}
            className="hidden lg:flex w-10 h-10 ml-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-offwhite/60 hover:text-orange items-center justify-center transition-all duration-200"
            aria-label="Scroll down to studio introduction"
          >
            <ArrowDown size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
