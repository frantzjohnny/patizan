import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Pencil, Upload, Eye, ArrowUp, ArrowDown,
  ExternalLink, Image as ImageIcon,
  Layers, Smartphone, Monitor, AlertCircle, X
} from 'lucide-react'
import {
  useAdminHeroSlides,
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useDeleteHeroSlide,
  useReorderHeroSlides,
} from '../../hooks/useHeroSlides'
import { uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import toast from 'react-hot-toast'
import type { HeroSlide, HeroImagePosition } from '../../types'

interface SlideModalProps {
  slide?: HeroSlide | null
  onClose: () => void
  totalSlides: number
}

const POSITION_OPTIONS: { value: HeroImagePosition; label: string }[] = [
  { value: 'center', label: 'Center (Default)' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

function SlideEditorModal({ slide, onClose, totalSlides }: SlideModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

  const [form, setForm] = useState({
    title: slide?.title || 'YOUR SOUND.\nYOUR SPACE.',
    subtitle: slide?.subtitle || 'PATIZAN RECORDS',
    description:
      slide?.description ||
      'A professional recording environment built for artists, producers and creators in South Florida.',
    background_image: slide?.background_image || '',
    image_position: (slide?.image_position || 'center') as HeroImagePosition,
    primary_button_text: slide?.primary_button_text || 'BOOK A SESSION',
    primary_button_link: slide?.primary_button_link || '/book-session',
    secondary_button_text: slide?.secondary_button_text || 'EXPLORE THE STUDIO',
    secondary_button_link: slide?.secondary_button_link || '/studio',
    is_active: slide?.is_active ?? true,
    display_order: slide?.display_order ?? totalSlides + 1,
  })

  const create = useCreateHeroSlide()
  const update = useUpdateHeroSlide()

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadImage('studio-images', file, 'hero')
      setForm((f) => ({ ...f, background_image: url }))
      toast.success('Hero slide image uploaded!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload hero image'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.background_image.trim()) {
      toast.error('Background image URL is required')
      return
    }

    try {
      if (slide) {
        await update.mutateAsync({ id: slide.id, ...form })
        toast.success('Slide updated successfully!')
      } else {
        await create.mutateAsync(form)
        toast.success('New slide created successfully!')
      }
      onClose()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save hero slide'))
    }
  }

  const titleLines = form.title.split('\n')

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-navy border border-gray-border rounded-2xl w-full max-w-5xl my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-border/70 flex items-center justify-between bg-charcoal/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-offwhite">
                {slide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
              </h3>
              <p className="text-xs text-gray-muted">
                Configure background image, crop position, dynamic headline, copy and action buttons.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-muted hover:text-offwhite hover:bg-charcoal rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (Split 2 Columns: Form on Left, Live Preview on Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Form Side */}
          <form onSubmit={handleSave} className="lg:col-span-6 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-gray-border/60">
            {/* Title */}
            <div>
              <label className="label-field flex items-center justify-between">
                <span>Slide Title (Supports line breaks) *</span>
                <span className="text-[10px] text-gray-muted font-normal uppercase">Press Enter for multi-line</span>
              </label>
              <textarea
                rows={2}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="YOUR SOUND.&#10;YOUR SPACE."
                className="input-field rounded-xl font-heading font-bold text-base leading-snug resize-none"
                required
              />
            </div>

            {/* Subtitle / Label */}
            <div>
              <label className="label-field">Subtitle / Eyebrow Label</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="PATIZAN RECORDS"
                className="input-field rounded-xl"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label-field">Description Copy</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A professional recording environment built for artists, producers and creators in South Florida."
                className="input-field rounded-xl text-sm resize-none"
              />
            </div>

            {/* Background Image & Image Position */}
            <div className="space-y-3">
              <label className="label-field">Background Image (1920x1080 Recommended)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.background_image}
                  onChange={(e) => setForm({ ...form, background_image: e.target.value })}
                  placeholder="https://.../storage/v1/object/public/..."
                  className="input-field rounded-xl text-xs font-mono"
                  required
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-charcoal hover:bg-charcoal-light border border-gray-border hover:border-orange/40 rounded-xl text-xs font-heading font-semibold text-offwhite transition-all flex items-center gap-2 shrink-0"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>Upload</span>
                </button>
              </div>

              {/* Image Position Selector */}
              <div>
                <label className="label-field flex items-center justify-between">
                  <span>Image Crop / Focal Position</span>
                  <span className="text-[10px] text-gray-muted font-mono font-normal">{form.image_position}</span>
                </label>
                <select
                  value={form.image_position}
                  onChange={(e) => setForm({ ...form, image_position: e.target.value as HeroImagePosition })}
                  className="input-field rounded-xl text-xs"
                >
                  {POSITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA Buttons Row 1: Primary */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Primary CTA Text</label>
                <input
                  type="text"
                  value={form.primary_button_text}
                  onChange={(e) => setForm({ ...form, primary_button_text: e.target.value })}
                  placeholder="BOOK A SESSION"
                  className="input-field rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="label-field">Primary CTA Link</label>
                <input
                  type="text"
                  value={form.primary_button_link}
                  onChange={(e) => setForm({ ...form, primary_button_link: e.target.value })}
                  placeholder="/book-session"
                  className="input-field rounded-xl text-xs"
                />
              </div>
            </div>

            {/* CTA Buttons Row 2: Secondary */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Secondary CTA Text</label>
                <input
                  type="text"
                  value={form.secondary_button_text}
                  onChange={(e) => setForm({ ...form, secondary_button_text: e.target.value })}
                  placeholder="EXPLORE THE STUDIO"
                  className="input-field rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="label-field">Secondary CTA Link</label>
                <input
                  type="text"
                  value={form.secondary_button_link}
                  onChange={(e) => setForm({ ...form, secondary_button_link: e.target.value })}
                  placeholder="/studio"
                  className="input-field rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Active & Display Order */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="label-field">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 1 })}
                  className="input-field rounded-xl"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer select-none bg-charcoal/60 border border-gray-border/60 p-3 rounded-xl hover:border-gray-border transition-colors">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-orange bg-navy border-gray-border rounded focus:ring-orange accent-orange"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-heading font-semibold text-offwhite">Slide Active</span>
                    <span className="text-[10px] text-gray-muted">Visible on live homepage</span>
                  </div>
                </label>
              </div>
            </div>
          </form>

          {/* Live Preview Side */}
          <div className="lg:col-span-6 bg-black/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-orange" />
                  <span className="text-xs font-heading font-bold tracking-wider uppercase text-offwhite">
                    Live UI Preview
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-charcoal p-1 rounded-lg border border-gray-border/50">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-md transition-colors ${
                      previewDevice === 'desktop' ? 'bg-orange text-black' : 'text-gray-muted hover:text-offwhite'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-md transition-colors ${
                      previewDevice === 'mobile' ? 'bg-orange text-black' : 'text-gray-muted hover:text-offwhite'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              {/* Simulated Hero Viewport */}
              <div
                className={`mx-auto rounded-xl overflow-hidden border border-gray-border/80 relative shadow-2xl transition-all duration-300 ${
                  previewDevice === 'desktop' ? 'w-full aspect-[16/10]' : 'w-64 aspect-[9/16]'
                }`}
              >
                {/* Background image */}
                {form.background_image ? (
                  <img
                    src={form.background_image}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover transition-all"
                    style={{ objectPosition: form.image_position || 'center' }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-charcoal flex items-center justify-center text-gray-muted text-xs">
                    No image provided
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />

                {/* Simulated Content */}
                <div className="relative z-20 h-full p-4 md:p-6 flex flex-col justify-center text-left">
                  {/* Subtitle */}
                  {form.subtitle && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
                      <span className="font-heading text-[10px] md:text-xs font-bold tracking-widest text-orange uppercase">
                        {form.subtitle}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h4 className="font-heading font-bold text-offwhite text-sm md:text-xl lg:text-2xl leading-none tracking-tight mb-2">
                    {titleLines.map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </h4>

                  {/* Description */}
                  {form.description && (
                    <p className="font-body text-offwhite/75 text-[10px] md:text-xs line-clamp-3 max-w-xs mb-4 leading-relaxed">
                      {form.description}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {form.primary_button_text && (
                      <span className="px-3 py-1.5 bg-orange text-black font-heading font-bold text-[9px] md:text-[10px] rounded-lg shadow-sm">
                        {form.primary_button_text}
                      </span>
                    )}
                    {form.secondary_button_text && (
                      <span className="px-3 py-1.5 bg-transparent border border-white/40 text-offwhite font-heading font-medium text-[9px] md:text-[10px] rounded-lg">
                        {form.secondary_button_text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulated slider pagination indicator */}
                <div className="absolute bottom-3 right-4 z-20 text-[9px] font-mono text-offwhite/60 tracking-wider">
                  0{form.display_order} / 0{totalSlides || 1}
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-gray-muted border-t border-gray-border/40 mt-4 flex items-center justify-between">
              <span className="text-offwhite/60">
                Text is rendered cleanly via HTML/UI
              </span>
              <span className="text-[11px] text-gold font-mono">
                Order: #{form.display_order} • Pos: {form.image_position}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-border/70 flex items-center justify-end gap-3 bg-charcoal/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-border text-xs font-heading font-semibold text-gray-muted hover:text-offwhite hover:bg-charcoal transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={create.isPending || update.isPending}
            className="btn-primary rounded-xl text-xs px-6 py-2.5 flex items-center gap-2"
          >
            {create.isPending || update.isPending ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : null}
            <span>{slide ? 'Save Changes' : 'Create Slide'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HeroSlidesAdminPage() {
  const { data: slides = [], isLoading } = useAdminHeroSlides()
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null | 'new'>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const update = useUpdateHeroSlide()
  const deleteSlide = useDeleteHeroSlide()
  const reorder = useReorderHeroSlides()

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await update.mutateAsync({
        id: slide.id,
        is_active: !slide.is_active,
      })
      toast.success(slide.is_active ? 'Slide deactivated' : 'Slide activated')
    } catch {
      toast.error('Failed to update slide status')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSlide.mutateAsync(id)
      toast.success('Slide removed')
      setDeletingId(null)
    } catch {
      toast.error('Failed to delete slide')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= slides.length) return

    const newSlides = [...slides]
    const temp = newSlides[index]
    newSlides[index] = newSlides[targetIndex]
    newSlides[targetIndex] = temp

    const updates = newSlides.map((s, idx) => ({
      id: s.id,
      display_order: idx + 1,
    }))

    try {
      await reorder.mutateAsync(updates)
      toast.success('Order updated!')
    } catch {
      toast.error('Failed to reorder slides')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-orange/10 border border-orange/30 text-orange text-[10px] font-heading font-bold uppercase tracking-widest">
              CMS Engine
            </span>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-offwhite">
              Hero Slider Management
            </h1>
          </div>
          <p className="text-gray-muted text-sm max-w-2xl">
            Control the full-screen cinematic hero carousel. Add background studio imagery, customize crop position, dynamic headline text, and booking call-to-actions.
          </p>
        </div>

        <button
          onClick={() => setEditingSlide('new')}
          className="btn-primary rounded-xl text-xs px-5 py-3 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {/* Hero Slider Guidelines Box */}
      <div className="bg-navy/80 border border-gray-border/60 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shrink-0">
            <Layers size={16} />
          </div>
          <div>
            <h4 className="text-xs font-heading font-bold text-offwhite uppercase tracking-wider">
              Independent Text & Image
            </h4>
            <p className="text-xs text-gray-muted mt-1 leading-relaxed">
              Images crossfade seamlessly while text renders dynamically via HTML/UI directly from database.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
            <ImageIcon size={16} />
          </div>
          <div>
            <h4 className="text-xs font-heading font-bold text-offwhite uppercase tracking-wider">
              Focal Crop & Photography
            </h4>
            <p className="text-xs text-gray-muted mt-1 leading-relaxed">
              Upload 1920x1080 studio photography and select optimal focal crop positioning.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
            <ExternalLink size={16} />
          </div>
          <div>
            <h4 className="text-xs font-heading font-bold text-offwhite uppercase tracking-wider">
              Booking CTA Routing
            </h4>
            <p className="text-xs text-gray-muted mt-1 leading-relaxed">
              Direct primary clicks to <code>/book-session</code> and secondary to <code>/studio</code> or <code>/services</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Table & Slide Cards */}
      {isLoading ? (
        <div className="bg-navy border border-gray-border rounded-2xl p-16 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange/30 border-t-orange rounded-full animate-spin mb-3" />
          <span className="text-xs text-gray-muted font-heading uppercase tracking-wider">
            Loading Hero Slides...
          </span>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-navy border border-gray-border rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal border border-gray-border mx-auto flex items-center justify-center text-gray-muted">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-offwhite">No hero slides found</h3>
            <p className="text-sm text-gray-muted mt-1">Create your first cinematic slide to display on the homepage.</p>
          </div>
          <button
            onClick={() => setEditingSlide('new')}
            className="btn-primary rounded-xl text-xs px-5 py-2.5 inline-flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create Slide</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-navy border rounded-2xl overflow-hidden transition-all duration-200 ${
                  slide.is_active
                    ? 'border-gray-border hover:border-gray-border/80'
                    : 'border-gray-border/40 opacity-70 bg-navy/60'
                }`}
              >
                <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  {/* Left: Reorder & Thumbnail */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col gap-1 text-gray-muted">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:text-orange hover:bg-charcoal rounded disabled:opacity-20 disabled:hover:text-gray-muted"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span className="font-mono text-[11px] font-bold text-center text-offwhite/50">
                        0{index + 1}
                      </span>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === slides.length - 1}
                        className="p-1 hover:text-orange hover:bg-charcoal rounded disabled:opacity-20 disabled:hover:text-gray-muted"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-28 h-20 md:w-36 md:h-24 rounded-xl overflow-hidden relative border border-gray-border shrink-0 bg-black">
                      <img
                        src={slide.background_image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: slide.image_position || 'center' }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[9px] font-mono font-semibold text-offwhite/80">
                        <span>Slide #{slide.display_order}</span>
                        {slide.image_position && slide.image_position !== 'center' && (
                          <span className="text-orange">({slide.image_position})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Slide Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {slide.subtitle && (
                        <span className="text-[10px] font-heading font-bold text-orange uppercase tracking-wider">
                          {slide.subtitle}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-heading font-bold uppercase tracking-wider ${
                          slide.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}
                      >
                        {slide.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {slide.image_position && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-mono text-gray-muted bg-charcoal border border-gray-border/50">
                          Pos: {slide.image_position}
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-base md:text-lg text-offwhite truncate">
                      {slide.title.replace(/\n/g, ' • ')}
                    </h3>

                    {slide.description && (
                      <p className="text-xs text-gray-muted line-clamp-2 leading-relaxed">
                        {slide.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-gray-muted pt-1">
                      {slide.primary_button_text && (
                        <span className="text-offwhite/80">
                          <strong className="text-orange">CTA 1:</strong> {slide.primary_button_text} ({slide.primary_button_link || '/'})
                        </span>
                      )}
                      {slide.secondary_button_text && (
                        <span className="text-offwhite/80">
                          <strong className="text-gold">CTA 2:</strong> {slide.secondary_button_text} ({slide.secondary_button_link || '/'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-colors ${
                        slide.is_active
                          ? 'bg-charcoal hover:bg-zinc-800 text-gray-muted hover:text-offwhite'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {slide.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="p-2 bg-charcoal hover:bg-charcoal-light border border-gray-border rounded-xl text-gray-muted hover:text-offwhite transition-colors"
                      title="Edit Slide"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => setDeletingId(slide.id)}
                      className="p-2 bg-charcoal hover:bg-red-500/10 border border-gray-border hover:border-red-500/30 rounded-xl text-gray-muted hover:text-red-400 transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-navy border border-gray-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-offwhite">Delete Hero Slide?</h3>
                <p className="text-xs text-gray-muted mt-1 leading-relaxed">
                  Are you sure you want to delete this slide? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-heading font-semibold text-gray-muted hover:text-offwhite bg-charcoal"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  className="px-4 py-2 rounded-xl text-xs font-heading font-bold text-white bg-red-600 hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide Edit/Create Modal */}
      <AnimatePresence>
        {editingSlide && (
          <SlideEditorModal
            slide={editingSlide === 'new' ? null : editingSlide}
            onClose={() => setEditingSlide(null)}
            totalSlides={slides.length}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
