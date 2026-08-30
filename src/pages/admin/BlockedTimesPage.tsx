import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { BlockedTime } from '../../types'

export default function BlockedTimesPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    reason: 'Studio Maintenance / Private Session',
    is_full_day: true,
  })

  const { data: blockedTimes = [], isLoading } = useQuery({
    queryKey: ['blocked-times'],
    queryFn: async (): Promise<BlockedTime[]> => {
      const { data, error } = await supabase
        .from('blocked_times')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        date: form.date,
        start_time: form.is_full_day ? null : form.start_time || null,
        end_time: form.is_full_day ? null : form.end_time || null,
        reason: form.reason,
        is_all_day: form.is_full_day,
      }
      const { error } = await supabase.from('blocked_times').insert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-times'] })
      toast.success('Blocked time added!')
      setShowModal(false)
    },
    onError: () => {
      toast.error('Failed to block time')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blocked_times').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-times'] })
      toast.success('Blocked time removed')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-offwhite">Blocked Times & Dates</h2>
          <p className="text-gray-muted text-sm mt-1">
            Prevent bookings during holidays, private artist locks, or studio maintenance.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary rounded-xl text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Block Date/Time
        </button>
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time Range</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={4}>
                    <div className="h-8 bg-charcoal-light rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : blockedTimes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-muted">
                  No blocked dates or times scheduled.
                </td>
              </tr>
            ) : (
              blockedTimes.map((b) => (
                <tr key={b.id}>
                  <td className="font-heading font-semibold text-offwhite">
                    {formatDate(b.date || '', 'MMMM d, yyyy')}
                  </td>
                  <td className="text-sm">
                    {b.is_all_day || b.is_full_day ? (
                      <span className="text-red-400 font-medium">Full Day Closed</span>
                    ) : (
                      `${b.start_time || '00:00'} - ${b.end_time || '23:59'}`
                    )}
                  </td>
                  <td className="text-sm text-gray-muted">{b.reason || '—'}</td>
                  <td>
                    <button
                      onClick={() => {
                        if (confirm('Remove this block?')) deleteMutation.mutate(b.id)
                      }}
                      className="p-1.5 text-gray-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-charcoal border border-gray-border rounded-2xl p-8 w-full max-w-md">
            <h3 className="font-heading font-bold text-xl text-offwhite mb-6">
              Block Studio Time
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Date to Block *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-field rounded-xl"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={form.is_full_day}
                    onChange={(e) => setForm({ ...form, is_full_day: e.target.checked })}
                    className="accent-orange"
                  />
                  <span className="text-offwhite text-sm font-medium">Full Day Block</span>
                </label>
              </div>

              {!form.is_full_day && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Start Time</label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="input-field rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="label-field">End Time</label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      className="input-field rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label-field">Reason</label>
                <input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. VIP Private Lockout"
                  className="input-field rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="btn-ghost">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!form.date || createMutation.isPending}
                className="btn-primary rounded-xl text-sm disabled:opacity-40"
              >
                {createMutation.isPending ? 'Blocking...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
