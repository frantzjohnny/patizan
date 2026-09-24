// =========================================================================
// PATIZAN RECORDS — Booking & Coupon WhatsApp Notification Dispatcher
// Secure client-side dispatcher: delegates sending to Edge Function or
// records notification into database logs without exposing server secrets.
// =========================================================================

import { supabase, isSupabaseConfigured } from './supabase'

export interface OwnerNotificationData {
  customerName: string
  customerPhone: string
  customerEmail: string
  serviceName: string
  selectedOptions?: string
  preferredDate: string
  preferredTime: string
  originalPrice: number
  couponCode?: string | null
  discountAmount?: number
  finalAmount: number
  promoterName?: string | null
  promoterCommission?: number
  additionalNotes?: string | null
}

export interface PromoterNotificationData {
  couponCode: string
  promoterPhone: string
  serviceName: string
  originalPrice: number
  discountPercentage: number
  discountAmount: number
  finalAmount: number
  commissionAmount: number
}

/**
 * Formats Owner WhatsApp Notification Message (Requirement 6)
 */
export function formatOwnerWhatsAppMessage(data: OwnerNotificationData): string {
  return [
    '🎵 PATIZAN RECORDS',
    'NEW SERVICE REQUEST',
    '',
    'Customer:',
    data.customerName,
    '',
    'Phone:',
    data.customerPhone,
    '',
    'Email:',
    data.customerEmail,
    '',
    'Selected Service:',
    data.serviceName,
    '',
    'Selected Options:',
    data.selectedOptions || 'Standard Session',
    '',
    'Requested Date:',
    data.preferredDate,
    '',
    'Requested Time:',
    data.preferredTime,
    '',
    'Original Price:',
    `$${Number(data.originalPrice).toFixed(2)}`,
    '',
    'Coupon:',
    data.couponCode || 'None',
    '',
    'Discount:',
    data.discountAmount ? `$${Number(data.discountAmount).toFixed(2)}` : '$0.00',
    '',
    'Final Amount:',
    `$${Number(data.finalAmount).toFixed(2)}`,
    '',
    'Promoter:',
    data.promoterName || 'None',
    '',
    'Promoter Commission:',
    data.promoterCommission ? `$${Number(data.promoterCommission).toFixed(2)}` : '$0.00',
    '',
    'Additional Notes:',
    data.additionalNotes || 'None',
  ].join('\n')
}

/**
 * Formats Promoter WhatsApp Notification Message (Requirement 7)
 * Strictly omits sensitive customer details (no customer phone/email).
 */
export function formatPromoterWhatsAppMessage(data: PromoterNotificationData): string {
  return [
    '🎉 PATIZAN RECORDS',
    '',
    `Your coupon ${data.couponCode} was used!`,
    '',
    `A customer used your coupon and received ${data.discountPercentage}% off.`,
    '',
    'Service:',
    data.serviceName,
    '',
    'Original Price:',
    `$${Number(data.originalPrice).toFixed(2)}`,
    '',
    'Customer Discount:',
    `$${Number(data.discountAmount).toFixed(2)}`,
    '',
    'Final Amount:',
    `$${Number(data.finalAmount).toFixed(2)}`,
    '',
    'Your Commission:',
    `$${Number(data.commissionAmount).toFixed(2)}`,
    '',
    'Thank you for promoting Patizan Records!',
  ].join('\n')
}

/**
 * Dispatches booking notifications safely.
 * Tries Supabase Edge Function first; falls back to database notification logs.
 */
export async function dispatchBookingNotifications(params: {
  bookingId: string
  ownerData: OwnerNotificationData
  promoterData?: PromoterNotificationData | null
}) {
  const { bookingId, ownerData, promoterData } = params

  const ownerMessage = formatOwnerWhatsAppMessage(ownerData)
  const promoterMessage = promoterData ? formatPromoterWhatsAppMessage(promoterData) : null

  // 1. Try invoking the Supabase Edge Function
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('send-booking-notification', {
        body: {
          booking_id: bookingId,
          customer_name: ownerData.customerName,
          customer_phone: ownerData.customerPhone,
          customer_email: ownerData.customerEmail,
          service_name: ownerData.serviceName,
          selected_options: ownerData.selectedOptions,
          preferred_date: ownerData.preferredDate,
          preferred_time: ownerData.preferredTime,
          original_price: ownerData.originalPrice,
          coupon_code: ownerData.couponCode,
          discount_amount: ownerData.discountAmount,
          final_amount: ownerData.finalAmount,
          promoter_name: ownerData.promoterName,
          promoter_phone: promoterData?.promoterPhone,
          promoter_commission_amount: promoterData?.commissionAmount,
          additional_notes: ownerData.additionalNotes,
        },
      })

      if (!error && data?.success) {
        return { success: true, mode: 'edge_function', data }
      }
    } catch {
      // Fall through to database logging
    }

    // 2. Direct Database Logging Fallback
    try {
      const logs = [
        {
          booking_id: bookingId,
          recipient_type: 'owner',
          recipient_phone: 'PENDING_CONFIG',
          message: ownerMessage,
          status: 'pending_credentials',
          provider: 'edge_fallback',
        },
      ]

      if (promoterData && promoterMessage) {
        logs.push({
          booking_id: bookingId,
          recipient_type: 'promoter',
          recipient_phone: promoterData.promoterPhone,
          message: promoterMessage,
          status: 'pending_credentials',
          provider: 'edge_fallback',
        })
      }

      await supabase.from('whatsapp_notifications_log').insert(logs)
    } catch {
      // Non-blocking
    }
  }

  return { success: true, mode: 'logged' }
}
