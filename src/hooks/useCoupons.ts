import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Coupon, CouponUsage } from '../types'

const LOCAL_COUPONS_KEY = 'patizan_local_coupons'
const LOCAL_USAGE_KEY = 'patizan_local_coupon_usage'

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: '11111111-2222-3333-4444-555555555555',
    code: 'PATIZAN10',
    promoter_name: 'Michael',
    promoter_phone: '+19592056476',
    discount_percentage: 10,
    commission_percentage: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    uses_count: 0,
    total_discount_amount: 0,
    total_commission_amount: 0,
  },
]

function getLocalCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(LOCAL_COUPONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  saveLocalCoupons(INITIAL_COUPONS)
  return INITIAL_COUPONS
}

function saveLocalCoupons(coupons: Coupon[]) {
  try {
    localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(coupons))
  } catch {}
}

function getLocalUsage(): CouponUsage[] {
  try {
    const raw = localStorage.getItem(LOCAL_USAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveLocalUsage(usage: CouponUsage[]) {
  try {
    localStorage.setItem(LOCAL_USAGE_KEY, JSON.stringify(usage))
  } catch {}
}

export interface CouponValidationResult {
  valid: boolean
  message?: string
  coupon_id?: string
  coupon_code?: string
  promoter_name?: string
  promoter_phone?: string
  discount_percentage?: number
  commission_percentage?: number
  original_amount?: number
  discount_amount?: number
  final_amount?: number
  commission_amount?: number
}

/**
 * Validates a coupon code and calculates discount & commission.
 * Priority: Supabase RPC -> Secure deterministic logic against database/cache.
 * NEVER trusts discount values from user input.
 */
export async function validateCoupon(
  code: string,
  originalAmount: number
): Promise<CouponValidationResult> {
  const cleanCode = (code || '').trim().toUpperCase()
  const origAmt = Math.max(0, Number(originalAmount) || 0)

  if (!cleanCode) {
    return { valid: false, message: 'Invalid coupon code.' }
  }

  // 1. Try Supabase RPC
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: cleanCode,
        p_original_amount: origAmt,
      })

      if (!error && data) {
        return data as CouponValidationResult
      }
    } catch {
      // Fallback to direct query or local cache
    }

    // 2. Direct Supabase Query
    try {
      const { data: dbCoupon, error: queryErr } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', cleanCode)
        .maybeSingle()

      if (!queryErr && dbCoupon) {
        if (!dbCoupon.is_active) {
          return { valid: false, message: 'This coupon is no longer active.' }
        }

        const discountPct = Number(dbCoupon.discount_percentage) || 10
        const commPct = Number(dbCoupon.commission_percentage) || 10
        const discountAmt = Math.round(origAmt * (discountPct / 100) * 100) / 100
        const finalAmt = Math.max(0, origAmt - discountAmt)
        const commAmt = Math.round(origAmt * (commPct / 100) * 100) / 100

        return {
          valid: true,
          coupon_id: dbCoupon.id,
          coupon_code: dbCoupon.code,
          promoter_name: dbCoupon.promoter_name,
          promoter_phone: dbCoupon.promoter_phone,
          discount_percentage: discountPct,
          commission_percentage: commPct,
          original_amount: origAmt,
          discount_amount: discountAmt,
          final_amount: finalAmt,
          commission_amount: commAmt,
        }
      } else if (!queryErr && !dbCoupon) {
        return { valid: false, message: 'Invalid coupon code.' }
      }
    } catch {
      // Continue to local fallback
    }
  }

  // 3. Fallback: Local Cache
  const localList = getLocalCoupons()
  const matched = localList.find((c) => c.code.toUpperCase() === cleanCode)

  if (!matched) {
    return { valid: false, message: 'Invalid coupon code.' }
  }

  if (!matched.is_active) {
    return { valid: false, message: 'This coupon is no longer active.' }
  }

  const discountPct = Number(matched.discount_percentage) || 10
  const commPct = Number(matched.commission_percentage) || 10
  const discountAmt = Math.round(origAmt * (discountPct / 100) * 100) / 100
  const finalAmt = Math.max(0, origAmt - discountAmt)
  const commAmt = Math.round(origAmt * (commPct / 100) * 100) / 100

  return {
    valid: true,
    coupon_id: matched.id,
    coupon_code: matched.code,
    promoter_name: matched.promoter_name,
    promoter_phone: matched.promoter_phone,
    discount_percentage: discountPct,
    commission_percentage: commPct,
    original_amount: origAmt,
    discount_amount: discountAmt,
    final_amount: finalAmt,
    commission_amount: commAmt,
  }
}

/**
 * Hook to retrieve all coupons with usage statistics
 */
export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async (): Promise<Coupon[]> => {
      let couponsData: Coupon[] = []
      let usageData: CouponUsage[] = []

      if (isSupabaseConfigured) {
        try {
          const [cRes, uRes] = await Promise.all([
            supabase.from('coupons').select('*').order('created_at', { ascending: false }),
            supabase.from('coupon_usage').select('*'),
          ])

          if (!cRes.error && cRes.data && cRes.data.length > 0) {
            couponsData = cRes.data
            if (!uRes.error && uRes.data) {
              usageData = uRes.data
            }
            saveLocalCoupons(couponsData)
            saveLocalUsage(usageData)
          }
        } catch {}
      }

      if (couponsData.length === 0) {
        couponsData = getLocalCoupons()
        usageData = getLocalUsage()
      }

      // Aggregate usage stats
      return couponsData.map((coupon) => {
        const matchingUses = usageData.filter(
          (u) => u.coupon_id === coupon.id || u.coupon_code.toUpperCase() === coupon.code.toUpperCase()
        )
        const totalDiscount = matchingUses.reduce((sum, u) => sum + (Number(u.discount_amount) || 0), 0)
        const totalCommission = matchingUses.reduce((sum, u) => sum + (Number(u.commission_amount) || 0), 0)

        return {
          ...coupon,
          uses_count: matchingUses.length,
          total_discount_amount: totalDiscount,
          total_commission_amount: totalCommission,
        }
      })
    },
  })
}

/**
 * Hook to retrieve usage history for a specific coupon or all coupons
 */
export function useCouponUsage(couponId?: string) {
  return useQuery({
    queryKey: ['coupon-usage', couponId],
    queryFn: async (): Promise<CouponUsage[]> => {
      if (isSupabaseConfigured) {
        try {
          let q = supabase.from('coupon_usage').select('*').order('created_at', { ascending: false })
          if (couponId) {
            q = q.eq('coupon_id', couponId)
          }
          const { data, error } = await q
          if (!error && data) {
            return data
          }
        } catch {}
      }

      const localUsage = getLocalUsage()
      if (couponId) {
        return localUsage.filter((u) => u.coupon_id === couponId)
      }
      return localUsage
    },
  })
}

/**
 * Hook to create a new promotional coupon
 */
export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      code: string
      promoter_name: string
      promoter_phone: string
      discount_percentage?: number
      commission_percentage?: number
      is_active?: boolean
    }) => {
      const code = payload.code.trim().toUpperCase()
      const newCoupon: Partial<Coupon> = {
        code,
        promoter_name: payload.promoter_name.trim(),
        promoter_phone: payload.promoter_phone.trim(),
        discount_percentage: payload.discount_percentage ?? 10,
        commission_percentage: payload.commission_percentage ?? 10,
        is_active: payload.is_active ?? true,
      }

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('coupons')
            .insert(newCoupon)
            .select()
            .single()

          if (!error && data) {
            const current = getLocalCoupons()
            saveLocalCoupons([data, ...current.filter((c) => c.code !== code)])
            return data
          } else if (error) {
            throw error
          }
        } catch (e: any) {
          if (e?.code === '23505' || e?.message?.includes('duplicate')) {
            throw new Error(`Coupon code "${code}" already exists.`)
          }
          // If table not found in schema cache, fallback to local
          if (e?.message?.includes('schema cache')) {
            const current = getLocalCoupons()
            if (current.some((c) => c.code.toUpperCase() === code)) {
              throw new Error(`Coupon code "${code}" already exists.`)
            }
            const created: Coupon = {
              id: crypto.randomUUID(),
              code,
              promoter_name: payload.promoter_name.trim(),
              promoter_phone: payload.promoter_phone.trim(),
              discount_percentage: payload.discount_percentage ?? 10,
              commission_percentage: payload.commission_percentage ?? 10,
              is_active: payload.is_active ?? true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              uses_count: 0,
              total_discount_amount: 0,
              total_commission_amount: 0,
            }
            saveLocalCoupons([created, ...current])
            return created
          }
          throw e
        }
      }

      // Local storage fallback
      const current = getLocalCoupons()
      if (current.some((c) => c.code.toUpperCase() === code)) {
        throw new Error(`Coupon code "${code}" already exists.`)
      }
      const created: Coupon = {
        id: crypto.randomUUID(),
        code,
        promoter_name: payload.promoter_name.trim(),
        promoter_phone: payload.promoter_phone.trim(),
        discount_percentage: payload.discount_percentage ?? 10,
        commission_percentage: payload.commission_percentage ?? 10,
        is_active: payload.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        uses_count: 0,
        total_discount_amount: 0,
        total_commission_amount: 0,
      }
      saveLocalCoupons([created, ...current])
      return created
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

/**
 * Hook to update an existing coupon
 */
export function useUpdateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      id: string
      code?: string
      promoter_name?: string
      promoter_phone?: string
      discount_percentage?: number
      commission_percentage?: number
      is_active?: boolean
    }) => {
      const { id, ...updates } = params
      if (updates.code) updates.code = updates.code.trim().toUpperCase()

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('coupons')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

          if (!error && data) {
            const current = getLocalCoupons()
            saveLocalCoupons(current.map((c) => (c.id === id ? { ...c, ...data } : c)))
            return data
          }
        } catch {}
      }

      const current = getLocalCoupons()
      const updated = current.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      )
      saveLocalCoupons(updated)
      return updated.find((c) => c.id === id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

/**
 * Hook to quickly toggle active status of a coupon
 */
export function useToggleCouponActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('coupons')
            .update({ is_active, updated_at: new Date().toISOString() })
            .eq('id', id)
        } catch {}
      }

      const current = getLocalCoupons()
      saveLocalCoupons(current.map((c) => (c.id === id ? { ...c, is_active } : c)))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

/**
 * Hook to delete a coupon
 */
export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('coupons').delete().eq('id', id)
        } catch {}
      }

      const current = getLocalCoupons()
      saveLocalCoupons(current.filter((c) => c.id !== id))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

/**
 * Record a coupon usage entry in the database and local cache
 */
export async function recordCouponUsage(usage: Omit<CouponUsage, 'id' | 'created_at'>) {
  const record: CouponUsage = {
    ...usage,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('coupon_usage').insert({
        coupon_id: usage.coupon_id,
        coupon_code: usage.coupon_code,
        promoter_name: usage.promoter_name,
        promoter_phone: usage.promoter_phone,
        customer_name: usage.customer_name,
        customer_phone: usage.customer_phone,
        customer_email: usage.customer_email,
        booking_id: usage.booking_id,
        original_amount: usage.original_amount,
        discount_percentage: usage.discount_percentage,
        discount_amount: usage.discount_amount,
        final_amount: usage.final_amount,
        commission_percentage: usage.commission_percentage,
        commission_amount: usage.commission_amount,
      })
    } catch {}
  }

  const currentUsage = getLocalUsage()
  saveLocalUsage([record, ...currentUsage])
  return record
}
