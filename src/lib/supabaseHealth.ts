/**
 * PATIZAN RECORDS — Supabase Runtime Health & Diagnostic Service
 * Audits connection, environment variables, authentication, core tables, and storage buckets.
 */

import { supabase, isSupabaseConfigured, supabaseUrl } from './supabase'
import { parseSupabaseError } from './supabaseErrors'

export interface DiagnosticItem {
  id: string
  name: string
  category: 'environment' | 'database' | 'storage' | 'auth' | 'security'
  status: 'ok' | 'warning' | 'error' | 'testing'
  message: string
  details?: string
  latencyMs?: number
}

export interface SystemHealthReport {
  overallStatus: 'connected' | 'unconfigured' | 'degraded' | 'error'
  timestamp: string
  isConfigured: boolean
  supabaseUrl: string
  items: DiagnosticItem[]
}

const REQUIRED_TABLES = [
  { id: 'artists', name: 'Artists Table' },
  { id: 'music_tracks', name: 'Music Tracks Table' },
  { id: 'playlists', name: 'Playlists Table' },
  { id: 'playlist_tracks', name: 'Playlist Tracks Table' },
  { id: 'gallery_items', name: 'Gallery Items Table' },
  { id: 'gallery_categories', name: 'Gallery Categories Table' },
  { id: 'hero_slides', name: 'Hero Slides Table' },
  { id: 'services', name: 'Services Table' },
  { id: 'service_packages', name: 'Service Packages Table' },
  { id: 'bookings', name: 'Bookings Table' },
  { id: 'customers', name: 'Customers Table' },
  { id: 'testimonials', name: 'Testimonials Table' },
  { id: 'blog_posts', name: 'Blog Posts Table' },
  { id: 'blog_categories', name: 'Blog Categories Table' },
  { id: 'site_settings', name: 'Site Settings Table' },
  { id: 'studio_availability', name: 'Studio Availability Table' },
  { id: 'blocked_times', name: 'Blocked Times Table' },
  { id: 'profiles', name: 'User Profiles Table' },
  { id: 'admin_users', name: 'Admin Users Authorization Table' },
]

const REQUIRED_BUCKETS = [
  { id: 'covers', name: 'Covers Bucket (Album art, Artist photos, Testimonials)' },
  { id: 'music', name: 'Music Bucket (Audio tracks & Beats)' },
  { id: 'gallery', name: 'Gallery Bucket (Studio images & media)' },
  { id: 'studio-images', name: 'Studio Images Bucket (Hero & Facility photography)' },
  { id: 'site-assets', name: 'Site Assets Bucket (Logos, Icons, Banners)' },
  { id: 'avatars', name: 'Avatars Bucket (User profiles)' },
  { id: 'blog', name: 'Blog Bucket (Article imagery)' },
  { id: 'videos', name: 'Videos Bucket (Studio video clips)' },
]

/**
 * Runs a complete system diagnostic check against Supabase
 */
export async function runSystemDiagnostics(): Promise<SystemHealthReport> {
  const items: DiagnosticItem[] = []

  // 1. Check Environment Variables
  if (!isSupabaseConfigured) {
    items.push({
      id: 'env_vars',
      name: 'Supabase Credentials',
      category: 'environment',
      status: 'error',
      message: 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or contains placeholder values.',
      details: 'Please add your real Supabase project URL and anon public key to your .env file.',
    })

    return {
      overallStatus: 'unconfigured',
      timestamp: new Date().toISOString(),
      isConfigured: false,
      supabaseUrl,
      items,
    }
  }

  items.push({
    id: 'env_vars',
    name: 'Supabase Credentials',
    category: 'environment',
    status: 'ok',
    message: 'Project URL and Anon API key are configured in environment.',
    details: `Target URL: ${supabaseUrl}`,
  })

  // 2. Test Live Database Connectivity
  const dbStart = performance.now()
  try {
    const { error: pingError } = await supabase.from('site_settings').select('id').limit(1)
    const latency = Math.round(performance.now() - dbStart)

    if (pingError && (pingError.code === '42P01' || pingError.code === 'PGRST205' || pingError.message.includes('schema cache'))) {
      items.push({
        id: 'database_ping',
        name: 'Database Connectivity',
        category: 'database',
        status: 'error',
        message: 'Connected to Supabase PostgreSQL, but schema tables are not yet initialized.',
        details: 'Run supabase/setup_complete.sql in the Supabase SQL Editor.',
        latencyMs: latency,
      })
    } else if (pingError) {
      const parsed = parseSupabaseError(pingError)
      items.push({
        id: 'database_ping',
        name: 'Database Connectivity',
        category: 'database',
        status: 'error',
        message: parsed.message,
        details: parsed.hint || pingError.message,
        latencyMs: latency,
      })
    } else {
      items.push({
        id: 'database_ping',
        name: 'Database Connectivity',
        category: 'database',
        status: 'ok',
        message: 'PostgreSQL database is online and accepting queries.',
        latencyMs: latency,
      })
    }
  } catch (err: unknown) {
    items.push({
      id: 'database_ping',
      name: 'Database Connectivity',
      category: 'database',
      status: 'error',
      message: 'Failed to establish connection to Supabase database.',
      details: String(err),
    })
  }

  // 3. Test Supabase Auth Service
  const authStart = performance.now()
  try {
    const { data: sessionData, error: authError } = await supabase.auth.getSession()
    const authLatency = Math.round(performance.now() - authStart)

    if (authError) {
      items.push({
        id: 'auth_service',
        name: 'Supabase Auth Service',
        category: 'auth',
        status: 'error',
        message: 'Auth service returned an error.',
        details: authError.message,
        latencyMs: authLatency,
      })
    } else {
      items.push({
        id: 'auth_service',
        name: 'Supabase Auth Service',
        category: 'auth',
        status: 'ok',
        message: sessionData.session ? 'Authenticated session active.' : 'Auth endpoint reachable (No active session).',
        latencyMs: authLatency,
      })
    }
  } catch (err: unknown) {
    items.push({
      id: 'auth_service',
      name: 'Supabase Auth Service',
      category: 'auth',
      status: 'error',
      message: 'Failed to reach Supabase Auth API.',
      details: String(err),
    })
  }

  // 4. Test All Required Database Tables
  for (const table of REQUIRED_TABLES) {
    const start = performance.now()
    try {
      const { error } = await supabase.from(table.id).select('*').limit(1)
      const lat = Math.round(performance.now() - start)

      if (error) {
        const parsed = parseSupabaseError(error)
        const isMissingTable = parsed.code === '42P01' || parsed.code === 'PGRST205' || error.message.includes('schema cache')
        items.push({
          id: `table_${table.id}`,
          name: table.name,
          category: 'database',
          status: isMissingTable ? 'error' : 'warning',
          message: parsed.message,
          details: parsed.hint || error.message,
          latencyMs: lat,
        })
      } else {
        items.push({
          id: `table_${table.id}`,
          name: table.name,
          category: 'database',
          status: 'ok',
          message: 'Table exists and is queryable.',
          latencyMs: lat,
        })
      }
    } catch (err: unknown) {
      items.push({
        id: `table_${table.id}`,
        name: table.name,
        category: 'database',
        status: 'error',
        message: 'Could not query table.',
        details: String(err),
      })
    }
  }

  // 5. Test Storage Buckets
  try {
    const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets()

    if (bucketListError) {
      items.push({
        id: 'storage_buckets_all',
        name: 'Storage Subsystem',
        category: 'storage',
        status: 'error',
        message: 'Failed to query Supabase Storage buckets.',
        details: bucketListError.message,
      })
    } else {
      const bucketMap = new Set((buckets || []).map((b) => b.name))

      for (const reqBucket of REQUIRED_BUCKETS) {
        if (bucketMap.has(reqBucket.id)) {
          items.push({
            id: `bucket_${reqBucket.id}`,
            name: reqBucket.name,
            category: 'storage',
            status: 'ok',
            message: `Bucket "${reqBucket.id}" is created and available.`,
          })
        } else {
          items.push({
            id: `bucket_${reqBucket.id}`,
            name: reqBucket.name,
            category: 'storage',
            status: 'error',
            message: `Bucket "${reqBucket.id}" does not exist in Supabase Storage.`,
            details: 'Run supabase/setup_complete.sql in Supabase SQL Editor.',
          })
        }
      }
    }
  } catch (err: unknown) {
    items.push({
      id: 'storage_buckets_all',
      name: 'Storage Subsystem',
      category: 'storage',
      status: 'error',
      message: 'Failed to access storage API.',
      details: String(err),
    })
  }

  // Determine Overall Status
  const hasErrors = items.some((i) => i.status === 'error')
  const hasWarnings = items.some((i) => i.status === 'warning')

  let overallStatus: SystemHealthReport['overallStatus'] = 'connected'
  if (hasErrors) overallStatus = 'error'
  else if (hasWarnings) overallStatus = 'degraded'

  return {
    overallStatus,
    timestamp: new Date().toISOString(),
    isConfigured: true,
    supabaseUrl,
    items,
  }
}
