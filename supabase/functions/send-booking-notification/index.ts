// =========================================================================
// PATIZAN RECORDS — SUPABASE EDGE FUNCTION: send-booking-notification
// Server-Side WhatsApp Business Notification Dispatcher
// Dispatches notifications to Owner and Promoter without exposing credentials
// =========================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  booking_id: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  service_name?: string
  selected_options?: string
  preferred_date?: string
  preferred_time?: string
  original_price?: number
  coupon_code?: string
  discount_amount?: number
  discount_percentage?: number
  final_amount?: number
  promoter_name?: string
  promoter_phone?: string
  promoter_commission_amount?: number
  additional_notes?: string
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: NotificationPayload = await req.json()
    const { booking_id } = payload

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const ownerWhatsappNumber = Deno.env.get('OWNER_WHATSAPP_NUMBER') || ''

    // Optional Provider Credentials
    const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN') || ''
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || ''
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID') || ''
    const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN') || ''
    const twilioFrom = Deno.env.get('TWILIO_WHATSAPP_FROM') || ''

    let supabase: any = null
    let booking: any = null

    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey)
      const { data } = await supabase
        .from('bookings')
        .select('*, service:services(name), package:service_packages(name, price)')
        .eq('id', booking_id)
        .single()
      booking = data
    }

    // Resolve details (from DB if found, otherwise from payload)
    const customerName = booking?.full_name || payload.customer_name || 'Valued Client'
    const customerPhone = booking?.phone || payload.customer_phone || 'N/A'
    const customerEmail = booking?.email || payload.customer_email || 'N/A'
    const serviceName = booking?.service?.name || payload.service_name || 'Studio Session'
    const selectedOptions = booking?.package?.name || payload.selected_options || 'Standard'
    const preferredDate = booking?.preferred_date || payload.preferred_date || 'TBD'
    const preferredTime = (booking?.preferred_start_time || payload.preferred_time || 'TBD').slice(0, 5)
    const originalPrice = booking?.original_amount ?? payload.original_price ?? booking?.package?.price ?? 0
    const couponCode = booking?.coupon_code || payload.coupon_code || null
    const discountAmount = booking?.discount_amount ?? payload.discount_amount ?? 0
    const discountPercentage = booking?.discount_percentage ?? payload.discount_percentage ?? 10
    const finalAmount = booking?.final_amount ?? payload.final_amount ?? originalPrice
    const promoterName = booking?.promoter_name || payload.promoter_name || null
    const promoterPhone = booking?.promoter_phone || payload.promoter_phone || null
    const promoterCommission = booking?.promoter_commission_amount ?? payload.promoter_commission_amount ?? 0
    const additionalNotes = booking?.additional_notes || payload.additional_notes || 'None'

    // Format Owner Message (Requirement 6)
    const ownerMessage = [
      '🎵 PATIZAN RECORDS',
      'NEW SERVICE REQUEST',
      '',
      'Customer:',
      customerName,
      '',
      'Phone:',
      customerPhone,
      '',
      'Email:',
      customerEmail,
      '',
      'Selected Service:',
      serviceName,
      '',
      'Selected Options:',
      selectedOptions,
      '',
      'Requested Date:',
      preferredDate,
      '',
      'Requested Time:',
      preferredTime,
      '',
      'Original Price:',
      `$${Number(originalPrice).toFixed(2)}`,
      '',
      'Coupon:',
      couponCode || 'None',
      '',
      'Discount:',
      discountAmount ? `$${Number(discountAmount).toFixed(2)}` : '$0.00',
      '',
      'Final Amount:',
      `$${Number(finalAmount).toFixed(2)}`,
      '',
      'Promoter:',
      promoterName || 'None',
      '',
      'Promoter Commission:',
      promoterCommission ? `$${Number(promoterCommission).toFixed(2)}` : '$0.00',
      '',
      'Additional Notes:',
      additionalNotes,
    ].join('\n')

    // Format Promoter Message (Requirement 7) — Sensitive customer data strictly omitted
    let promoterMessage = ''
    if (couponCode && promoterPhone) {
      promoterMessage = [
        '🎉 PATIZAN RECORDS',
        '',
        `Your coupon ${couponCode} was used!`,
        '',
        `A customer used your coupon and received ${discountPercentage}% off.`,
        '',
        'Service:',
        serviceName,
        '',
        'Original Price:',
        `$${Number(originalPrice).toFixed(2)}`,
        '',
        'Customer Discount:',
        `$${Number(discountAmount).toFixed(2)}`,
        '',
        'Final Amount:',
        `$${Number(finalAmount).toFixed(2)}`,
        '',
        'Your Commission:',
        `$${Number(promoterCommission).toFixed(2)}`,
        '',
        'Thank you for promoting Patizan Records!',
      ].join('\n')
    }

    let ownerStatus: 'sent' | 'pending_credentials' | 'failed' = 'pending_credentials'
    let promoterStatus: 'sent' | 'pending_credentials' | 'failed' = 'pending_credentials'
    let providerUsed = 'none'

    // Dispatch helper for Meta Cloud API or Twilio
    const sendWhatsApp = async (to: string, text: string) => {
      if (whatsappToken && whatsappPhoneId) {
        providerUsed = 'meta_cloud_api'
        const cleanTo = to.replace(/[^\d]/g, '')
        const res = await fetch(`https://graph.facebook.com/v20.0/${whatsappPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo,
            type: 'text',
            text: { body: text },
          }),
        })
        return res.ok ? 'sent' : 'failed'
      } else if (twilioSid && twilioAuth && twilioFrom) {
        providerUsed = 'twilio'
        const cleanTo = to.startsWith('+') ? to : `+${to.replace(/[^\d]/g, '')}`
        const bodyParams = new URLSearchParams({
          From: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
          To: `whatsapp:${cleanTo}`,
          Body: text,
        })
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams,
          }
        )
        return res.ok ? 'sent' : 'failed'
      }
      return 'pending_credentials'
    }

    // 1. Send to Owner
    if (ownerWhatsappNumber) {
      ownerStatus = await sendWhatsApp(ownerWhatsappNumber, ownerMessage)
    }

    // 2. Send to Promoter
    if (promoterPhone && promoterMessage) {
      promoterStatus = await sendWhatsApp(promoterPhone, promoterMessage)
    }

    // 3. Log into Supabase database if available
    if (supabase) {
      const logsToInsert = [
        {
          booking_id,
          recipient_type: 'owner',
          recipient_phone: ownerWhatsappNumber || 'CONFIG_REQUIRED',
          message: ownerMessage,
          status: ownerStatus,
          provider: providerUsed,
        },
      ]

      if (promoterPhone && promoterMessage) {
        logsToInsert.push({
          booking_id,
          recipient_type: 'promoter',
          recipient_phone: promoterPhone,
          message: promoterMessage,
          status: promoterStatus,
          provider: providerUsed,
        })
      }

      await supabase.from('whatsapp_notifications_log').insert(logsToInsert)
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking_id,
        owner_status: ownerStatus,
        promoter_status: promoterStatus,
        provider: providerUsed,
        note:
          ownerStatus === 'pending_credentials'
            ? 'Owner WhatsApp notification logged. Configure OWNER_WHATSAPP_NUMBER and WhatsApp API keys to send live messages.'
            : 'Notification dispatched successfully.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to process notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
