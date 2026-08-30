/**
 * PATIZAN RECORDS — Storage Management Utility
 * Robust file uploads and management with MIME validation, size limits, and error handling.
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { parseSupabaseError } from './supabaseErrors'

export type AllowedBucket =
  | 'covers'
  | 'music'
  | 'gallery'
  | 'studio-images'
  | 'site-assets'
  | 'avatars'
  | 'blog'
  | 'videos'

export interface UploadOptions {
  bucket: AllowedBucket
  file: File
  folder?: string
  allowedMimeTypes?: string[]
  maxSizeMB?: number
}

const DEFAULT_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

const DEFAULT_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
]

const DEFAULT_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]

/**
 * Generate a safe unique file path using timestamp, random hash, and original extension
 */
function generateSafePath(originalName: string, folder?: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  const randomHash = Math.random().toString(36).substring(2, 10)
  const timestamp = Date.now()
  const cleanName = `${timestamp}-${randomHash}.${ext}`
  return folder ? `${folder.replace(/\/$/, '')}/${cleanName}` : cleanName
}

/**
 * Uploads a file to a Supabase Storage bucket with comprehensive validation
 */
export async function uploadToStorage(options: UploadOptions): Promise<string> {
  const { bucket, file, folder, allowedMimeTypes, maxSizeMB } = options

  if (!isSupabaseConfigured) {
    throw new Error(
      `Cannot upload to "${bucket}". Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.`
    )
  }

  // 1. Validate file existence
  if (!file) {
    throw new Error('No file provided for upload.')
  }

  // 2. Validate MIME type
  if (allowedMimeTypes && allowedMimeTypes.length > 0) {
    const isMimeValid = allowedMimeTypes.includes(file.type) ||
      allowedMimeTypes.some(m => m.endsWith('/*') && file.type.startsWith(m.replace('/*', '')))
    
    if (!isMimeValid && file.type) {
      throw new Error(
        `Unsupported file format (${file.type}). Allowed formats: ${allowedMimeTypes.join(', ')}`
      )
    }
  }

  // 3. Validate File Size
  if (maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      throw new Error(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum limit of ${maxSizeMB}MB.`
      )
    }
  }

  const filePath = generateSafePath(file.name, folder)

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      const parsed = parseSupabaseError(uploadError)
      throw new Error(parsed.hint ? `${parsed.message} — ${parsed.hint}` : parsed.message)
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!data?.publicUrl) {
      throw new Error(`Failed to generate public URL for uploaded file in bucket "${bucket}".`)
    }

    return data.publicUrl
  } catch (err: unknown) {
    const parsed = parseSupabaseError(err)
    throw new Error(parsed.message || `Upload to bucket "${bucket}" failed.`)
  }
}

/**
 * Upload an Image (Covers, Studio, Gallery, Assets)
 */
export async function uploadImage(bucket: AllowedBucket = 'covers', file: File, folder?: string): Promise<string> {
  return uploadToStorage({
    bucket,
    file,
    folder,
    allowedMimeTypes: DEFAULT_IMAGE_MIMES,
    maxSizeMB: 10,
  })
}

/**
 * Upload Audio Track / Beat to 'music' bucket
 */
export async function uploadAudio(file: File, folder = 'tracks'): Promise<string> {
  return uploadToStorage({
    bucket: 'music',
    file,
    folder,
    allowedMimeTypes: DEFAULT_AUDIO_MIMES,
    maxSizeMB: 100,
  })
}

/**
 * Upload Video to 'videos' bucket
 */
export async function uploadVideo(file: File, folder = 'gallery'): Promise<string> {
  return uploadToStorage({
    bucket: 'videos',
    file,
    folder,
    allowedMimeTypes: DEFAULT_VIDEO_MIMES,
    maxSizeMB: 500,
  })
}

/**
 * Delete a file from a Supabase Storage bucket by its public URL or path
 */
export async function deleteFromStorage(bucket: AllowedBucket, fileUrlOrPath: string): Promise<void> {
  if (!isSupabaseConfigured || !fileUrlOrPath) return

  try {
    // Extract relative path if full URL was provided
    let path = fileUrlOrPath
    if (fileUrlOrPath.includes(`/storage/v1/object/public/${bucket}/`)) {
      path = fileUrlOrPath.split(`/storage/v1/object/public/${bucket}/`)[1]
    } else if (fileUrlOrPath.startsWith('http')) {
      const urlObj = new URL(fileUrlOrPath)
      const parts = urlObj.pathname.split(`/${bucket}/`)
      if (parts.length > 1) {
        path = parts[1]
      }
    }

    if (path) {
      await supabase.storage.from(bucket).remove([path])
    }
  } catch (err) {
    console.warn(`[Storage Cleanup] Failed to delete ${fileUrlOrPath} from ${bucket}:`, err)
  }
}
