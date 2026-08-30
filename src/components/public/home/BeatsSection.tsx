import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Play, Music2, ArrowRight, ShoppingCart } from 'lucide-react'
import { useMusicTracks, useBeatCategories } from '../../../hooks/useMusic'
import { usePlayerStore } from '../../../store/playerStore'
import { formatCurrency } from '../../../lib/utils'

export default function BeatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { data: categories = [] } = useBeatCategories()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const { data: tracksData, isLoading } = useMusicTracks({
    isBeats: true,
    beatCategoryId: selectedCategory,
    pageSize: 6,
  })
  const tracks = tracksData?.data || []

  const { setTracks, playTrack, isPlaying, getCurrentTrack, togglePlay } = usePlayerStore()

  const handlePlayTrack = (track: typeof tracks[0], index: number) => {
    const current = getCurrentTrack()
    if (current?.id === track.id) {
      togglePlay()
    } else {
      setTracks(tracks, index)
      playTrack(index)
    }
  }

  return (
    <section className="section bg-navy overflow-hidden">
      <div ref={ref} className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
          >
            <p className="section-label mb-3">BEAT CATALOG</p>
            <h2 className="section-title">
              FIND YOUR
              <br />
              SOUND.
            </h2>
          </motion.div>

          <motion.a
            href="/music"
            className="inline-flex items-center gap-2 text-orange text-sm font-heading font-semibold tracking-widest uppercase hover:text-orange-hover transition-colors group"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            FULL CATALOG
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Category tabs */}
        <motion.div
          className="flex gap-2 flex-wrap mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase transition-all duration-200 ${
              !selectedCategory
                ? 'bg-orange text-black'
                : 'bg-charcoal border border-gray-border text-gray-muted hover:text-offwhite hover:border-orange/30'
            }`}
          >
            ALL
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-orange text-black'
                  : 'bg-charcoal border border-gray-border text-gray-muted hover:text-offwhite hover:border-orange/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Tracks */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-charcoal rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-16 text-gray-muted">
              <Music2 size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-body">No beats available in this category yet.</p>
            </div>
          ) : (
            <motion.div
              key={selectedCategory}
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {tracks.map((track, i) => {
                const current = getCurrentTrack()
                const isCurrentTrack = current?.id === track.id
                const isThisPlaying = isCurrentTrack && isPlaying

                return (
                  <motion.div
                    key={track.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${
                      isCurrentTrack
                        ? 'bg-orange/10 border-orange/30'
                        : 'bg-charcoal border-gray-border hover:border-orange/20 hover:bg-charcoal-light'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handlePlayTrack(track, i)}
                  >
                    {/* Play button / number */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isCurrentTrack ? 'bg-orange' : 'bg-black/40 group-hover:bg-orange/20'
                    }`}>
                      {isThisPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          {[...Array(4)].map((_, j) => (
                            <div
                              key={j}
                              className="w-0.5 bg-black rounded-full waveform-bar"
                              style={{ animationDelay: `${j * 0.1}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Play size={16} className={isCurrentTrack ? 'text-black ml-0.5' : 'text-offwhite/60 ml-0.5'} />
                      )}
                    </div>

                    {/* Cover */}
                    {track.cover_url ? (
                      <img
                        src={track.cover_url}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                        <Music2 size={16} className="text-gray-muted" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-heading font-semibold text-sm truncate ${isCurrentTrack ? 'text-orange' : 'text-offwhite'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-muted truncate">{track.artist} · {track.beat_category?.name || track.genre}</p>
                    </div>

                    {/* BPM */}
                    {track.bpm && (
                      <span className="hidden md:block text-xs text-gray-muted shrink-0">
                        {track.bpm} BPM
                      </span>
                    )}

                    {/* Price */}
                    {track.price && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-heading font-bold text-orange">
                          {formatCurrency(track.price)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          className="p-1.5 bg-orange/10 rounded-lg text-orange hover:bg-orange/20 transition-colors"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
