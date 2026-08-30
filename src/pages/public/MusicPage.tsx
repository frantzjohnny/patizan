import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Music2, ShoppingCart } from 'lucide-react'
import { useMusicTracks, useBeatCategories } from '../../hooks/useMusic'
import { usePlayerStore } from '../../store/playerStore'
import { formatCurrency, formatDuration } from '../../lib/utils'
import SEO from '../../components/common/SEO'

export default function MusicPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const { data: categories = [] } = useBeatCategories()
  const { data: tracksData, isLoading } = useMusicTracks({
    isBeats: true,
    beatCategoryId: selectedCategory,
  })
  const tracks = tracksData?.data || []
  const { data: featuredData } = useMusicTracks({ isFeatured: true, isBeats: false })
  const featuredTracks = featuredData?.data || []

  const { setTracks, playTrack, isPlaying, getCurrentTrack, togglePlay } = usePlayerStore()

  const handlePlay = (track: typeof tracks[0], list: typeof tracks, index: number) => {
    const current = getCurrentTrack()
    if (current?.id === track.id) {
      togglePlay()
    } else {
      setTracks(list, index)
      playTrack(index)
    }
  }

  return (
    <>
      <SEO
        title="Music & Beats | Patizan Records"
        description="Listen to studio releases, featured tracks, and browse exclusive royalty-ready beat productions from Patizan Records producers in Tamarac, FL."
        canonicalPath="/music"
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-black">
        <div className="container-wide">
          <motion.p className="section-label mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            BEATS & MUSIC
          </motion.p>
          <motion.h1
            className="font-heading font-bold text-display-xl text-offwhite"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
          >
            THE CATALOG.
          </motion.h1>
        </div>
      </section>

      {/* Featured Tracks */}
      {featuredTracks.length > 0 && (
        <section className="section bg-navy">
          <div className="container-wide">
            <p className="section-label mb-3">FEATURED</p>
            <h2 className="font-heading font-bold text-3xl text-offwhite mb-8">Featured Tracks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTracks.slice(0, 6).map((track, i) => {
                const current = getCurrentTrack()
                const isActive = current?.id === track.id && isPlaying
                return (
                  <motion.div
                    key={track.id}
                    className="group bg-charcoal border border-gray-border rounded-2xl overflow-hidden hover:border-orange/30 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <Music2 size={48} className="text-gray-muted" />
                        </div>
                      )}
                      <button
                        onClick={() => handlePlay(track, featuredTracks, i)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-300 group/play"
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-orange opacity-100' : 'bg-orange opacity-0 group-hover/play:opacity-100'}`}>
                          <Play size={24} className="text-black ml-1" />
                        </div>
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="font-heading font-bold text-base text-offwhite truncate">{track.title}</p>
                      <p className="text-gray-muted text-sm truncate">{track.artist}</p>
                      {track.price && (
                        <p className="text-orange font-heading font-bold text-sm mt-2">{formatCurrency(track.price)}</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Beat Catalog */}
      <section className="section bg-black">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="section-label mb-2">BEAT STORE</p>
              <h2 className="font-heading font-bold text-3xl text-offwhite">Beat Catalog</h2>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-semibold uppercase tracking-wider transition-all ${!selectedCategory ? 'bg-orange text-black' : 'bg-charcoal border border-gray-border text-gray-muted hover:text-offwhite'}`}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-heading font-semibold uppercase tracking-wider transition-all ${selectedCategory === cat.id ? 'bg-orange text-black' : 'bg-charcoal border border-gray-border text-gray-muted hover:text-offwhite'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-charcoal rounded-xl animate-pulse" />)}
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-16 px-4 bg-charcoal border border-gray-border rounded-2xl">
              <Music2 size={36} className="text-gray-muted mx-auto mb-3" />
              <p className="font-heading font-semibold text-offwhite text-base">No Tracks Published Yet</p>
              <p className="text-gray-muted text-xs mt-1">Check back soon for new beats and studio releases.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {tracks.map((track, i) => {
                  const current = getCurrentTrack()
                  const isActive = current?.id === track.id
                  const isThisPlaying = isActive && isPlaying
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-orange/10 border-orange/30' : 'bg-charcoal border-gray-border hover:border-orange/20'}`}
                      onClick={() => handlePlay(track, tracks, i)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-orange' : 'bg-black/50'}`}>
                        {isThisPlaying ? (
                          <div className="flex items-end gap-0.5 h-4">
                            {[...Array(4)].map((_, j) => (
                              <div key={j} className="w-0.5 bg-black rounded-full waveform-bar" style={{ animationDelay: `${j * 0.1}s` }} />
                            ))}
                          </div>
                        ) : (
                          <Play size={14} className={isActive ? 'text-black ml-0.5' : 'text-offwhite/60 ml-0.5'} />
                        )}
                      </div>
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                          <Music2 size={14} className="text-gray-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-heading font-semibold text-sm truncate ${isActive ? 'text-orange' : 'text-offwhite'}`}>{track.title}</p>
                        <p className="text-xs text-gray-muted">{track.artist} · {track.beat_category?.name || track.genre}</p>
                      </div>
                      {track.bpm && <span className="hidden md:block text-xs text-gray-muted">{track.bpm} BPM</span>}
                      {track.key && <span className="hidden lg:block text-xs text-gray-muted">{track.key}</span>}
                      {track.duration_seconds && <span className="text-xs text-gray-muted tabular-nums">{formatDuration(track.duration_seconds)}</span>}
                      {track.price ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-heading font-bold text-sm text-orange">{formatCurrency(track.price)}</span>
                          <button className="p-1.5 bg-orange/10 rounded-lg text-orange hover:bg-orange/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <ShoppingCart size={12} />
                          </button>
                        </div>
                      ) : null}
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  )
}
