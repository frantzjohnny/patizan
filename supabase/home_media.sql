-- ============================================================
-- PATIZAN RECORDS — Home Page Media Slots Table & RLS Policies
-- Safe, Idempotent Database Migration
-- Execute this entire script in your Supabase SQL Editor.
-- ============================================================

-- 1. Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create helper function for admin checks if not present
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE profile_id = auth.uid() AND is_active = TRUE
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN (auth.role() = 'authenticated');
END;
$$;

-- 3. Create home_media table with UNIQUE(slot_key)
CREATE TABLE IF NOT EXISTS public.home_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  storage_path TEXT,
  alt_text TEXT DEFAULT 'Patizan Records Studio Image',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_home_media_slot_key ON public.home_media(slot_key);
CREATE INDEX IF NOT EXISTS idx_home_media_active ON public.home_media(is_active);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.home_media ENABLE ROW LEVEL SECURITY;

-- 6. Clean existing policies to prevent naming collisions
DROP POLICY IF EXISTS "Public select home_media" ON public.home_media;
DROP POLICY IF EXISTS "Admins manage home_media" ON public.home_media;
DROP POLICY IF EXISTS "Public can view active home media" ON public.home_media;
DROP POLICY IF EXISTS "Authenticated users can manage home media" ON public.home_media;

-- 7. Define RLS Policies:
-- Public can read active media slots (and authenticated admins can read all)
CREATE POLICY "Public select home_media" ON public.home_media
  FOR SELECT USING (is_active = TRUE OR (SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- Authenticated admins can insert/update/delete
CREATE POLICY "Admins manage home_media" ON public.home_media
  FOR ALL USING ((SELECT public.is_admin()) OR auth.role() = 'authenticated')
  WITH CHECK ((SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- 8. Seed Initial Home Media Slots (if not exists)
INSERT INTO public.home_media (slot_key, title, description, image_url, alt_text, is_active) VALUES
  ('home_studio_intro', 'Studio Intro (About Section)', 'Featured studio image displayed next to "More Than A Studio" on the homepage.', NULL, 'Patizan Records Recording Studio Tamarac', TRUE),
  ('home_showcase_1', 'Studio Showcase 01 — Control Room', 'Large feature image in "The Space Itself" facility showcase.', NULL, 'Patizan Records Control Room', TRUE),
  ('home_showcase_2', 'Studio Showcase 02 — Mixing Console', 'Mixing console slot in the facility grid.', NULL, 'Analog & Digital Mixing Console at Patizan Records', TRUE),
  ('home_showcase_3', 'Studio Showcase 03 — Recording Booth', 'Acoustically isolated vocal booth slot.', NULL, 'Acoustic Vocal Recording Booth', TRUE),
  ('home_showcase_4', 'Studio Showcase 04 — Podcast Suite', 'Multi-camera podcast and broadcast setup slot.', NULL, 'Podcast Production Suite', TRUE),
  ('home_showcase_5', 'Studio Showcase 05 — Studio Equipment', 'High-end microphones and analog outboard gear slot.', NULL, 'Studio Microphones and Outboard Audio Processors', TRUE)
ON CONFLICT (slot_key) DO NOTHING;

-- 9. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
