-- 20231110_01_booking_conflict_fix.sql
-- Migration: tighten booking conflict detection and add atomic check on insert

-- 1. Add generated booking_range column (tstzrange) for easier overlap checks
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS booking_range tstzrange GENERATED ALWAYS AS (
    tstzrange(
      make_timestamptz(COALESCE(confirmed_date, preferred_date), COALESCE(confirmed_start_time, preferred_start_time)),
      make_timestamptz(COALESCE(confirmed_date, preferred_date),
        COALESCE(confirmed_end_time, preferred_start_time + (session_duration_hours * INTERVAL '1 hour')))
    )
  ) STORED;

-- Removed exclusion constraint; advisory lock now ensures atomic conflict detection

-- 3. Keep the original conflict function for legacy calls (now just wraps the constraint)
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_date DATE,
  p_start_time TIME,
  p_duration_hours NUMERIC,
  p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bookings
    WHERE (
      status = 'approved'
      OR (status = 'pending' AND origin = 'online' AND temp_reserved_until > NOW())
      OR (status = 'pending' AND origin = 'manual')
      OR (status = 'pending' AND payment_status = 'awaiting_proof')
    )
    AND booking_range && tstzrange(
      make_timestamptz(p_date, p_start_time),
      make_timestamptz(p_date, p_start_time + (p_duration_hours * INTERVAL '1 hour'))
    )
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Update trigger to rely on the new constraint (throws error automatically)
DROP TRIGGER IF EXISTS trg_enforce_booking_conflict ON bookings;
CREATE TRIGGER trg_enforce_booking_conflict
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE PROCEDURE enforce_booking_conflict();

-- Trigger function now simply raises error if constraint fails (no extra logic needed)
CREATE OR REPLACE FUNCTION enforce_booking_conflict()
RETURNS trigger AS $$
DECLARE
  conflict_exists BOOLEAN;
  lock_key BIGINT;
BEGIN
  lock_key := hashtext((COALESCE(NEW.preferred_date, NEW.confirmed_date)::text) || '_' || (COALESCE(NEW.preferred_start_time, NEW.confirmed_start_time)::text));
  PERFORM pg_advisory_xact_lock(lock_key);
  SELECT EXISTS (
    SELECT 1 FROM bookings
    WHERE booking_range && NEW.booking_range
      AND (
        status = 'approved'
        OR (status = 'pending' AND origin = 'online' AND temp_reserved_until > CURRENT_TIMESTAMP)
        OR (status = 'pending' AND origin = 'manual')
        OR (status = 'pending' AND payment_status = 'awaiting_proof')
      )
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) INTO conflict_exists;
  IF conflict_exists THEN
    RAISE EXCEPTION 'Booking conflict detected for % %', NEW.preferred_date, NEW.preferred_start_time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- End of migration
