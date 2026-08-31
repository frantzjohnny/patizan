-- ============================================================
-- PATIZAN RECORDS — Home Page Media Slots Table & RLS Policies
-- Execute this script in your Supabase SQL Editor.
-- ============================================================

-- 1. Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create home_media table with UNIQUE(slot_key)
CREATE TABLE IF NOT EXISTS public.home_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  alt_text TEXT DEFAULT 'Patizan Records Studio Image',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_home_media_slot_key ON public.home_media(slot_key);
CREATE INDEX IF NOT EXISTS idx_home_media_active ON public.home_media(is_active);

-- 4. Enable Row Level Security
ALTER TABLE public.home_media ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public select home_media" ON public.home_media;
DROP POLICY IF EXISTS "Admins manage home_media" ON public.home_media;
DROP POLICY IF EXISTS "Public can view active home media" ON public.home_media;
DROP POLICY IF EXISTS "Authenticated users can manage home media" ON public.home_media;

-- 6. Define Policies:
-- Public can view active media
CREATE POLICY "Public select home_media" ON public.home_media
  FOR SELECT USING (is_active = TRUE OR (SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- Authenticated admins can insert/update/delete
CREATE POLICY "Admins manage home_media" ON public.home_media
  FOR ALL USING ((SELECT public.is_admin()) OR auth.role() = 'authenticated')
  WITH CHECK ((SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- 7. Seed Initial Home Media Slots (if not exists)
INSERT INTO public.home_media (slot_key, title, description, image_url, alt_text, is_active) VALUES
  ('home_studio_intro', 'Studio Intro (About Section)', 'Featured studio image displayed next to "More Than A Studio" on the homepage.', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80', 'Patizan Records Recording Studio Tamarac', TRUE),
  ('home_showcase_1', 'Studio Showcase 01 — Control Room', 'Large feature image in "The Space Itself" facility showcase.', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80', 'Patizan Records Control Room', TRUE),
  ('home_showcase_2', 'Studio Showcase 02 — Mixing Console', 'Mixing console slot in the facility grid.', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80', 'Analog & Digital Mixing Console at Patizan Records', TRUE),
  ('home_showcase_3', 'Studio Showcase 03 — Recording Booth', 'Acoustically isolated vocal booth slot.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', 'Acoustic Vocal Recording Booth', TRUE),
  ('home_showcase_4', 'Studio Showcase 04 — Podcast Suite', 'Multi-camera podcast and broadcast setup slot.', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80', 'Podcast Production Suite', TRUE),
  ('home_showcase_5', 'Studio Showcase 05 — Studio Equipment', 'High-end microphones and analog outboard gear slot.', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80', 'Studio Microphones and Outboard Audio Processors', TRUE)
ON CONFLICT (slot_key) DO NOTHING;
