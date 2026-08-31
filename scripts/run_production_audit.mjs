import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://thpqwqwubxfiydxsnbdd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHF3cXd1YnhmaXlkeHNuYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjUxNzgsImV4cCI6MjEwMzYwMTE3OH0.7eISR0GHHYHUrVpcX5phSnpAz-HPXRZhZWd2etyIV4w'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runProductionAudit() {
  console.log('====================================================')
  console.log('PATIZAN RECORDS — COMPREHENSIVE PRODUCTION AUDIT')
  console.log('====================================================\n')

  // 1. Check Database Tables
  console.log('--- 1. Supabase Database Tables ---')
  const tables = [
    'services',
    'service_packages',
    'hero_slides',
    'gallery_items',
    'music_tracks',
    'playlists',
    'artists',
    'testimonials',
    'blog_posts',
    'studio_availability',
    'blocked_times',
    'site_settings',
    'studio_info',
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`[DB] ${table}: ❌ Error (${error.message})`)
      } else {
        console.log(`[DB] ${table}: ✅ PASS (accessible)`)
      }
    } catch (e) {
      console.log(`[DB] ${table}: ❌ Exception (${e.message})`)
    }
  }

  // 2. Check Services & Packages
  console.log('\n--- 2. Services & Packages Audit ---')
  const { data: services } = await supabase.from('services').select('name, starting_price, is_active').order('display_order')
  if (services && services.length > 0) {
    console.log(`Found ${services.length} services:`)
    services.forEach(s => console.log(`  - ${s.name}: $${s.starting_price} (active: ${s.is_active})`))
  } else {
    console.log('No services found in database or query failed.')
  }

  const { data: packages } = await supabase.from('service_packages').select('name, duration_hours, price, is_active').order('price')
  if (packages && packages.length > 0) {
    console.log(`Found ${packages.length} session packages:`)
    packages.forEach(p => console.log(`  - ${p.name} (${p.duration_hours}h): $${p.price}`))
  }

  // 3. Check Hero Slides
  console.log('\n--- 3. Hero Slides Audit ---')
  const { data: slides } = await supabase.from('hero_slides').select('headline, subheadline, image_url, is_active').order('display_order')
  if (slides && slides.length > 0) {
    console.log(`Found ${slides.length} hero slides:`)
    slides.forEach((sl, i) => console.log(`  Slide ${i+1}: "${sl.headline}" -> ${sl.image_url}`))
  }

  // 4. Check Local Studio Images Directory
  console.log('\n--- 4. Local Studio Directory Audit ---')
  const studioDir = path.resolve('public/images/studio')
  if (fs.existsSync(studioDir)) {
    const files = fs.readdirSync(studioDir)
    console.log(`public/images/studio/ exists with ${files.length} items:`, files.join(', '))
  } else {
    console.log('❌ public/images/studio/ does NOT exist!')
  }

  // 5. Check Fallback SVGs
  console.log('\n--- 5. Local Fallback SVG Assets Audit ---')
  const fallbackFiles = [
    'public/images/studio-placeholder.svg',
    'public/images/service-placeholder.svg',
    'public/images/og-default.svg',
    'public/images/track-placeholder.svg',
    'public/favicon.svg'
  ]
  fallbackFiles.forEach(f => {
    const exists = fs.existsSync(path.resolve(f))
    console.log(`  - ${f}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`)
  })
}

runProductionAudit()
