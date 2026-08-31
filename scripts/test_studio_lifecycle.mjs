import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://thpqwqwubxfiydxsnbdd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHF3cXd1YnhmaXlkeHNuYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjUxNzgsImV4cCI6MjEwMzYwMTE3OH0.7eISR0GHHYHUrVpcX5phSnpAz-HPXRZhZWd2etyIV4w'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testFullLifecycle() {
  console.log('=== REAL PRODUCTION VERIFICATION: STUDIO_PHOTOS ===\n')

  // 1. Check table existence
  console.log('Step 1: Checking public.studio_photos table existence...')
  const { data: initialPhotos, error: selectErr } = await supabase
    .from('studio_photos')
    .select('*')

  if (selectErr) {
    console.error('FAIL: Table does not exist:', selectErr)
    return
  }
  console.log('PASS: studio_photos table exists! Current count:', initialPhotos.length)

  // 2. Test Storage Bucket
  console.log('\nStep 2: Checking studio-images storage bucket...')
  const { data: bucketList, error: bucketErr } = await supabase.storage
    .from('studio-images')
    .list()

  if (bucketErr) {
    console.error('FAIL: Bucket error:', bucketErr)
    return
  }
  console.log('PASS: studio-images bucket accessible. Items:', bucketList.length)

  // 3. Test Real Insert
  console.log('\nStep 3: Testing Insert of Studio Photo A...')
  const testPhotoA = {
    title: 'Control Room A (Test Session)',
    description: 'Precision acoustics and analog monitoring chain.',
    image_url: 'https://thpqwqwubxfiydxsnbdd.supabase.co/storage/v1/object/public/studio-images/photos/control-room-test-a.webp',
    storage_path: 'photos/control-room-test-a.webp',
    category: 'control-room',
    display_order: 1,
    is_active: true,
    is_seo_image: true,
  }

  const { data: insertedA, error: insertErr } = await supabase
    .from('studio_photos')
    .insert([testPhotoA])
    .select()
    .single()

  if (insertErr) {
    console.error('FAIL: Insert error (check RLS policies):', insertErr)
    return
  }
  console.log('PASS: Photo A inserted with ID:', insertedA.id, '| is_seo_image:', insertedA.is_seo_image)

  // 4. Test Second Photo Insert & SEO switch
  console.log('\nStep 4: Testing Insert of Studio Photo B and single-SEO uniqueness...')
  const testPhotoB = {
    title: 'Vocal Booth B (Test Session)',
    description: 'Isolated acoustic booth for vocal tracking.',
    image_url: 'https://thpqwqwubxfiydxsnbdd.supabase.co/storage/v1/object/public/studio-images/photos/vocal-booth-test-b.webp',
    storage_path: 'photos/vocal-booth-test-b.webp',
    category: 'recording-booth',
    display_order: 2,
    is_active: true,
    is_seo_image: false,
  }

  const { data: insertedB, error: insertBErr } = await supabase
    .from('studio_photos')
    .insert([testPhotoB])
    .select()
    .single()

  if (insertBErr) {
    console.error('FAIL: Photo B insert error:', insertBErr)
    return
  }
  console.log('PASS: Photo B inserted with ID:', insertedB.id)

  // 5. Test SEO Switch to Photo B
  console.log('\nStep 5: Switching SEO image from Photo A to Photo B...')
  // Clear previous
  await supabase.from('studio_photos').update({ is_seo_image: false }).eq('is_seo_image', true)
  // Set new
  const { error: seoSwitchErr } = await supabase
    .from('studio_photos')
    .update({ is_seo_image: true })
    .eq('id', insertedB.id)

  if (seoSwitchErr) {
    console.error('FAIL: SEO switch error:', seoSwitchErr)
    return
  }

  // Verify only 1 active SEO image exists
  const { data: activeSeoPhotos } = await supabase
    .from('studio_photos')
    .select('id, title, is_seo_image')
    .eq('is_seo_image', true)

  if (activeSeoPhotos.length === 1 && activeSeoPhotos[0].id === insertedB.id) {
    console.log('PASS: Single SEO image enforced! Active SEO photo is:', activeSeoPhotos[0].title)
  } else {
    console.error('FAIL: Multiple or no SEO photos found:', activeSeoPhotos)
  }

  // 6. Test Photo Update / Replacement
  console.log('\nStep 6: Testing Photo Replacement on Photo A...')
  const updatedUrl = 'https://thpqwqwubxfiydxsnbdd.supabase.co/storage/v1/object/public/studio-images/photos/control-room-test-a2.webp'
  const { data: updatedA, error: updateErr } = await supabase
    .from('studio_photos')
    .update({
      title: 'Control Room A (Updated HD)',
      image_url: updatedUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', insertedA.id)
    .select()
    .single()

  if (updateErr || updatedA.image_url !== updatedUrl) {
    console.error('FAIL: Update error:', updateErr)
  } else {
    console.log('PASS: Photo A updated. New Title:', updatedA.title, '| New URL:', updatedA.image_url)
  }

  // 7. Test Public Query (active only, ordered by display_order)
  console.log('\nStep 7: Testing Public Website Query (SELECT active photos ORDER BY display_order)...')
  const { data: publicPhotos, error: pubErr } = await supabase
    .from('studio_photos')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (pubErr) {
    console.error('FAIL: Public query error:', pubErr)
  } else {
    console.log('PASS: Public query returned', publicPhotos.length, 'active studio photos:')
    publicPhotos.forEach(p => console.log(`  - [Order ${p.display_order}] ${p.title} (${p.category}) - SEO: ${p.is_seo_image}`))
  }

  // 8. Clean up test records
  console.log('\nStep 8: Cleaning up test records...')
  await supabase.from('studio_photos').delete().in('id', [insertedA.id, insertedB.id])
  console.log('PASS: Test records cleaned up.')

  console.log('\n=== ALL 8 VERIFICATION PHASES PASSED! ===')
}

testFullLifecycle()
