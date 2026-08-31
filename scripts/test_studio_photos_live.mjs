import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://thpqwqwubxfiydxsnbdd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHF3cXd1YnhmaXlkeHNuYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjUxNzgsImV4cCI6MjEwMzYwMTE3OH0.7eISR0GHHYHUrVpcX5phSnpAz-HPXRZhZWd2etyIV4w'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runVerification() {
  console.log('--- 1. Testing public.studio_photos table existence ---')
  const { data: photos, error: tableError } = await supabase
    .from('studio_photos')
    .select('*')
    .limit(5)

  if (tableError) {
    console.error('FAIL: Error querying studio_photos:', tableError)
  } else {
    console.log('PASS: Successfully queried studio_photos. Total records:', photos.length)
  }

  console.log('\n--- 2. Testing studio-images storage bucket existence ---')
  const { data: bucketFiles, error: storageError } = await supabase.storage
    .from('studio-images')
    .list('photos')

  if (storageError) {
    console.error('FAIL: Error querying studio-images bucket:', storageError)
  } else {
    console.log('PASS: Successfully connected to studio-images bucket. Files in photos/:', bucketFiles.length)
  }

  console.log('\n--- 3. Testing public.home_media table existence ---')
  const { data: homeMedia, error: homeMediaError } = await supabase
    .from('home_media')
    .select('*')
    .limit(10)

  if (homeMediaError) {
    console.error('FAIL: Error querying home_media:', homeMediaError)
  } else {
    console.log('PASS: Successfully queried home_media. Total records:', homeMedia.length)
    console.log('Slots:', homeMedia.map(m => m.slot_key).join(', '))
  }

  console.log('\n--- 4. Testing site_settings table ---')
  const { data: settings, error: settingsError } = await supabase
    .from('site_settings')
    .select('id, og_image_url, seo_title')
    .limit(1)
    .single()

  if (settingsError) {
    console.error('FAIL: Error querying site_settings:', settingsError)
  } else {
    console.log('PASS: site_settings og_image_url:', settings.og_image_url)
  }
}

runVerification()
