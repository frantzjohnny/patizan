import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { Booking } from '../../types'

interface CalendarEvent extends Event {
  id: string
  title: string
  start: Date
  end: Date
  resource: Booking
  color: string
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
})

const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  under_review: '#3B82F6',
  approved: '#22C55E',
  rejected: '#EF4444',
  cancelled: '#6B7280',
  completed: '#10B981',
}

export default function CalendarPage() {
  const [selected, setSelected] = useState<Booking | null>(null)

  const { data: bookings = [] } = useQuery({
    queryKey: ['calendar-all-bookings'],
    queryFn: async (): Promise<Booking[]> => {
      const { data } = await supabase
        .from('bookings')
        .select('*, service:services(name)')
        .in('status', ['pending', 'under_review', 'approved', 'completed'])
        .order('preferred_date')
      return data || []
    },
  })

  const events: CalendarEvent[] = bookings.map((b) => {
    const dateStr = b.confirmed_date || b.preferred_date
    const timeStr = b.confirmed_start_time || b.preferred_start_time
    const start = new Date(`${dateStr}T${timeStr}`)
    const end = new Date(start.getTime() + (b.session_duration_hours || 1) * 60 * 60 * 1000)

    return {
      id: b.id,
      title: `${b.full_name} — ${b.service?.name || 'Session'}`,
      start,
      end,
      resource: b,
      color: STATUS_COLORS[b.status] || '#FF7A00',
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap text-xs">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-gray-muted capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl p-4 md:p-6 overflow-hidden" style={{ height: 700 }}>
        <BigCalendar<CalendarEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={(event: CalendarEvent) => setSelected(event.resource)}
          eventPropGetter={(event: CalendarEvent) => ({
            style: { backgroundColor: event.color, borderColor: event.color },
          })}
        />
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-charcoal border border-gray-border rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-xl text-offwhite mb-4">{selected.full_name}</h3>
            <div className="space-y-2 text-sm text-gray-muted">
              <p>Service: <span className="text-offwhite">{selected.service?.name}</span></p>
              <p>Date: <span className="text-offwhite">{selected.preferred_date}</span></p>
              <p>Time: <span className="text-offwhite">{selected.preferred_start_time}</span></p>
              <p>Duration: <span className="text-offwhite">{selected.session_duration_hours}h</span></p>
              <p>Status: <span className="text-orange capitalize">{selected.status.replace('_', ' ')}</span></p>
              <p>Phone: <span className="text-offwhite">{selected.phone}</span></p>
              <p>Email: <span className="text-offwhite">{selected.email}</span></p>
            </div>
            <button onClick={() => setSelected(null)} className="btn-primary rounded-xl text-sm mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
