import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { INITIAL_SERVICES, INITIAL_PACKAGES } from '../lib/mockData'
import type { Service, ServicePackage } from '../types'

const LOCAL_SERVICES_KEY = 'patizan_local_services'
const LOCAL_PACKAGES_KEY = 'patizan_local_packages'

function getLocalServices(): Service[] {
  try {
    const data = localStorage.getItem(LOCAL_SERVICES_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  localStorage.setItem(LOCAL_SERVICES_KEY, JSON.stringify(INITIAL_SERVICES))
  return INITIAL_SERVICES
}

function saveLocalServices(services: Service[]) {
  try {
    localStorage.setItem(LOCAL_SERVICES_KEY, JSON.stringify(services))
  } catch {}
}

function getLocalPackages(): ServicePackage[] {
  try {
    const data = localStorage.getItem(LOCAL_PACKAGES_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  localStorage.setItem(LOCAL_PACKAGES_KEY, JSON.stringify(INITIAL_PACKAGES))
  return INITIAL_PACKAGES
}

function saveLocalPackages(pkgs: ServicePackage[]) {
  try {
    localStorage.setItem(LOCAL_PACKAGES_KEY, JSON.stringify(pkgs))
  } catch {}
}

export function useServices(activeOnly = true) {
  return useQuery({
    queryKey: ['services', activeOnly],
    queryFn: async (): Promise<Service[]> => {
      if (isSupabaseConfigured) {
        try {
          let q = supabase
            .from('services')
            .select('*')
            .order('display_order', { ascending: true })
          if (activeOnly) q = q.eq('is_active', true)
          const { data, error } = await q
          if (!error && data && data.length > 0) {
            saveLocalServices(data)
            return data
          }
        } catch (err) {
          console.warn('[useServices] Supabase query failed, using local cache:', err)
        }
      }
      const local = getLocalServices()
      return activeOnly ? local.filter((s) => s.is_active) : local
    },
    staleTime: 1000 * 30, // 30 seconds for reactive updates
  })
}

export function useService(idOrSlug: string) {
  return useQuery({
    queryKey: ['service', idOrSlug],
    queryFn: async (): Promise<Service | null> => {
      if (isSupabaseConfigured) {
        try {
          // Check if valid UUID or slug
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
          let q = supabase.from('services').select('*')
          if (isUuid) {
            q = q.eq('id', idOrSlug)
          } else {
            q = q.eq('slug', idOrSlug)
          }
          const { data, error } = await q.single()
          if (!error && data) return data
        } catch {}
      }
      const local = getLocalServices()
      return local.find((s) => s.id === idOrSlug || s.slug === idOrSlug) || null
    },
    enabled: !!idOrSlug,
    staleTime: 1000 * 30,
  })
}

export function useServicePackages(serviceId?: string, activeOnly = true) {
  return useQuery({
    queryKey: ['service-packages', serviceId, activeOnly],
    queryFn: async (): Promise<ServicePackage[]> => {
      if (isSupabaseConfigured) {
        try {
          let q = supabase
            .from('service_packages')
            .select('*, service:services(*)')
            .order('display_order', { ascending: true })
          if (serviceId) q = q.eq('service_id', serviceId)
          if (activeOnly) q = q.eq('is_active', true)
          const { data, error } = await q
          if (!error && data && data.length > 0) {
            saveLocalPackages(data)
            return data
          }
        } catch {}
      }
      let local = getLocalPackages()
      if (serviceId) local = local.filter((p) => p.service_id === serviceId)
      if (activeOnly) local = local.filter((p) => p.is_active)
      return local
    },
    staleTime: 1000 * 30,
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (service: Partial<Service>) => {
      const now = new Date().toISOString()
      const payload = {
        name: service.name || '',
        slug: service.slug || '',
        short_description: service.short_description || null,
        description: service.description || null,
        image_url: service.image_url || null,
        starting_price: service.starting_price || null,
        is_featured: service.is_featured ?? false,
        is_active: service.is_active ?? true,
        display_order: service.display_order ?? 0,
        updated_at: now,
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('services')
          .insert(payload)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create service in database: ${error.message}`)
        }
        if (data) {
          const list = getLocalServices()
          list.push(data)
          saveLocalServices(list)
          return data
        }
      }

      // Local fallback
      const newService: Service = {
        id: `s-${Date.now()}`,
        ...payload,
        created_at: now,
      }
      const list = getLocalServices()
      list.push(newService)
      saveLocalServices(list)
      return newService
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
      const now = new Date().toISOString()
      const payload = {
        ...updates,
        updated_at: now,
      }

      if (isSupabaseConfigured) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        
        let updateResult: any = null
        if (isUuid) {
          const { data, error } = await supabase
            .from('services')
            .update(payload)
            .eq('id', id)
            .select()

          if (error) {
            throw new Error(`Database update failed: ${error.message}`)
          }
          if (data && data.length > 0) {
            updateResult = data[0]
          }
        }

        // If ID wasn't UUID or matched 0 rows, try matching by slug
        if (!updateResult && updates.slug) {
          const { data, error } = await supabase
            .from('services')
            .update(payload)
            .eq('slug', updates.slug)
            .select()

          if (error) {
            throw new Error(`Database update by slug failed: ${error.message}`)
          }
          if (data && data.length > 0) {
            updateResult = data[0]
          }
        }

        // If still not found in database, upsert it by slug
        if (!updateResult && updates.slug) {
          const { data, error } = await supabase
            .from('services')
            .upsert({ ...payload, slug: updates.slug }, { onConflict: 'slug' })
            .select()
            .single()

          if (error) {
            throw new Error(`Database upsert failed: ${error.message}`)
          }
          updateResult = data
        }

        // Post-update verification SELECT
        if (updateResult) {
          const { data: verified, error: verifyErr } = await supabase
            .from('services')
            .select('*')
            .eq('id', updateResult.id)
            .single()

          if (verifyErr || !verified) {
            throw new Error('Database verification failed: Service could not be confirmed.')
          }

          if (updates.image_url !== undefined && verified.image_url !== updates.image_url) {
            throw new Error(
              `Verification mismatch: Expected image_url "${updates.image_url}" but found "${verified.image_url}".`
            )
          }

          // Update local cache
          const list = getLocalServices()
          const idx = list.findIndex((s) => s.id === id || s.slug === updates.slug)
          if (idx !== -1) {
            list[idx] = verified
          } else {
            list.push(verified)
          }
          saveLocalServices(list)
          return verified
        }
      }

      // Local fallback
      const list = getLocalServices()
      const idx = list.findIndex((s) => s.id === id || (updates.slug && s.slug === updates.slug))
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload }
        saveLocalServices(list)
        return list[idx]
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['services'] })
      qc.invalidateQueries({ queryKey: ['service', variables.id] })
      if (variables.slug) {
        qc.invalidateQueries({ queryKey: ['service', variables.slug] })
      }
    },
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        if (isUuid) {
          const { error } = await supabase.from('services').delete().eq('id', id)
          if (error) throw new Error(`Failed to delete service: ${error.message}`)
        } else {
          // Match by id or slug
          await supabase.from('services').delete().or(`id.eq.${id},slug.eq.${id}`)
        }
      }

      // Delete locally
      const list = getLocalServices().filter((s) => s.id !== id && s.slug !== id)
      saveLocalServices(list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useCreatePackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pkg: Partial<ServicePackage>) => {
      const now = new Date().toISOString()
      const payload = {
        service_id: pkg.service_id || '',
        name: pkg.name || '',
        duration_hours: pkg.duration_hours || 1,
        price: pkg.price || 0,
        description: pkg.description || null,
        engineer_included: pkg.engineer_included ?? false,
        is_featured: pkg.is_featured ?? false,
        is_active: pkg.is_active ?? true,
        display_order: pkg.display_order ?? 0,
        updated_at: now,
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('service_packages')
          .insert(payload)
          .select()
          .single()

        if (error) throw new Error(`Failed to create package: ${error.message}`)
        if (data) {
          const list = getLocalPackages()
          list.push(data)
          saveLocalPackages(list)
          return data
        }
      }

      const newPkg: ServicePackage = {
        id: `p-${Date.now()}`,
        ...payload,
        created_at: now,
      }
      const list = getLocalPackages()
      list.push(newPkg)
      saveLocalPackages(list)
      return newPkg
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-packages'] }),
  })
}

export function useUpdatePackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServicePackage> & { id: string }) => {
      const now = new Date().toISOString()
      const payload = { ...updates, updated_at: now }

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('service_packages').update(payload).eq('id', id)
        if (error) throw new Error(`Failed to update package: ${error.message}`)
      }

      const list = getLocalPackages()
      const idx = list.findIndex((p) => p.id === id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload }
        saveLocalPackages(list)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-packages'] }),
  })
}

export function useDeletePackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('service_packages').delete().eq('id', id)
        if (error) throw new Error(`Failed to delete package: ${error.message}`)
      }

      const list = getLocalPackages().filter((p) => p.id !== id)
      saveLocalPackages(list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-packages'] }),
  })
}

