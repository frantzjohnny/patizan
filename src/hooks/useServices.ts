import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { INITIAL_SERVICES, INITIAL_PACKAGES } from '../lib/mockData'
import type { Service, ServicePackage } from '../types'

const LOCAL_SERVICES_KEY = 'patizan_local_services'
const LOCAL_PACKAGES_KEY = 'patizan_local_packages'

function getLocalServices(): Service[] {
  try {
    const data = localStorage.getItem(LOCAL_SERVICES_KEY)
    if (data) return JSON.parse(data)
  } catch {}
  localStorage.setItem(LOCAL_SERVICES_KEY, JSON.stringify(INITIAL_SERVICES))
  return INITIAL_SERVICES
}

function saveLocalServices(services: Service[]) {
  localStorage.setItem(LOCAL_SERVICES_KEY, JSON.stringify(services))
}

function getLocalPackages(): ServicePackage[] {
  try {
    const data = localStorage.getItem(LOCAL_PACKAGES_KEY)
    if (data) return JSON.parse(data)
  } catch {}
  localStorage.setItem(LOCAL_PACKAGES_KEY, JSON.stringify(INITIAL_PACKAGES))
  return INITIAL_PACKAGES
}

function saveLocalPackages(pkgs: ServicePackage[]) {
  localStorage.setItem(LOCAL_PACKAGES_KEY, JSON.stringify(pkgs))
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
          if (!error && data && data.length > 0) return data
        } catch {}
      }
      const local = getLocalServices()
      return activeOnly ? local.filter((s) => s.is_active) : local
    },
  })
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async (): Promise<Service | null> => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single()
          if (!error && data) return data
        } catch {}
      }
      const local = getLocalServices()
      return local.find((s) => s.id === id) || null
    },
    enabled: !!id,
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
          if (!error && data && data.length > 0) return data
        } catch {}
      }
      let local = getLocalPackages()
      if (serviceId) local = local.filter((p) => p.service_id === serviceId)
      if (activeOnly) local = local.filter((p) => p.is_active)
      return local
    },
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (service: Partial<Service>) => {
      const newService: Service = {
        id: `s-${Date.now()}`,
        name: service.name || '',
        slug: service.slug || '',
        short_description: service.short_description || null,
        description: service.description || null,
        image_url: service.image_url || null,
        starting_price: service.starting_price || null,
        is_featured: service.is_featured ?? false,
        is_active: service.is_active ?? true,
        display_order: service.display_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('services')
            .insert(service)
            .select()
            .single()
          if (!error && data) return data
        } catch {}
      }

      // Save locally
      const list = getLocalServices()
      list.push(newService)
      saveLocalServices(list)
      return newService
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('services').update(updates).eq('id', id)
          if (!error) return
        } catch {}
      }

      // Update locally
      const list = getLocalServices()
      const idx = list.findIndex((s) => s.id === id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() }
        saveLocalServices(list)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('services').delete().eq('id', id)
          if (!error) return
        } catch {}
      }

      // Delete locally
      const list = getLocalServices().filter((s) => s.id !== id)
      saveLocalServices(list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useCreatePackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pkg: Partial<ServicePackage>) => {
      const newPkg: ServicePackage = {
        id: `p-${Date.now()}`,
        service_id: pkg.service_id || '',
        name: pkg.name || '',
        duration_hours: pkg.duration_hours || 1,
        price: pkg.price || 0,
        description: pkg.description || null,
        engineer_included: pkg.engineer_included ?? false,
        is_featured: pkg.is_featured ?? false,
        is_active: pkg.is_active ?? true,
        display_order: pkg.display_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('service_packages')
            .insert(pkg)
            .select()
            .single()
          if (!error && data) return data
        } catch {}
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
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('service_packages').update(updates).eq('id', id)
          if (!error) return
        } catch {}
      }

      const list = getLocalPackages()
      const idx = list.findIndex((p) => p.id === id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() }
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
        try {
          const { error } = await supabase.from('service_packages').delete().eq('id', id)
          if (!error) return
        } catch {}
      }

      const list = getLocalPackages().filter((p) => p.id !== id)
      saveLocalPackages(list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-packages'] }),
  })
}
