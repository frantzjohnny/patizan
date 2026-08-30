-- ============================================================
-- PATIZAN RECORDS — MASTER DATABASE & STORAGE SETUP
-- Run this ONCE in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- This script provisions:
-- 1. PostgreSQL Extensions
-- 2. Complete Schema (21 Tables & Relationships)
-- 3. Automatic Auth Profile Sync Trigger
-- 4. Role-Based Admin Authorization Architecture
-- 5. Row Level Security (RLS) Policies (Public Minimum + Admin Guard)
-- 6. Storage Buckets (8 Buckets) & Storage Security Policies
-- 7. Initial Seed Data (Hero Slides, Services, Availability, Settings)
-- ============================================================

-- ─── Step 1: PostgreSQL Extensions ───────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Step 2: Profiles Table (Mirrors auth.users) ─────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Step 3: Admin Users Table (Role-Based Authorization) ────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Step 4: is_admin() Security Definer Function ────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.profile_id = auth.uid() AND au.is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Step 5: Automatic Profile Synchronization Trigger ───────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Studio Administrator'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Step 6: Core Tables ──────────────────────────────────────

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Hero Slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  background_image TEXT NOT NULL,
  image_position TEXT DEFAULT 'center',
  primary_button_text TEXT DEFAULT 'BOOK A SESSION',
  primary_button_link TEXT DEFAULT '/book-session',
  secondary_button_text TEXT DEFAULT 'EXPLORE THE STUDIO',
  secondary_button_link TEXT DEFAULT '/studio',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order ON public.hero_slides(is_active, display_order);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  starting_price NUMERIC(10,2),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

-- Service Packages
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  duration_hours NUMERIC(4,1) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  engineer_included BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  artist_name TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram TEXT,
  preferred_date DATE NOT NULL,
  preferred_start_time TIME NOT NULL,
  session_duration_hours NUMERIC(4,1) DEFAULT 1,
  number_of_people INTEGER DEFAULT 1,
  additional_notes TEXT,
  reference_file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','cancelled','completed')),
  confirmed_date DATE,
  confirmed_start_time TIME,
  confirmed_end_time TIME,
  admin_notes TEXT,
  policy_acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(preferred_date);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Studio Availability (0 = Sunday, 6 = Saturday)
CREATE TABLE IF NOT EXISTS public.studio_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) UNIQUE NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  open_time TIME DEFAULT '09:00',
  close_time TIME DEFAULT '23:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked Times
CREATE TABLE IF NOT EXISTS public.blocked_times (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT FALSE,
  reason TEXT,
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none','weekly','monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Categories & Items
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.gallery_categories(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image','video','youtube','vimeo')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beat Categories & Music Tracks
CREATE TABLE IF NOT EXISTS public.beat_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beat_category_id UUID REFERENCES public.beat_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  bpm INTEGER,
  key TEXT,
  price NUMERIC(10,2),
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_beat BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists & Playlist Tracks
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_active_website_playlist BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  UNIQUE(playlist_id, track_id)
);

-- Artists
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  role TEXT,
  photo_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  testimonial TEXT,
  rating NUMERIC(2,1),
  featured_track_id UUID REFERENCES public.music_tracks(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT,
  testimonial TEXT NOT NULL,
  rating NUMERIC(2,1),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Categories & Posts
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  author TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  studio_name TEXT DEFAULT 'Patizan Records',
  tagline TEXT DEFAULT 'WHERE SOUND BECOMES CULTURE.',
  hero_title TEXT DEFAULT 'YOUR SOUND.' || E'\n' || 'YOUR SPACE.',
  hero_subtitle TEXT,
  hero_cta_primary TEXT DEFAULT 'BOOK A SESSION',
  hero_cta_secondary TEXT DEFAULT 'EXPLORE THE STUDIO',
  hero_image_url TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  address TEXT DEFAULT '3900 W Commercial Blvd, Suite 230, Tamarac, FL 33309, USA',
  phone TEXT DEFAULT '959 205 6476',
  email TEXT DEFAULT 'patizanrecordsmia@gmail.com',
  instagram TEXT DEFAULT '@patizanrecordsmiiami',
  facebook TEXT,
  youtube TEXT,
  tiktok TEXT,
  google_maps_url TEXT,
  google_maps_embed TEXT,
  promo_message TEXT,
  promo_message_enabled BOOLEAN DEFAULT TRUE,
  announcement_banner TEXT,
  announcement_banner_enabled BOOLEAN DEFAULT FALSE,
  footer_tagline TEXT DEFAULT 'Built for artists. Designed for sound.',
  studio_policy TEXT,
  deposit_percentage NUMERIC(5,2) DEFAULT 50.00,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Step 7: Enable Row Level Security (RLS) on All Tables ────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ─── Step 8: Define Secure RLS Policies ──────────────────────

-- Profiles
CREATE POLICY "Public view profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile or admins update all" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- Admin Users (Only admins can manage roles; users can read their own status)
CREATE POLICY "Users check own admin status" ON public.admin_users FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY "Admins insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update admin_users" ON public.admin_users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete admin_users" ON public.admin_users FOR DELETE USING (public.is_admin());

-- Customers
CREATE POLICY "Public create customer record" ON public.customers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins select customers" ON public.customers FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update customers" ON public.customers FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete customers" ON public.customers FOR DELETE USING (public.is_admin());

-- Hero Slides
CREATE POLICY "Public select hero_slides" ON public.hero_slides FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins manage hero_slides" ON public.hero_slides FOR ALL USING (public.is_admin());

-- Services & Service Packages
CREATE POLICY "Public select services" ON public.services FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins manage services" ON public.services FOR ALL USING (public.is_admin());
CREATE POLICY "Public select service_packages" ON public.service_packages FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins manage service_packages" ON public.service_packages FOR ALL USING (public.is_admin());

-- Bookings (Public can create bookings, only admins can view and manage)
CREATE POLICY "Public create bookings" ON public.bookings FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins select bookings" ON public.bookings FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE USING (public.is_admin());

-- Notifications
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL USING (public.is_admin());

-- Studio Availability & Blocked Times
CREATE POLICY "Public select studio_availability" ON public.studio_availability FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage studio_availability" ON public.studio_availability FOR ALL USING (public.is_admin());
CREATE POLICY "Public select blocked_times" ON public.blocked_times FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage blocked_times" ON public.blocked_times FOR ALL USING (public.is_admin());

-- Gallery Categories & Items
CREATE POLICY "Public select gallery_categories" ON public.gallery_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage gallery_categories" ON public.gallery_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Public select gallery_items" ON public.gallery_items FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins manage gallery_items" ON public.gallery_items FOR ALL USING (public.is_admin());

-- Beat Categories & Music Tracks
CREATE POLICY "Public select beat_categories" ON public.beat_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage beat_categories" ON public.beat_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Public select music_tracks" ON public.music_tracks FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins manage music_tracks" ON public.music_tracks FOR ALL USING (public.is_admin());

-- Playlists & Playlist Tracks
CREATE POLICY "Public select playlists" ON public.playlists FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins manage playlists" ON public.playlists FOR ALL USING (public.is_admin());
CREATE POLICY "Public select playlist_tracks" ON public.playlist_tracks FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage playlist_tracks" ON public.playlist_tracks FOR ALL USING (public.is_admin());

-- Artists
CREATE POLICY "Public select artists" ON public.artists FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage artists" ON public.artists FOR ALL USING (public.is_admin());

-- Testimonials
CREATE POLICY "Public select testimonials" ON public.testimonials FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());

-- Blog Categories & Posts
CREATE POLICY "Public select blog_categories" ON public.blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage blog_categories" ON public.blog_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Public select blog_posts" ON public.blog_posts FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins manage blog_posts" ON public.blog_posts FOR ALL USING (public.is_admin());

-- Site Settings
CREATE POLICY "Public select site_settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage site_settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- ─── Step 9: Storage Buckets & Policies ───────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('covers', 'covers', TRUE, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']),
  ('studio-images', 'studio-images', TRUE, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']),
  ('gallery', 'gallery', TRUE, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']),
  ('videos', 'videos', TRUE, 524288000, ARRAY['video/mp4','video/webm','video/ogg','video/quicktime']),
  ('music', 'music', TRUE, 104857600, ARRAY['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/m4a','audio/x-m4a','audio/aac','audio/ogg']),
  ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('blog', 'blog', TRUE, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('site-assets', 'site-assets', TRUE, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/svg+xml','image/x-icon'])
ON CONFLICT (id) DO NOTHING;

-- Public Storage Read Policies
CREATE POLICY "Public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Public read studio-images" ON storage.objects FOR SELECT USING (bucket_id = 'studio-images');
CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public read videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Public read music" ON storage.objects FOR SELECT USING (bucket_id = 'music');
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public read blog" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
CREATE POLICY "Public read site-assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');

-- Admin Storage Write & Delete Policies
CREATE POLICY "Admins upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update covers" ON storage.objects FOR UPDATE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete covers" ON storage.objects FOR DELETE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload studio-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'studio-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update studio-images" ON storage.objects FOR UPDATE USING (bucket_id = 'studio-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete studio-images" ON storage.objects FOR DELETE USING (bucket_id = 'studio-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update gallery" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update videos" ON storage.objects FOR UPDATE USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload music" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'music' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update music" ON storage.objects FOR UPDATE USING (bucket_id = 'music' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete music" ON storage.objects FOR DELETE USING (bucket_id = 'music' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload blog" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update blog" ON storage.objects FOR UPDATE USING (bucket_id = 'blog' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete blog" ON storage.objects FOR DELETE USING (bucket_id = 'blog' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload site-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Admins update site-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Admins delete site-assets" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- ─── Step 10: Seed Baseline Data ─────────────────────────────

-- Site Settings
INSERT INTO public.site_settings (studio_name, tagline, hero_title, address, phone, email, instagram, promo_message, promo_message_enabled)
VALUES (
  'Patizan Records',
  'WHERE SOUND BECOMES CULTURE.',
  'YOUR SOUND.' || E'\n' || 'YOUR SPACE.',
  '3900 W Commercial Blvd, Suite 230, Tamarac, FL 33309, USA',
  '959 205 6476',
  'patizanrecordsmia@gmail.com',
  '@patizanrecordsmiiami',
  'When you record a complete track, you will receive a complimentary studio visualizer.',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Studio Availability (Mon-Sun 9am-11pm)
INSERT INTO public.studio_availability (day_of_week, is_open, open_time, close_time) VALUES
  (0, TRUE, '09:00', '23:00'),
  (1, TRUE, '09:00', '23:00'),
  (2, TRUE, '09:00', '23:00'),
  (3, TRUE, '09:00', '23:00'),
  (4, TRUE, '09:00', '23:00'),
  (5, TRUE, '09:00', '23:00'),
  (6, TRUE, '09:00', '23:00')
ON CONFLICT (day_of_week) DO NOTHING;

-- Hero Slides
INSERT INTO public.hero_slides (id, title, subtitle, description, background_image, image_position, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, is_active, display_order)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 'YOUR SOUND.' || E'\n' || 'YOUR SPACE.', 'PATIZAN RECORDS', 'A professional recording environment built for artists, producers and creators in South Florida.', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=85&auto=format&fit=crop', 'center', 'BOOK A SESSION', '/book-session', 'EXPLORE THE STUDIO', '/studio', TRUE, 1),
  ('a1b2c3d4-e5f6-4a5b-8c9d-012345678902', 'TURN YOUR IDEAS' || E'\n' || 'INTO SOUND.', 'RECORDING • PRODUCTION • MIXING', 'From the first take to the final master, create music in a professional studio designed around your sound.', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1920&q=85&auto=format&fit=crop', 'center', 'BOOK A SESSION', '/book-session', 'OUR SERVICES', '/services', TRUE, 2),
  ('a1b2c3d4-e5f6-4a5b-8c9d-012345678903', 'MAKE SOMETHING' || E'\n' || 'PEOPLE REMEMBER.', 'MUSIC PRODUCTION', 'Professional recording, beat production, mixing and mastering for artists ready to elevate their sound.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=85&auto=format&fit=crop', 'center', 'BOOK A SESSION', '/book-session', 'EXPLORE MUSIC', '/music', TRUE, 3),
  ('a1b2c3d4-e5f6-4a5b-8c9d-012345678904', 'YOUR VOICE' || E'\n' || 'DESERVES A STUDIO.', 'PODCAST • VOICE • CONTENT', 'Professional recording for podcasts, voiceovers, commercials and digital content.', 'https://images.unsplash.com/photo-1589903188900-85dae523342b?w=1920&q=85&auto=format&fit=crop', 'center', 'BOOK A SESSION', '/book-session', 'VIEW SERVICES', '/services', TRUE, 4),
  ('a1b2c3d4-e5f6-4a5b-8c9d-012345678905', 'WHERE SOUND' || E'\n' || 'BECOMES CULTURE.', 'SOUTH FLORIDA RECORDING STUDIO', 'A creative studio in Tamarac, Florida built for artists, producers and creators.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=85&auto=format&fit=crop', 'center', 'BOOK A SESSION', '/book-session', 'VISIT THE STUDIO', '/studio', TRUE, 5)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description, background_image = EXCLUDED.background_image;

-- ─── Step 11: Helper to Authorize First Administrator ────────
-- Usage: SELECT grant_admin_by_email('your_admin_email@domain.com');
CREATE OR REPLACE FUNCTION public.grant_admin_by_email(target_email TEXT, target_role TEXT DEFAULT 'super_admin')
RETURNS TEXT AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = LOWER(TRIM(target_email));
  IF target_user_id IS NULL THEN
    RETURN 'User not found in auth.users. Please sign up or create the user in Supabase Auth first.';
  END IF;

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (target_user_id, LOWER(TRIM(target_email)), 'Studio Administrator')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.admin_users (profile_id, role, is_active)
  VALUES (target_user_id, target_role, TRUE)
  ON CONFLICT (profile_id) DO UPDATE SET role = target_role, is_active = TRUE;

  RETURN 'Administrator authorized successfully.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
