-- ============================================================
-- PATIZAN RECORDS — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ─── Site Settings (initial row) ────────────────────────────

INSERT INTO site_settings (
  studio_name, tagline, hero_title, hero_subtitle,
  hero_cta_primary, hero_cta_secondary,
  address, phone, email, instagram,
  promo_message, promo_message_enabled,
  footer_tagline, meta_description,
  studio_policy
) VALUES (
  'Patizan Records',
  'WHERE SOUND BECOMES CULTURE.',
  'YOUR SOUND.' || E'\n' || 'YOUR SPACE.',
  'Professional recording, production, mixing, mastering and creative studio services in Tamarac, Florida.',
  'BOOK A SESSION',
  'EXPLORE THE STUDIO',
  '3900 W Commercial Blvd, Suite 230, Tamarac, FL 33309, USA',
  '959 205 6476',
  'patizanrecordsmia@gmail.com',
  '@patizanrecordsmiiami',
  'When you record a complete music, you''ll receive a free visualizer in the studio.',
  TRUE,
  'Built for artists. Designed for sound.',
  'Patizan Records — Professional recording studio in Tamarac, FL. Recording, podcast, mixing, mastering and music production services in South Florida.',
  '1. A 50% deposit is required to confirm your booking reservation.
2. No refund after reservation has been made.
3. The studio is not responsible if a client is late for their appointment. Session time begins at the scheduled start time.
4. Clients must respect all studio equipment and property.
5. If any equipment is damaged, the client is responsible for replacement or repair fees.
6. Late fees may apply for sessions that run over the agreed time.
7. No outside food or beverages except water.
8. Maximum occupancy must be respected at all times.'
) ON CONFLICT DO NOTHING;

-- ─── Studio Information ─────────────────────────────────────

INSERT INTO studio_info (
  name, tagline, address, city, state, zip, country, phone, email, instagram, website, about_text, mission_text
) VALUES (
  'PATIZAN RECORDS',
  'WHERE SOUND BECOMES CULTURE.',
  '3900 W Commercial Blvd, Suite 230',
  'Tamarac',
  'FL',
  '33309',
  'USA',
  '959 205 6476',
  'patizanrecordsmia@gmail.com',
  '@patizanrecordsmiiami',
  'https://patizanrecords.com',
  'Patizan Records was founded to provide South Florida artists with a premier recording and production environment without compromise.',
  'To empower creative expression with world-class acoustics, industry-standard equipment, and passionate engineering support.'
) ON CONFLICT DO NOTHING;

-- ─── Studio Availability (Mon–Sun, 9 AM – 11 PM) ────────────

INSERT INTO studio_availability (day_of_week, is_open, open_time, close_time) VALUES
  (0, TRUE, '09:00', '23:00'),  -- Sunday
  (1, TRUE, '09:00', '23:00'),  -- Monday
  (2, TRUE, '09:00', '23:00'),  -- Tuesday
  (3, TRUE, '09:00', '23:00'),  -- Wednesday
  (4, TRUE, '09:00', '23:00'),  -- Thursday
  (5, TRUE, '09:00', '23:00'),  -- Friday
  (6, TRUE, '09:00', '23:00')   -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- ─── Services ───────────────────────────────────────────────

INSERT INTO services (name, slug, short_description, description, starting_price, is_featured, is_active, display_order) VALUES
  ('Recording', 'recording', 'Professional vocal and instrument recording sessions with industry-standard signal chain.', 'State-of-the-art recording environment designed for artists, bands, and solo performers. Achieve the perfect take with our professional-grade microphones, acoustic treatment, and experienced engineers.', 40, TRUE, TRUE, 1),
  ('Podcast', 'podcast', 'Professional podcast recording and production with broadcast microphones.', 'Launch or elevate your podcast with crystal-clear audio quality. Dedicated multi-track podcast desk setup with acoustic isolation.', 40, FALSE, TRUE, 2),
  ('Voice Over', 'voice-over', 'Crystal-clear voice over recordings for commercials, audiobooks, and media.', 'From commercial spots to audiobooks and dubbing, our voice over sessions deliver pristine, broadcast-ready vocal clarity.', 40, FALSE, TRUE, 3),
  ('Mixing & Mastering', 'mixing-mastering', 'Transform rough recordings into radio-ready, commercially competitive masters.', 'Our engineers bring analog warmth and digital surgical precision to every track. Full stem mixing, stereo balance, and streaming-compliant loudness mastering.', 75, FALSE, TRUE, 4),
  ('Beat Production', 'beat-production', 'Custom, exclusive beat production by in-house producers across all genres.', 'Commission original, industry-ready beats tailored to your unique sound. We cover Drill, Afro, Compas, Amapiano, Hip-Hop, and Trap.', 50, FALSE, TRUE, 5),
  ('Streaming', 'streaming', 'Live streaming setup and multi-camera broadcast production.', 'Professional live streaming for concerts, creator events, and live DJ sets with studio-grade audio routing.', 75, FALSE, TRUE, 6),
  ('Jingle', 'jingle', 'Custom sonic branding and jingles for businesses and advertising.', 'Create memorable sonic signatures and brand anthems that stick in your audience’s mind.', 100, FALSE, TRUE, 7),
  ('DJ Tag', 'dj-tag', 'Custom vocal DJ tags and drops for producers and DJs.', 'Custom signature voice tags, drops, and sweeps processed with vocal FX.', 25, FALSE, TRUE, 8),
  ('Commercial Spot Production', 'commercial-spot', 'Full commercial audio production for radio, television, and social ads.', 'End-to-end commercial audio production from voice casting and sound design to final loudness delivery.', 150, FALSE, TRUE, 9)
ON CONFLICT (slug) DO NOTHING;

-- ─── Service Packages ───────────────────────────────────────

-- Recording packages
WITH rec AS (SELECT id FROM services WHERE slug = 'recording')
INSERT INTO service_packages (service_id, name, duration_hours, price, description, engineer_included, is_featured, is_active, display_order) VALUES
  ((SELECT id FROM rec), 'Basic — 1 Hour', 1, 40, 'Perfect for quick sessions, singles or voice overs. Includes studio time.', FALSE, FALSE, TRUE, 1),
  ((SELECT id FROM rec), 'Basic — 2 Hours', 2, 75, 'Great for EPs or multiple takes. Includes studio time.', FALSE, FALSE, TRUE, 2),
  ((SELECT id FROM rec), 'Basic — 4 Hours', 4, 140, 'Ideal for full productions. Includes studio time.', FALSE, FALSE, TRUE, 3),
  ((SELECT id FROM rec), 'Full Session — 8 Hours', 8, 300, 'Complete day session for albums and full productions. Engineer included.', TRUE, TRUE, TRUE, 4)
ON CONFLICT DO NOTHING;

-- Podcast packages
WITH pod AS (SELECT id FROM services WHERE slug = 'podcast')
INSERT INTO service_packages (service_id, name, duration_hours, price, description, engineer_included, is_featured, is_active, display_order) VALUES
  ((SELECT id FROM pod), '1 Hour Session', 1, 40, 'Single episode recording.', FALSE, FALSE, TRUE, 1),
  ((SELECT id FROM pod), '2 Hour Session', 2, 75, 'Extended recording for long-form content.', FALSE, FALSE, TRUE, 2),
  ((SELECT id FROM pod), '4 Hour Session', 4, 140, 'Full day podcast production.', TRUE, FALSE, TRUE, 3)
ON CONFLICT DO NOTHING;

-- ─── Beat Categories ────────────────────────────────────────

INSERT INTO beat_categories (name, slug, display_order) VALUES
  ('Drill', 'drill', 1),
  ('Compas', 'compas', 2),
  ('Afro', 'afro', 3),
  ('Amapiano', 'amapiano', 4),
  ('Rap Beats', 'rap-beats', 5)
ON CONFLICT (slug) DO NOTHING;

-- ─── Music Tracks ───────────────────────────────────────────

WITH drill AS (SELECT id FROM beat_categories WHERE slug = 'drill'),
     afro AS (SELECT id FROM beat_categories WHERE slug = 'afro'),
     compas AS (SELECT id FROM beat_categories WHERE slug = 'compas')
INSERT INTO music_tracks (
  title, artist, audio_url, cover_url, duration_seconds, bpm, key, genre, price, is_beat, beat_category_id, is_featured, is_published, display_order
) VALUES
  ('Tamarac Night', 'Patizan Records', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, 215, 140, 'C# Minor', 'Drill', 39.99, TRUE, (SELECT id FROM drill), TRUE, TRUE, 1),
  ('Island Heat', 'Patizan Records', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, 184, 108, 'G Minor', 'Afro', 49.99, TRUE, (SELECT id FROM afro), TRUE, TRUE, 2),
  ('Caribbean Pulse', 'Patizan Records', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, 198, 115, 'F Major', 'Compas', 49.99, TRUE, (SELECT id FROM compas), TRUE, TRUE, 3)
ON CONFLICT DO NOTHING;

-- ─── Gallery Categories ─────────────────────────────────────

INSERT INTO gallery_categories (name, slug, display_order) VALUES
  ('All', 'all', 0),
  ('Photos', 'photos', 1),
  ('Videos', 'videos', 2),
  ('Studio', 'studio', 3),
  ('Artists', 'artists', 4),
  ('Sessions', 'sessions', 5),
  ('Behind the Scenes', 'behind-the-scenes', 6)
ON CONFLICT (slug) DO NOTHING;

-- ─── Gallery Items ──────────────────────────────────────────

WITH studio_cat AS (SELECT id FROM gallery_categories WHERE slug = 'studio')
INSERT INTO gallery_items (category_id, title, description, media_type, url, thumbnail_url, is_featured, is_published, display_order) VALUES
  ((SELECT id FROM studio_cat), 'Control Room A', 'Main mixing and vocal tracking console.', 'image', NULL, NULL, TRUE, TRUE, 1),
  ((SELECT id FROM studio_cat), 'Analog Mixing Suite', 'Solid State Logic and analog outboard processors.', 'image', NULL, NULL, TRUE, TRUE, 2),
  ((SELECT id FROM studio_cat), 'Live Room & Vocal Booth', 'Acoustically tuned isolation booth.', 'image', NULL, NULL, TRUE, TRUE, 3),
  ((SELECT id FROM studio_cat), 'Podcast Recording Lounge', 'Multi-microphone broadcast desk.', 'image', NULL, NULL, TRUE, TRUE, 4),
  ((SELECT id FROM studio_cat), 'Beat Production Station', 'MIDI controllers and MPC workflow.', 'image', NULL, NULL, FALSE, TRUE, 5),
  ((SELECT id FROM studio_cat), 'Outboard Equipment Rack', 'Preamps, compressors, and converters.', 'image', NULL, NULL, FALSE, TRUE, 6)
ON CONFLICT DO NOTHING;

-- ─── Blog Categories ────────────────────────────────────────

INSERT INTO blog_categories (name, slug, display_order) VALUES
  ('News', 'news', 1),
  ('Tips & Tricks', 'tips-tricks', 2),
  ('Artist Spotlight', 'artist-spotlight', 3),
  ('Industry Insights', 'industry-insights', 4),
  ('Studio Updates', 'studio-updates', 5)
ON CONFLICT (slug) DO NOTHING;

-- ─── Blog Posts ─────────────────────────────────────────────

WITH tips AS (SELECT id FROM blog_categories WHERE slug = 'tips-tricks'),
     news AS (SELECT id FROM blog_categories WHERE slug = 'news')
INSERT INTO blog_posts (
  category_id, title, slug, excerpt, content, cover_url, author, is_featured, is_published, published_at
) VALUES
  (
    (SELECT id FROM tips),
    '5 Ways to Prepare for Your First Professional Studio Session',
    'prepare-for-studio-session',
    'Maximize your studio time and walk away with your best vocal takes by following these 5 key studio prep strategies.',
    '<p>Stepping into a professional recording studio is an exciting milestone for any artist. To make the most out of every paid hour, preparation is everything.</p><h3>1. Know Your Lyrics and Arrangements Cold</h3><p>Rehearse your vocals and delivery beforehand so you can focus on emotion and cadence instead of reading off your phone.</p><h3>2. Bring Backing Tracks and Stems on a Flash Drive</h3><p>Always have WAV format instrumentals and trackouts organized in clean folders.</p><h3>3. Rest Your Voice and Hydrate</h3><p>Drink room-temperature water and avoid excessive dairy or caffeine right before recording.</p>',
    NULL,
    'Patizan Records Staff',
    TRUE,
    TRUE,
    NOW()
  ),
  (
    (SELECT id FROM news),
    'Patizan Records Expands Studio Facilities in Tamarac, FL',
    'patizan-records-expands-tamarac',
    'We are excited to unveil our upgraded Control Room acoustics and new dedicated podcast recording suite in Broward County.',
    '<p>Patizan Records is proud to announce the grand opening of our newly renovated studio facilities at 3900 W Commercial Blvd in Tamarac, FL.</p><p>Equipped with acoustic treatment, industry-standard microphone chains, and enhanced monitoring, we are ready to serve South Florida''s vibrant music community.</p>',
    NULL,
    'Patizan Records',
    FALSE,
    TRUE,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- ─── Sample Testimonials ────────────────────────────────────

INSERT INTO testimonials (name, role, testimonial, rating, is_featured, display_order) VALUES
  ('Marcus J.', 'Recording Artist', 'Great sound, great environment and a team that truly understands the artist. Patizan Records brought my vision to life.', 5, TRUE, 1),
  ('Sophia R.', 'Podcaster', 'I recorded my first episode here and the quality blew everyone away. The setup is professional and the vibe is perfect.', 5, TRUE, 2),
  ('DJ Kairo', 'DJ / Producer', 'Best studio in South Florida for beats and mixing. The engineers know what they''re doing and the equipment is top-notch.', 5, TRUE, 3),
  ('Elena V.', 'Voice Over Artist', 'Incredible acoustic environment. My voice over clients always notice the difference in quality after recording at Patizan.', 5, TRUE, 4)
ON CONFLICT DO NOTHING;

-- ─── Sample Playlist (Website Default) ──────────────────────

INSERT INTO playlists (name, description, is_active_website_playlist, is_published) VALUES
  ('Patizan Featured', 'Featured tracks from Patizan Records artists.', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ─── Hero Slides Seed ───────────────────────────────────────

INSERT INTO hero_slides (id, title, subtitle, description, background_image, image_position, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, is_active, display_order)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    'YOUR SOUND.' || E'\n' || 'YOUR SPACE.',
    'PATIZAN RECORDS',
    'A professional recording environment built for artists, producers and creators in South Florida.',
    NULL,
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
    'TURN YOUR IDEAS' || E'\n' || 'INTO SOUND.',
    'RECORDING • PRODUCTION • MIXING',
    'From the first take to the final master, create music in a professional studio designed around your sound.',
    NULL,
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
    'MAKE SOMETHING' || E'\n' || 'PEOPLE REMEMBER.',
    'MUSIC PRODUCTION',
    'Professional recording, beat production, mixing and mastering for artists ready to elevate their sound.',
    NULL,
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
    'YOUR VOICE' || E'\n' || 'DESERVES A STUDIO.',
    'PODCAST • VOICE • CONTENT',
    'Professional recording for podcasts, voiceovers, commercials and digital content.',
    NULL,
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
    'WHERE SOUND' || E'\n' || 'BECOMES CULTURE.',
    'SOUTH FLORIDA RECORDING STUDIO',
    'A creative studio in Tamarac, Florida built for artists, producers and creators.',
    NULL,
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
