#!/usr/bin/env bash
set -e

echo "Running booking conflict tests..."
PSQL="psql -v ON_ERROR_STOP=1 -h localhost -U postgres -d postgres"

run_sql() {
  local sql="$1"
  echo "$sql" | $PSQL
}

# 1. Insert an approved booking (conflict source)
run_sql "INSERT INTO bookings (customer_id, service_id, full_name, email, phone, preferred_date, preferred_start_time, session_duration_hours, status, confirmed_date, confirmed_start_time, confirmed_end_time)
VALUES (gen_random_uuid(), gen_random_uuid(), 'Test User', 'test@example.com', '123456', '2024-01-01', '10:00', 2, 'approved', '2024-01-01', '10:00', '12:00');"

conflict=$(echo "SELECT check_booking_conflict('2024-01-01', '11:00', 1);" | $PSQL -tA)
if [ "$conflict" = "t" ]; then
  echo "✅ Conflict detected for overlapping approved booking (expected)"
else
  echo "❌ FAIL: Conflict not detected for overlapping approved booking"
  exit 1
fi

# 2. Insert a manual pending booking (no expiry) that should block later slots
run_sql "INSERT INTO bookings (customer_id, service_id, full_name, email, phone, preferred_date, preferred_start_time, session_duration_hours, status, origin)
VALUES (gen_random_uuid(), gen_random_uuid(), 'Manual', 'manual@example.com', '123456', '2024-01-02', '14:00', 2, 'pending', 'manual');"

conflict_manual=$(echo "SELECT check_booking_conflict('2024-01-02', '15:00', 1);" | $PSQL -tA)
if [ "$conflict_manual" = "t" ]; then
  echo "✅ Conflict detected for manual pending booking (expected)"
else
  echo "❌ FAIL: Manual pending booking did not block as expected"
  exit 1
fi

# 3. Insert an online pending booking with an expired hold (should NOT block)
run_sql "INSERT INTO bookings (customer_id, service_id, full_name, email, phone, preferred_date, preferred_start_time, session_duration_hours, status, temp_reserved_until)
VALUES (gen_random_uuid(), gen_random_uuid(), 'Online', 'online@example.com', '123456', '2024-01-03', '09:00', 2, 'pending', NOW() - INTERVAL '1 hour');"

conflict_expired=$(echo "SELECT check_booking_conflict('2024-01-03', '09:30', 1);" | $PSQL -tA)
if [ "$conflict_expired" = "f" ]; then
  echo "✅ Expired hold does NOT block (expected)"
else
  echo "❌ FAIL: Expired hold incorrectly blocks"
  exit 1
fi

# 4. Insert an admin blocked time and verify it is considered a conflict
run_sql "INSERT INTO blocked_times (title, date, start_time, end_time, is_all_day) VALUES ('Maintenance', '2024-01-04', '08:00', '12:00', false);"
blocked=$(echo "SELECT EXISTS (SELECT 1 FROM blocked_times WHERE date='2024-01-04' AND (start_time, end_time) OVERLAPS ('09:00'::time, '10:00'::time));" | $PSQL -tA)
if [ "$blocked" = "t" ]; then
  echo "✅ Blocked time correctly identified"
else
  echo "❌ FAIL: Blocked time not detected"
  exit 1
fi

echo "All booking conflict tests passed."
