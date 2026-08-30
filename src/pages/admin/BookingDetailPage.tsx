import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Phone, Mail, Calendar } from 'lucide-react'
import { InstagramIcon } from '../../components/icons/SocialIcons'
import { useBooking, useUpdateBookingStatus } from '../../hooks/useBookings'
import { formatDate, formatTime, formatCurrency } from '../../lib/utils'
import type { BookingStatus } from '../../types'
import toast from 'react-hot-toast'

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-pending',
  under_review: 'badge-under_review',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading } = useBooking(id || '')
  const updateStatus = useUpdateBookingStatus()
  const [adminNotes, setAdminNotes] = useState('')
  const [confirmedDate, setConfirmedDate] = useState('')
  const [confirmedTime, setConfirmedTime] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return <div className="text-center py-20 text-gray-muted">Booking not found.</div>
  }

  const handleStatusChange = async (status: BookingStatus) => {
    if (!confirm(`Change status to "${status}"?`)) return
    try {
      await updateStatus.mutateAsync({
        id: booking.id,
        status,
        adminNotes,
        confirmedDate: confirmedDate || undefined,
        confirmedStartTime: confirmedTime || undefined,
      })
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-muted hover:text-offwhite text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Bookings
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-offwhite">{booking.full_name}</h2>
          <p className="text-gray-muted text-sm mt-1">Booking ID: {booking.id.slice(0, 8)}...</p>
        </div>
        <span className={STATUS_BADGE[booking.status] + ' text-sm px-4 py-2'}>
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-charcoal border border-gray-border rounded-2xl p-6">
            <h3 className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-muted mb-5">Session Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Service</p>
                <p className="text-offwhite font-medium">{booking.service?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Package</p>
                <p className="text-offwhite font-medium">{booking.package?.name || 'Custom'}</p>
              </div>
              <div>
                <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Preferred Date</p>
                <p className="text-offwhite font-medium">{formatDate(booking.preferred_date, 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Preferred Time</p>
                <p className="text-offwhite font-medium">{formatTime(booking.preferred_start_time)}</p>
              </div>
              <div>
                <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Duration</p>
                <p className="text-offwhite font-medium">{booking.session_duration_hours}h</p>
              </div>
              <div>
                <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">People</p>
                <p className="text-offwhite font-medium">{booking.number_of_people}</p>
              </div>
              {booking.artist_name && (
                <div>
                  <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Artist Name</p>
                  <p className="text-offwhite font-medium">{booking.artist_name}</p>
                </div>
              )}
              {booking.package?.price && (
                <div>
                  <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Price</p>
                  <p className="text-orange font-heading font-bold">{formatCurrency(booking.package.price)}</p>
                </div>
              )}
            </div>
            {booking.additional_notes && (
              <div className="mt-4 pt-4 border-t border-gray-border">
                <p className="text-gray-muted text-xs uppercase tracking-wider mb-2">Notes from Client</p>
                <p className="text-offwhite/70 text-sm">{booking.additional_notes}</p>
              </div>
            )}
          </div>

          {/* Confirm / Admin section */}
          <div className="bg-charcoal border border-gray-border rounded-2xl p-6">
            <h3 className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-muted mb-5">Admin Actions</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label-field">Confirmed Date</label>
                <input
                  type="date"
                  value={confirmedDate || booking.confirmed_date || ''}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                  className="input-field rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="label-field">Confirmed Start Time</label>
                <input
                  type="time"
                  value={confirmedTime || booking.confirmed_start_time || ''}
                  onChange={(e) => setConfirmedTime(e.target.value)}
                  className="input-field rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="label-field">Admin Notes</label>
              <textarea
                value={adminNotes || booking.admin_notes || ''}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes..."
                className="input-field rounded-xl text-sm resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange('under_review')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-heading font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => handleStatusChange('approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-heading font-semibold hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-heading font-semibold hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              {booking.status === 'under_review' && (
                <>
                  <button onClick={() => handleStatusChange('approved')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-heading font-semibold hover:bg-green-700 transition-colors">Approve</button>
                  <button onClick={() => handleStatusChange('rejected')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-heading font-semibold hover:bg-red-700 transition-colors">Reject</button>
                </>
              )}
              {booking.status === 'approved' && (
                <>
                  <button onClick={() => handleStatusChange('completed')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-heading font-semibold hover:bg-emerald-700 transition-colors">Mark Completed</button>
                  <button onClick={() => handleStatusChange('cancelled')} className="px-4 py-2 bg-gray-600 text-white rounded-xl text-sm font-heading font-semibold hover:bg-gray-700 transition-colors">Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Client info */}
        <div className="space-y-6">
          <div className="bg-charcoal border border-gray-border rounded-2xl p-6">
            <h3 className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-muted mb-5">Client Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-orange shrink-0" />
                <a href={`tel:${booking.phone}`} className="text-offwhite text-sm hover:text-orange transition-colors">{booking.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-orange shrink-0" />
                <a href={`mailto:${booking.email}`} className="text-offwhite text-sm hover:text-orange transition-colors break-all">{booking.email}</a>
              </div>
              {booking.instagram && (
                <div className="flex items-center gap-3">
                  <InstagramIcon className="w-4 h-4 text-orange shrink-0" />
                  <span className="text-offwhite text-sm">{booking.instagram}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-charcoal border border-gray-border rounded-2xl p-6">
            <h3 className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-muted mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-muted">
                <Calendar size={12} className="text-orange" />
                Submitted: {formatDate(booking.created_at)}
              </div>
              {booking.confirmed_date && (
                <div className="flex items-center gap-2 text-xs text-gray-muted">
                  <span className="text-green-400">✓</span>
                  Confirmed: {formatDate(booking.confirmed_date)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
