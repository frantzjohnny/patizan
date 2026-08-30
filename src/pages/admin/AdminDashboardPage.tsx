import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import {
  Calendar, Clock, CheckCircle, Users, Image, Music, TrendingUp, AlertCircle,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({
  title, value, icon: Icon, color = 'orange', href, suffix = '',
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color?: 'orange' | 'gold' | 'green' | 'blue' | 'red'
  href?: string
  suffix?: string
}) {
  const colorMap = {
    orange: 'bg-orange/10 border-orange/20 text-orange',
    gold: 'bg-gold/10 border-gold/20 text-gold',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
  }

  const card = (
    <div className="bg-charcoal border border-gray-border rounded-2xl p-6 hover:border-orange/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="font-heading font-bold text-3xl text-offwhite mb-1">
        {value}{suffix}
      </div>
      <div className="text-gray-muted text-sm font-body">{title}</div>
    </div>
  )

  if (href) {
    return <Link to={href}>{card}</Link>
  }
  return card
}

export default function AdminDashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [todayB, pending, upcoming, monthly, services, gallery, music] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('confirmed_date', today).eq('status', 'approved'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('confirmed_date', today).eq('status', 'approved'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('gallery_items').select('*', { count: 'exact', head: true }),
        supabase.from('music_tracks').select('*', { count: 'exact', head: true }),
      ])
      return {
        bookingsToday: todayB.count || 0,
        pendingRequests: pending.count || 0,
        upcomingSessions: upcoming.count || 0,
        monthlyBookings: monthly.count || 0,
        activeServices: services.count || 0,
        galleryItems: gallery.count || 0,
        musicTracks: music.count || 0,
      }
    },
  })

  const { data: recentBookings = [] } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, service:services(name)')
        .order('created_at', { ascending: false })
        .limit(5)
      return data || []
    },
  })

  const { data: chartData = [] } = useQuery({
    queryKey: ['bookings-chart'],
    queryFn: async () => {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start)
          .lte('created_at', end)
        months.push({
          month: d.toLocaleString('default', { month: 'short' }),
          bookings: count || 0,
        })
      }
      return months
    },
  })

  const STATUS_BADGE_CLASSES: Record<string, string> = {
    pending: 'badge-pending',
    under_review: 'badge-under_review',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    cancelled: 'badge-cancelled',
    completed: 'badge-completed',
  }

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Bookings Today', value: stats?.bookingsToday ?? '—', icon: Calendar, color: 'orange' as const, href: '/admin/bookings' },
          { title: 'Pending Requests', value: stats?.pendingRequests ?? '—', icon: AlertCircle, color: 'red' as const, href: '/admin/bookings' },
          { title: 'Upcoming Sessions', value: stats?.upcomingSessions ?? '—', icon: Clock, color: 'blue' as const, href: '/admin/calendar' },
          { title: 'Monthly Bookings', value: stats?.monthlyBookings ?? '—', icon: TrendingUp, color: 'green' as const },
          { title: 'Active Services', value: stats?.activeServices ?? '—', icon: CheckCircle, color: 'gold' as const, href: '/admin/services' },
          { title: 'Gallery Items', value: stats?.galleryItems ?? '—', icon: Image, color: 'blue' as const, href: '/admin/gallery' },
          { title: 'Music Tracks', value: stats?.musicTracks ?? '—', icon: Music, color: 'orange' as const, href: '/admin/music' },
          { title: 'Total Clients', value: '—', icon: Users, color: 'green' as const, href: '/admin/customers' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings chart */}
        <div className="bg-charcoal border border-gray-border rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg text-offwhite mb-6">Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#8E8E8E" fontSize={12} fontFamily="Space Grotesk" />
              <YAxis stroke="#8E8E8E" fontSize={12} fontFamily="Space Grotesk" />
              <Tooltip
                contentStyle={{ background: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', fontFamily: 'Inter' }}
                labelStyle={{ color: '#F5F3EA' }}
                itemStyle={{ color: '#FF7A00' }}
              />
              <Bar dataKey="bookings" fill="#FF7A00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent bookings */}
        <div className="bg-charcoal border border-gray-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-lg text-offwhite">Recent Requests</h3>
            <Link to="/admin/bookings" className="text-orange text-xs font-heading font-semibold uppercase tracking-wider hover:text-orange-hover transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-gray-muted text-sm text-center py-8">No bookings yet.</p>
            ) : (
              recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/admin/bookings/${booking.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-charcoal-light transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center shrink-0">
                    <span className="text-orange text-xs font-bold">
                      {booking.full_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-semibold text-offwhite truncate">{booking.full_name}</p>
                    <p className="text-xs text-gray-muted truncate">{booking.service?.name} · {booking.preferred_date}</p>
                  </div>
                  <span className={STATUS_BADGE_CLASSES[booking.status] || 'badge'}>
                    {booking.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6">
        <h3 className="font-heading font-bold text-lg text-offwhite mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'View Bookings', href: '/admin/bookings' },
            { label: 'Manage Services', href: '/admin/services' },
            { label: 'Upload Media', href: '/admin/gallery' },
            { label: 'Add Track', href: '/admin/music' },
            { label: 'Write Blog Post', href: '/admin/blog' },
            { label: 'Site Settings', href: '/admin/settings' },
          ].map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="px-4 py-2 bg-charcoal-light border border-gray-border rounded-xl text-sm font-heading font-medium text-offwhite/70 hover:text-orange hover:border-orange/30 transition-all"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
