import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { deleteFromStorage } from '../lib/storage'
import type { StudioPhoto } from '../types'

/**
 * Public Studio Photos Hook
 * Retrieves active studio photos ordered by display_order.
 * Subscribes to Supabase Realtime for instant updates on the live website.
 */
export function useStudioPhotos(activeOnly = true) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('realtime:studio_photos_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'studio_photos' },
        () => {
          qc.invalidateQueries({ queryKey: ['studio-photos'] })
          qc.invalidateQueries({ queryKey: ['admin-studio-photos'] })
          qc.invalidateQueries({ queryKey: ['site-settings'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [qc])

  return useQuery({
    queryKey: ['studio-photos', activeOnly],
    queryFn: async (): Promise<StudioPhoto[]> => {
      if (!isSupabaseConfigured) return []

      let q = supabase
        .from('studio_photos')
        .select('*')
        .order('display_order', { ascending: true })

      if (activeOnly) {
        q = q.eq('is_active', true)
      }

      const { data, error } = await q
      if (error) {
        console.warn('[Patizan Records] Error loading studio_photos:', error.message)
        return []
      }
      return data || []
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Admin Studio Photos Hook
 * Fetches all photos (active and inactive) ordered by display_order.
 */
export function useAdminStudioPhotos() {
  const qc = useQueryClient()

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('realtime:studio_photos_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'studio_photos' },
        () => {
          qc.invalidateQueries({ queryKey: ['studio-photos'] })
          qc.invalidateQueries({ queryKey: ['admin-studio-photos'] })
          qc.invalidateQueries({ queryKey: ['site-settings'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [qc])

  return useQuery({
    queryKey: ['admin-studio-photos'],
    queryFn: async (): Promise<StudioPhoto[]> => {
      if (!isSupabaseConfigured) return []

      const { data, error } = await supabase
        .from('studio_photos')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.warn('[Patizan Records] Error loading admin studio_photos:', error.message)
        throw error
      }
      return data || []
    },
    staleTime: 1000 * 15,
  })
}

/**
 * Create a new Studio Photo
 */
export function useCreateStudioPhoto() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (photo: Omit<StudioPhoto, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured')

      // If marked as SEO image, first unset any existing SEO photo
      if (photo.is_seo_image) {
        await supabase
          .from('studio_photos')
          .update({ is_seo_image: false, updated_at: new Date().toISOString() })
          .eq('is_seo_image', true)
      }

      const { data, error } = await supabase
        .from('studio_photos')
        .insert([{ ...photo, updated_at: new Date().toISOString() }])
        .select()
        .single()

      if (error) throw error

      // If SEO image, sync with site_settings og_image_url if present
      if (photo.is_seo_image && data?.image_url) {
        try {
          await supabase
            .from('site_settings')
            .update({ og_image_url: data.image_url, updated_at: new Date().toISOString() })
            .neq('id', '00000000-0000-0000-0000-000000000000')
        } catch {
          // Non-blocking if column not yet added to site_settings
        }
      }

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-photos'] })
      qc.invalidateQueries({ queryKey: ['admin-studio-photos'] })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })
}

/**
 * Update an existing Studio Photo
 */
export function useUpdateStudioPhoto() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      oldImageUrl,
      ...updates
    }: Partial<StudioPhoto> & { id: string; oldImageUrl?: string }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured')

      // If marked as SEO image, unset any others
      if (updates.is_seo_image) {
        await supabase
          .from('studio_photos')
          .update({ is_seo_image: false, updated_at: new Date().toISOString() })
          .eq('is_seo_image', true)
          .neq('id', id)
      }

      const { data, error } = await supabase
        .from('studio_photos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Sync SEO image with site_settings if active
      if (updates.is_seo_image && data?.image_url) {
        try {
          await supabase
            .from('site_settings')
            .update({ og_image_url: data.image_url, updated_at: new Date().toISOString() })
            .neq('id', '00000000-0000-0000-0000-000000000000')
        } catch {
          // Non-blocking
        }
      }

      // Cleanup replaced old image in background if URL changed
      if (oldImageUrl && updates.image_url && oldImageUrl !== updates.image_url) {
        deleteFromStorage('studio-images', oldImageUrl).catch(console.warn)
      }

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-photos'] })
      qc.invalidateQueries({ queryKey: ['admin-studio-photos'] })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })
}

/**
 * Delete a Studio Photo
 */
export function useDeleteStudioPhoto() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl?: string }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured')

      const { error } = await supabase
        .from('studio_photos')
        .delete()
        .eq('id', id)

      if (error) throw error

      if (imageUrl) {
        await deleteFromStorage('studio-images', imageUrl)
      }

      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-photos'] })
      qc.invalidateQueries({ queryKey: ['admin-studio-photos'] })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })
}

/**
 * Reorder Studio Photos
 */
export function useReorderStudioPhotos() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      if (!isSupabaseConfigured) return

      const updates = items.map((item) =>
        supabase
          .from('studio_photos')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      )

      await Promise.all(updates)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-photos'] })
      qc.invalidateQueries({ queryKey: ['admin-studio-photos'] })
    },
  })
}

/**
 * Set a photo as the site's official SEO / Social Sharing image
 * Automatically syncs with studio_photos and site_settings.
 */
export function useSetSeoStudioPhoto() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl: string }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured')

      // Attempt RPC function first if created
      const { error: rpcError } = await supabase.rpc('set_studio_photo_seo', { target_photo_id: id })

      if (rpcError) {
        // Fallback dual-update transaction
        await supabase
          .from('studio_photos')
          .update({ is_seo_image: false, updated_at: new Date().toISOString() })
          .eq('is_seo_image', true)

        const { error: updateError } = await supabase
          .from('studio_photos')
          .update({ is_seo_image: true, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (updateError) throw updateError

        try {
          await supabase
            .from('site_settings')
            .update({ og_image_url: imageUrl, updated_at: new Date().toISOString() })
            .neq('id', '00000000-0000-0000-0000-000000000000')
        } catch {
          // Non-blocking
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-photos'] })
      qc.invalidateQueries({ queryKey: ['admin-studio-photos'] })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })
}
