-- ============================================================
-- PATIZAN RECORDS — Services & Service Packages Schema + Seed
-- Execute this script in your Supabase SQL Editor.
-- ============================================================

-- 1. Create services table
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

-- 2. Create service_packages table
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

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active_order ON public.services(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON public.service_packages(service_id);

-- 4. Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public select services" ON public.services;
DROP POLICY IF EXISTS "Admins manage services" ON public.services;
DROP POLICY IF EXISTS "Public select service_packages" ON public.service_packages;
DROP POLICY IF EXISTS "Admins manage service_packages" ON public.service_packages;

-- 6. Define Policies:
-- Services
CREATE POLICY "Public select services" ON public.services
  FOR SELECT USING (is_active = TRUE OR (SELECT public.is_admin()) OR auth.role() = 'authenticated');

CREATE POLICY "Admins manage services" ON public.services
  FOR ALL USING ((SELECT public.is_admin()) OR auth.role() = 'authenticated')
  WITH CHECK ((SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- Service Packages
CREATE POLICY "Public select service_packages" ON public.service_packages
  FOR SELECT USING (is_active = TRUE OR (SELECT public.is_admin()) OR auth.role() = 'authenticated');

CREATE POLICY "Admins manage service_packages" ON public.service_packages
  FOR ALL USING ((SELECT public.is_admin()) OR auth.role() = 'authenticated')
  WITH CHECK ((SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- 7. Seed Official Services (with deterministic UUIDs & UPSERT)
INSERT INTO public.services (id, name, slug, short_description, description, image_url, starting_price, is_featured, is_active, display_order)
VALUES
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'Recording',
    'recording',
    'Professional vocal and instrument recording sessions with industry-standard signal chain.',
    'State-of-the-art recording environment designed for artists, bands, and solo performers. Achieve the perfect take with our professional-grade microphones, acoustic treatment, and experienced engineers.',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=85&auto=format&fit=crop',
    40.00,
    TRUE,
    TRUE,
    1
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678902',
    'Podcast',
    'podcast',
    'Professional podcast recording and production with broadcast microphones.',
    'Launch or elevate your podcast with crystal-clear audio quality. Dedicated multi-track podcast desk setup with acoustic isolation.',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80&auto=format&fit=crop',
    40.00,
    FALSE,
    TRUE,
    2
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678903',
    'Voice Over',
    'voice-over',
    'Crystal-clear voice over recordings for commercials, audiobooks, and media.',
    'From commercial spots to audiobooks and dubbing, our voice over sessions deliver pristine, broadcast-ready vocal clarity.',
    'https://images.unsplash.com/photo-1589903188900-85dae523342b?w=800&q=80&auto=format&fit=crop',
    40.00,
    FALSE,
    TRUE,
    3
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678904',
    'Mixing & Mastering',
    'mixing-mastering',
    'Transform rough recordings into radio-ready, commercially competitive masters.',
    'Our engineers bring analog warmth and digital surgical precision to every track. Full stem mixing, stereo balance, and streaming-compliant loudness mastering.',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80&auto=format&fit=crop',
    75.00,
    FALSE,
    TRUE,
    4
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678905',
    'Beat Production',
    'beat-production',
    'Custom, exclusive beat production by in-house producers across all genres.',
    'Commission original, industry-ready beats tailored to your unique sound. We cover Drill, Afro, Compas, Amapiano, Hip-Hop, and Trap.',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80&auto=format&fit=crop',
    50.00,
    FALSE,
    TRUE,
    5
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678906',
    'Streaming',
    'streaming',
    'Live streaming setup and multi-camera broadcast production.',
    'Professional live streaming for concerts, creator events, and live DJ sets with studio-grade audio routing.',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80&auto=format&fit=crop',
    75.00,
    FALSE,
    TRUE,
    6
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678907',
    'Jingle',
    'jingle',
    'Custom sonic branding and jingles for businesses and advertising.',
    'Create memorable sonic signatures and brand anthems that stick in your audience’s mind.',
    'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&q=80&auto=format&fit=crop',
    100.00,
    FALSE,
    TRUE,
    7
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678908',
    'DJ Tag',
    'dj-tag',
    'Custom vocal DJ tags and drops for producers and DJs.',
    'Custom signature voice tags, drops, and sweeps processed with vocal FX.',
    'https://images.unsplash.com/photo-1571266028243-d220c6a3adc0?w=800&q=80&auto=format&fit=crop',
    25.00,
    FALSE,
    TRUE,
    8
  ),
  (
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678909',
    'Commercial Spot Production',
    'commercial-spot',
    'Full commercial audio production for radio, television, and social ads.',
    'End-to-end commercial audio production from voice casting and sound design to final loudness delivery.',
    'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80&auto=format&fit=crop',
    150.00,
    FALSE,
    TRUE,
    9
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  image_url = COALESCE(services.image_url, EXCLUDED.image_url),
  starting_price = EXCLUDED.starting_price,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- 8. Seed Service Packages for Recording
INSERT INTO public.service_packages (id, service_id, name, duration_hours, price, description, engineer_included, is_featured, is_active, display_order)
VALUES
  (
    'c1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'Basic — 1 Hour',
    1.0,
    40.00,
    'Quick recording sessions for singles, vocals or demos. Studio time included.',
    FALSE,
    FALSE,
    TRUE,
    1
  ),
  (
    'c1b2c3d4-e5f6-4a5b-8c9d-012345678902',
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'Standard — 2 Hours',
    2.0,
    75.00,
    'For multiple takes, vocal doubling and layering. Studio time included.',
    FALSE,
    FALSE,
    TRUE,
    2
  ),
  (
    'c1b2c3d4-e5f6-4a5b-8c9d-012345678903',
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'Half Day — 4 Hours',
    4.0,
    140.00,
    'For serious recording, EP development and extended sessions. Includes dedicated engineer.',
    TRUE,
    FALSE,
    TRUE,
    3
  ),
  (
    'c1b2c3d4-e5f6-4a5b-8c9d-012345678904',
    'b1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'Full Day — 8 Hours',
    8.0,
    260.00,
    'Complete album recording, full band tracking or intensive lockout session with engineer.',
    TRUE,
    TRUE,
    TRUE,
    4
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  duration_hours = EXCLUDED.duration_hours,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  engineer_included = EXCLUDED.engineer_included,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;
