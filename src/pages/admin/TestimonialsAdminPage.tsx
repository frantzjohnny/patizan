import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Upload, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import toast from 'react-hot-toast'
import type { Testimonial } from '../../types'

export default function TestimonialsAdminPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Testimonial | undefined>()

  const [form, setForm] = useState({
    name: '',
    role: 'Artist / Producer',
    testimonial: '',
    rating: 5,
    photo_url: '',
    is_featured: true,
    display_order: 0,
  })

  const { data: testimonials = [], isLoading, error } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadImage('covers', file, 'testimonials')
      setForm((f) => ({ ...f, photo_url: url }))
      toast.success('Photo uploaded!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload photo'))
    } finally {
      setUploading(false)
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Client name is required.')
      if (!form.testimonial.trim()) throw new Error('Testimonial text is required.')

      const payload = {
        ...form,
        rating: Number(form.rating) || 5,
        display_order: parseInt(form.display_order.toString()) || 0,
      }

      if (editingItem) {
        const { error } = await supabase
          .from('testimonials')
          .update(payload)
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('testimonials').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testimonials'] })
      qc.invalidateQueries({ queryKey: ['testimonials-featured'] })
      toast.success(editingItem ? 'Testimonial updated!' : 'Testimonial created!')
      setShowModal(false)
      setEditingItem(undefined)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to save testimonial'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testimonials'] })
      qc.invalidateQueries({ queryKey: ['testimonials-featured'] })
      toast.success('Testimonial deleted')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to delete testimonial'))
    },
  })

  const openCreate = () => {
    setEditingItem(undefined)
    setForm({
      name: '',
      role: 'Artist / Producer',
      testimonial: '',
      rating: 5,
      photo_url: '',
      is_featured: true,
      display_order: 0,
    })
    setShowModal(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditingItem(t)
    setForm({
      name: t.name,
      role: t.role || 'Artist / Producer',
      testimonial: t.testimonial,
      rating: t.rating || 5,
      photo_url: t.photo_url || '',
      is_featured: t.is_featured,
      display_order: t.display_order,
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Client Reviews & Testimonials</h1>
          <p className="text-gray-muted text-xs mt-1">Manage verified artist feedback, ratings, and quotes displayed on the website.</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          Add Review
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs">
          {getErrorMessage(error, 'Failed to load testimonials from Supabase.')}
        </div>
      )}

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Role</th>
              <th>Rating</th>
              <th>Testimonial Quote</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <div className="h-8 bg-charcoal-light rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : testimonials.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-muted text-xs">
                  No testimonials recorded yet. Click "Add Review" to create one.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {t.photo_url ? (
                        <img
                          src={t.photo_url}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-offwhite/40">
                          <User size={16} />
                        </div>
                      )}
                      <p className="font-heading font-semibold text-offwhite text-sm">{t.name}</p>
                    </div>
                  </td>
                  <td className="text-xs text-offwhite/70">{t.role || '—'}</td>
                  <td>
                    <span className="text-xs font-mono font-bold text-orange px-2 py-0.5 rounded bg-orange/10 border border-orange/20">
                      {Number(t.rating || 5).toFixed(1)} / 5.0
                    </span>
                  </td>
                  <td className="text-xs text-offwhite/80 max-w-sm truncate italic">
                    "{t.testimonial}"
                  </td>
                  <td>
                    <span
                      className={`text-[10px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        t.is_featured
                          ? 'bg-orange/20 border border-orange text-orange'
                          : 'bg-white/5 border border-white/10 text-offwhite/40'
                      }`}
                    >
                      {t.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete testimonial from "${t.name}"?`)) {
                            deleteMutation.mutate(t.id)
                          }
                        }}
                        className="p-1.5 text-gray-muted hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-lg my-8">
            <h3 className="font-heading font-bold text-xl text-offwhite mb-6">
              {editingItem ? 'Edit Review' : 'Add Client Review'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Client Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    className="input-field rounded-xl"
                  />
                </div>
                <div>
                  <label className="label-field">Role / Credit</label>
                  <input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Hip Hop Artist"
                    className="input-field rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Testimonial Quote *</label>
                <textarea
                  value={form.testimonial}
                  onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                  rows={4}
                  className="input-field rounded-xl resize-none"
                  placeholder="Describe client feedback and session experience..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Score (1.0 - 5.0)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="input-field rounded-xl"
                  >
                    <option value={5}>5.0 — Exceptional</option>
                    <option value={4.5}>4.5 — Great</option>
                    <option value={4}>4.0 — Good</option>
                    <option value={3.5}>3.5 — Average</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="input-field rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Client Avatar (URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    value={form.photo_url}
                    onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                    placeholder="https://..."
                    className="input-field rounded-xl flex-1 text-xs"
                  />
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file)
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-offwhite text-xs font-heading font-medium flex items-center gap-1.5 shrink-0"
                  >
                    <Upload size={14} />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
                {form.photo_url && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={form.photo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <span className="text-[11px] text-offwhite/50 truncate">{form.photo_url}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-orange"
                  />
                  <span className="text-offwhite text-xs font-heading font-semibold">
                    Featured on Website Homepage
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingItem(undefined)
                }}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!form.name.trim() || !form.testimonial.trim() || saveMutation.isPending || uploading}
                className="btn-primary rounded-xl text-xs px-6 py-2.5 disabled:opacity-40"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
