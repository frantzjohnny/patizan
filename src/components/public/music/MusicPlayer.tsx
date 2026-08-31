import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1,
  X, ChevronUp, Music2,
} from 'lucide-react'
import { usePlayerStore } from '../../../store/playerStore'
import { formatDuration, cn } from '../../../lib/utils'

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const mobileProgressRef = useRef<HTMLDivElement>(null)
  const [mobileExpanded, setMobileExpanded] = useState(false)

  const {
    tracks, currentIndex, isPlaying, volume, isMuted,
    isShuffled, repeatMode, currentTime, duration,
    isExpanded, isVisible,
    togglePlay, nextTrack, prevTrack,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
    setCurrentTime, setDuration, setIsPlaying, setExpanded,
    getCurrentTrack,
  } = usePlayerStore()

  const track = getCurrentTrack()

  // Sync audio element with store
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return

    const wasPlaying = isPlaying

    if (audio.src !== track.audio_url) {
      audio.src = track.audio_url
      audio.load()
      if (wasPlaying) {
        audio.play().catch(() => setIsPlaying(false))
      }
    }
  }, [track?.audio_url, currentIndex, isPlaying, setIsPlaying, track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, setIsPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (audio) setCurrentTime(audio.currentTime)
  }, [setCurrentTime])

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (audio) setDuration(audio.duration)
  }, [setDuration])

  const handleEnded = useCallback(() => {
    nextTrack()
  }, [nextTrack])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    const audio = audioRef.current
    const bar = ref.current
    if (!audio || !bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = pct * duration
  }

  if (!isVisible || !track || tracks.length === 0) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* Persistent Global HTML Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* ========================================================
          1. MOBILE VIEW: Floating Circular Music Button + Compact Card
         ======================================================== */}
      <div className="md:hidden">
        {/* Floating Circular Music Button */}
        <motion.div
          className="fixed bottom-5 right-5 z-[70]"
          style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            aria-label={mobileExpanded ? 'Minimize music player' : isPlaying ? 'Open music player (playing)' : 'Open music player'}
            className={cn(
              'relative w-14 h-14 rounded-full bg-orange text-black flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange/50',
              isPlaying ? 'shadow-glow-orange border-2 border-white/20' : 'border border-black/20'
            )}
          >
            {/* Ambient Pulse Ring when playing */}
            {isPlaying && (
              <span className="absolute inset-0 rounded-full bg-orange/40 animate-ping opacity-30 pointer-events-none" />
            )}

            {/* Icon State */}
            {isPlaying ? (
              <div className="flex items-end gap-[3px] h-4">
                {[10, 16, 8, 14].map((h, idx) => (
                  <motion.div
                    key={idx}
                    className="w-[2.5px] bg-black rounded-full"
                    animate={{ height: [4, h, 4] }}
                    transition={{
                      duration: 0.8 + idx * 0.2,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            ) : (
              <Play size={22} className="text-black ml-0.5 fill-black" />
            )}
          </button>
        </motion.div>

        {/* Compact Mobile Expandable Music Card */}
        <AnimatePresence>
          {mobileExpanded && (
            <>
              {/* Backdrop dismiss */}
              <motion.div
                className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileExpanded(false)}
              />

              {/* Floating Compact Card */}
              <motion.div
                className="fixed bottom-22 right-4 left-4 max-w-sm ml-auto z-[80] bg-[#111111]/98 backdrop-blur-2xl border border-gray-border/80 rounded-3xl p-5 shadow-2xl"
                style={{ bottom: 'calc(max(1.25rem, env(safe-area-inset-bottom, 1.25rem)) + 4.25rem)' }}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header: Thumbnail + Track info + Close button */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {track.cover_url ? (
                      <img
                        src={track.cover_url}
                        alt={track.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-charcoal flex items-center justify-center shrink-0 border border-white/10">
                        <Music2 size={20} className="text-gray-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-bold text-sm text-offwhite truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-orange/90 font-body truncate">{track.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileExpanded(false)}
                    aria-label="Minimize music player"
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-offwhite/60 hover:text-offwhite hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div
                    ref={mobileProgressRef}
                    className="relative h-2 bg-charcoal rounded-full cursor-pointer py-1"
                    onClick={(e) => handleProgressClick(e, mobileProgressRef)}
                  >
                    <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                      <div
                        className="h-full bg-orange rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-muted font-mono px-0.5">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-between px-1">
                  <button
                    onClick={toggleShuffle}
                    aria-label="Toggle shuffle"
                    className={cn('p-2 transition-colors', isShuffled ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
                  >
                    <Shuffle size={18} />
                  </button>

                  <button
                    onClick={prevTrack}
                    aria-label="Previous track"
                    className="p-2 text-offwhite/80 hover:text-offwhite transition-colors"
                  >
                    <SkipBack size={22} />
                  </button>

                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause music' : 'Play music'}
                    className="w-12 h-12 bg-orange rounded-full flex items-center justify-center hover:bg-orange-hover text-black transition-all active:scale-95 shadow-glow-orange"
                  >
                    {isPlaying ? <Pause size={22} className="fill-black" /> : <Play size={22} className="fill-black ml-0.5" />}
                  </button>

                  <button
                    onClick={nextTrack}
                    aria-label="Next track"
                    className="p-2 text-offwhite/80 hover:text-offwhite transition-colors"
                  >
                    <SkipForward size={22} />
                  </button>

                  <button
                    onClick={cycleRepeat}
                    aria-label="Toggle repeat mode"
                    className={cn('p-2 transition-colors', repeatMode !== 'none' ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
                  >
                    {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================
          2. DESKTOP VIEW: Full Bottom Bar + Expanded Modal
         ======================================================== */}
      <div className="hidden md:block">
        {/* Fullscreen/Expanded view (Desktop) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="fixed inset-0 z-[90] bg-black/98 backdrop-blur-xl flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Background art blur */}
              {track.cover_url && (
                <div className="absolute inset-0 opacity-10">
                  <img
                    src={track.cover_url}
                    alt=""
                    className="w-full h-full object-cover blur-3xl scale-110"
                  />
                </div>
              )}

              <div className="relative flex flex-col h-full p-6 md:p-10 max-w-lg mx-auto w-full">
                {/* Close button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setExpanded(false)}
                    aria-label="Minimize full player"
                    className="p-2 text-offwhite/50 hover:text-offwhite transition-colors"
                  >
                    <X size={28} />
                  </button>
                </div>

                {/* Album art */}
                <div className="flex-1 flex items-center justify-center mb-8">
                  {track.cover_url ? (
                    <motion.img
                      key={track.id}
                      src={track.cover_url}
                      alt={track.title}
                      className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-2xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: isPlaying ? 1 : 0.92, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  ) : (
                    <div className="w-64 h-64 md:w-80 md:h-80 bg-charcoal rounded-2xl flex items-center justify-center">
                      <Music2 size={80} className="text-gray-muted" />
                    </div>
                  )}
                </div>

                {/* Track info */}
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-2xl text-offwhite truncate">{track.title}</h3>
                  <p className="text-gray-muted font-body mt-1 truncate">{track.artist}</p>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div
                    ref={progressRef}
                    className="relative h-1.5 bg-gray-border rounded-full cursor-pointer group"
                    onClick={(e) => handleProgressClick(e, progressRef)}
                  >
                    <div
                      className="absolute left-0 top-0 h-full bg-orange rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-muted font-body">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={toggleShuffle}
                    aria-label="Toggle shuffle"
                    className={cn('p-2 transition-colors', isShuffled ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
                  >
                    <Shuffle size={20} />
                  </button>

                  <button
                    onClick={prevTrack}
                    aria-label="Previous track"
                    className="p-2 text-offwhite/70 hover:text-offwhite transition-colors"
                  >
                    <SkipBack size={28} />
                  </button>

                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause music' : 'Play music'}
                    className="w-16 h-16 bg-orange rounded-full flex items-center justify-center hover:bg-orange-hover transition-all shadow-glow-orange active:scale-95"
                  >
                    {isPlaying ? <Pause size={28} className="text-black" /> : <Play size={28} className="text-black ml-1" />}
                  </button>

                  <button
                    onClick={nextTrack}
                    aria-label="Next track"
                    className="p-2 text-offwhite/70 hover:text-offwhite transition-colors"
                  >
                    <SkipForward size={28} />
                  </button>

                  <button
                    onClick={cycleRepeat}
                    aria-label="Toggle repeat mode"
                    className={cn('p-2 transition-colors', repeatMode !== 'none' ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
                  >
                    {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="text-gray-muted hover:text-offwhite transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    aria-label="Volume control"
                    className="flex-1 accent-orange h-1"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Bottom player bar */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[80] bg-navy/98 backdrop-blur-xl border-t border-gray-border/50 shadow-player"
          style={{ height: 'var(--player-height)' }}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Progress bar (thin, top of player) */}
          <div
            ref={progressRef}
            className="absolute top-0 left-0 right-0 h-0.5 bg-gray-border cursor-pointer group"
            onClick={(e) => handleProgressClick(e, progressRef)}
          >
            <div
              className="h-full bg-orange transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center h-full px-4 gap-4">
            {/* Track info */}
            <button
              className="flex items-center gap-3 min-w-0 md:w-56 group text-left"
              onClick={() => setExpanded(true)}
              aria-label="Expand player"
            >
              {track.cover_url ? (
                <img
                  src={track.cover_url}
                  alt={track.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-charcoal flex items-center justify-center shrink-0">
                  <Music2 size={18} className="text-gray-muted" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-heading font-semibold text-sm text-offwhite truncate group-hover:text-orange transition-colors">
                  {track.title}
                </p>
                <p className="text-xs text-gray-muted truncate">{track.artist}</p>
              </div>
              <ChevronUp size={16} className="text-gray-muted group-hover:text-orange transition-colors shrink-0" />
            </button>

            {/* Controls (center) */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <button
                onClick={toggleShuffle}
                aria-label="Toggle shuffle"
                className={cn('p-1.5 transition-colors', isShuffled ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
              >
                <Shuffle size={16} />
              </button>

              <button
                onClick={prevTrack}
                aria-label="Previous track"
                className="p-1.5 text-offwhite/70 hover:text-offwhite transition-colors"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
                className="w-10 h-10 bg-orange rounded-full flex items-center justify-center hover:bg-orange-hover transition-all active:scale-95 shadow-glow-orange"
              >
                {isPlaying ? <Pause size={18} className="text-black" /> : <Play size={18} className="text-black ml-0.5" />}
              </button>

              <button
                onClick={nextTrack}
                aria-label="Next track"
                className="p-1.5 text-offwhite/70 hover:text-offwhite transition-colors"
              >
                <SkipForward size={20} />
              </button>

              <button
                onClick={cycleRepeat}
                aria-label="Toggle repeat mode"
                className={cn('p-1.5 transition-colors', repeatMode !== 'none' ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
              >
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>

            {/* Volume + time (right side) */}
            <div className="flex items-center gap-3 md:w-56 justify-end">
              <span className="text-xs text-gray-muted font-body tabular-nums">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-gray-muted hover:text-offwhite transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volume control"
                className="w-20 accent-orange h-1"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
