import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1,
  ChevronUp, ChevronDown, Music2, ListMusic,
} from 'lucide-react'
import { usePlayerStore } from '../../../store/playerStore'
import { formatDuration, cn } from '../../../lib/utils'

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

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
  }, [track?.audio_url, currentIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audio.currentTime = pct * duration
  }

  if (!isVisible || !track || tracks.length === 0) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-[90] bg-black/98 backdrop-blur-xl flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background art */}
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
                  className="p-2 text-offwhite/50 hover:text-offwhite transition-colors"
                >
                  <ChevronDown size={28} />
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
                  onClick={handleProgressClick}
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
                  className={cn('p-2 transition-colors', isShuffled ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
                >
                  <Shuffle size={20} />
                </button>

                <button onClick={prevTrack} className="p-2 text-offwhite/70 hover:text-offwhite transition-colors">
                  <SkipBack size={28} />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-orange rounded-full flex items-center justify-center hover:bg-orange-hover transition-all shadow-glow-orange active:scale-95"
                >
                  {isPlaying ? <Pause size={28} className="text-black" /> : <Play size={28} className="text-black ml-1" />}
                </button>

                <button onClick={nextTrack} className="p-2 text-offwhite/70 hover:text-offwhite transition-colors">
                  <SkipForward size={28} />
                </button>

                <button
                  onClick={cycleRepeat}
                  className={cn('p-2 transition-colors', repeatMode !== 'none' ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
                >
                  {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-gray-muted hover:text-offwhite transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-orange h-1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom player bar */}
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
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-orange transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center h-full px-4 gap-4">
          {/* Track info */}
          <button
            className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-56 group"
            onClick={() => setExpanded(true)}
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
            <ChevronUp size={16} className="text-gray-muted group-hover:text-orange transition-colors hidden md:block shrink-0" />
          </button>

          {/* Controls (center on md+) */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 justify-center">
            <button
              onClick={toggleShuffle}
              className={cn('hidden md:block p-1.5 transition-colors', isShuffled ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
            >
              <Shuffle size={16} />
            </button>

            <button onClick={prevTrack} className="hidden md:block p-1.5 text-offwhite/70 hover:text-offwhite transition-colors">
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-orange rounded-full flex items-center justify-center hover:bg-orange-hover transition-all active:scale-95 shadow-glow-orange"
            >
              {isPlaying ? <Pause size={18} className="text-black" /> : <Play size={18} className="text-black ml-0.5" />}
            </button>

            <button onClick={nextTrack} className="p-1.5 text-offwhite/70 hover:text-offwhite transition-colors">
              <SkipForward size={20} />
            </button>

            <button
              onClick={cycleRepeat}
              className={cn('hidden md:block p-1.5 transition-colors', repeatMode !== 'none' ? 'text-orange' : 'text-gray-muted hover:text-offwhite')}
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Volume + time (right side) */}
          <div className="hidden md:flex items-center gap-3 md:w-56 justify-end">
            <span className="text-xs text-gray-muted font-body tabular-nums">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
            <button onClick={toggleMute} className="text-gray-muted hover:text-offwhite transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-orange h-1"
            />
          </div>

          {/* Waveform animation (mobile) */}
          <button
            onClick={() => setExpanded(true)}
            className="md:hidden flex items-end gap-0.5 h-5"
          >
            {isPlaying ? (
              [...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    height: `${Math.random() * 60 + 40}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))
            ) : (
              <ListMusic size={18} className="text-gray-muted" />
            )}
          </button>
        </div>
      </motion.div>
    </>
  )
}
