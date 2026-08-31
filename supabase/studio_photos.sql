-- ============================================================
-- PATIZAN RECORDS — Studio Photos Library Table & Functions
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

-- 3. Create studio_photos table
CREATE TABLE IF NOT EXISTS public.studio_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  category TEXT NOT NULL DEFAULT 'control-room',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_seo_image BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_studio_photos_active_order ON public.studio_photos (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_studio_photos_category ON public.studio_photos (category);
CREATE INDEX IF NOT EXISTS idx_studio_photos_order ON public.studio_photos (display_order);

-- 5. Enforce at most ONE active SEO image via Partial Unique Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_photos_seo_unique 
  ON public.studio_photos (is_seo_image) 
  WHERE is_seo_image = TRUE;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.studio_photos ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public can read active studio photos" ON public.studio_photos;
DROP POLICY IF EXISTS "Admins manage studio photos" ON public.studio_photos;
DROP POLICY IF EXISTS "Public select studio_photos" ON public.studio_photos;
DROP POLICY IF EXISTS "Admins manage studio_photos" ON public.studio_photos;

-- 8. Define Policies:
-- Public can view active studio photos (and admins can view all)
CREATE POLICY "Public select studio_photos" ON public.studio_photos
  FOR SELECT USING (is_active = TRUE OR (SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- Authenticated admins can insert/update/delete
CREATE POLICY "Admins manage studio_photos" ON public.studio_photos
  FOR ALL USING ((SELECT public.is_admin()) OR auth.role() = 'authenticated')
  WITH CHECK ((SELECT public.is_admin()) OR auth.role() = 'authenticated');

-- 9. Stored Procedure: Atomically set official SEO image
CREATE OR REPLACE FUNCTION public.set_studio_photo_seo(target_photo_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_url TEXT;
BEGIN
  -- Verify target photo exists
  SELECT image_url INTO target_url FROM public.studio_photos WHERE id = target_photo_id;
  IF target_url IS NULL THEN
    RAISE EXCEPTION 'Studio photo not found';
  END IF;

  -- Clear previous SEO flag across all studio photos
  UPDATE public.studio_photos
  SET is_seo_image = FALSE, updated_at = NOW()
  WHERE is_seo_image = TRUE;

  -- Set target photo as official SEO image
  UPDATE public.studio_photos
  SET is_seo_image = TRUE, updated_at = NOW()
  WHERE id = target_photo_id;

  -- Update global site_settings og_image_url to match
  UPDATE public.site_settings
  SET og_image_url = target_url, updated_at = NOW()
  WHERE id IS NOT NULL;
END;
$$;

-- 10. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
