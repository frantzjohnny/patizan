import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePlayerStore } from '../store/playerStore'
import type { MusicTrack, Playlist } from '../types'

export function useMusicTracks(filters?: {
  isBeats?: boolean
  beatCategoryId?: string
  isFeatured?: boolean
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['music-tracks', filters],
    queryFn: async () => {
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let q = supabase
        .from('music_tracks')
        .select('*, beat_category:beat_categories(*)', { count: 'exact' })
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .range(from, to)

      if (filters?.isBeats !== undefined) q = q.eq('is_beat', filters.isBeats)
      if (filters?.beatCategoryId) q = q.eq('beat_category_id', filters.beatCategoryId)
      if (filters?.isFeatured) q = q.eq('is_featured', true)

      const { data, error, count } = await q
      if (error) throw error
      return { data: data || [], count: count || 0 }
    },
  })
}

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: async (): Promise<Playlist[]> => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })
}

export function usePlaylistTracks(playlistId: string) {
  return useQuery({
    queryKey: ['playlist-tracks', playlistId],
    queryFn: async (): Promise<MusicTrack[]> => {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select('*, track:music_tracks(*)')
        .eq('playlist_id', playlistId)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data || []).map((pt: { track: MusicTrack }) => pt.track).filter(Boolean)
    },
    enabled: !!playlistId,
  })
}

export function useActivePlaylist() {
  return useQuery({
    queryKey: ['active-playlist'],
    queryFn: async (): Promise<{ playlist?: Playlist; tracks: MusicTrack[] } | null> => {
      // 1. Try to find explicitly active playlist
      const { data: playlist } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_active_website_playlist', true)
        .eq('is_published', true)
        .single()

      if (playlist) {
        const { data: ptData } = await supabase
          .from('playlist_tracks')
          .select('*, track:music_tracks(*)')
          .eq('playlist_id', playlist.id)
          .order('display_order', { ascending: true })

        const tracks = (ptData || []).map((pt: { track: MusicTrack }) => pt.track).filter(Boolean)
        if (tracks.length > 0) {
          return { playlist, tracks }
        }
      }

      // 2. Fallback to all published tracks or featured tracks
      const { data: fallbackTracks } = await supabase
        .from('music_tracks')
        .select('*, beat_category:beat_categories(*)')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .limit(10)

      if (fallbackTracks && fallbackTracks.length > 0) {
        return { playlist: playlist || undefined, tracks: fallbackTracks }
      }

      return null
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Auto-load the active playlist into the player
export function useInitPlayer() {
  const { data } = useActivePlaylist()
  const { setTracks, isVisible } = usePlayerStore()

  useEffect(() => {
    if (data?.tracks && data.tracks.length > 0 && !isVisible) {
      setTracks(data.tracks)
    }
  }, [data, isVisible, setTracks])
}

export function useBeatCategories() {
  return useQuery({
    queryKey: ['beat-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beat_categories')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
  })
}

export function useCreateTrack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (track: Partial<MusicTrack>) => {
      const { data, error } = await supabase
        .from('music_tracks')
        .insert(track)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music-tracks'] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      qc.invalidateQueries({ queryKey: ['admin-music-tracks'] })
    },
  })
}

export function useUpdateTrack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MusicTrack> & { id: string }) => {
      const { error } = await supabase.from('music_tracks').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music-tracks'] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      qc.invalidateQueries({ queryKey: ['admin-music-tracks'] })
    },
  })
}

export function useDeleteTrack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('music_tracks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music-tracks'] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      qc.invalidateQueries({ queryKey: ['admin-music-tracks'] })
    },
  })
}

export function useAdminPlaylists() {
  return useQuery({
    queryKey: ['admin-playlists'],
    queryFn: async (): Promise<Playlist[]> => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })
}

export function useAdminMusicTracks() {
  return useQuery({
    queryKey: ['admin-music-tracks'],
    queryFn: async (): Promise<MusicTrack[]> => {
      const { data, error } = await supabase
        .from('music_tracks')
        .select('*, beat_category:beat_categories(*)')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
  })
}
