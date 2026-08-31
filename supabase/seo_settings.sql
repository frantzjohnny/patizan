-- ============================================================
-- PATIZAN RECORDS — SEO & Social Sharing Settings Schema
-- Execute this script in your Supabase SQL Editor.
-- ============================================================

-- 1. Add SEO columns to site_settings if they do not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'seo_title') THEN
    ALTER TABLE public.site_settings ADD COLUMN seo_title TEXT DEFAULT 'Patizan Records | Recording Studio in Tamarac, FL';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'og_image_url') THEN
    ALTER TABLE public.site_settings ADD COLUMN og_image_url TEXT DEFAULT 'https://patizanrecords.com/images/og-default.svg';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'canonical_url') THEN
    ALTER TABLE public.site_settings ADD COLUMN canonical_url TEXT DEFAULT 'https://patizanrecords.com';
  END IF;
END $$;

-- 2. Update default site_settings row with SEO defaults if null
UPDATE public.site_settings
SET
  seo_title = COALESCE(seo_title, 'Patizan Records | Recording Studio in Tamarac, FL'),
  meta_description = COALESCE(meta_description, 'Professional recording, music production, mixing, mastering, podcast and creative studio services in Tamarac, Florida.'),
  og_image_url = COALESCE(og_image_url, 'https://patizanrecords.com/images/og-default.svg'),
  canonical_url = COALESCE(canonical_url, 'https://patizanrecords.com')
WHERE id IS NOT NULL;
