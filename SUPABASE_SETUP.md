# Patizan Records — Supabase Configuration & Production Setup Guide

This guide explains how to connect **Patizan Records** to your Supabase project in 3 simple steps.

---

## Step 1: Copy API Credentials to `.env`
1. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to **Project Settings** ➔ **API**.
2. Locate:
   - **Project URL**: `https://<your-project-ref>.supabase.co` (Do not include `/rest/v1/` or trailing slashes)
   - **Project API Keys** ➔ `anon` `public` key (`eyJ...`)
3. In the root directory of the project, open `.env` and configure:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_APP_URL=http://localhost:5173
   VITE_APP_NAME=Patizan Records
   ```

---

## Step 2: Run Master Setup in Supabase SQL Editor
1. In your Supabase Dashboard, click **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/setup_complete.sql`](file:///supabase/setup_complete.sql) and paste it into the editor.
4. Click **Run** (or press `Ctrl+Enter`).

This single script automatically sets up:
- All 20 Database Tables (`artists`, `music_tracks`, `playlists`, `hero_slides`, `services`, `bookings`, `gallery_items`, `studio_availability`, `site_settings`, etc.)
- All 8 Storage Buckets (`covers`, `music`, `gallery`, `studio-images`, `site-assets`, `avatars`, `blog`, `videos`)
- Row Level Security (RLS) policies for public visitors & authenticated administrators
- Baseline studio availability (Mon–Sun 9am–11pm), initial Hero Slides, and Site Settings.

---

## Step 3: Authorize Your First Administrator Account
1. In your Supabase Dashboard, go to **Authentication** ➔ **Users**.
2. Click **Add User** ➔ **Create User**.
3. Enter your administrator email and a strong secure password. Check **Auto Confirm User?**.
4. In the **SQL Editor**, run:
   ```sql
   SELECT grant_admin_by_email('your_admin_email@domain.com');
   ```
   *(Replace with the email you just created).*

---

## Step 4: Verify Runtime Health
1. Start the application:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:5173/admin/login` and log in with your credentials.
3. Open **System Status** (`http://localhost:5173/admin/system`).
4. You will see a live diagnostic test verifying Database, Auth, Storage Buckets, and Tables with real-time green checkmarks.
