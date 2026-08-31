-- ============================================================
-- PATIZAN RECORDS — Hero Slider Schema & Seed Data
-- ============================================================

-- Create hero_slides table
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

-- If table already existed without image_position column:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'image_position'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN image_position TEXT DEFAULT 'center';
  END IF;
END $$;

-- Indexes for fast ordering and active slide filtering
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order ON hero_slides(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(display_order);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read active hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Admins manage hero slides" ON hero_slides;

-- Public visitors can read active hero slides
CREATE POLICY "Public can read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = TRUE);

-- Admins can create, read, update, delete hero slides
CREATE POLICY "Admins manage hero slides" ON hero_slides
  FOR ALL USING (is_admin());

-- Default Hero Content Seed (Refined American English Copy)
INSERT INTO hero_slides (id, title, subtitle, description, background_image, image_position, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, is_active, display_order)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'YOUR SOUND.\nYOUR SPACE.',
    'PATIZAN RECORDS',
    'A professional recording environment built for artists, producers and creators in South Florida.',
    'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1920&q=85&auto=format&fit=crop',
    'center',
    'BOOK A SESSION',
    '/book-session',
    'EXPLORE THE STUDIO',
    '/studio',
    TRUE,
    1
  ),
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-012345678902',
    'TURN YOUR IDEAS\nINTO SOUND.',
    'RECORDING • PRODUCTION • MIXING',
    'From the first take to the final master, create music in a professional studio designed around your sound.',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1920&q=85&auto=format&fit=crop',
    'center',
    'BOOK A SESSION',
    '/book-session',
    'OUR SERVICES',
    '/services',
    TRUE,
    2
  ),
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-012345678903',
    'MAKE SOMETHING\nPEOPLE REMEMBER.',
    'MUSIC PRODUCTION',
    'Professional recording, beat production, mixing and mastering for artists ready to elevate their sound.',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=85&auto=format&fit=crop',
    'center',
    'BOOK A SESSION',
    '/book-session',
    'EXPLORE MUSIC',
    '/music',
    TRUE,
    3
  ),
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-012345678904',
    'YOUR VOICE\nDESERVES A STUDIO.',
    'PODCAST • VOICE • CONTENT',
    'Professional recording for podcasts, voiceovers, commercials and digital content.',
    'https://images.unsplash.com/photo-1589903188900-85dae523342b?w=1920&q=85&auto=format&fit=crop',
    'center',
    'BOOK A SESSION',
    '/book-session',
    'VIEW SERVICES',
    '/services',
    TRUE,
    4
  ),
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-012345678905',
    'WHERE SOUND\nBECOMES CULTURE.',
    'SOUTH FLORIDA RECORDING STUDIO',
    'A creative studio in Tamarac, Florida built for artists, producers and creators.',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=85&auto=format&fit=crop',
    'center',
    'BOOK A SESSION',
    '/book-session',
    'VISIT THE STUDIO',
    '/studio',
    TRUE,
    5
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  background_image = EXCLUDED.background_image,
  image_position = EXCLUDED.image_position,
  primary_button_text = EXCLUDED.primary_button_text,
  primary_button_link = EXCLUDED.primary_button_link,
  secondary_button_text = EXCLUDED.secondary_button_text,
  secondary_button_link = EXCLUDED.secondary_button_link,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;
