import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
// Sanitize URL by removing any trailing slashes or /rest/v1
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseAnonKey !== 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Storage helpers
export async function uploadFile(
  bucket: string,
  file: File,
  customPath?: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin'
  const randomHash = Math.random().toString(36).substring(2, 9)
  const filePath = customPath || `${Date.now()}-${randomHash}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    throw error
  }
}
