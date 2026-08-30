-- ============================================================
-- PATIZAN RECORDS — Complete Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Profiles (extends auth.users) ─────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Admin Users ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Customers ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ─── Hero Slides ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hero_slides (
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

CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order ON hero_slides(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(display_order);

-- ─── Services ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
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

-- ─── Service Packages ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
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

-- ─── Bookings ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

-- ─── Booking Status History ─────────────────────────────────

CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Studio Availability ────────────────────────────────────

CREATE TABLE IF NOT EXISTS studio_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) UNIQUE NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  open_time TIME DEFAULT '09:00',
  close_time TIME DEFAULT '23:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Blocked Times ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blocked_times (
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

-- ─── Gallery Categories ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ─── Gallery Items ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES gallery_categories(id) ON DELETE SET NULL,
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

-- ─── Beat Categories ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS beat_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ─── Music Tracks ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beat_category_id UUID REFERENCES beat_categories(id) ON DELETE SET NULL,
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

-- ─── Playlists ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_active_website_playlist BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Playlist Tracks ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  UNIQUE(playlist_id, track_id)
);

-- ─── Artists ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS artists (
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
  featured_track_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Testimonials ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
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

-- ─── Blog Categories ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ─── Blog Posts ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  author TEXT NOT NULL DEFAULT 'Patizan Records',
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);

-- ─── Site Settings ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  studio_name TEXT DEFAULT 'Patizan Records',
  tagline TEXT,
  hero_title TEXT DEFAULT 'YOUR SOUND. YOUR SPACE.',
  hero_subtitle TEXT DEFAULT 'Professional recording, production, mixing, mastering and creative studio services in Tamarac, Florida.',
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
  google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=3900+W+Commercial+Blvd+Tamarac+FL',
  google_maps_embed TEXT,
  promo_message TEXT DEFAULT 'When you record a complete music, you''ll receive a free visualizer in the studio.',
  promo_message_enabled BOOLEAN DEFAULT TRUE,
  announcement_banner TEXT,
  announcement_banner_enabled BOOLEAN DEFAULT FALSE,
  footer_tagline TEXT DEFAULT 'Built for artists. Designed for sound.',
  studio_policy TEXT,
  meta_description TEXT DEFAULT 'Patizan Records — Professional recording studio in Tamarac, FL. Recording, podcast, mixing, mastering and music production services.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Studio Information ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS studio_info (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT DEFAULT 'PATIZAN RECORDS',
  tagline TEXT DEFAULT 'WHERE SOUND BECOMES CULTURE.',
  address TEXT DEFAULT '3900 W Commercial Blvd, Suite 230',
  city TEXT DEFAULT 'Tamarac',
  state TEXT DEFAULT 'FL',
  zip TEXT DEFAULT '33309',
  country TEXT DEFAULT 'USA',
  phone TEXT DEFAULT '959 205 6476',
  email TEXT DEFAULT 'patizanrecordsmia@gmail.com',
  instagram TEXT DEFAULT '@patizanrecordsmiiami',
  website TEXT DEFAULT 'https://patizanrecords.com',
  maps_embed_url TEXT,
  about_text TEXT,
  mission_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new_booking','booking_approved','booking_rejected','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Updated At Trigger Function ────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','customers','services','service_packages','bookings',
    'studio_availability','blocked_times','gallery_items','music_tracks','playlists',
    'artists','testimonials','blog_posts','site_settings']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
      CREATE TRIGGER update_%s_updated_at
        BEFORE UPDATE ON %s
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- ─── Auto-create profile on signup ──────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─── Booking Conflict Check Function ────────────────────────

CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_date DATE,
  p_start_time TIME,
  p_duration_hours NUMERIC,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  p_end_time TIME;
  conflict_count INTEGER;
BEGIN
  p_end_time := p_start_time + (p_duration_hours * INTERVAL '1 hour');
  
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE confirmed_date = p_date
    AND status = 'approved'
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
    AND (
      (confirmed_start_time, confirmed_end_time) OVERLAPS (p_start_time, p_end_time)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE profile_id = auth.uid()
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ─── Profiles RLS ───────────────────────────────────────────
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());

-- ─── Admin Users RLS ────────────────────────────────────────
CREATE POLICY "Admins can view admin list" ON admin_users FOR SELECT USING (is_admin());
CREATE POLICY "Super admins manage admin users" ON admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE profile_id = auth.uid() AND role = 'super_admin' AND is_active = TRUE)
);

-- ─── Customers RLS ──────────────────────────────────────────
CREATE POLICY "Admins manage customers" ON customers FOR ALL USING (is_admin());
CREATE POLICY "Public can insert customer on booking" ON customers FOR INSERT WITH CHECK (TRUE);

-- ─── Services RLS ───────────────────────────────────────────
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage services" ON services FOR ALL USING (is_admin());

-- ─── Service Packages RLS ───────────────────────────────────
CREATE POLICY "Public can read active packages" ON service_packages FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage packages" ON service_packages FOR ALL USING (is_admin());

-- ─── Bookings RLS ───────────────────────────────────────────
CREATE POLICY "Admins manage bookings" ON bookings FOR ALL USING (is_admin());
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- ─── Booking Status History RLS ─────────────────────────────
CREATE POLICY "Admins manage booking history" ON booking_status_history FOR ALL USING (is_admin());
CREATE POLICY "Public can insert history on booking" ON booking_status_history FOR INSERT WITH CHECK (TRUE);

-- ─── Studio Availability RLS ────────────────────────────────
CREATE POLICY "Public can read availability" ON studio_availability FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage availability" ON studio_availability FOR ALL USING (is_admin());

-- ─── Blocked Times RLS ──────────────────────────────────────
CREATE POLICY "Public can read blocked times" ON blocked_times FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage blocked times" ON blocked_times FOR ALL USING (is_admin());

-- ─── Gallery Categories RLS ─────────────────────────────────
CREATE POLICY "Public can read gallery categories" ON gallery_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage gallery categories" ON gallery_categories FOR ALL USING (is_admin());

-- ─── Gallery Items RLS ──────────────────────────────────────
CREATE POLICY "Public can read published gallery" ON gallery_items FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins manage gallery" ON gallery_items FOR ALL USING (is_admin());

-- ─── Beat Categories RLS ────────────────────────────────────
CREATE POLICY "Public can read beat categories" ON beat_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage beat categories" ON beat_categories FOR ALL USING (is_admin());

-- ─── Music Tracks RLS ───────────────────────────────────────
CREATE POLICY "Public can read published tracks" ON music_tracks FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins manage tracks" ON music_tracks FOR ALL USING (is_admin());

-- ─── Playlists RLS ──────────────────────────────────────────
CREATE POLICY "Public can read published playlists" ON playlists FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins manage playlists" ON playlists FOR ALL USING (is_admin());

-- ─── Playlist Tracks RLS ────────────────────────────────────
CREATE POLICY "Public can read playlist tracks" ON playlist_tracks FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage playlist tracks" ON playlist_tracks FOR ALL USING (is_admin());

-- ─── Artists RLS ────────────────────────────────────────────
CREATE POLICY "Public can read artists" ON artists FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage artists" ON artists FOR ALL USING (is_admin());

-- ─── Testimonials RLS ───────────────────────────────────────
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage testimonials" ON testimonials FOR ALL USING (is_admin());

-- ─── Blog Categories RLS ────────────────────────────────────
CREATE POLICY "Public can read blog categories" ON blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage blog categories" ON blog_categories FOR ALL USING (is_admin());

-- ─── Blog Posts RLS ─────────────────────────────────────────
CREATE POLICY "Public can read published posts" ON blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins manage blog posts" ON blog_posts FOR ALL USING (is_admin());

-- ─── Hero Slides RLS ────────────────────────────────────────
CREATE POLICY "Public can read active hero slides" ON hero_slides FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage hero slides" ON hero_slides FOR ALL USING (is_admin());

-- ─── Site Settings RLS ──────────────────────────────────────
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage site settings" ON site_settings FOR ALL USING (is_admin());

-- ─── Studio Info RLS ────────────────────────────────────────
ALTER TABLE studio_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read studio info" ON studio_info FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage studio info" ON studio_info FOR ALL USING (is_admin());

-- ─── Notifications RLS ──────────────────────────────────────
CREATE POLICY "Admins manage notifications" ON notifications FOR ALL USING (is_admin());
CREATE POLICY "Public can insert notifications" ON notifications FOR INSERT WITH CHECK (TRUE);
