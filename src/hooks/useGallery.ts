import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { GalleryItem, GalleryCategory } from '../types'

export function useGalleryCategories() {
  return useQuery({
    queryKey: ['gallery-categories'],
    queryFn: async (): Promise<GalleryCategory[]> => {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
  })
}

export function useGalleryItems(categoryId?: string, page = 1, pageSize = 24) {
  return useQuery({
    queryKey: ['gallery-items', categoryId, page],
    queryFn: async () => {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let q = supabase
        .from('gallery_items')
        .select('*, category:gallery_categories(*)', { count: 'exact' })
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .range(from, to)

      // 'all' category or no filter → show everything
      if (categoryId && categoryId !== 'all') {
        q = q.eq('category_id', categoryId)
      }

      const { data, error, count } = await q
      if (error) throw error
      return { data: data || [], count: count || 0 }
    },
  })
}

export function useAdminGalleryItems() {
  return useQuery({
    queryKey: ['admin-gallery-items'],
    queryFn: async (): Promise<GalleryItem[]> => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*, category:gallery_categories(*)')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
  })
}

export function useCreateGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (item: Partial<GalleryItem>) => {
      const { data, error } = await supabase
        .from('gallery_items')
        .insert(item)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery-items'] })
      qc.invalidateQueries({ queryKey: ['admin-gallery-items'] })
    },
  })
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GalleryItem> & { id: string }) => {
      const { error } = await supabase.from('gallery_items').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery-items'] })
      qc.invalidateQueries({ queryKey: ['admin-gallery-items'] })
    },
  })
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery-items'] })
      qc.invalidateQueries({ queryKey: ['admin-gallery-items'] })
    },
  })
}
