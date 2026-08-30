import { Menu, Bell, LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'

interface AdminHeaderProps {
  onMenuClick: () => void
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/bookings': 'Bookings',
    '/admin/calendar': 'Calendar',
    '/admin/customers': 'Customers',
    '/admin/services': 'Services',
    '/admin/pricing': 'Pricing',
    '/admin/gallery': 'Gallery',
    '/admin/music': 'Music',
    '/admin/playlists': 'Playlists',
    '/admin/artists': 'Artists',
    '/admin/testimonials': 'Testimonials',
    '/admin/blog': 'Blog',
    '/admin/availability': 'Availability',
    '/admin/blocked-times': 'Blocked Times',
    '/admin/studio-info': 'Studio Information',
    '/admin/settings': 'Site Settings',
    '/admin/users': 'Admin Users',
  }
  return titles[pathname] || 'Admin'
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const location = useLocation()
  const { user } = useAuthStore()

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      return count || 0
    },
    refetchInterval: 30000,
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 h-16 bg-black/95 backdrop-blur-md border-b border-gray-border/50">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-gray-muted hover:text-offwhite transition-colors"
      >
        <Menu size={20} />
      </button>

      <h1 className="font-heading font-bold text-lg text-offwhite flex-1">
        {getPageTitle(location.pathname)}
      </h1>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-muted hover:text-offwhite transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-orange rounded-full text-[10px] font-bold text-black flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-border">
          <div className="w-8 h-8 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center">
            <span className="text-orange text-xs font-heading font-bold">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <span className="hidden md:block text-sm text-offwhite/70 font-body">
            {user?.full_name || user?.email}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-muted hover:text-red-400 transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
