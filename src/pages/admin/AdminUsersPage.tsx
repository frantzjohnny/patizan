import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import type { Profile } from '../../types'

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-heading font-bold text-xl text-offwhite">Authorized Administrators</h2>
        <p className="text-gray-muted text-sm mt-1">
          Staff and admin accounts with access to the studio management portal.
        </p>
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(2)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={4}>
                    <div className="h-8 bg-charcoal-light rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-muted">
                  No admin profiles registered in system.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center font-bold text-orange text-xs">
                        {u.full_name?.charAt(0) || u.email?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <span className="font-heading font-semibold text-offwhite text-sm">
                        {u.full_name || 'Admin User'}
                      </span>
                    </div>
                  </td>
                  <td className="text-sm text-gray-muted">{u.email}</td>
                  <td>
                    <span className="badge-approved">
                      {(u.role || 'admin').toUpperCase()}
                    </span>
                  </td>
                  <td className="text-sm text-gray-muted">{formatDate(u.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
