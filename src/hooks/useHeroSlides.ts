import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { INITIAL_HERO_SLIDES } from '../lib/mockData'
import type { HeroSlide } from '../types'

const LOCAL_HERO_SLIDES_KEY = 'patizan_local_hero_slides'

function getLocalHeroSlides(): HeroSlide[] {
  try {
    const data = localStorage.getItem(LOCAL_HERO_SLIDES_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  localStorage.setItem(LOCAL_HERO_SLIDES_KEY, JSON.stringify(INITIAL_HERO_SLIDES))
  return INITIAL_HERO_SLIDES
}

function saveLocalHeroSlides(slides: HeroSlide[]) {
  localStorage.setItem(LOCAL_HERO_SLIDES_KEY, JSON.stringify(slides))
}

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
        try {
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
          } else if (data && data.length > 0) {
            return data
          }
        } catch (err: any) {
          console.warn('[Patizan Records] Supabase request failed, activating offline fallback:', err?.message || err)
        }
      }

      // Offline / LocalStorage fallback
      const local = getLocalHeroSlides()
      return activeOnly ? local.filter((s) => s.is_active) : local
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Admin Hero Slides Hook
 * Fetches all slides (active and inactive) ordered by display_order.
 */
export function useAdminHeroSlides() {
  const qc = useQueryClient()

  // Realtime subscription for admin list
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
        try {
          const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('display_order', { ascending: true })

          if (error) {
            console.warn('[Patizan Records Admin] Error loading hero_slides:', error.message)
          } else if (data && data.length > 0) {
            return data
          }
        } catch (err: any) {
          console.warn('[Patizan Records Admin] Supabase unreachable:', err?.message || err)
        }
      }
      return getLocalHeroSlides()
    },
    staleTime: 0, // Always fresh in admin
    refetchOnWindowFocus: true,
  })
}

export function useCreateHeroSlide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>) => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('hero_slides')
            .insert({
              ...slide,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (!error && data) {
            return data
          }
          if (error) {
            console.warn('[Patizan Records] Supabase insert failed, saving locally:', error.message)
          }
        } catch (err: any) {
          console.warn('[Patizan Records] Supabase insert error:', err?.message || err)
        }
      }

      // Local storage persistence
      const current = getLocalHeroSlides()
      const newSlide: HeroSlide = {
        id: `hero-${Date.now()}`,
        ...slide,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const updated = [...current, newSlide]
      saveLocalHeroSlides(updated)
      return newSlide
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
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('hero_slides')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)

          if (!error) return
          if (error) {
            console.warn('[Patizan Records] Supabase update failed:', error.message)
          }
        } catch (err: any) {
          console.warn('[Patizan Records] Supabase update error:', err?.message || err)
        }
      }

      const current = getLocalHeroSlides()
      const updated = current.map((s) =>
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      )
      saveLocalHeroSlides(updated)
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
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('hero_slides').delete().eq('id', id)
          if (!error) return
          if (error) {
            console.warn('[Patizan Records] Supabase delete failed:', error.message)
          }
        } catch (err: any) {
          console.warn('[Patizan Records] Supabase delete error:', err?.message || err)
        }
      }

      const current = getLocalHeroSlides()
      const updated = current.filter((s) => s.id !== id)
      saveLocalHeroSlides(updated)
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
      if (isSupabaseConfigured) {
        try {
          for (const item of slides) {
            await supabase
              .from('hero_slides')
              .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
              .eq('id', item.id)
          }
          return
        } catch (err: any) {
          console.warn('[Patizan Records] Supabase reorder error:', err?.message || err)
        }
      }

      const current = getLocalHeroSlides()
      const orderMap = new Map(slides.map((s) => [s.id, s.display_order]))
      const updated = current
        .map((s) => ({
          ...s,
          display_order: orderMap.has(s.id) ? orderMap.get(s.id)! : s.display_order,
        }))
        .sort((a, b) => a.display_order - b.display_order)
      saveLocalHeroSlides(updated)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
    },
  })
}
