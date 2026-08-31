# PATIZAN RECORDS — Studio Website & Private Management Platform

A high-performance, full-stack web application and studio operations management platform engineered for **PATIZAN RECORDS** (Tamarac, FL). Built with React 19, TypeScript, Vite, Tailwind CSS, and Supabase.

---

## 📍 Studio Overview
- **Location**: 3900 W Commercial Blvd, Suite 230, Tamarac, FL 33309, USA
- **Phone**: 959 205 6476
- **Email**: patizanrecordsmiami@gmail.com
- **Instagram**: [@patizanrecordsmiiami](https://instagram.com/patizanrecordsmiiami)

---

## 🛠️ Technology Stack
- **Frontend Core**: React 19, TypeScript, Vite 8, React Router v7
- **Styling & Design System**: Tailwind CSS v4, Framer Motion, Lucide Icons
- **State & Data Layer**: TanStack React Query v5, Zustand (persistent store)
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (GoTrue JWT) with role-based database authorization
- **Media Storage**: Supabase Storage (Audio, High-Res Photography, Video)
- **Form Management**: React Hook Form, Zod Schema Validation
- **Deployment**: Vercel (SPA routing configured via `vercel.json`)

---

## 🏗️ Architecture & Features

### 1. Public Website
- **Cinematic Homepage**: Dynamic Hero Slides CMS, interactive sound wave visualizers, and brand storytelling.
- **Audio & Beat Catalog**: Global persistent bottom music player with seek bar, playlist queue, volume controls, and track details.
- **Multi-Step Studio Booking**: Service and package selection, real-time availability checking, booking requests, and policy acknowledgment.
- **Interactive Gallery**: Filterable multi-format media gallery (Photography, 4K Studio video, YouTube embeds).
- **Services & Pricing**: Detailed tier breakdown for Recording, Podcasting, Mixing & Mastering, Beat Production, and Lockout sessions.
- **Blog & News CMS**: Articles, studio releases, and music production tips.

### 2. Admin Portal (`/admin`)
- **Restricted Access**: Protected route guarding with database role verification (`admin_users` table).
- **Studio Dashboard**: Key performance metrics, session analytics, and booking calendar.
- **Bookings Management**: Real-time review, status transitions (Pending ➔ Approved ➔ Completed), and customer communication notes.
- **CMS Management**: Direct CRUD for Hero Slides, Audio Tracks, Playlists, Gallery items, Services, Testimonials, and Site Settings.
- **System Status Diagnostics (`/admin/system`)**: Live real-time health checks of Supabase API, database tables, storage buckets, and RLS policies.

---

## 🚀 Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd pro
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your project credentials from your Supabase Dashboard (**Project Settings** ➔ **API**):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Patizan Records
```

> [!NOTE]
> Ensure `VITE_SUPABASE_URL` is the base URL (e.g., `https://xyz.supabase.co`) without trailing slashes or `/rest/v1`.

### 3. Database & Storage Initialization
1. Open your **Supabase Dashboard** ➔ **SQL Editor**.
2. Open [`supabase/setup_complete.sql`](file:///supabase/setup_complete.sql).
3. Paste the script and click **Run**.

This script provisions:
- All 20 database tables and relational foreign keys
- Row Level Security (RLS) policies for public and admin operations
- 8 Supabase Storage buckets (`covers`, `music`, `gallery`, `studio-images`, `site-assets`, `avatars`, `blog`, `videos`)
- Default studio availability, initial Hero slides, and site settings

### 4. Authorize First Administrator
1. In your **Supabase Dashboard**, go to **Authentication** ➔ **Users** and click **Add User** (or use the portal registration screen at `/admin/login`).
2. In the **SQL Editor**, grant administrator authorization:
```sql
SELECT grant_admin_by_email('your_admin_email@domain.com');
```

---

## 💻 Development & Production

### Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Verify Supabase Connectivity
Run the connection verification script:
```bash
node scripts/verify_connection.mjs
```

### Build for Production
```bash
npm run build
```

---

## 🌐 Vercel Deployment

1. Import the repository into your **Vercel Dashboard**.
2. In **Project Settings** ➔ **Environment Variables**, configure:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! The included `vercel.json` file ensures seamless Single Page Application (SPA) routing across all public and admin paths.
