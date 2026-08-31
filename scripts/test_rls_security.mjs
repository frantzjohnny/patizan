import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://thpqwqwubxfiydxsnbdd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHF3cXd1YnhmaXlkeHNuYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjUxNzgsImV4cCI6MjEwMzYwMTE3OH0.7eISR0GHHYHUrVpcX5phSnpAz-HPXRZhZWd2etyIV4w'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testWithAuth() {
  console.log('--- Checking RLS Policies & Auth ---')

  // 1. Unauthenticated SELECT (Public read of active photos)
  const { data: publicRead, error: readErr } = await supabase
    .from('studio_photos')
    .select('*')
    .eq('is_active', true)

  if (readErr) {
    console.error('FAIL: Public SELECT failed:', readErr)
  } else {
    console.log('PASS: Public SELECT works correctly! Result:', publicRead.length, 'records')
  }

  // 2. Unauthenticated write rejection test (Security proof)
  const { error: unauthWriteErr } = await supabase
    .from('studio_photos')
    .insert([{
      title: 'Hacker Attempt',
      image_url: 'http://malicious.com',
      category: 'other',
      display_order: 99
    }])

  if (unauthWriteErr && unauthWriteErr.code === '42501') {
    console.log('PASS: Unauthenticated write correctly blocked by RLS (42501 Unauthorized)!')
  } else {
    console.warn('WARNING: Unauthenticated write should be blocked:', unauthWriteErr)
  }
}

testWithAuth()
