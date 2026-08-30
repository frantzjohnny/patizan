import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Booking, BookingStatus } from '../types'

export function useBookings(filters?: {
  status?: BookingStatus
  date?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let q = supabase
        .from('bookings')
        .select('*, service:services(*), package:service_packages(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (filters?.status) q = q.eq('status', filters.status)
      if (filters?.date) q = q.eq('preferred_date', filters.date)
      if (filters?.search) {
        q = q.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }

      const { data, error, count } = await q
      if (error) throw error
      return { data: data || [], count: count || 0 }
    },
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async (): Promise<Booking | null> => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, service:services(*), package:service_packages(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useBookingStats() {
  return useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      const [todayResult, pendingResult, upcomingResult, monthlyResult] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('confirmed_date', today)
          .eq('status', 'approved'),
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .gte('confirmed_date', today)
          .eq('status', 'approved'),
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ])

      return {
        today: todayResult.count || 0,
        pending: pendingResult.count || 0,
        upcoming: upcomingResult.count || 0,
        monthly: monthlyResult.count || 0,
      }
    },
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (booking: Partial<Booking>) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single()
      if (error) throw error

      // Create notification
      await supabase.from('notifications').insert({
        type: 'new_booking',
        title: 'New Booking Request',
        message: `${booking.full_name} requested a session for ${booking.preferred_date}`,
        booking_id: data.id,
      })

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['booking-stats'] })
    },
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
      confirmedDate,
      confirmedStartTime,
      confirmedEndTime,
    }: {
      id: string
      status: BookingStatus
      adminNotes?: string
      confirmedDate?: string
      confirmedStartTime?: string
      confirmedEndTime?: string
    }) => {
      const updates: Partial<Booking> = { status }
      if (adminNotes !== undefined) updates.admin_notes = adminNotes
      if (confirmedDate) updates.confirmed_date = confirmedDate
      if (confirmedStartTime) updates.confirmed_start_time = confirmedStartTime
      if (confirmedEndTime) updates.confirmed_end_time = confirmedEndTime

      const { error } = await supabase.from('bookings').update(updates).eq('id', id)
      if (error) throw error

      // Log status change
      await supabase.from('booking_status_history').insert({
        booking_id: id,
        status,
        notes: adminNotes,
      })
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['booking-stats'] })
    },
  })
}

export function useCheckBookingConflict() {
  return useMutation({
    mutationFn: async ({
      date,
      startTime,
      durationHours,
      excludeId,
    }: {
      date: string
      startTime: string
      durationHours: number
      excludeId?: string
    }) => {
      const { data, error } = await supabase.rpc('check_booking_conflict', {
        p_date: date,
        p_start_time: startTime,
        p_duration_hours: durationHours,
        p_exclude_id: excludeId || null,
      })
      if (error) throw error
      return data as boolean
    },
  })
}

export function useCalendarBookings(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar-bookings', year, month],
    queryFn: async () => {
      const start = new Date(year, month, 1).toISOString().split('T')[0]
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('bookings')
        .select('*, service:services(name)')
        .gte('preferred_date', start)
        .lte('preferred_date', end)
        .in('status', ['approved', 'pending', 'under_review'])

      if (error) throw error
      return data || []
    },
  })
}
