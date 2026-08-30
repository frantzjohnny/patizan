import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Upload, Music as MusicIcon, Play } from 'lucide-react'
import { useAdminMusicTracks, useBeatCategories, useCreateTrack, useUpdateTrack, useDeleteTrack } from '../../hooks/useMusic'
import { uploadAudio, uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { MusicTrack, BeatCategory } from '../../types'

function TrackModal({
  track,
  categories,
  onClose,
}: {
  track?: MusicTrack
  categories: BeatCategory[]
  onClose: () => void
}) {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [form, setForm] = useState({
    title: track?.title || '',
    artist: track?.artist || 'Patizan Records',
    audio_url: track?.audio_url || '',
    cover_url: track?.cover_url || '',
    duration_seconds: track?.duration_seconds?.toString() || '180',
    bpm: track?.bpm?.toString() || '',
    key: track?.key || '',
    genre: track?.genre || 'Hip Hop',
    price: track?.price?.toString() || '',
    is_beat: track?.is_beat ?? true,
    beat_category_id: track?.beat_category_id || '',
    is_featured: track?.is_featured || false,
    is_published: track?.is_published ?? true,
    display_order: track?.display_order ?? 0,
  })

  const create = useCreateTrack()
  const update = useUpdateTrack()

  const handleAudioUpload = async (file: File) => {
    setUploadingAudio(true)
    try {
      const url = await uploadAudio(file, 'tracks')
      setForm((f) => ({ ...f, audio_url: url }))
      toast.success('Audio track uploaded!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload audio file'))
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true)
    try {
      const url = await uploadImage('covers', file, 'covers')
      setForm((f) => ({ ...f, cover_url: url }))
      toast.success('Cover artwork uploaded!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload cover artwork'))
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a track title')
      return
    }
    if (!form.audio_url.trim()) {
      toast.error('Please upload or provide an audio URL')
      return
    }

    try {
      const payload = {
        ...form,
        duration_seconds: parseInt(form.duration_seconds) || 180,
        bpm: form.bpm ? parseInt(form.bpm) : null,
        price: form.price ? parseFloat(form.price) : null,
        beat_category_id: form.beat_category_id || null,
        display_order: parseInt(form.display_order.toString()) || 0,
      }
      if (track) {
        await update.mutateAsync({ id: track.id, ...payload })
        toast.success('Track updated!')
      } else {
        await create.mutateAsync(payload)
        toast.success('Track added!')
      }
      onClose()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save track'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-lg my-8">
        <h3 className="font-heading font-bold text-xl text-offwhite mb-6">
          {track ? 'Edit Track' : 'Add Track / Beat'}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Tamarac Night"
                className="input-field rounded-xl"
              />
            </div>
            <div>
              <label className="label-field">Artist / Producer</label>
              <input
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                placeholder="Patizan Records"
                className="input-field rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Audio File (MP3 / WAV / M4A) *</label>
            <div className="flex gap-2">
              <input
                value={form.audio_url}
                onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
                placeholder="https://..."
                className="input-field rounded-xl flex-1 text-xs"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={uploadingAudio}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-offwhite text-xs font-heading font-medium flex items-center gap-1.5 shrink-0"
              >
                <Upload size={14} />
                <span>{uploadingAudio ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
            {form.audio_url && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                <Play size={10} />
                <span className="truncate">{form.audio_url}</span>
              </div>
            )}
          </div>

          <div>
            <label className="label-field">Cover Image (URL or Upload)</label>
            <div className="flex gap-2">
              <input
                value={form.cover_url}
                onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                placeholder="https://..."
                className="input-field rounded-xl flex-1 text-xs"
              />
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-offwhite text-xs font-heading font-medium flex items-center gap-1.5 shrink-0"
              >
                <Upload size={14} />
                <span>{uploadingCover ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
            {form.cover_url && (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.cover_url} alt="Cover Preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                <span className="text-[11px] text-offwhite/50 truncate">{form.cover_url}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-field">BPM</label>
              <input
                type="number"
                value={form.bpm}
                onChange={(e) => setForm({ ...form, bpm: e.target.value })}
                placeholder="140"
                className="input-field rounded-xl"
              />
            </div>
            <div>
              <label className="label-field">Key</label>
              <input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="C# Minor"
                className="input-field rounded-xl"
              />
            </div>
            <div>
              <label className="label-field">Price ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="29.99"
                className="input-field rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Genre / Style</label>
              <input
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="input-field rounded-xl"
                placeholder="Trap, R&B, Afrobeat..."
              />
            </div>
            <div>
              <label className="label-field">Beat Category</label>
              <select
                value={form.beat_category_id}
                onChange={(e) => setForm({ ...form, beat_category_id: e.target.value })}
                className="input-field rounded-xl"
              >
                <option value="">None / General</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_beat}
                onChange={(e) => setForm({ ...form, is_beat: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite/80 text-xs">Is Beat Catalog Item</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite/80 text-xs">Featured in Player</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite/80 text-xs">Published</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-ghost text-xs">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.title || !form.audio_url || create.isPending || update.isPending || uploadingAudio || uploadingCover}
            className="btn-primary rounded-xl text-xs px-6 py-2.5 disabled:opacity-40"
          >
            {create.isPending || update.isPending ? 'Saving...' : 'Save Track'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MusicAdminPage() {
  const { data: tracks = [], isLoading, error } = useAdminMusicTracks()
  const { data: categories = [] } = useBeatCategories()
  const deleteTrack = useDeleteTrack()

  const [showModal, setShowModal] = useState(false)
  const [editingTrack, setEditingTrack] = useState<MusicTrack | undefined>()

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete track "${title}"?`)) return
    try {
      await deleteTrack.mutateAsync(id)
      toast.success('Track deleted.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to delete track'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Music & Beat Catalog</h1>
          <p className="text-gray-muted text-xs mt-1">Upload audio stems, master tracks, beats, BPM, pricing, and audio playback.</p>
        </div>
        <button
          onClick={() => { setEditingTrack(undefined); setShowModal(true) }}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          Add Track
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs">
          {getErrorMessage(error, 'Failed to load tracks from Supabase.')}
        </div>
      )}

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Track</th>
              <th>Category / Genre</th>
              <th>BPM / Key</th>
              <th>Price</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7}>
                    <div className="h-8 bg-charcoal-light rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : tracks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-muted text-xs">
                  No music tracks found. Click "Add Track" to upload your first audio.
                </td>
              </tr>
            ) : (
              tracks.map((track) => (
                <tr key={track.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {track.cover_url ? (
                        <img
                          src={track.cover_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                          <MusicIcon size={16} className="text-gray-muted" />
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-semibold text-offwhite text-sm">{track.title}</p>
                        <p className="text-xs text-gray-muted">{track.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-offwhite/80">
                    {track.beat_category?.name || track.genre || '—'}
                  </td>
                  <td className="text-xs font-mono text-offwhite/70">
                    {track.bpm ? `${track.bpm} BPM` : ''} {track.key ? `· ${track.key}` : ''}
                  </td>
                  <td className="text-xs font-heading font-bold text-orange">
                    {track.price ? formatCurrency(track.price) : 'Free / Stream'}
                  </td>
                  <td>
                    <span className="text-[10px] uppercase tracking-wider font-heading px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-offwhite/70">
                      {track.is_beat ? 'Beat' : 'Song'}
                    </span>
                  </td>
                  <td>
                    <span className={track.is_published ? 'badge-approved' : 'badge-cancelled'}>
                      {track.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingTrack(track); setShowModal(true) }}
                        className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(track.id, track.title)}
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
        <TrackModal
          track={editingTrack}
          categories={categories}
          onClose={() => { setShowModal(false); setEditingTrack(undefined) }}
        />
      )}
    </div>
  )
}
