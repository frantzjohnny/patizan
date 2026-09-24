import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, Link } from 'react-router-dom'
import { Check, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, User, Mail, Phone, Calendar, Music2, FileText, Shield, Clock, Tag } from 'lucide-react'
import { InstagramIcon } from '../../components/icons/SocialIcons'
import { useServices, useServicePackages } from '../../hooks/useServices'
import { useCreateBooking, useBookedSlotsForDate } from '../../hooks/useBookings'
import { validateCoupon, recordCouponUsage, type CouponValidationResult } from '../../hooks/useCoupons'
import { dispatchBookingNotifications, type PromoterNotificationData } from '../../lib/notifications'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { bookingFormSchema, type BookingFormData } from '../../lib/validations'
import { formatCurrency, formatDate, formatTime, cn } from '../../lib/utils'
import { STUDIO_POLICY_DEFAULT } from '../../lib/constants'
import type { Service, ServicePackage, StudioAvailability, BlockedTime, Booking } from '../../types'
import SEO from '../../components/common/SEO'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Service', icon: Music2 },
  { id: 2, label: 'Package', icon: Check },
  { id: 3, label: 'Date & Time', icon: Calendar },
  { id: 4, label: 'Your Info', icon: User },
  { id: 5, label: 'Review', icon: FileText },
]

const TIMES = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 mb-12 overflow-x-auto no-scrollbar pb-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isComplete = currentStep > step.id
        const isActive = currentStep === step.id

        return (
          <div key={step.id} className="flex items-center gap-2 shrink-0">
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-heading font-semibold tracking-wide uppercase transition-all duration-300',
              isActive ? 'bg-orange text-black font-bold' :
              isComplete ? 'bg-orange/20 text-orange' :
              'bg-charcoal border border-gray-border text-gray-muted'
            )}>
              {isComplete ? (
                <Check size={14} />
              ) : (
                <Icon size={14} />
              )}
              <span className="hidden sm:block">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px transition-colors ${currentStep > step.id ? 'bg-orange' : 'bg-gray-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Step 1 — Choose Service
function StepService({
  services,
  selected,
  onSelect,
}: {
  services: Service[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="font-heading font-bold text-2xl text-offwhite mb-2">Choose Your Service</h2>
      <p className="text-gray-muted text-sm mb-8">What type of session are you booking at Patizan Records?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            className={cn(
              'p-5 rounded-xl border text-left transition-all duration-200 hover:border-orange/50',
              selected === service.id
                ? 'border-orange bg-orange/10'
                : 'border-gray-border bg-charcoal hover:bg-charcoal-light'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn('font-heading font-bold text-base', selected === service.id ? 'text-orange' : 'text-offwhite')}>
                {service.name}
              </h3>
              {selected === service.id && (
                <div className="w-5 h-5 rounded-full bg-orange flex items-center justify-center shrink-0">
                  <Check size={12} className="text-black" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-muted mt-2 line-clamp-2">{service.short_description}</p>
            {service.starting_price && (
              <p className="text-orange font-heading font-bold text-sm mt-3">
                From {formatCurrency(service.starting_price)}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 2 — Choose Package
function StepPackage({
  packages,
  selected,
  onSelect,
}: {
  packages: ServicePackage[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="font-heading font-bold text-2xl text-offwhite mb-2">Choose Your Package</h2>
      <p className="text-gray-muted text-sm mb-8">Select the session length that works best for your project.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => onSelect(pkg.id)}
            className={cn(
              'p-6 rounded-xl border text-left transition-all duration-200',
              selected === pkg.id
                ? 'border-orange bg-orange/10'
                : 'border-gray-border bg-charcoal hover:border-orange/30'
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className={cn('font-heading font-bold text-lg', selected === pkg.id ? 'text-orange' : 'text-offwhite')}>
                {pkg.name}
              </h3>
              {selected === pkg.id && (
                <div className="w-5 h-5 rounded-full bg-orange flex items-center justify-center">
                  <Check size={12} className="text-black" />
                </div>
              )}
            </div>
            <div className="font-heading font-bold text-3xl text-offwhite mb-1">
              {formatCurrency(pkg.price)}
            </div>
            <div className="text-gray-muted text-sm mb-4">
              {pkg.duration_hours < 1
                ? `${pkg.duration_hours * 60} minutes`
                : `${pkg.duration_hours} hour${pkg.duration_hours > 1 ? 's' : ''}`}
            </div>
            {pkg.engineer_included && (
              <div className="flex items-center gap-1.5 text-orange text-xs font-heading font-medium">
                <Check size={12} />
                Engineer included
              </div>
            )}
          </button>
        ))}

        {/* Custom option */}
        <button
          type="button"
          onClick={() => onSelect('custom')}
          className={cn(
            'p-6 rounded-xl border text-left transition-all duration-200 border-dashed',
            selected === 'custom'
              ? 'border-orange bg-orange/10'
              : 'border-gray-border/50 hover:border-orange/30'
          )}
        >
          <h3 className="font-heading font-bold text-lg text-offwhite mb-2">Custom Session</h3>
          <p className="text-gray-muted text-sm">Request custom duration or special arrangement.</p>
        </button>
      </div>
    </div>
  )
}

// Step 3 — Date & Time
function StepDateTime({
  availability,
  blockedTimes,
  bookedSlots = [],
  value,
  onChange,
}: {
  availability: StudioAvailability[]
  blockedTimes: BlockedTime[]
  bookedSlots?: { startTime: string; endTime: string }[]
  value: { date: string; time: string; duration: number; people: number }
  onChange: (v: typeof value) => void
}) {
  // Florida Today Date (America/New_York)
  const todayInFlorida = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const isDateAvailable = (dateStr: string) => {
    if (!dateStr) return true
    const d = new Date(`${dateStr}T12:00:00`)
    const day = d.getDay()
    const avail = availability.find((a) => a.day_of_week === day)
    if (avail && !avail.is_open) return false

    // Check if fully blocked
    const isBlocked = blockedTimes.some(
      (b) => b.date === dateStr && (b.is_all_day || b.is_full_day)
    )
    return !isBlocked
  }

  // Check if a specific time slot is booked or blocked
  const isSlotBooked = (timeStr: string) => {
    if (!value.date) return false

    const [reqH, reqM] = timeStr.split(':').map(Number)
    const reqStartMins = reqH * 60 + reqM
    const reqEndMins = reqStartMins + (value.duration || 1) * 60

    // Check booked slots from confirmed bookings
    const hasBookingConflict = bookedSlots.some((slot) => {
      const [bStartH, bStartM] = slot.startTime.split(':').map(Number)
      const [bEndH, bEndM] = slot.endTime.split(':').map(Number)
      const bStartMins = bStartH * 60 + (bStartM || 0)
      const bEndMins = bEndH * 60 + (bEndM || 0)
      return Math.max(reqStartMins, bStartMins) < Math.min(reqEndMins, bEndMins)
    })

    if (hasBookingConflict) return true

    // Check blocked times
    const hasBlockedConflict = blockedTimes.some((b) => {
      if (b.date !== value.date) return false
      if (b.is_all_day || b.is_full_day) return true
      if (b.start_time && b.end_time) {
        const [blStartH, blStartM] = b.start_time.split(':').map(Number)
        const [blEndH, blEndM] = b.end_time.split(':').map(Number)
        const blStartMins = blStartH * 60 + (blStartM || 0)
        const blEndMins = blEndH * 60 + (blEndM || 0)
        return Math.max(reqStartMins, blStartMins) < Math.min(reqEndMins, blEndMins)
      }
      return false
    })

    return hasBlockedConflict
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <h2 className="font-heading font-bold text-2xl text-offwhite">Choose Date & Time</h2>
        <span className="text-xs text-orange bg-orange/10 border border-orange/20 px-3 py-1 rounded-full font-heading font-medium flex items-center gap-1.5">
          <Clock size={12} /> Eastern Time (ET) · Tamarac, FL
        </span>
      </div>
      <p className="text-gray-muted text-sm mb-8">Select your preferred session date and start time.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date */}
        <div>
          <label className="label-field">Preferred Date</label>
          <input
            type="date"
            min={todayInFlorida}
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            className="input-field rounded-xl"
          />
          {value.date && !isDateAvailable(value.date) && (
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Studio is closed or fully booked on this date.
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="label-field">Session Duration</label>
          <select
            value={value.duration}
            onChange={(e) => onChange({ ...value, duration: Number(e.target.value) })}
            className="input-field rounded-xl"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
              <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        {/* Time slots */}
        <div className="md:col-span-2">
          <label className="label-field mb-4">Preferred Start Time (ET)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {TIMES.map((time) => {
              const booked = isSlotBooked(time)
              return (
                <button
                  key={time}
                  type="button"
                  disabled={booked}
                  onClick={() => onChange({ ...value, time })}
                  className={cn(
                    'py-3 rounded-xl text-xs font-heading font-semibold text-center transition-all duration-200 relative flex flex-col items-center justify-center',
                    booked
                      ? 'opacity-40 cursor-not-allowed bg-charcoal/40 border border-gray-border/30 text-gray-muted'
                      : value.time === time
                      ? 'bg-orange text-black font-bold shadow-glow-orange'
                      : 'bg-charcoal border border-gray-border text-offwhite/70 hover:border-orange/40'
                  )}
                  title={booked ? 'This time slot is already booked or unavailable' : undefined}
                >
                  <span className={cn(booked && 'line-through')}>{formatTime(time)}</span>
                  {booked && (
                    <span className="text-[9px] font-mono uppercase tracking-wider text-red-400 mt-0.5 font-bold">
                      BOOKED
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* People */}
        <div>
          <label className="label-field">Number of People in Studio</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...value, people: Math.max(1, value.people - 1) })}
              className="w-10 h-10 rounded-xl bg-charcoal border border-gray-border text-offwhite flex items-center justify-center hover:border-orange/40 transition-colors"
            >
              −
            </button>
            <span className="font-heading font-bold text-xl text-offwhite w-12 text-center">{value.people}</span>
            <button
              type="button"
              onClick={() => onChange({ ...value, people: Math.min(20, value.people + 1) })}
              className="w-10 h-10 rounded-xl bg-charcoal border border-gray-border text-offwhite flex items-center justify-center hover:border-orange/40 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 4 — Customer Info
function StepCustomerInfo({ register, errors }: { register: ReturnType<typeof useForm>['register']; errors: Record<string, { message?: string }> }) {
  return (
    <div>
      <h2 className="font-heading font-bold text-2xl text-offwhite mb-2">Your Information</h2>
      <p className="text-gray-muted text-sm mb-8">Tell us about yourself so we can prepare your session and audio engineer.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label-field">Full Name *</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              {...register('full_name')}
              placeholder="Your full name"
              className="input-field rounded-xl pl-10"
            />
          </div>
          {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="label-field">Artist / Stage Name</label>
          <div className="relative">
            <Music2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              {...register('artist_name')}
              placeholder="Stage or Band Name (optional)"
              className="input-field rounded-xl pl-10"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Email Address *</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              {...register('email')}
              type="email"
              placeholder="your@email.com"
              className="input-field rounded-xl pl-10"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label-field">Phone Number *</label>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              {...register('phone')}
              type="tel"
              placeholder="(959) 205-6476"
              className="input-field rounded-xl pl-10"
            />
          </div>
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="label-field">Instagram Handle</label>
          <div className="relative">
            <InstagramIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              {...register('instagram')}
              placeholder="@yourhandle"
              className="input-field rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Project Details & Notes</label>
          <textarea
            {...register('additional_notes')}
            rows={4}
            placeholder="Describe your session goals, reference tracks, stems preparation, or gear requirements..."
            className="input-field rounded-xl resize-none"
          />
        </div>
      </div>
    </div>
  )
}

// Step 5 — Review & Policy
function StepReview({
  formData,
  service,
  pkg,
  basePrice,
  appliedCoupon,
  couponInput,
  setCouponInput,
  couponError,
  setCouponError,
  isApplyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  register,
  errors,
}: {
  formData: Partial<BookingFormData>
  service?: Service
  pkg?: ServicePackage
  basePrice: number
  appliedCoupon: CouponValidationResult | null
  couponInput: string
  setCouponInput: (v: string) => void
  couponError: string | null
  setCouponError: (v: string | null) => void
  isApplyingCoupon: boolean
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  register: ReturnType<typeof useForm>['register']
  errors: Record<string, { message?: string }>
}) {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('studio_policy').single()
      return data
    },
  })

  return (
    <div>
      <h2 className="font-heading font-bold text-2xl text-offwhite mb-2">Review Your Request</h2>
      <p className="text-gray-muted text-sm mb-8">Please review your session details and acknowledge the studio policy.</p>

      {/* Summary card */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Service</p>
            <p className="text-offwhite font-medium">{service?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Package</p>
            <p className="text-offwhite font-medium">{pkg?.name || 'Custom Session'}</p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Date</p>
            <p className="text-offwhite font-medium">
              {formData.preferred_date ? formatDate(formData.preferred_date, 'MMMM d, yyyy') : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Start Time (ET)</p>
            <p className="text-offwhite font-medium">
              {formData.preferred_start_time ? formatTime(formData.preferred_start_time) : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Duration</p>
            <p className="text-offwhite font-medium">{formData.session_duration_hours} Hour(s)</p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Attendees</p>
            <p className="text-offwhite font-medium">{formData.number_of_people} Person(s)</p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Client Name</p>
            <p className="text-offwhite font-medium">{formData.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Email</p>
            <p className="text-offwhite font-medium truncate">{formData.email || '—'}</p>
          </div>
          <div>
            <p className="text-gray-muted text-xs uppercase tracking-wider mb-1">Phone</p>
            <p className="text-offwhite font-medium">{formData.phone || '—'}</p>
          </div>
        </div>

        {basePrice > 0 && (
          <div className="pt-4 border-t border-gray-border space-y-2">
            {appliedCoupon ? (
              <>
                <div className="flex justify-between items-center text-sm text-offwhite/70">
                  <span>Original Total:</span>
                  <span className="font-mono">{formatCurrency(appliedCoupon.original_amount ?? basePrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-green-400">
                  <span>Discount ({appliedCoupon.discount_percentage}% off):</span>
                  <span className="font-mono">-{formatCurrency(appliedCoupon.discount_amount ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-border/50">
                  <div>
                    <span className="font-heading font-semibold text-offwhite text-sm block">Final Total</span>
                    <span className="text-gray-muted text-xs">50% Deposit Due on Confirmation</span>
                  </div>
                  <span className="font-heading font-bold text-2xl text-orange">
                    {formatCurrency(appliedCoupon.final_amount ?? basePrice)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-gray-muted text-sm">Session Estimate (50% Deposit Due on Confirmation)</span>
                <span className="font-heading font-bold text-2xl text-orange">{formatCurrency(basePrice)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Promo Code Input Box (Requirement 3) */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 mb-6">
        <label className="label-field mb-2 text-offwhite flex items-center gap-2">
          <Tag size={14} className="text-orange" />
          PROMO CODE
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => {
              setCouponInput(e.target.value.toUpperCase())
              setCouponError(null)
            }}
            placeholder="Enter coupon code"
            disabled={isApplyingCoupon || !!appliedCoupon}
            className="input-field rounded-xl uppercase font-mono tracking-wider text-sm flex-1"
          />
          {appliedCoupon ? (
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="px-4 py-2 rounded-xl text-xs font-heading font-semibold text-gray-muted hover:text-red-400 border border-gray-border hover:border-red-400/40 transition-colors"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={!couponInput.trim() || isApplyingCoupon}
              className="btn-primary rounded-xl text-xs px-5 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {isApplyingCoupon ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                'APPLY'
              )}
            </button>
          )}
        </div>

        {appliedCoupon && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <Check size={16} />
              <span>✓ Coupon {appliedCoupon.coupon_code} applied</span>
            </div>
            <div className="pt-2 border-t border-green-500/20 text-xs font-mono space-y-1">
              <div className="flex justify-between text-offwhite/80">
                <span>Original Total:</span>
                <span>{formatCurrency(appliedCoupon.original_amount ?? basePrice)}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>Discount ({appliedCoupon.discount_percentage}%):</span>
                <span>-{formatCurrency(appliedCoupon.discount_amount ?? 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-offwhite text-sm pt-1 border-t border-green-500/20">
                <span>Final Total:</span>
                <span className="text-orange">{formatCurrency(appliedCoupon.final_amount ?? basePrice)}</span>
              </div>
            </div>
          </div>
        )}

        {couponError && (
          <p className="mt-2 text-red-400 text-xs flex items-center gap-1.5">
            <AlertCircle size={14} />
            {couponError}
          </p>
        )}
      </div>

      {/* Studio Policy */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-orange" />
          <h3 className="font-heading font-semibold text-sm tracking-wider uppercase text-offwhite">
            Studio Policies & Terms
          </h3>
        </div>
        <div className="text-offwhite/70 text-xs md:text-sm font-body leading-relaxed space-y-2 whitespace-pre-line bg-black/40 p-4 rounded-xl border border-gray-border/50 max-h-48 overflow-y-auto">
          {settings?.studio_policy || STUDIO_POLICY_DEFAULT}
        </div>
      </div>

      {/* Policy checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-charcoal transition-colors">
        <input
          {...register('policy_acknowledged')}
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border border-gray-border accent-orange"
        />
        <span className="text-offwhite/80 text-sm font-body leading-relaxed group-hover:text-offwhite transition-colors">
          I have read and agree to all Patizan Records studio policies. I understand that a <strong>50% deposit</strong> is required, <strong>no refunds</strong> will be issued after reservation, and session time begins promptly at the scheduled hour.
        </span>
      </label>
      {errors.policy_acknowledged && (
        <p className="text-red-400 text-xs mt-2">{errors.policy_acknowledged.message}</p>
      )}
    </div>
  )
}

// Confirmation screen
function BookingConfirmation() {
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center mx-auto mb-8 shadow-glow-orange"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
      >
        <CheckCircle2 size={48} className="text-orange" />
      </motion.div>

      <h2 className="font-heading font-bold text-4xl text-offwhite mb-4">
        REQUEST RECEIVED
      </h2>
      <div className="h-px w-16 bg-orange mx-auto mb-6" />
      <p className="text-offwhite/70 font-body text-lg max-w-md mx-auto leading-relaxed mb-3">
        Your studio session request has been submitted to the Patizan Records team.
      </p>
      <p className="text-offwhite/40 font-body text-sm max-w-md mx-auto mb-10">
        We will review your requested time slot, verify studio availability, and contact you directly by phone/email to finalize your 50% deposit and session confirmation.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="btn-primary rounded-xl text-sm">
          BACK TO HOME
        </Link>
        <Link to="/services" className="btn-secondary rounded-xl text-sm">
          EXPLORE SERVICES
        </Link>
      </div>
    </motion.div>
  )
}

export default function BookSessionPage() {
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get('service') || '')
  const [selectedPackageId, setSelectedPackageId] = useState(searchParams.get('package') || '')
  const [dateTime, setDateTime] = useState({ date: '', time: '', duration: 1, people: 1 })

  const { data: services = [] } = useServices(true)
  const { data: packages = [] } = useServicePackages(selectedServiceId || undefined)
  const { data: availability = [] } = useQuery({
    queryKey: ['studio-availability'],
    queryFn: async () => {
      const { data } = await supabase.from('studio_availability').select('*').order('day_of_week')
      return data || []
    },
  })
  const { data: blockedTimes = [] } = useQuery({
    queryKey: ['blocked-times'],
    queryFn: async () => {
      const { data } = await supabase.from('blocked_times').select('*')
      return data || []
    },
  })

  // Booked slots for selected date to prevent double bookings
  const { data: bookedSlots = [] } = useBookedSlotsForDate(dateTime.date)

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const createBooking = useCreateBooking()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      service_id: selectedServiceId,
      package_id: selectedPackageId || undefined,
      session_duration_hours: 1,
      number_of_people: 1,
      policy_acknowledged: false,
    },
  })

  const formData = watch()
  const selectedService = services.find((s) => s.id === selectedServiceId)
  const selectedPackage = packages.find((p) => p.id === selectedPackageId)

  // Calculate base price
  const basePrice =
    selectedPackage?.price ||
    ((selectedService?.starting_price || 0) * (dateTime.duration || 1))

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setIsApplyingCoupon(true)
    setCouponError(null)
    try {
      const result = await validateCoupon(couponInput, basePrice)
      if (result.valid) {
        setAppliedCoupon(result)
        setCouponError(null)
        toast.success(`Coupon ${result.coupon_code} applied!`)
      } else {
        setAppliedCoupon(null)
        setCouponError(result.message || 'Invalid coupon code.')
      }
    } catch {
      setCouponError('Invalid coupon code.')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError(null)
    toast('Coupon removed')
  }

  // Sync URL search params and auto-advance step
  useEffect(() => {
    const pkgParam = searchParams.get('package')
    const srvParam = searchParams.get('service')

    if (pkgParam) {
      setSelectedPackageId(pkgParam)
      setValue('package_id', pkgParam)
      if (srvParam) {
        setSelectedServiceId(srvParam)
        setValue('service_id', srvParam)
      }
      // If user directly clicked "Book this session" from rate card, take them straight to date & time
      setCurrentStep(3)
    } else if (srvParam) {
      setSelectedServiceId(srvParam)
      setValue('service_id', srvParam)
      setCurrentStep(2)
    }
  }, [searchParams, setValue])

  // Sync local state to form
  useEffect(() => {
    if (selectedServiceId) setValue('service_id', selectedServiceId)
  }, [selectedServiceId, setValue])

  useEffect(() => {
    if (selectedPackageId && selectedPackageId !== 'custom') {
      setValue('package_id', selectedPackageId)
      const matchedPkg = packages.find((p) => p.id === selectedPackageId)
      if (matchedPkg?.duration_hours) {
        setDateTime((prev) => ({ ...prev, duration: matchedPkg.duration_hours }))
      }
    }
  }, [selectedPackageId, packages, setValue])

  useEffect(() => {
    if (dateTime.date) setValue('preferred_date', dateTime.date)
    if (dateTime.time) setValue('preferred_start_time', dateTime.time)
    setValue('session_duration_hours', dateTime.duration)
    setValue('number_of_people', dateTime.people)
  }, [dateTime, setValue])

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedServiceId
      case 2: return true // package optional
      case 3: return !!dateTime.date && !!dateTime.time
      case 4: return !!formData.full_name && !!formData.email && !!formData.phone
      default: return true
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    try {
      // 1. Conflict check against database
      const { data: conflict } = await supabase.rpc('check_booking_conflict', {
        p_date: dateTime.date,
        p_start_time: dateTime.time,
        p_duration_hours: dateTime.duration,
      })

      if (conflict) {
        toast.error('The selected time slot conflicts with an existing session. Please pick another time.')
        setCurrentStep(3)
        return
      }

      let finalBookingPayload: Partial<Booking> = {
        ...data,
        service_id: selectedServiceId,
        package_id: selectedPackageId && selectedPackageId !== 'custom' ? selectedPackageId : undefined,
        preferred_date: dateTime.date,
        preferred_start_time: dateTime.time,
        session_duration_hours: dateTime.duration,
        number_of_people: dateTime.people,
        status: 'pending',
        original_amount: basePrice,
        discount_amount: 0,
        final_amount: basePrice,
      }

      let promoterNotifData: PromoterNotificationData | null = null

      // 2. Validate coupon securely on server/deterministic logic
      if (appliedCoupon && appliedCoupon.valid) {
        const recheck = await validateCoupon(appliedCoupon.coupon_code || '', basePrice)
        if (!recheck.valid) {
          toast.error(recheck.message || 'Coupon is no longer valid.')
          setAppliedCoupon(null)
          setCouponError(recheck.message || 'Coupon is no longer valid.')
          return
        }

        finalBookingPayload = {
          ...finalBookingPayload,
          coupon_id: recheck.coupon_id,
          coupon_code: recheck.coupon_code,
          original_amount: recheck.original_amount,
          discount_percentage: recheck.discount_percentage,
          discount_amount: recheck.discount_amount,
          final_amount: recheck.final_amount,
          promoter_name: recheck.promoter_name,
          promoter_phone: recheck.promoter_phone,
          promoter_commission_percentage: recheck.commission_percentage,
          promoter_commission_amount: recheck.commission_amount,
        }

        if (recheck.promoter_phone && recheck.coupon_code) {
          promoterNotifData = {
            couponCode: recheck.coupon_code,
            promoterPhone: recheck.promoter_phone,
            serviceName: selectedService?.name || 'Studio Session',
            originalPrice: recheck.original_amount || basePrice,
            discountPercentage: recheck.discount_percentage || 10,
            discountAmount: recheck.discount_amount || 0,
            finalAmount: recheck.final_amount || basePrice,
            commissionAmount: recheck.commission_amount || 0,
          }
        }
      }

      // 3. Create booking record
      const createdBooking = await createBooking.mutateAsync(finalBookingPayload)

      // 4. Record coupon usage in database & cache (Requirement 9)
      if (finalBookingPayload.coupon_code) {
        try {
          await recordCouponUsage({
            coupon_id: finalBookingPayload.coupon_id || null,
            coupon_code: finalBookingPayload.coupon_code,
            promoter_name: finalBookingPayload.promoter_name || 'Promoter',
            promoter_phone: finalBookingPayload.promoter_phone || '',
            customer_name: data.full_name,
            customer_phone: data.phone,
            customer_email: data.email,
            booking_id: createdBooking.id,
            original_amount: finalBookingPayload.original_amount || basePrice,
            discount_percentage: finalBookingPayload.discount_percentage || 10,
            discount_amount: finalBookingPayload.discount_amount || 0,
            final_amount: finalBookingPayload.final_amount || basePrice,
            commission_percentage: finalBookingPayload.promoter_commission_percentage || 10,
            commission_amount: finalBookingPayload.promoter_commission_amount || 0,
          })
        } catch {}
      }

      // 5. Dispatch Owner and Promoter notifications (Requirements 6 & 7)
      try {
        await dispatchBookingNotifications({
          bookingId: createdBooking.id,
          ownerData: {
            customerName: data.full_name,
            customerPhone: data.phone,
            customerEmail: data.email,
            serviceName: selectedService?.name || 'Studio Session',
            selectedOptions: selectedPackage?.name || 'Standard Session',
            preferredDate: dateTime.date,
            preferredTime: dateTime.time,
            originalPrice: finalBookingPayload.original_amount || basePrice,
            couponCode: finalBookingPayload.coupon_code || 'None',
            discountAmount: finalBookingPayload.discount_amount || 0,
            finalAmount: finalBookingPayload.final_amount || basePrice,
            promoterName: finalBookingPayload.promoter_name || 'None',
            promoterCommission: finalBookingPayload.promoter_commission_amount || 0,
            additionalNotes: data.additional_notes || 'None',
          },
          promoterData: promoterNotifData,
        })
      } catch {}

      setSubmitted(true)
    } catch {
      toast.error('Failed to submit booking. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-24 px-4">
        <div className="max-w-lg w-full">
          <BookingConfirmation />
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Book a Recording Session | Patizan Records"
        description="Book your studio recording session online at Patizan Records in Tamarac, FL. Select your service, package, preferred date, and time slot."
        canonicalPath="/book-session"
      />
      <div className="min-h-screen bg-black pt-24">
        {/* Header */}
        <div className="container-standard py-12">
          <p className="section-label mb-3">STUDIO BOOKING</p>
          <h1 className="font-heading font-bold text-display-md text-offwhite mb-4">
            BOOK YOUR SESSION.
          </h1>
          <p className="text-offwhite/50 font-body max-w-md">
            Fill out the form below to request your studio session. Our team will review and confirm your reservation promptly.
          </p>
        </div>

        {/* Form */}
        <div className="container-standard pb-24">
          <div className="max-w-4xl">
            <StepIndicator currentStep={currentStep} />

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <StepService
                      services={services}
                      selected={selectedServiceId}
                      onSelect={setSelectedServiceId}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepPackage
                      packages={packages}
                      selected={selectedPackageId}
                      onSelect={setSelectedPackageId}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepDateTime
                      availability={availability}
                      blockedTimes={blockedTimes}
                      bookedSlots={bookedSlots}
                      value={dateTime}
                      onChange={setDateTime}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepCustomerInfo register={register as ReturnType<typeof useForm>['register']} errors={errors as Record<string, { message?: string }>} />
                  )}
                  {currentStep === 5 && (
                    <StepReview
                      formData={{ ...formData, preferred_date: dateTime.date, preferred_start_time: dateTime.time, session_duration_hours: dateTime.duration, number_of_people: dateTime.people }}
                      service={selectedService}
                      pkg={selectedPackage}
                      basePrice={basePrice}
                      appliedCoupon={appliedCoupon}
                      couponInput={couponInput}
                      setCouponInput={setCouponInput}
                      couponError={couponError}
                      setCouponError={setCouponError}
                      isApplyingCoupon={isApplyingCoupon}
                      onApplyCoupon={handleApplyCoupon}
                      onRemoveCoupon={handleRemoveCoupon}
                      register={register as ReturnType<typeof useForm>['register']}
                      errors={errors as Record<string, { message?: string }>}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-border">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    disabled={!canProceed()}
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="btn-primary rounded-xl text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createBooking.isPending}
                    className="btn-primary rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {createBooking.isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        SUBMIT REQUEST
                        <Check size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
