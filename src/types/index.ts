export type UserRole = 'admin' | 'staff'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url?: string | null
  role?: 'admin' | 'staff'
  created_at: string
  updated_at: string
}

export interface StudioInfo {
  id: string
  name: string
  tagline?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  phone?: string
  email?: string
  instagram?: string
  website?: string
  maps_embed_url?: string
  about_text?: string
  mission_text?: string
  created_at?: string
  updated_at?: string
}

export interface SiteSettings {
  id: string
  studio_name: string
  tagline?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  instagram_handle?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  facebook_url?: string | null
  hero_title?: string | null
  hero_subtitle?: string | null
  hero_cta_primary?: string | null
  hero_cta_secondary?: string | null
  hero_image_url?: string | null
  logo_url?: string | null
  favicon_url?: string | null
  promo_message?: string | null
  promo_message_enabled?: boolean
  announcement_banner?: string | null
  announcement_banner_enabled?: boolean
  footer_tagline?: string | null
  studio_policy?: string | null
  deposit_percentage?: number | null
  meta_description?: string | null
  facebook?: string | null
  youtube?: string | null
  tiktok?: string | null
  google_maps_url?: string | null
  google_maps_embed?: string | null
  created_at: string
  updated_at: string
  [key: string]: any
}

export type HeroImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  background_image: string
  image_position?: HeroImagePosition | string | null
  primary_button_text: string | null
  primary_button_link: string | null
  secondary_button_text: string | null
  secondary_button_link: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  slug: string
  short_description: string | null
  description: string | null
  starting_price: number | null
  image_url?: string | null
  icon_name?: string | null
  is_featured?: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ServicePackage {
  id: string
  service_id: string
  name: string
  duration_hours: number
  price: number
  description: string | null
  engineer_included: boolean
  is_featured?: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  service?: Service
}

export type BookingStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'

export interface Booking {
  id: string
  service_id: string
  package_id: string | null
  full_name: string
  artist_name: string | null
  email: string
  phone: string
  instagram: string | null
  preferred_date: string
  preferred_start_time: string
  session_duration_hours: number
  number_of_people: number
  additional_notes: string | null
  policy_acknowledged: boolean
  status: BookingStatus
  admin_notes: string | null
  confirmed_date: string | null
  confirmed_start_time: string | null
  confirmed_end_time: string | null
  created_at: string
  updated_at: string
  service?: Service
  package?: ServicePackage
}

export interface BeatCategory {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  created_at: string
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  audio_url: string
  cover_url: string | null
  duration_seconds: number | null
  bpm: number | null
  key: string | null
  genre: string | null
  price: number | null
  is_beat: boolean
  beat_category_id: string | null
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
  beat_category?: BeatCategory
}

export interface Playlist {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  is_active_website_playlist: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface GalleryCategory {
  id: string
  name: string
  slug: string
  display_order: number
  created_at: string
}

export interface GalleryItem {
  id: string
  category_id: string | null
  title: string | null
  description: string | null
  media_type: 'image' | 'video' | 'youtube' | 'vimeo'
  url: string
  thumbnail_url: string | null
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
  category?: GalleryCategory
}

export interface Artist {
  id: string
  name: string
  bio?: string | null
  photo_url: string | null
  spotify_url?: string | null
  apple_music_url?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: string
  name: string
  role: string | null
  photo_url: string | null
  rating: number | null
  testimonial: string
  is_featured: boolean
  display_order: number
  created_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface BlogPost {
  id: string
  category_id: string | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  author: string | null
  is_featured: boolean
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  category?: BlogCategory
}

export interface StudioAvailability {
  id: string
  day_of_week: number
  is_open: boolean
  open_time: string
  close_time: string
  slot_duration_minutes?: number
  created_at: string
  updated_at: string
}

export interface BlockedTime {
  id: string
  date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  is_all_day?: boolean
  is_full_day?: boolean
  created_at: string
}

export interface Customer {
  id: string
  full_name: string
  email: string
  phone: string | null
  instagram: string | null
  total_bookings: number
  created_at: string
}
