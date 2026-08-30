import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MusicTrack } from '../types';

interface PlayerStore {
  tracks: MusicTrack[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  isVisible: boolean;
  shuffledOrder: number[];

  // Actions
  setTracks: (tracks: MusicTrack[], startIndex?: number) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  setVisible: (visible: boolean) => void;
  getCurrentTrack: () => MusicTrack | null;
}

function generateShuffleOrder(length: number, currentIndex: number): number[] {
  const arr = Array.from({ length }, (_, i) => i).filter((i) => i !== currentIndex);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return [currentIndex, ...arr];
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      tracks: [],
      currentIndex: 0,
      isPlaying: false,
      volume: 0.8,
      isMuted: false,
      isShuffled: false,
      repeatMode: 'none',
      currentTime: 0,
      duration: 0,
      isExpanded: false,
      isVisible: false,
      shuffledOrder: [],

      setTracks: (tracks, startIndex = 0) => {
        set({
          tracks,
          currentIndex: startIndex,
          isVisible: tracks.length > 0,
          shuffledOrder: generateShuffleOrder(tracks.length, startIndex),
        });
      },

      playTrack: (index) => {
        const { tracks } = get();
        if (index >= 0 && index < tracks.length) {
          set({ currentIndex: index, isPlaying: true, currentTime: 0 });
        }
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      nextTrack: () => {
        const { tracks, currentIndex, isShuffled, shuffledOrder, repeatMode } = get();
        if (tracks.length === 0) return;

        if (repeatMode === 'one') {
          set({ currentTime: 0, isPlaying: true });
          return;
        }

        const order = isShuffled ? shuffledOrder : tracks.map((_, i) => i);
        const currentPosInOrder = order.indexOf(currentIndex);
        const nextPos = currentPosInOrder + 1;

        if (nextPos >= order.length) {
          if (repeatMode === 'all') {
            set({ currentIndex: order[0], currentTime: 0, isPlaying: true });
          } else {
            set({ isPlaying: false });
          }
        } else {
          set({ currentIndex: order[nextPos], currentTime: 0, isPlaying: true });
        }
      },

      prevTrack: () => {
        const { tracks, currentIndex, currentTime, isShuffled, shuffledOrder } = get();
        if (tracks.length === 0) return;

        // If more than 3 seconds in, restart current
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        const order = isShuffled ? shuffledOrder : tracks.map((_, i) => i);
        const currentPosInOrder = order.indexOf(currentIndex);
        const prevPos = currentPosInOrder - 1;

        if (prevPos < 0) {
          set({ currentIndex: order[order.length - 1], currentTime: 0, isPlaying: true });
        } else {
          set({ currentIndex: order[prevPos], currentTime: 0, isPlaying: true });
        }
      },

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      toggleShuffle: () => {
        const { isShuffled, tracks, currentIndex } = get();
        set({
          isShuffled: !isShuffled,
          shuffledOrder: generateShuffleOrder(tracks.length, currentIndex),
        });
      },

      cycleRepeat: () => {
        const { repeatMode } = get();
        const modes: Array<'none' | 'one' | 'all'> = ['none', 'all', 'one'];
        const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
        set({ repeatMode: modes[nextIndex] });
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setExpanded: (expanded) => set({ isExpanded: expanded }),
      setVisible: (visible) => set({ isVisible: visible }),

      getCurrentTrack: () => {
        const { tracks, currentIndex } = get();
        return tracks[currentIndex] || null;
      },
    }),
    {
      name: 'patizan-player',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode,
      }),
    }
  )
);
