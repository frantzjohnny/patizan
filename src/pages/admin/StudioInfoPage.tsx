import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { StudioInfo } from '../../types'

export default function StudioInfoPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: 'PATIZAN RECORDS',
    tagline: 'Built for artists. Designed for sound.',
    address: '3900 W Commercial Blvd, Suite 230',
    city: 'Tamarac',
    state: 'FL',
    zip: '33309',
    country: 'USA',
    phone: '959 205 6476',
    email: 'patizanrecordsmia@gmail.com',
    instagram: '@patizanrecordsmiiami',
    website: 'https://patizanrecords.com',
    maps_embed_url: '',
    about_text: '',
    mission_text: '',
  })

  const { data: studioInfo, isLoading } = useQuery({
    queryKey: ['studio-info'],
    queryFn: async (): Promise<StudioInfo | null> => {
      const { data, error } = await supabase.from('studio_info').select('*').single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
  })

  useEffect(() => {
    if (studioInfo) {
      setForm({
        name: studioInfo.name || '',
        tagline: studioInfo.tagline || '',
        address: studioInfo.address || '',
        city: studioInfo.city || '',
        state: studioInfo.state || '',
        zip: studioInfo.zip || '',
        country: studioInfo.country || '',
        phone: studioInfo.phone || '',
        email: studioInfo.email || '',
        instagram: studioInfo.instagram || '',
        website: studioInfo.website || '',
        maps_embed_url: studioInfo.maps_embed_url || '',
        about_text: studioInfo.about_text || '',
        mission_text: studioInfo.mission_text || '',
      })
    }
  }, [studioInfo])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (studioInfo?.id) {
        const { error } = await supabase
          .from('studio_info')
          .update(form)
          .eq('id', studioInfo.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('studio_info').insert(form)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-info'] })
      toast.success('Studio information updated!')
    },
    onError: () => {
      toast.error('Failed to update studio info')
    },
  })

  if (isLoading) {
    return <div className="p-8 text-center text-gray-muted">Loading studio details...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-offwhite">Studio Identity & Location</h2>
          <p className="text-gray-muted text-sm mt-1">
            Keep your contact info, address, and social links up to date.
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="btn-primary rounded-xl text-sm flex items-center gap-2"
        >
          <Save size={16} />
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Studio Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
          <div>
            <label className="label-field">Brand Tagline</label>
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Physical Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input-field rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label-field">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
          <div>
            <label className="label-field">State</label>
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
          <div>
            <label className="label-field">ZIP Code</label>
            <input
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
          <div>
            <label className="label-field">Country</label>
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
          <div>
            <label className="label-field">Email Address</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
          <div>
            <label className="label-field">Instagram Handle</label>
            <input
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="label-field">About Studio Overview</label>
          <textarea
            value={form.about_text}
            onChange={(e) => setForm({ ...form, about_text: e.target.value })}
            rows={3}
            className="input-field rounded-xl resize-none"
          />
        </div>

        <div>
          <label className="label-field">Mission & Philosophy</label>
          <textarea
            value={form.mission_text}
            onChange={(e) => setForm({ ...form, mission_text: e.target.value })}
            rows={3}
            className="input-field rounded-xl resize-none"
          />
        </div>
      </div>
    </div>
  )
}
