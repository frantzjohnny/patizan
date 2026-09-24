-- =========================================================================
-- PATIZAN RECORDS — COUPON, PROMOTER, BOOKING NOTIFICATION & TIME SLOT SYSTEM
-- =========================================================================

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  promoter_name TEXT NOT NULL,
  promoter_phone TEXT NOT NULL,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_discount_pct CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CONSTRAINT check_commission_pct CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  CONSTRAINT check_code_non_empty CHECK (TRIM(code) <> ''),
  CONSTRAINT check_promoter_name_non_empty CHECK (TRIM(promoter_name) <> ''),
  CONSTRAINT check_promoter_phone_non_empty CHECK (TRIM(promoter_phone) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_upper ON public.coupons (UPPER(TRIM(code)));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons (is_active);

-- 2. Add Coupon & Amount Columns to Bookings Table (if not present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'coupon_id') THEN
    ALTER TABLE public.bookings ADD COLUMN coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'coupon_code') THEN
    ALTER TABLE public.bookings ADD COLUMN coupon_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'original_amount') THEN
    ALTER TABLE public.bookings ADD COLUMN original_amount NUMERIC(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_percentage') THEN
    ALTER TABLE public.bookings ADD COLUMN discount_percentage NUMERIC(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_amount') THEN
    ALTER TABLE public.bookings ADD COLUMN discount_amount NUMERIC(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'final_amount') THEN
    ALTER TABLE public.bookings ADD COLUMN final_amount NUMERIC(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'promoter_name') THEN
    ALTER TABLE public.bookings ADD COLUMN promoter_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'promoter_phone') THEN
    ALTER TABLE public.bookings ADD COLUMN promoter_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'promoter_commission_percentage') THEN
    ALTER TABLE public.bookings ADD COLUMN promoter_commission_percentage NUMERIC(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'promoter_commission_amount') THEN
    ALTER TABLE public.bookings ADD COLUMN promoter_commission_amount NUMERIC(10,2);
  END IF;
END $$;

-- 3. Create Coupon Usage History Table
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code TEXT NOT NULL,
  promoter_name TEXT NOT NULL,
  promoter_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  original_amount NUMERIC(10,2) NOT NULL,
  discount_percentage NUMERIC(5,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL,
  final_amount NUMERIC(10,2) NOT NULL,
  commission_percentage NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_booking_id ON public.coupon_usage(booking_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_code ON public.coupon_usage(coupon_code);

-- 4. Create WhatsApp Notifications Log Table
CREATE TABLE IF NOT EXISTS public.whatsapp_notifications_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('owner', 'promoter')),
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('sent', 'pending_credentials', 'failed', 'simulated')),
  provider TEXT DEFAULT 'whatsapp_business_api',
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_booking ON public.whatsapp_notifications_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON public.whatsapp_notifications_log(status);

-- 5. RPC Function: validate_coupon (Secure Server-Side Coupon & Discount Calculation)
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_original_amount NUMERIC DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
  v_discount_amt NUMERIC(10,2);
  v_final_amt NUMERIC(10,2);
  v_comm_amt NUMERIC(10,2);
  v_orig_amt NUMERIC(10,2);
BEGIN
  IF p_code IS NULL OR TRIM(p_code) = '' THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Invalid coupon code.');
  END IF;

  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_code));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Invalid coupon code.');
  END IF;

  IF NOT v_coupon.is_active THEN
    RETURN jsonb_build_object('valid', false, 'message', 'This coupon is no longer active.');
  END IF;

  v_orig_amt := COALESCE(p_original_amount, 0);
  v_discount_amt := ROUND(v_orig_amt * (v_coupon.discount_percentage / 100.0), 2);
  v_final_amt := GREATEST(0, v_orig_amt - v_discount_amt);
  v_comm_amt := ROUND(v_orig_amt * (v_coupon.commission_percentage / 100.0), 2);

  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'coupon_code', v_coupon.code,
    'promoter_name', v_coupon.promoter_name,
    'promoter_phone', v_coupon.promoter_phone,
    'discount_percentage', v_coupon.discount_percentage,
    'commission_percentage', v_coupon.commission_percentage,
    'original_amount', v_orig_amt,
    'discount_amount', v_discount_amt,
    'final_amount', v_final_amt,
    'commission_amount', v_comm_amt
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC Function: get_booked_time_slots (Publicly queries booked time ranges without sensitive customer data)
CREATE OR REPLACE FUNCTION public.get_booked_time_slots(p_date DATE)
RETURNS TABLE (
  start_time TEXT,
  end_time TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(COALESCE(confirmed_start_time, preferred_start_time), 'HH24:MI') as start_time,
    TO_CHAR(COALESCE(confirmed_end_time, COALESCE(confirmed_start_time, preferred_start_time) + (COALESCE(session_duration_hours, 1) * INTERVAL '1 hour')), 'HH24:MI') as end_time
  FROM public.bookings
  WHERE (COALESCE(confirmed_date, preferred_date) = p_date)
    AND status IN ('approved', 'confirmed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Enhanced check_booking_conflict Function
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  p_date DATE,
  p_start_time TIME,
  p_duration_hours NUMERIC,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_end_time TIME;
  conflict_count INTEGER;
BEGIN
  v_end_time := p_start_time + (p_duration_hours * INTERVAL '1 hour');
  
  SELECT COUNT(*) INTO conflict_count
  FROM public.bookings
  WHERE (COALESCE(confirmed_date, preferred_date) = p_date)
    AND status IN ('approved', 'confirmed')
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
    AND (
      (COALESCE(confirmed_start_time, preferred_start_time), 
       COALESCE(confirmed_end_time, COALESCE(confirmed_start_time, preferred_start_time) + (COALESCE(session_duration_hours, 1) * INTERVAL '1 hour')))
      OVERLAPS (p_start_time, v_end_time)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Database Trigger: Auto-populate confirmed fields & Prevent Double-Booking on Status Confirmation
CREATE OR REPLACE FUNCTION public.check_and_prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
  v_start_time TIME;
  v_duration NUMERIC;
  v_end_time TIME;
  v_conflict_count INTEGER;
BEGIN
  IF NEW.status IN ('approved', 'confirmed') THEN
    v_date := COALESCE(NEW.confirmed_date, NEW.preferred_date);
    v_start_time := COALESCE(NEW.confirmed_start_time, NEW.preferred_start_time);
    v_duration := COALESCE(NEW.session_duration_hours, 1);
    v_end_time := COALESCE(NEW.confirmed_end_time, v_start_time + (v_duration * INTERVAL '1 hour'));

    NEW.confirmed_date := v_date;
    NEW.confirmed_start_time := v_start_time;
    NEW.confirmed_end_time := v_end_time;

    -- Verify no conflict with another confirmed session
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE id <> NEW.id
      AND status IN ('approved', 'confirmed')
      AND (COALESCE(confirmed_date, preferred_date) = v_date)
      AND (
        (COALESCE(confirmed_start_time, preferred_start_time),
         COALESCE(confirmed_end_time, COALESCE(confirmed_start_time, preferred_start_time) + (COALESCE(session_duration_hours, 1) * INTERVAL '1 hour')))
        OVERLAPS (v_start_time, v_end_time)
      );

    IF v_conflict_count > 0 THEN
      RAISE EXCEPTION 'Double booking conflict: Another session is already confirmed on % overlapping %', v_date, v_start_time;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_double_booking ON public.bookings;
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE OF status, confirmed_date, confirmed_start_time, confirmed_end_time
ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.check_and_prevent_double_booking();

-- 9. Row Level Security Policies
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_notifications_log ENABLE ROW LEVEL SECURITY;

-- Helper to check admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE profile_id = auth.uid()
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Coupons RLS:
-- Public CANNOT view coupons table directly (prevents leaking promoter numbers or commissions).
-- Public validates coupons securely through validate_coupon RPC.
DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- Coupon Usage RLS:
DROP POLICY IF EXISTS "Admins manage coupon_usage" ON public.coupon_usage;
CREATE POLICY "Admins manage coupon_usage" ON public.coupon_usage FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public insert coupon_usage" ON public.coupon_usage;
CREATE POLICY "Public insert coupon_usage" ON public.coupon_usage FOR INSERT WITH CHECK (TRUE);

-- WhatsApp Notifications Log RLS:
DROP POLICY IF EXISTS "Admins manage whatsapp_notifications_log" ON public.whatsapp_notifications_log;
CREATE POLICY "Admins manage whatsapp_notifications_log" ON public.whatsapp_notifications_log FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public insert whatsapp_notifications_log" ON public.whatsapp_notifications_log;
CREATE POLICY "Public insert whatsapp_notifications_log" ON public.whatsapp_notifications_log FOR INSERT WITH CHECK (TRUE);

-- 10. Initial Seed Coupon (PATIZAN10)
INSERT INTO public.coupons (code, promoter_name, promoter_phone, discount_percentage, commission_percentage, is_active)
VALUES ('PATIZAN10', 'Michael', '+19592056476', 10.00, 10.00, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 11. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
