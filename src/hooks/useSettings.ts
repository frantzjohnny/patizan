import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { STUDIO_POLICY_DEFAULT } from '../lib/constants'
import type { SiteSettings } from '../types'

const LOCAL_SETTINGS_KEY = 'patizan_local_settings'

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'settings-1',
  studio_name: 'Patizan Records',
  tagline: 'WHERE SOUND BECOMES CULTURE.',
  hero_title: 'YOUR SOUND.\nYOUR SPACE.',
  hero_subtitle: 'Professional recording, production, mixing, mastering and creative studio services in Tamarac, Florida.',
  hero_cta_primary: 'BOOK A SESSION',
  hero_cta_secondary: 'EXPLORE THE STUDIO',
  hero_image_url: null,
  logo_url: null,
  favicon_url: null,
  address: '3900 W Commercial Blvd, Suite 230, Tamarac, FL 33309, USA',
  phone: '959 205 6476',
  email: 'patizanrecordsmiami@gmail.com',
  instagram: '@patizanrecordsmiami',
  facebook: null,
  youtube: null,
  tiktok: null,
  google_maps_url: 'https://maps.google.com/?q=3900+W+Commercial+Blvd+Tamarac+FL',
  google_maps_embed: null,
  promo_message: "When you record a complete music, you'll receive a free visualizer in the studio.",
  promo_message_enabled: true,
  announcement_banner: null,
  announcement_banner_enabled: false,
  footer_tagline: 'Built for artists. Designed for sound.',
  studio_policy: STUDIO_POLICY_DEFAULT,
  deposit_percentage: 50,
  meta_description: 'Patizan Records — Professional recording studio in Tamarac, FL. Recording, podcast, mixing, mastering and music production services.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function getLocalSettings(): SiteSettings {
  try {
    const data = localStorage.getItem(LOCAL_SETTINGS_KEY)
    if (data) return JSON.parse(data)
  } catch {}
  return DEFAULT_SETTINGS
}

function saveLocalSettings(settings: SiteSettings) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings))
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async (): Promise<SiteSettings | null> => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single()
          if (!error && data) return data
        } catch {}
      }
      return getLocalSettings()
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<SiteSettings>) => {
      if (isSupabaseConfigured) {
        try {
          const { data: existing } = await supabase
            .from('site_settings')
            .select('id')
            .single()

          if (existing) {
            const { error } = await supabase
              .from('site_settings')
              .update(updates)
              .eq('id', existing.id)
            if (!error) return
          }
        } catch {}
      }

      // Save locally
      const current = getLocalSettings()
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() }
      saveLocalSettings(updated)
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })
}
