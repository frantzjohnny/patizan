import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { HomeMediaItem } from '../types'

export const INITIAL_HOME_MEDIA: HomeMediaItem[] = [
  {
    id: 'media-studio-intro',
    slot_key: 'home_studio_intro',
    title: 'Studio Intro (About Section)',
    description: 'Featured studio image displayed next to "More Than A Studio" on the homepage.',
    image_url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80',
    alt_text: 'Patizan Records Recording Studio Tamarac',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'media-showcase-1',
    slot_key: 'home_showcase_1',
    title: 'Studio Showcase 01 — Control Room',
    description: 'Large feature image in "The Space Itself" facility showcase.',
    image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
    alt_text: 'Patizan Records Control Room',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'media-showcase-2',
    slot_key: 'home_showcase_2',
    title: 'Studio Showcase 02 — Mixing Console',
    description: 'Mixing console slot in the facility grid.',
    image_url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80',
    alt_text: 'Analog & Digital Mixing Console at Patizan Records',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'media-showcase-3',
    slot_key: 'home_showcase_3',
    title: 'Studio Showcase 03 — Recording Booth',
    description: 'Acoustically isolated vocal booth slot.',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    alt_text: 'Acoustic Vocal Recording Booth',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'media-showcase-4',
    slot_key: 'home_showcase_4',
    title: 'Studio Showcase 04 — Podcast Suite',
    description: 'Multi-camera podcast and broadcast setup slot.',
    image_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80',
    alt_text: 'Podcast Production Suite',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'media-showcase-5',
    slot_key: 'home_showcase_5',
    title: 'Studio Showcase 05 — Studio Equipment',
    description: 'High-end microphones and analog outboard gear slot.',
    image_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80',
    alt_text: 'Studio Microphones and Outboard Audio Processors',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
]

const STORAGE_KEY = 'patizan_home_media_cache'

function getLocalHomeMedia(): HomeMediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Ignore localStorage errors
  }
  return INITIAL_HOME_MEDIA
}

function saveLocalHomeMedia(items: HomeMediaItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore localStorage errors
  }
}

export function useHomeMedia() {
  return useQuery<HomeMediaItem[]>({
    queryKey: ['home_media'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('home_media')
          .select('*')
          .order('slot_key')

        if (error || !data || data.length === 0) {
          return getLocalHomeMedia()
        }

        // Merge fetched data with default slots in case new slots exist
        const merged = INITIAL_HOME_MEDIA.map((initial) => {
          const found = data.find((d: any) => d.slot_key === initial.slot_key)
          return found || initial
        })

        saveLocalHomeMedia(merged)
        return merged
      } catch {
        return getLocalHomeMedia()
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

export function useUpdateHomeMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      slot_key,
      image_url,
      alt_text,
      storage_path,
    }: {
      slot_key: string
      image_url: string
      alt_text?: string
      storage_path?: string
    }) => {
      const now = new Date().toISOString()

      // Attempt Supabase upsert
      try {
        await supabase.from('home_media').upsert(
          {
            slot_key,
            image_url,
            alt_text: alt_text || 'Patizan Records Studio Image',
            storage_path: storage_path || null,
            is_active: true,
            updated_at: now,
          },
          { onConflict: 'slot_key' }
        )
      } catch (err) {
        console.warn('Supabase home_media update fallback to local cache:', err)
      }

      // Update local storage cache
      const current = getLocalHomeMedia()
      const updated = current.map((item) =>
        item.slot_key === slot_key
          ? {
              ...item,
              image_url,
              alt_text: alt_text !== undefined ? alt_text : item.alt_text,
              storage_path: storage_path || item.storage_path,
              updated_at: now,
            }
          : item
      )
      saveLocalHomeMedia(updated)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_media'] })
    },
  })
}
