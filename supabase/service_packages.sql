-- ============================================================
-- PATIZAN RECORDS — Service Packages Migration & Seed
-- Run this script in your Supabase SQL Editor.
-- ============================================================

-- 1. Create service_packages table if not exists
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

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON public.service_packages(service_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_active_order ON public.service_packages(is_active, display_order);

-- 3. Row Level Security
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select service_packages" ON public.service_packages;
DROP POLICY IF EXISTS "Admins manage service_packages" ON public.service_packages;

CREATE POLICY "Public select service_packages" ON public.service_packages
  FOR SELECT USING (is_active = TRUE OR (SELECT public.is_admin()) OR auth.role() = 'authenticated');

CREATE POLICY "Admins manage service_packages" ON public.service_packages
  FOR ALL USING ((SELECT public.is_admin()) OR auth.role() = 'authenticated')
  WITH CHECK ((SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- 4. Delete existing recording packages if any to ensure clean, duplicate-free state
DELETE FROM public.service_packages
WHERE service_id IN (SELECT id FROM public.services WHERE slug = 'recording');

-- 5. Seed Official Recording Packages ($40, $75, $140, $300)
INSERT INTO public.service_packages (service_id, name, duration_hours, price, description, engineer_included, is_featured, is_active, display_order)
SELECT
  s.id,
  pkg.name,
  pkg.duration_hours,
  pkg.price,
  pkg.description,
  pkg.engineer_included,
  pkg.is_featured,
  pkg.is_active,
  pkg.display_order
FROM public.services s
CROSS JOIN (
  VALUES
    (
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
      'Full Session — 8 Hours',
      8.0,
      300.00,
      'Complete studio lockout for album tracking and major projects. Full engineer support included.',
      TRUE,
      TRUE,
      TRUE,
      4
    )
) AS pkg(name, duration_hours, price, description, engineer_included, is_featured, is_active, display_order)
WHERE s.slug = 'recording';
