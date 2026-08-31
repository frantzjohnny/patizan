import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Trash2, Pencil, Upload, ArrowUp, ArrowDown,
  CheckCircle, Sparkles, Eye, X, Camera, Check
} from 'lucide-react'
import {
  useAdminStudioPhotos,
  useCreateStudioPhoto,
  useUpdateStudioPhoto,
  useDeleteStudioPhoto,
  useReorderStudioPhotos,
  useSetSeoStudioPhoto,
} from '../../hooks/useStudioPhotos'
import { uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import toast from 'react-hot-toast'
import type { StudioPhoto, StudioPhotoCategory } from '../../types'

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  'control-room': { label: 'Control Room', color: 'bg-orange/15 text-orange border-orange/30' },
  'recording-booth': { label: 'Recording Booth', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  'podcast-setup': { label: 'Podcast Setup', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  'equipment': { label: 'Equipment & Gear', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'live-room': { label: 'Live Room', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'studio-interior': { label: 'Studio Interior', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  'studio-exterior': { label: 'Studio Exterior', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  'other': { label: 'Other Space', color: 'bg-white/10 text-offwhite/80 border-white/20' },
}

const CATEGORY_OPTIONS: { value: StudioPhotoCategory; label: string }[] = [
  { value: 'control-room', label: 'Control Room' },
  { value: 'recording-booth', label: 'Recording Booth' },
  { value: 'podcast-setup', label: 'Podcast Setup' },
  { value: 'equipment', label: 'Equipment & Gear' },
  { value: 'live-room', label: 'Live Room' },
  { value: 'studio-interior', label: 'Studio Interior' },
  { value: 'studio-exterior', label: 'Studio Exterior' },
  { value: 'other', label: 'Other Space' },
]

interface EditorModalProps {
  photo?: StudioPhoto | null
  onClose: () => void
  totalCount: number
}

function PhotoEditorModal({ photo, onClose, totalCount }: EditorModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(false)

  const [form, setForm] = useState({
    title: photo?.title || '',
    description: photo?.description || '',
    image_url: photo?.image_url || '',
    category: (photo?.category || 'control-room') as StudioPhotoCategory,
    display_order: photo?.display_order ?? totalCount + 1,
    is_active: photo?.is_active ?? true,
    is_seo_image: photo?.is_seo_image ?? false,
  })

  const create = useCreateStudioPhoto()
  const update = useUpdateStudioPhoto()

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      const url = await uploadImage('studio-images', file, 'photos')
      setForm((prev) => ({ ...prev, image_url: url }))
      toast.success('Studio photo uploaded to Supabase Storage!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload photo'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Photo title is required')
      return
    }
    if (!form.image_url.trim()) {
      toast.error('Please upload an image for this studio photo')
      return
    }

    try {
      if (photo) {
        await update.mutateAsync({
          id: photo.id,
          oldImageUrl: photo.image_url,
          ...form,
        })
        toast.success('Studio photo updated!')
      } else {
        await create.mutateAsync(form)
        toast.success('Studio photo added!')
      }
      onClose()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save studio photo'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-charcoal border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-2xl my-8 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-offwhite/50 hover:text-offwhite hover:bg-white/5 transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange/15 border border-orange/30 flex items-center justify-center text-orange">
            <Camera size={20} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-offwhite">
              {photo ? 'Edit Studio Photo' : 'Upload Studio Photo'}
            </h3>
            <p className="text-xs text-offwhite/50 font-body">
              Add real photographs of Patizan Records facilities to display in the Studio section.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Image Upload Area */}
          <div>
            <label className="label-field mb-2 flex items-center justify-between">
              <span>Photo Upload (High Resolution) *</span>
              {form.image_url && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle size={12} /> Supabase Storage Ready
                </span>
              )}
            </label>

            {form.image_url ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/10] bg-black group">
                <img
                  src={form.image_url}
                  alt="Studio preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-orange text-black font-heading font-bold text-xs flex items-center gap-2 hover:bg-orange-hover transition-colors"
                  >
                    <Upload size={14} />
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-offwhite font-heading font-medium text-xs flex items-center gap-2 hover:bg-white/20 transition-colors"
                  >
                    <Eye size={14} />
                    View Full
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed border-white/15 hover:border-orange/50 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 bg-black/40 hover:bg-black/60 ${
                  uploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 text-orange mx-auto flex items-center justify-center mb-3">
                  <Upload size={22} className={uploading ? 'animate-bounce' : ''} />
                </div>
                <p className="font-heading font-semibold text-sm text-offwhite mb-1">
                  {uploading ? 'Uploading to Supabase Storage...' : 'Click to select photo or drag & drop'}
                </p>
                <p className="text-xs text-offwhite/40 font-body">
                  Supports WEBP, PNG, JPG (up to 10MB). Clean, high-resolution studio shots recommended.
                </p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </div>

          {/* Title & Room Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field mb-1.5">Photo Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Main Control Room A"
                className="input-field rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="label-field mb-1.5">Room / Facility Space *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as StudioPhotoCategory })}
                className="input-field rounded-xl text-sm capitalize"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label-field mb-1.5">Description (Optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Highlight equipment, acoustic treatment, or features in this photo..."
              rows={2}
              className="input-field rounded-xl text-sm resize-none"
            />
          </div>

          {/* Display Order & Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="label-field mb-1.5">Display Order Number</label>
              <input
                type="number"
                min={1}
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 1 })}
                className="input-field rounded-xl text-sm font-mono"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-white/20 bg-charcoal text-orange focus:ring-orange/40 w-4 h-4"
                />
                <span className="text-sm font-heading font-medium text-offwhite">
                  Active (Visible on public studio page)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_seo_image}
                  onChange={(e) => setForm({ ...form, is_seo_image: e.target.checked })}
                  className="rounded border-white/20 bg-charcoal text-orange focus:ring-orange/40 w-4 h-4"
                />
                <span className="text-sm font-heading font-semibold text-gold flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Set as official SEO / Social Preview image
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-offwhite/70 hover:text-offwhite hover:bg-white/5 font-heading text-xs uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading || create.isPending || update.isPending}
            className="btn-primary px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider disabled:opacity-50 inline-flex items-center gap-2"
          >
            {create.isPending || update.isPending ? 'Saving...' : photo ? 'Save Changes' : 'Add Photo'}
          </button>
        </div>

        {/* Image Zoom Modal */}
        {previewZoom && (
          <div
            className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setPreviewZoom(false)}
          >
            <img
              src={form.image_url}
              alt="Zoomed preview"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function StudioPhotosAdminPage() {
  const { data: photos = [], isLoading } = useAdminStudioPhotos()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingPhoto, setEditingPhoto] = useState<StudioPhoto | null | 'new'>(null)
  const [previewPhoto, setPreviewPhoto] = useState<StudioPhoto | null>(null)

  const updateMutation = useUpdateStudioPhoto()
  const deleteMutation = useDeleteStudioPhoto()
  const reorderMutation = useReorderStudioPhotos()
  const setSeoMutation = useSetSeoStudioPhoto()

  // Filtered photos
  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter((p) => p.category === selectedCategory)

  // Current active SEO image
  const currentSeoPhoto = photos.find((p) => p.is_seo_image)

  const handleToggleActive = async (photo: StudioPhoto) => {
    try {
      await updateMutation.mutateAsync({
        id: photo.id,
        is_active: !photo.is_active,
      })
      toast.success(photo.is_active ? 'Photo deactivated' : 'Photo activated on website!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update status'))
    }
  }

  const handleSetSeoImage = async (photo: StudioPhoto) => {
    try {
      await setSeoMutation.mutateAsync({
        id: photo.id,
        imageUrl: photo.image_url,
      })
      toast.success(`"${photo.title}" is now the official SEO & Social Sharing image!`)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to set SEO image'))
    }
  }

  const handleDelete = async (photo: StudioPhoto) => {
    if (!window.confirm(`Are you sure you want to delete "${photo.title}"? This cannot be undone.`)) {
      return
    }

    try {
      await deleteMutation.mutateAsync({
        id: photo.id,
        imageUrl: photo.image_url,
      })
      toast.success('Studio photo deleted')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to delete photo'))
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= filteredPhotos.length) return

    const currentItem = filteredPhotos[index]
    const targetItem = filteredPhotos[targetIndex]

    const reordered = [
      { id: currentItem.id, display_order: targetItem.display_order },
      { id: targetItem.id, display_order: currentItem.display_order },
    ]

    try {
      await reorderMutation.mutateAsync(reordered)
      toast.success('Order updated')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to reorder photos'))
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 mb-2">
            <Camera size={13} className="text-orange" />
            <span className="text-[11px] font-heading font-bold tracking-widest text-orange uppercase">
              STUDIO FACILITY CMS
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-offwhite">Studio Photo Library</h1>
          <p className="text-sm text-offwhite/60 font-body mt-1">
            Upload, manage, and reorder real studio photography. One photo can also be chosen as the official SEO Social Preview image.
          </p>
        </div>

        <button
          onClick={() => setEditingPhoto('new')}
          className="btn-primary px-5 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} />
          Upload Studio Photo
        </button>
      </div>

      {/* SEO Social Share Preview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-charcoal via-navy to-charcoal border border-gold/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 text-gold font-heading font-bold text-xs tracking-widest uppercase mb-2">
              <Sparkles size={15} />
              OFFICIAL SEO & SOCIAL SHARING PREVIEW
            </div>
            <h3 className="font-heading font-bold text-xl text-offwhite mb-2">
              Website OpenGraph Image
            </h3>
            <p className="text-xs text-offwhite/70 font-body leading-relaxed mb-4">
              When someone shares <span className="text-orange font-mono">patizanrecords.com</span> on iMessage, Twitter, WhatsApp, or Facebook, this exact studio photo appears as the hero banner.
            </p>
            {currentSeoPhoto ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/40 text-gold text-xs font-heading font-semibold">
                <Check size={14} />
                Selected: {currentSeoPhoto.title}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-offwhite/50 text-xs">
                Using default branded fallback asset
              </div>
            )}
          </div>

          {/* Realistic Social Share Card Preview */}
          <div className="lg:col-span-8 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-black/80 shadow-2xl">
              <div className="aspect-[1.91/1] w-full bg-charcoal relative overflow-hidden">
                {currentSeoPhoto ? (
                  <img
                    src={currentSeoPhoto.image_url}
                    alt="SEO Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/images/og-default.svg"
                    alt="SEO Default"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-offwhite/80 border border-white/10">
                  1200 × 630 OG CARD
                </div>
              </div>
              <div className="p-4 border-t border-white/10">
                <p className="text-[10px] font-mono text-offwhite/40 uppercase tracking-wider mb-1">
                  PATIZANRECORDS.COM
                </p>
                <p className="font-heading font-bold text-sm text-offwhite truncate">
                  Patizan Records | Recording Studio in Tamarac, FL
                </p>
                <p className="text-xs text-offwhite/60 font-body line-clamp-1 mt-0.5">
                  Professional recording, music production, mixing, mastering & podcast suite in South Florida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl font-heading text-xs font-semibold tracking-wider uppercase transition-all ${
              selectedCategory === 'all'
                ? 'bg-orange text-black shadow-md'
                : 'bg-charcoal text-offwhite/70 hover:text-offwhite hover:bg-white/5 border border-white/10'
            }`}
          >
            All Spaces ({photos.length})
          </button>
          {CATEGORY_OPTIONS.map((cat) => {
            const count = photos.filter((p) => p.category === cat.value).length
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-xl font-heading text-xs font-semibold tracking-wider uppercase transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-orange text-black shadow-md'
                    : 'bg-charcoal text-offwhite/70 hover:text-offwhite hover:bg-white/5 border border-white/10'
                }`}
              >
                {cat.label} {count > 0 ? `(${count})` : ''}
              </button>
            )
          })}
        </div>

        <div className="text-xs font-mono text-offwhite/50">
          Showing {filteredPhotos.length} of {photos.length} photo{photos.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Photos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-white/10 bg-charcoal p-4 animate-pulse">
              <div className="aspect-[16/10] bg-white/5 rounded-xl mb-4" />
              <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/15 bg-charcoal/40">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 border border-orange/20 text-orange mx-auto flex items-center justify-center mb-4">
            <Camera size={26} />
          </div>
          <h3 className="font-heading font-bold text-lg text-offwhite mb-2">No Studio Photos Yet</h3>
          <p className="text-sm text-offwhite/60 font-body max-w-md mx-auto mb-6">
            Upload your first studio facility photograph (Control Room, Vocal Booth, Podcast Desk, Equipment) to display it on the public website.
          </p>
          <button
            onClick={() => setEditingPhoto('new')}
            className="btn-primary px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => {
            const catMeta = CATEGORY_LABELS[photo.category] || CATEGORY_LABELS['other']

            return (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  photo.is_seo_image
                    ? 'border-gold/60 bg-gradient-to-b from-charcoal via-navy/60 to-charcoal shadow-[0_0_30px_rgba(255,201,40,0.15)]'
                    : 'border-white/10 bg-charcoal hover:border-white/20'
                }`}
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[16/10] bg-black overflow-hidden group">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Badges Top */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-heading font-bold tracking-wider uppercase border backdrop-blur-md ${catMeta.color}`}>
                      {catMeta.label}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-offwhite/80 border border-white/10">
                      #{photo.display_order}
                    </span>
                  </div>

                  {/* SEO Image Golden Badge */}
                  {photo.is_seo_image && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-gold text-black font-heading font-bold text-[11px] tracking-wider uppercase shadow-lg flex items-center gap-1.5">
                      <Sparkles size={13} className="fill-black" />
                      CURRENT SEO IMAGE
                    </div>
                  )}

                  {/* Click to zoom preview */}
                  <button
                    onClick={() => setPreviewPhoto(photo)}
                    className="absolute top-3 right-12 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-offwhite/80 hover:text-offwhite opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View full image"
                  >
                    <Eye size={14} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-lg text-offwhite mb-1.5">
                      {photo.title}
                    </h4>
                    {photo.description ? (
                      <p className="text-xs text-offwhite/60 font-body line-clamp-2 mb-4">
                        {photo.description}
                      </p>
                    ) : (
                      <p className="text-xs text-offwhite/30 italic font-body mb-4">
                        No description provided.
                      </p>
                    )}
                  </div>

                  {/* Controls & Quick Actions */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    {/* Active toggle & Reorder buttons */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleToggleActive(photo)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold transition-colors ${
                          photo.is_active
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${photo.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {photo.is_active ? 'Active' : 'Inactive'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-offwhite/50 hover:text-offwhite hover:bg-white/5 disabled:opacity-20 transition-all"
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === filteredPhotos.length - 1}
                          className="p-1.5 rounded-lg text-offwhite/50 hover:text-offwhite hover:bg-white/5 disabled:opacity-20 transition-all"
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>

                    {/* SEO Button & Edit/Delete Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      {!photo.is_seo_image ? (
                        <button
                          onClick={() => handleSetSeoImage(photo)}
                          className="px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-heading font-semibold tracking-wider uppercase transition-all inline-flex items-center gap-1.5"
                          title="Set as website social preview / OG image"
                        >
                          <Sparkles size={12} />
                          USE AS SEO IMAGE
                        </button>
                      ) : (
                        <div className="text-[11px] font-heading font-bold text-gold flex items-center gap-1">
                          <Check size={12} /> ACTIVE SEO IMAGE
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingPhoto(photo)}
                          className="p-2 rounded-xl text-offwhite/70 hover:text-offwhite hover:bg-white/5 transition-colors"
                          title="Edit Photo"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(photo)}
                          className="p-2 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Photo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Editor Modal */}
      {editingPhoto && (
        <PhotoEditorModal
          photo={editingPhoto === 'new' ? null : editingPhoto}
          onClose={() => setEditingPhoto(null)}
          totalCount={photos.length}
        />
      )}

      {/* Fullscreen Preview Zoom Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-offwhite hover:bg-white/20 transition-all"
          >
            <X size={24} />
          </button>
          <img
            src={previewPhoto.image_url}
            alt={previewPhoto.title}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
          />
          <div className="mt-4 text-center">
            <h3 className="font-heading font-bold text-lg text-offwhite">{previewPhoto.title}</h3>
            {previewPhoto.description && (
              <p className="text-sm text-offwhite/60 font-body mt-1 max-w-xl">{previewPhoto.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
