import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'

// Public Layout & Helpers
import PublicLayout from './components/public/layout/PublicLayout'
import ScrollToTop from './components/common/ScrollToTop'

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('./pages/public/HomePage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'))
const StudioPage = lazy(() => import('./pages/public/StudioPage'))
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'))
const MusicPage = lazy(() => import('./pages/public/MusicPage'))
const BookSessionPage = lazy(() => import('./pages/public/BookSessionPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))
const BlogPage = lazy(() => import('./pages/public/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))

// Admin Layout & Protected Route
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminLayout = lazy(() => import('./components/admin/layout/AdminLayout'))
const ProtectedRoute = lazy(() => import('./components/admin/layout/ProtectedRoute'))

// Admin Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const BookingsPage = lazy(() => import('./pages/admin/BookingsPage'))
const BookingDetailPage = lazy(() => import('./pages/admin/BookingDetailPage'))
const CalendarPage = lazy(() => import('./pages/admin/CalendarPage'))
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'))
const ServicesAdminPage = lazy(() => import('./pages/admin/ServicesAdminPage'))
const HeroSlidesAdminPage = lazy(() => import('./pages/admin/HeroSlidesAdminPage'))
const HomeMediaAdminPage = lazy(() => import('./pages/admin/HomeMediaAdminPage'))
const PricingAdminPage = lazy(() => import('./pages/admin/PricingAdminPage'))
const GalleryAdminPage = lazy(() => import('./pages/admin/GalleryAdminPage'))
const MusicAdminPage = lazy(() => import('./pages/admin/MusicAdminPage'))
const PlaylistsAdminPage = lazy(() => import('./pages/admin/PlaylistsAdminPage'))
const ArtistsAdminPage = lazy(() => import('./pages/admin/ArtistsAdminPage'))
const TestimonialsAdminPage = lazy(() => import('./pages/admin/TestimonialsAdminPage'))
const BlogAdminPage = lazy(() => import('./pages/admin/BlogAdminPage'))
const AvailabilityPage = lazy(() => import('./pages/admin/AvailabilityPage'))
const BlockedTimesPage = lazy(() => import('./pages/admin/BlockedTimesPage'))
const StudioInfoPage = lazy(() => import('./pages/admin/StudioInfoPage'))
const SiteSettingsPage = lazy(() => import('./pages/admin/SiteSettingsPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const SystemStatusPage = lazy(() => import('./pages/admin/SystemStatusPage'))

function RouteLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-2 border-orange/30 border-t-orange rounded-full animate-spin mb-4" />
      <span className="font-heading text-xs tracking-widest uppercase text-gray-muted">
        Loading Patizan Records...
      </span>
    </div>
  )
}

function App() {
  const { setUser, setIsAdmin, setLoading } = useAuthStore()

  useEffect(() => {
    // Initialize auth state
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Check admin status strictly from admin_users table
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('profile_id', session.user.id)
          .eq('is_active', true)
          .single()

        if (adminUser) {
          setUser(
            profile || {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || 'Studio Administrator',
              created_at: session.user.created_at,
              updated_at: session.user.created_at,
            }
          )
          setIsAdmin(true)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        setIsAdmin(false)
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('profile_id', session.user.id)
          .eq('is_active', true)
          .single()

        if (adminUser) {
          setUser(
            profile || {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || 'Studio Administrator',
              created_at: session.user.created_at,
              updated_at: session.user.created_at,
            }
          )
          setIsAdmin(true)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setIsAdmin, setLoading])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/book-session" element={<BookSessionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/404" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
              <Route path="/admin/bookings/:id" element={<BookingDetailPage />} />
              <Route path="/admin/calendar" element={<CalendarPage />} />
              <Route path="/admin/customers" element={<CustomersPage />} />
              <Route path="/admin/services" element={<ServicesAdminPage />} />
              <Route path="/admin/hero-slides" element={<HeroSlidesAdminPage />} />
              <Route path="/admin/home-media" element={<HomeMediaAdminPage />} />
              <Route path="/admin/pricing" element={<PricingAdminPage />} />
              <Route path="/admin/gallery" element={<GalleryAdminPage />} />
              <Route path="/admin/music" element={<MusicAdminPage />} />
              <Route path="/admin/playlists" element={<PlaylistsAdminPage />} />
              <Route path="/admin/artists" element={<ArtistsAdminPage />} />
              <Route path="/admin/testimonials" element={<TestimonialsAdminPage />} />
              <Route path="/admin/blog" element={<BlogAdminPage />} />
              <Route path="/admin/availability" element={<AvailabilityPage />} />
              <Route path="/admin/blocked-times" element={<BlockedTimesPage />} />
              <Route path="/admin/studio-info" element={<StudioInfoPage />} />
              <Route path="/admin/settings" element={<SiteSettingsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/system" element={<SystemStatusPage />} />
            </Route>
          </Route>

          {/* Fallback to custom 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
