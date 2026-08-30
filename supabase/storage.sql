-- ============================================================
-- PATIZAN RECORDS — Supabase Storage Bucket Policies
-- Run in Supabase SQL Editor AFTER creating buckets
-- ============================================================

-- Create storage buckets (run via Supabase Dashboard or API)
-- Or use the SQL below if you have access to storage schema:

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

-- ─── Public read policies ────────────────────────────────────

DROP POLICY IF EXISTS "Public read covers" ON storage.objects;
CREATE POLICY "Public read covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Public read studio-images" ON storage.objects;
CREATE POLICY "Public read studio-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'studio-images');

DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
CREATE POLICY "Public read gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public read videos" ON storage.objects;
CREATE POLICY "Public read videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Public read music" ON storage.objects;
CREATE POLICY "Public read music" ON storage.objects
  FOR SELECT USING (bucket_id = 'music');

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public read blog" ON storage.objects;
CREATE POLICY "Public read blog" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog');

DROP POLICY IF EXISTS "Public read site-assets" ON storage.objects;
CREATE POLICY "Public read site-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

-- ─── Admin write & delete policies ────────────────────────────

DROP POLICY IF EXISTS "Admins upload covers" ON storage.objects;
CREATE POLICY "Admins upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete covers" ON storage.objects;
CREATE POLICY "Admins delete covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins upload studio-images" ON storage.objects;
CREATE POLICY "Admins upload studio-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'studio-images' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete studio-images" ON storage.objects;
CREATE POLICY "Admins delete studio-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'studio-images' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins upload gallery" ON storage.objects;
CREATE POLICY "Admins upload gallery" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete gallery" ON storage.objects;
CREATE POLICY "Admins delete gallery" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins upload videos" ON storage.objects;
CREATE POLICY "Admins upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete videos" ON storage.objects;
CREATE POLICY "Admins delete videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'videos' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins upload music" ON storage.objects;
CREATE POLICY "Admins upload music" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'music' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete music" ON storage.objects;
CREATE POLICY "Admins delete music" ON storage.objects
  FOR DELETE USING (bucket_id = 'music' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins upload avatars" ON storage.objects;
CREATE POLICY "Admins upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete avatars" ON storage.objects;
CREATE POLICY "Admins delete avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins upload blog" ON storage.objects;
CREATE POLICY "Admins upload blog" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete blog" ON storage.objects;
CREATE POLICY "Admins delete blog" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins upload site-assets" ON storage.objects;
CREATE POLICY "Admins upload site-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND (is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins delete site-assets" ON storage.objects;
CREATE POLICY "Admins delete site-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-assets' AND (is_admin() OR auth.role() = 'authenticated'));
