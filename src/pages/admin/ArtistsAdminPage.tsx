import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Upload, User, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import toast from 'react-hot-toast'
import type { Artist } from '../../types'

export default function ArtistsAdminPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | undefined>()

  const [form, setForm] = useState({
    name: '',
    bio: '',
    photo_url: '',
    spotify_url: '',
    apple_music_url: '',
    instagram_url: '',
    youtube_url: '',
    is_featured: false,
    display_order: 0,
  })

  const { data: artists = [], isLoading, error: queryError } = useQuery({
    queryKey: ['admin-artists'],
    queryFn: async (): Promise<Artist[]> => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadImage('covers', file, 'artists')
      setForm((f) => ({ ...f, photo_url: url }))
      toast.success('Artist photo uploaded!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload artist photo'))
    } finally {
      setUploading(false)
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) {
        throw new Error('Artist name is required.')
      }

      if (editingArtist) {
        const { error } = await supabase
          .from('artists')
          .update({
            ...form,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingArtist.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('artists').insert(form)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-artists'] })
      toast.success(editingArtist ? 'Artist updated!' : 'Artist created!')
      setShowModal(false)
      setEditingArtist(undefined)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to save artist'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('artists').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-artists'] })
      toast.success('Artist deleted')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to delete artist'))
    },
  })

  const openCreate = () => {
    setEditingArtist(undefined)
    setForm({
      name: '',
      bio: '',
      photo_url: '',
      spotify_url: '',
      apple_music_url: '',
      instagram_url: '',
      youtube_url: '',
      is_featured: false,
      display_order: 0,
    })
    setShowModal(true)
  }

  const openEdit = (a: Artist) => {
    setEditingArtist(a)
    setForm({
      name: a.name,
      bio: a.bio || '',
      photo_url: a.photo_url || '',
      spotify_url: a.spotify_url || '',
      apple_music_url: a.apple_music_url || '',
      instagram_url: a.instagram_url || '',
      youtube_url: a.youtube_url || '',
      is_featured: a.is_featured,
      display_order: a.display_order,
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Artists & Roster</h1>
          <p className="text-gray-muted text-xs mt-1">Manage studio artists, producers, client roster, and social profiles.</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          Add Artist
        </button>
      </div>

      {queryError && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs">
          {getErrorMessage(queryError, 'Failed to load artists from Supabase.')}
        </div>
      )}

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Bio</th>
              <th>Instagram</th>
              <th>Order</th>
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
            ) : artists.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-muted text-xs">
                  No artists recorded yet. Click "Add Artist" to create one.
                </td>
              </tr>
            ) : (
              artists.map((artist) => (
                <tr key={artist.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {artist.photo_url ? (
                        <img
                          src={artist.photo_url}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-offwhite/40">
                          <User size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-semibold text-offwhite text-sm">{artist.name}</p>
                        {artist.spotify_url && (
                          <a
                            href={artist.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-orange hover:underline inline-flex items-center gap-1"
                          >
                            <span>Spotify</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-offwhite/70 max-w-xs truncate">
                    {artist.bio || '—'}
                  </td>
                  <td className="text-xs font-mono text-offwhite/80">
                    {artist.instagram_url ? (
                      <a
                        href={artist.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-orange underline"
                      >
                        {artist.instagram_url.replace('https://instagram.com/', '@')}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="text-xs font-mono text-offwhite/70">{artist.display_order}</td>
                  <td>
                    <span
                      className={`text-[10px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        artist.is_featured
                          ? 'bg-orange/20 border border-orange text-orange'
                          : 'bg-white/5 border border-white/10 text-offwhite/40'
                      }`}
                    >
                      {artist.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(artist)}
                        className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete artist "${artist.name}"?`)) {
                            deleteMutation.mutate(artist.id)
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
              {editingArtist ? 'Edit Artist' : 'Add Artist'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Artist / Producer Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Metro Boomin"
                  className="input-field rounded-xl"
                />
              </div>

              <div>
                <label className="label-field">Bio / Description</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="input-field rounded-xl resize-none"
                  placeholder="Short bio or credits..."
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="label-field">Artist Photo</label>
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
                    <img src={form.photo_url} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    <span className="text-[11px] text-offwhite/50 truncate">{form.photo_url}</span>
                  </div>
                )}
              </div>

              {/* Social & Streaming Links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Instagram URL</label>
                  <input
                    value={form.instagram_url}
                    onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="input-field rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="label-field">Spotify URL</label>
                  <input
                    value={form.spotify_url}
                    onChange={(e) => setForm({ ...form, spotify_url: e.target.value })}
                    placeholder="https://open.spotify.com/..."
                    className="input-field rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Apple Music URL</label>
                  <input
                    value={form.apple_music_url}
                    onChange={(e) => setForm({ ...form, apple_music_url: e.target.value })}
                    placeholder="https://music.apple.com/..."
                    className="input-field rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="label-field">YouTube URL</label>
                  <input
                    value={form.youtube_url}
                    onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="input-field rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="input-field rounded-xl text-xs"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="accent-orange"
                    />
                    <span className="text-offwhite text-xs font-heading font-semibold">Featured on Website</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingArtist(undefined)
                }}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!form.name.trim() || saveMutation.isPending || uploading}
                className="btn-primary rounded-xl text-xs px-6 py-2.5 disabled:opacity-40"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Artist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
