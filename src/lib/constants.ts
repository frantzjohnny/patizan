// ============================================================
// PATIZAN RECORDS — Application Constants
// ============================================================

export const APP_NAME = 'Patizan Records';
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://patizanrecords.com';

export const STUDIO_INFO = {
  name: 'Patizan Records',
  address: '3900 W Commercial Blvd, Suite 230',
  city: 'Tamarac, FL 33309',
  phone: '959 205 6476',
  email: 'patizanrecordsmia@gmail.com',
  instagram: '@patizanrecordsmiiami',
  fullAddress: '3900 W Commercial Blvd, Suite 230, Tamarac, FL 33309, USA',
} as const;

export const BRAND_COLORS = {
  deepBlack: '#050505',
  darkNavy: '#081018',
  charcoal: '#111111',
  offWhite: '#F5F3EA',
  white: '#FFFFFF',
  accentOrange: '#FF7A00',
  accentGold: '#FFC928',
  mutedGray: '#8E8E8E',
} as const;

export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'under_review', label: 'Under Review', color: 'blue' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
  { value: 'completed', label: 'Completed', color: 'emerald' },
] as const;

export const STORAGE_BUCKETS = {
  studioImages: 'studio-images',
  gallery: 'gallery',
  videos: 'videos',
  music: 'music',
  avatars: 'avatars',
  blog: 'blog',
  siteAssets: 'site-assets',
} as const;

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 500 * 1024 * 1024, // 500 MB
  audio: 100 * 1024 * 1024, // 100 MB
  document: 5 * 1024 * 1024, // 5 MB
} as const;

export const ACCEPTED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'],
} as const;

export const DEFAULT_PAGINATION_SIZE = 20;

export const STUDIO_POLICY_DEFAULT = `1. A 50% deposit is required to confirm your booking reservation.
2. No refund after reservation has been made.
3. The studio is not responsible if a client is late for their appointment. Session time begins at the scheduled start time.
4. Clients must respect all studio equipment and property.
5. If any equipment is damaged, the client is responsible for replacement or repair fees.
6. Late fees may apply for sessions that run over the agreed time.
7. No outside food or beverages except water.
8. Maximum occupancy must be respected at all times.`;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/studio', label: 'Studio' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/music', label: 'Music' },
  { href: '/blog', label: 'Blog' },
] as const;

export const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    section: 'Bookings',
    items: [
      { href: '/admin/bookings', label: 'Bookings', icon: 'Calendar' },
      { href: '/admin/calendar', label: 'Calendar', icon: 'CalendarDays' },
      { href: '/admin/customers', label: 'Customers', icon: 'Users' },
    ],
  },
  {
    section: 'Content',
    items: [
      { href: '/admin/hero-slides', label: 'Hero Slider', icon: 'Layers' },
      { href: '/admin/services', label: 'Services', icon: 'Briefcase' },
      { href: '/admin/pricing', label: 'Pricing', icon: 'DollarSign' },
      { href: '/admin/gallery', label: 'Gallery', icon: 'Image' },
      { href: '/admin/music', label: 'Music', icon: 'Music' },
      { href: '/admin/playlists', label: 'Playlists', icon: 'ListMusic' },
      { href: '/admin/artists', label: 'Artists', icon: 'Mic2' },
      { href: '/admin/testimonials', label: 'Testimonials', icon: 'MessageSquareQuote' },
      { href: '/admin/blog', label: 'Blog', icon: 'FileText' },
    ],
  },
  {
    section: 'Studio',
    items: [
      { href: '/admin/availability', label: 'Availability', icon: 'Clock' },
      { href: '/admin/blocked-times', label: 'Blocked Times', icon: 'Ban' },
      { href: '/admin/studio-info', label: 'Studio Info', icon: 'Building2' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { href: '/admin/settings', label: 'Site Settings', icon: 'Settings' },
      { href: '/admin/users', label: 'Admin Users', icon: 'Shield' },
      { href: '/admin/system', label: 'System Health', icon: 'Activity' },
    ],
  },
] as const;

export const LOCAL_SEO_KEYWORDS = [
  'Recording Studio Tamarac FL',
  'Recording Studio Miami',
  'Music Studio Tamarac',
  'Recording Studio South Florida',
  'Podcast Studio Tamarac',
  'Music Production Tamarac',
  'Mixing and Mastering Tamarac',
];
