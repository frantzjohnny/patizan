import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { INITIAL_HERO_SLIDES } from '../lib/mockData'
import type { HeroSlide } from '../types'

/**
 * Public Hero Slides Hook
 * Primary source of truth: Supabase `hero_slides` table.
 * Subscribes to realtime updates so changes made in the admin dashboard reflect on the public website immediately.
 */
export function useHeroSlides(activeOnly = true) {
  const qc = useQueryClient()

  // Realtime subscription to hero_slides table changes
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('realtime:hero_slides_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hero_slides' },
        () => {
          qc.invalidateQueries({ queryKey: ['hero-slides'] })
          qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [qc])

  return useQuery({
    queryKey: ['hero-slides', activeOnly],
    queryFn: async (): Promise<HeroSlide[]> => {
      if (isSupabaseConfigured) {
        let q = supabase
          .from('hero_slides')
          .select('*')
          .order('display_order', { ascending: true })

        if (activeOnly) {
          q = q.eq('is_active', true)
        }

        const { data, error } = await q
        if (error) {
          console.warn('[Patizan Records] Error loading hero_slides from Supabase:', error.message)
          throw error
        }
        if (data && data.length > 0) {
          return data
        }
      }

      // Safe fallback when unconfigured or empty initial state
      return activeOnly ? INITIAL_HERO_SLIDES.filter((s) => s.is_active) : INITIAL_HERO_SLIDES
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Admin Hero Slides Hook
 * Fetches all slides (active and inactive) ordered by display_order directly from Supabase.
 */
export function useAdminHeroSlides() {
  const qc = useQueryClient()

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('realtime:hero_slides_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hero_slides' },
        () => {
          qc.invalidateQueries({ queryKey: ['hero-slides'] })
          qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [qc])

  return useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async (): Promise<HeroSlide[]> => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .order('display_order', { ascending: true })

        if (error) {
          throw new Error(`Failed to load hero slides from database: ${error.message}`)
        }
        return data || []
      }
      return INITIAL_HERO_SLIDES
    },
    staleTime: 0, // Always fresh in admin
    refetchOnWindowFocus: true,
  })
}

export function useCreateHeroSlide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Cannot save hero slide.')
      }

      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('hero_slides')
        .insert({
          ...slide,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create hero slide in database: ${error.message}`)
      }
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
    },
  })
}

export function useUpdateHeroSlide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroSlide> & { id: string }) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Cannot update hero slide.')
      }

      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('hero_slides')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Failed to update hero slide: ${error.message}`)
      }
      if (!data || data.length === 0) {
        throw new Error(`Hero slide with id "${id}" was not found in the database.`)
      }
      return data[0]
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
    },
  })
}

export function useDeleteHeroSlide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Cannot delete hero slide.')
      }

      const { error } = await supabase.from('hero_slides').delete().eq('id', id)
      if (error) {
        throw new Error(`Failed to delete hero slide: ${error.message}`)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
    },
  })
}

export function useReorderHeroSlides() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (slides: { id: string; display_order: number }[]) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.')
      }

      for (const item of slides) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)

        if (error) {
          throw new Error(`Failed to reorder slide ${item.id}: ${error.message}`)
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
    },
  })
}

