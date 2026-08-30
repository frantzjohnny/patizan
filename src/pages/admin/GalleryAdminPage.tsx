import { useState, useRef } from 'react'
import { Plus, Trash2, Pencil, Upload, X, Film } from 'lucide-react'
import { useAdminGalleryItems, useGalleryCategories, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem } from '../../hooks/useGallery'
import { uploadImage, uploadVideo } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import toast from 'react-hot-toast'
import type { GalleryItem, GalleryCategory } from '../../types'

function GalleryUploadModal({
  categories,
  item,
  onClose,
}: {
  categories: GalleryCategory[]
  item?: GalleryItem
  onClose: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: item?.title || '',
    url: item?.url || '',
    thumbnail_url: item?.thumbnail_url || '',
    media_type: item?.media_type || 'image',
    category_id: item?.category_id || '',
    is_featured: item?.is_featured || false,
    is_published: item?.is_published ?? true,
    display_order: item?.display_order ?? 0,
  })

  const create = useCreateGalleryItem()
  const update = useUpdateGalleryItem()

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      if (file.type.startsWith('video/')) {
        const url = await uploadVideo(file, 'gallery')
        setForm((f) => ({ ...f, url, media_type: 'video' }))
        toast.success('Video uploaded!')
      } else {
        const url = await uploadImage('gallery', file, 'gallery')
        setForm((f) => ({ ...f, url, media_type: 'image' }))
        toast.success('Image uploaded!')
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload media'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.url.trim()) {
      toast.error('Please upload an image or provide a media URL')
      return
    }

    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        display_order: parseInt(form.display_order.toString()) || 0,
      }
      if (item) {
        await update.mutateAsync({ id: item.id, ...payload })
        toast.success('Media item updated!')
      } else {
        await create.mutateAsync(payload)
        toast.success('Media item added to gallery!')
      }
      onClose()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save gallery item'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-lg my-8">
        <h3 className="font-heading font-bold text-xl text-offwhite mb-6">
          {item ? 'Edit Gallery Media' : 'Add Media to Gallery'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label-field">Media Type</label>
            <select
              value={form.media_type}
              onChange={(e) => setForm({ ...form, media_type: e.target.value as GalleryItem['media_type'] })}
              className="input-field rounded-xl"
            >
              <option value="image">Image (Upload or URL)</option>
              <option value="video">Direct Video (.mp4 / .webm)</option>
              <option value="youtube">YouTube Embed URL</option>
              <option value="vimeo">Vimeo Embed URL</option>
            </select>
          </div>

          {form.media_type === 'image' ? (
            <div>
              <label className="label-field">Studio Image File</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              {form.url ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={form.url} alt="" className="w-full h-44 object-cover" />
                  <button
                    onClick={() => setForm({ ...form, url: '' })}
                    className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-border rounded-xl p-8 text-gray-muted hover:border-orange/50 hover:text-offwhite transition-all flex flex-col items-center gap-2.5"
                >
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
                  ) : (
                    <Upload size={22} className="text-orange" />
                  )}
                  <span className="text-xs font-heading font-medium">
                    {uploading ? 'Uploading to Supabase Storage...' : 'Click to select and upload studio photo'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <label className="label-field">Media URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className="input-field rounded-xl text-xs"
              />
            </div>
          )}

          <div>
            <label className="label-field">Title / Caption (Optional)</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field rounded-xl"
              placeholder="e.g. Studio A Vocal Booth"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input-field rounded-xl"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
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

          <div className="flex gap-6 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite/80 text-xs">Featured on Homepage</span>
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
          <button onClick={onClose} className="btn-ghost text-xs">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.url || create.isPending || update.isPending || uploading}
            className="btn-primary rounded-xl text-xs px-6 py-2.5 disabled:opacity-40"
          >
            {create.isPending || update.isPending ? 'Saving...' : item ? 'Update Media' : 'Add to Gallery'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GalleryAdminPage() {
  const { data: items = [], isLoading, error } = useAdminGalleryItems()
  const { data: categories = [] } = useGalleryCategories()
  const deleteItem = useDeleteGalleryItem()
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | undefined>()

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return
    try {
      await deleteItem.mutateAsync(id)
      toast.success('Media item deleted.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to delete media item'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Studio Gallery & Media</h1>
          <p className="text-gray-muted text-xs mt-1">Upload facility photography, video clips, and studio equipment showcases.</p>
        </div>
        <button
          onClick={() => { setEditingItem(undefined); setShowModal(true) }}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          Add Media
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs">
          {getErrorMessage(error, 'Failed to load gallery items from Supabase.')}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-charcoal rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-charcoal rounded-2xl border border-gray-border text-gray-muted text-xs">
          No gallery media uploaded yet. Click "Add Media" to upload studio photography.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-charcoal border border-gray-border relative">
                {item.media_type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 text-offwhite/70 gap-1.5">
                    <Film size={24} className="text-orange" />
                    <span className="text-[10px] font-mono">Video</span>
                  </div>
                ) : item.url.includes('youtube') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/30 text-red-400 gap-1.5">
                    <Film size={24} />
                    <span className="text-[10px] font-mono">YouTube</span>
                  </div>
                ) : (
                  <img
                    src={item.thumbnail_url || item.url}
                    alt={item.title || ''}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-[11px] font-heading font-medium text-offwhite truncate">{item.title}</p>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => { setEditingItem(item); setShowModal(true) }}
                  className="p-2 bg-charcoal rounded-lg text-offwhite hover:text-orange transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-charcoal rounded-lg text-offwhite hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {!item.is_published && (
                <div className="absolute top-2 left-2 bg-amber-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded">
                  Draft
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <GalleryUploadModal
          categories={categories}
          item={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(undefined) }}
        />
      )}
    </div>
  )
}
