import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { StudioAvailability } from '../../types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AvailabilityPage() {
  const qc = useQueryClient()
  const [schedule, setSchedule] = useState<StudioAvailability[]>([])

  const { data: initialData = [], isLoading } = useQuery({
    queryKey: ['studio-availability'],
    queryFn: async (): Promise<StudioAvailability[]> => {
      const { data, error } = await supabase
        .from('studio_availability')
        .select('*')
        .order('day_of_week', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  useEffect(() => {
    if (initialData.length > 0) {
      setSchedule(initialData)
    }
  }, [initialData])

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const item of schedule) {
        const { error } = await supabase
          .from('studio_availability')
          .update({
            is_open: item.is_open,
            open_time: item.open_time,
            close_time: item.close_time,
          })
          .eq('id', item.id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-availability'] })
      toast.success('Studio schedule saved!')
    },
    onError: () => {
      toast.error('Failed to save schedule')
    },
  })

  const updateDay = (dayIndex: number, fields: Partial<StudioAvailability>) => {
    setSchedule((prev) =>
      prev.map((item) => (item.day_of_week === dayIndex ? { ...item, ...fields } : item))
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-offwhite">Studio Operating Hours</h2>
          <p className="text-gray-muted text-sm mt-1">
            Configure open days, start times and daily session capacity.
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="btn-primary rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {saveMutation.isPending ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden divide-y divide-gray-border/50">
        {isLoading ? (
          <div className="p-8 text-center text-gray-muted">Loading schedule...</div>
        ) : (
          schedule.map((item) => (
            <div
              key={item.day_of_week}
              className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                item.is_open ? 'bg-transparent' : 'bg-black/30 opacity-60'
              }`}
            >
              <div className="w-36">
                <span className="font-heading font-bold text-base text-offwhite">
                  {DAYS[item.day_of_week]}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.is_open}
                    onChange={(e) => updateDay(item.day_of_week, { is_open: e.target.checked })}
                    className="accent-orange w-4 h-4"
                  />
                  <span className="text-sm font-heading font-semibold text-offwhite">
                    {item.is_open ? 'OPEN' : 'CLOSED'}
                  </span>
                </label>
              </div>

              {item.is_open ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-muted">Open:</span>
                    <input
                      type="time"
                      value={item.open_time}
                      onChange={(e) =>
                        updateDay(item.day_of_week, { open_time: e.target.value })
                      }
                      className="input-field py-1.5 px-3 rounded-lg text-sm w-32"
                    />
                  </div>
                  <span className="text-gray-muted">—</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-muted">Close:</span>
                    <input
                      type="time"
                      value={item.close_time}
                      onChange={(e) =>
                        updateDay(item.day_of_week, { close_time: e.target.value })
                      }
                      className="input-field py-1.5 px-3 rounded-lg text-sm w-32"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-muted italic">Closed for bookings</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
