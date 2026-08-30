import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Search } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import type { Customer } from '../../types'

export default function CustomersPage() {
  const [search, setSearch] = useState('')

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async (): Promise<Customer[]> => {
      let q = supabase.from('customers').select('*').order('created_at', { ascending: false })
      if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      const { data } = await q
      return data || []
    },
  })

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="input-field rounded-xl pl-9 text-sm"
        />
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Instagram</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5}><div className="h-8 bg-charcoal-light rounded animate-pulse" /></td></tr>)
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-muted">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-heading font-semibold text-offwhite">{c.full_name}</td>
                  <td className="text-sm">{c.email}</td>
                  <td className="text-sm">{c.phone || '—'}</td>
                  <td className="text-sm">{c.instagram || '—'}</td>
                  <td className="text-sm text-gray-muted">{formatDate(c.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
