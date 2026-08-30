import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, ListMusic, Music, X } from 'lucide-react'
import { useAdminPlaylists, usePlaylistTracks, useAdminMusicTracks } from '../../hooks/useMusic'
import { supabase } from '../../lib/supabase'
import { getErrorMessage } from '../../lib/supabaseErrors'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { Playlist } from '../../types'

function PlaylistTracksManager({
  playlist,
  onClose,
}: {
  playlist: Playlist
  onClose: () => void
}) {
  const qc = useQueryClient()
  const { data: currentTracks = [], isLoading: loadingCurrent } = usePlaylistTracks(playlist.id)
  const { data: allTracks = [] } = useAdminMusicTracks()
  const [selectedTrackId, setSelectedTrackId] = useState('')

  const addTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const nextOrder = currentTracks.length + 1
      const { error } = await supabase.from('playlist_tracks').insert({
        playlist_id: playlist.id,
        track_id: trackId,
        display_order: nextOrder,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlist-tracks', playlist.id] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      setSelectedTrackId('')
      toast.success('Track added to playlist!')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to add track to playlist'))
    },
  })

  const removeTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlist.id)
        .eq('track_id', trackId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlist-tracks', playlist.id] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      toast.success('Track removed from playlist.')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to remove track'))
    },
  })

  // Filter out tracks already in this playlist
  const availableTracks = allTracks.filter(
    (t) => !currentTracks.some((ct) => ct.id === t.id)
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <ListMusic size={20} className="text-orange" />
            <div>
              <h3 className="font-heading font-bold text-lg text-offwhite">
                Manage Tracks: {playlist.name}
              </h3>
              <p className="text-xs text-gray-muted">{currentTracks.length} tracks attached</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-offwhite/50 hover:text-offwhite">
            <X size={18} />
          </button>
        </div>

        {/* Add Track Form */}
        <div className="flex gap-2 mb-6">
          <select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            className="input-field rounded-xl text-xs flex-1"
          >
            <option value="">-- Select a track to add --</option>
            {availableTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.artist})
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedTrackId && addTrackMutation.mutate(selectedTrackId)}
            disabled={!selectedTrackId || addTrackMutation.isPending}
            className="btn-primary rounded-xl text-xs px-4 shrink-0 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Plus size={14} />
            <span>Add Track</span>
          </button>
        </div>

        {/* Current Tracks List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {loadingCurrent ? (
            <div className="text-center py-8 text-xs text-gray-muted animate-pulse">
              Loading playlist tracks...
            </div>
          ) : currentTracks.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-muted bg-white/5 rounded-xl border border-white/5">
              No tracks in this playlist yet. Add one above.
            </div>
          ) : (
            currentTracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-offwhite/40 w-5 text-right">
                    {idx + 1}.
                  </span>
                  {track.cover_url ? (
                    <img src={track.cover_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-offwhite/40">
                      <Music size={14} />
                    </div>
                  )}
                  <div>
                    <p className="font-heading font-semibold text-xs text-offwhite">{track.title}</p>
                    <p className="text-[11px] text-gray-muted">{track.artist}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeTrackMutation.mutate(track.id)}
                  disabled={removeTrackMutation.isPending}
                  className="p-1.5 text-offwhite/40 hover:text-red-400 transition-colors"
                  title="Remove from playlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn-ghost text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlaylistsAdminPage() {
  const qc = useQueryClient()
  const { data: playlists = [], isLoading, error } = useAdminPlaylists()

  const [showModal, setShowModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | undefined>()
  const [managingTracksFor, setManagingTracksFor] = useState<Playlist | undefined>()

  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active_website_playlist: false,
    is_published: true,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Playlist name is required.')

      if (form.is_active_website_playlist) {
        // Unset other active playlists first
        await supabase
          .from('playlists')
          .update({ is_active_website_playlist: false })
          .neq('id', editingPlaylist?.id || '00000000-0000-0000-0000-000000000000')
      }

      if (editingPlaylist) {
        const { error } = await supabase
          .from('playlists')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingPlaylist.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('playlists').insert(form)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-playlists'] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      toast.success(editingPlaylist ? 'Playlist updated!' : 'Playlist created!')
      setShowModal(false)
      setEditingPlaylist(undefined)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to save playlist'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('playlists').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-playlists'] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      toast.success('Playlist deleted')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to delete playlist'))
    },
  })

  const setActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('playlists').update({ is_active_website_playlist: false }).neq('id', id)
      const { error } = await supabase.from('playlists').update({ is_active_website_playlist: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-playlists'] })
      qc.invalidateQueries({ queryKey: ['active-playlist'] })
      toast.success('Active website player playlist updated!')
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to set active playlist')),
  })

  const openCreate = () => {
    setEditingPlaylist(undefined)
    setForm({
      name: '',
      description: '',
      is_active_website_playlist: false,
      is_published: true,
    })
    setShowModal(true)
  }

  const openEdit = (p: Playlist) => {
    setEditingPlaylist(p)
    setForm({
      name: p.name,
      description: p.description || '',
      is_active_website_playlist: p.is_active_website_playlist,
      is_published: p.is_published,
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Playlists & Player</h1>
          <p className="text-gray-muted text-xs mt-1">Curate track sequences and designate the active website audio playlist.</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          Create Playlist
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs">
          {getErrorMessage(error, 'Failed to load playlists from Supabase.')}
        </div>
      )}

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Playlist Name</th>
              <th>Description</th>
              <th>Tracks</th>
              <th>Active Player</th>
              <th>Status</th>
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
            ) : playlists.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-muted text-xs">
                  No playlists found. Click "Create Playlist" to get started.
                </td>
              </tr>
            ) : (
              playlists.map((pl) => (
                <tr key={pl.id}>
                  <td>
                    <div className="flex items-center gap-2.5 font-heading font-semibold text-offwhite text-sm">
                      <ListMusic size={16} className="text-orange shrink-0" />
                      <span>{pl.name}</span>
                    </div>
                  </td>
                  <td className="text-xs text-gray-muted max-w-xs truncate">{pl.description || '—'}</td>
                  <td>
                    <button
                      onClick={() => setManagingTracksFor(pl)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-offwhite text-xs font-heading font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Music size={12} className="text-orange" />
                      <span>Manage Tracks</span>
                    </button>
                  </td>
                  <td>
                    {pl.is_active_website_playlist ? (
                      <span className="text-orange text-xs font-heading font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> ACTIVE PLAYER
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveMutation.mutate(pl.id)}
                        className="text-xs text-gray-muted hover:text-orange transition-colors font-heading"
                      >
                        Set as Active
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={pl.is_published ? 'badge-approved' : 'badge-cancelled'}>
                      {pl.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(pl)}
                        className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete playlist "${pl.name}"?`)) {
                            deleteMutation.mutate(pl.id)
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
              {editingPlaylist ? 'Edit Playlist' : 'Create Playlist'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Playlist Title *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Featured Beats"
                  className="input-field rounded-xl"
                />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="input-field rounded-xl resize-none"
                  placeholder="Description of the playlist..."
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active_website_playlist}
                    onChange={(e) =>
                      setForm({ ...form, is_active_website_playlist: e.target.checked })
                    }
                    className="accent-orange"
                  />
                  <span className="text-offwhite text-xs font-heading font-semibold">
                    Set as Active Website Player Playlist
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="accent-orange"
                  />
                  <span className="text-offwhite/70 text-xs">Published</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingPlaylist(undefined)
                }}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!form.name.trim() || saveMutation.isPending}
                className="btn-primary rounded-xl text-xs px-6 py-2.5 disabled:opacity-40"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Playlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {managingTracksFor && (
        <PlaylistTracksManager
          playlist={managingTracksFor}
          onClose={() => setManagingTracksFor(undefined)}
        />
      )}
    </div>
  )
}
