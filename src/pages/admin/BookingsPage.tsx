import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Check, X, CheckCircle } from 'lucide-react'
import { useBookings, useUpdateBookingStatus } from '../../hooks/useBookings'
import { formatDate, formatTime, cn } from '../../lib/utils'
import type { BookingStatus } from '../../types'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'under_review', 'approved', 'rejected', 'cancelled', 'completed'] as const

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-pending',
  under_review: 'badge-under_review',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
}

export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useBookings({
    search: search || undefined,
    status: statusFilter,
    page,
    pageSize: 20,
  })

  const bookings = data?.data || []
  const total = data?.count || 0

  const updateStatus = useUpdateBookingStatus()

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'approved' })
      toast.success('Booking approved!')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Reject this booking request?')) return
    try {
      await updateStatus.mutateAsync({ id, status: 'rejected' })
      toast.success('Booking rejected.')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-field rounded-xl pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={cn('px-4 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider transition-all', !statusFilter ? 'bg-orange text-black' : 'bg-charcoal border border-gray-border text-gray-muted hover:text-offwhite')}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? undefined : s)}
              className={cn('px-4 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider transition-all', statusFilter === s ? 'bg-orange text-black' : 'bg-charcoal border border-gray-border text-gray-muted hover:text-offwhite')}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className="h-8 bg-charcoal-light rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-muted">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <p className="font-heading font-semibold text-offwhite text-sm">{booking.full_name}</p>
                        <p className="text-xs text-gray-muted">{booking.email}</p>
                        <p className="text-xs text-gray-muted">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="text-sm">{booking.service?.name || '—'}</td>
                    <td className="text-sm tabular-nums">{formatDate(booking.preferred_date)}</td>
                    <td className="text-sm tabular-nums">{formatTime(booking.preferred_start_time)}</td>
                    <td className="text-sm">{booking.session_duration_hours}h</td>
                    <td>
                      <span className={STATUS_BADGE[booking.status]}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/bookings/${booking.id}`}
                          className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                          title="View details"
                        >
                          <Eye size={14} />
                        </Link>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              className="p-1.5 text-green-400 hover:text-green-300 transition-colors"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => updateStatus.mutateAsync({ id: booking.id, status: 'completed' })}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Mark completed"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-border">
            <p className="text-xs text-gray-muted">{total} total bookings</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-border text-xs text-gray-muted hover:text-offwhite disabled:opacity-40 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-offwhite">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1.5 rounded-lg border border-gray-border text-xs text-gray-muted hover:text-offwhite disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
