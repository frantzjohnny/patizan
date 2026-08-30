/**
 * PATIZAN RECORDS — Supabase Error Translation & Normalization Utility
 * Converts raw PostgreSQL, Supabase Auth, and Storage errors into descriptive, actionable messages.
 */

export interface ParsedSupabaseError {
  title: string
  message: string
  code?: string
  hint?: string
  isConfigurationError: boolean
}

export function parseSupabaseError(error: unknown, fallbackMessage = 'An unexpected error occurred'): ParsedSupabaseError {
  if (!error) {
    return {
      title: 'Success',
      message: '',
      isConfigurationError: false,
    }
  }

  // If error is already a string
  if (typeof error === 'string') {
    return {
      title: 'Operation Failed',
      message: error,
      isConfigurationError: false,
    }
  }

  const err = error as Record<string, unknown>
  const code = (err.code as string) || (err.status as string) || ''
  const rawMessage = (err.message as string) || (err.error_description as string) || ''
  const details = (err.details as string) || ''
  const hint = (err.hint as string) || ''

  // 1. Missing or unconfigured Supabase environment
  if (
    rawMessage.includes('placeholder') ||
    rawMessage.includes('your-project') ||
    rawMessage.includes('Invalid API key') ||
    rawMessage.includes('anon-key') ||
    rawMessage.includes('Failed to fetch') ||
    code === 'PGRST301'
  ) {
    return {
      title: 'Supabase Not Configured',
      message:
        'Cannot connect to Supabase. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set with valid Supabase project credentials in your .env file.',
      code,
      hint: 'Verify your .env configuration and restart your development server.',
      isConfigurationError: true,
    }
  }

  // 2. PostgreSQL Table does not exist (42P01 or PGRST205)
  if (code === '42P01' || code === 'PGRST205' || (rawMessage.includes('relation') && rawMessage.includes('does not exist')) || rawMessage.includes('schema cache')) {
    const tableMatch = rawMessage.match(/table 'public\.([^']+)'/) || rawMessage.match(/relation "([^"]+)" does not exist/)
    const tableName = tableMatch ? tableMatch[1] : 'database table'
    return {
      title: 'Database Table Not Initialized',
      message: `The database table "${tableName}" is not initialized in your Supabase project.`,
      code,
      hint: 'Run supabase/setup_complete.sql in the Supabase SQL Editor to initialize all tables.',
      isConfigurationError: true,
    }
  }

  // 3. PostgreSQL Column does not exist (42703)
  if (code === '42703' || (rawMessage.includes('column') && rawMessage.includes('does not exist'))) {
    const colMatch = rawMessage.match(/column "([^"]+)" of relation "([^"]+)" does not exist/)
    const colName = colMatch ? `${colMatch[2]}.${colMatch[1]}` : 'requested column'
    return {
      title: 'Database Schema Out of Date',
      message: `The column "${colName}" is missing in your Supabase database schema.`,
      code,
      hint: 'Run supabase/setup_complete.sql in the Supabase SQL Editor.',
      isConfigurationError: true,
    }
  }

  // 4. RLS Permission Denied / Access Violation (42501)
  if (code === '42501' || rawMessage.toLowerCase().includes('row-level security') || rawMessage.toLowerCase().includes('permission denied')) {
    return {
      title: 'Admin Permission Required',
      message: 'Unable to perform this action. Check your admin permissions or sign in again.',
      code,
      hint: 'Verify your user is authorized in the admin_users table.',
      isConfigurationError: false,
    }
  }

  // 5. Storage Bucket Missing or Not Found
  if (rawMessage.toLowerCase().includes('bucket not found') || rawMessage.toLowerCase().includes('bucket does not exist')) {
    return {
      title: 'Storage Bucket Not Found',
      message: 'Unable to upload image or media. The storage bucket is not configured in Supabase.',
      code,
      hint: 'Run supabase/setup_complete.sql in Supabase SQL Editor to create all storage buckets.',
      isConfigurationError: true,
    }
  }

  // 6. Storage Object Policy Denied
  if (rawMessage.toLowerCase().includes('storage') && (rawMessage.toLowerCase().includes('policy') || rawMessage.toLowerCase().includes('denied') || rawMessage.toLowerCase().includes('unauthorized'))) {
    return {
      title: 'Storage Permission Denied',
      message: 'Unable to upload media. Check your admin storage permissions.',
      code,
      hint: 'Verify that storage RLS policies in supabase/setup_complete.sql are applied.',
      isConfigurationError: false,
    }
  }

  // 7. Duplicate Key / Unique constraint (23505)
  if (code === '23505' || rawMessage.includes('duplicate key')) {
    return {
      title: 'Duplicate Record',
      message: 'A record with this identifier, name, or slug already exists. Please choose a unique name.',
      code,
      hint: details || 'Use a different title or slug.',
      isConfigurationError: false,
    }
  }

  // 8. Foreign Key Violation (23503)
  if (code === '23503' || rawMessage.includes('violates foreign key constraint')) {
    return {
      title: 'Linked Record Not Found',
      message: 'The associated category, service, or track was not found.',
      code,
      hint: details || 'Verify referenced record exists before linking.',
      isConfigurationError: false,
    }
  }

  // 9. Payload Too Large (413)
  if (code === '413' || rawMessage.toLowerCase().includes('too large') || rawMessage.toLowerCase().includes('file size')) {
    return {
      title: 'File Size Exceeded',
      message: 'The file exceeds the maximum allowed size (Images: 10MB, Audio: 100MB, Video: 500MB).',
      code,
      hint: 'Please compress or choose a smaller file.',
      isConfigurationError: false,
    }
  }

  // 10. Default / Fallback
  return {
    title: 'Operation Failed',
    message: rawMessage || details || fallbackMessage,
    code,
    hint,
    isConfigurationError: false,
  }
}

/**
 * Returns a human-friendly string for display in toast notifications or UI banners.
 */
export function getErrorMessage(error: unknown, fallback = 'Operation failed'): string {
  const parsed = parseSupabaseError(error, fallback)
  if (parsed.hint && parsed.isConfigurationError) {
    return `${parsed.message} (${parsed.hint})`
  }
  return parsed.message || fallback
}
