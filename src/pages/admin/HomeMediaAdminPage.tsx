import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload, Check, AlertCircle, ExternalLink,
  Layers, RefreshCw, Eye
} from 'lucide-react'
import { useHomeMedia, useUpdateHomeMedia, INITIAL_HOME_MEDIA } from '../../hooks/useHomeMedia'
import { uploadImage } from '../../lib/storage'
import type { HomeMediaItem } from '../../types'

export default function HomeMediaAdminPage() {
  const { data: mediaItems = INITIAL_HOME_MEDIA } = useHomeMedia()
  const updateMedia = useUpdateHomeMedia()

  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})
  const [altTexts, setAltTexts] = useState<Record<string, string>>({})
  const [filesToUpload, setFilesToUpload] = useState<Record<string, File>>({})
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ slot: string; type: 'success' | 'error'; text: string } | null>(null)

  const handleFileSelect = (slot_key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // MIME Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setStatusMessage({
        slot: slot_key,
        type: 'error',
        text: 'Unsupported format. Please upload JPG, PNG, or WEBP.',
      })
      return
    }

    // Size Validation (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        slot: slot_key,
        type: 'error',
        text: 'File size exceeds 10MB limit.',
      })
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrls((prev) => ({ ...prev, [slot_key]: objectUrl }))
    setFilesToUpload((prev) => ({ ...prev, [slot_key]: file }))
    setStatusMessage(null)
  }

  const handleCancelPreview = (slot_key: string) => {
    setPreviewUrls((prev) => {
      const next = { ...prev }
      delete next[slot_key]
      return next
    })
    setFilesToUpload((prev) => {
      const next = { ...prev }
      delete next[slot_key]
      return next
    })
    setStatusMessage(null)
  }

  const handleSaveSlot = async (item: HomeMediaItem) => {
    const slotKey = item.slot_key
    const file = filesToUpload[slotKey]
    const customAlt = altTexts[slotKey] !== undefined ? altTexts[slotKey] : item.alt_text

    setUploadingSlot(slotKey)
    setStatusMessage(null)

    try {
      let finalImageUrl = item.image_url

      // Upload new file to Supabase Storage if selected
      if (file) {
        finalImageUrl = await uploadImage('studio-images', file, 'home-media')
      }

      // Save to Supabase table & local cache
      await updateMedia.mutateAsync({
        slot_key: slotKey,
        image_url: finalImageUrl,
        alt_text: customAlt,
      })

      // Clean preview states
      setPreviewUrls((prev) => {
        const next = { ...prev }
        delete next[slotKey]
        return next
      })
      setFilesToUpload((prev) => {
        const next = { ...prev }
        delete next[slotKey]
        return next
      })

      setStatusMessage({
        slot: slotKey,
        type: 'success',
        text: 'Image updated successfully.',
      })
    } catch (err: any) {
      setStatusMessage({
        slot: slotKey,
        type: 'error',
        text: err?.message || 'Failed to update image. Please try again.',
      })
    } finally {
      setUploadingSlot(null)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-border/40 pb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite uppercase tracking-wider">
            Home Page Media CMS
          </h1>
          <p className="text-gray-muted text-sm mt-1">
            Manage, replace, and configure images displayed across the public Homepage without editing code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hero-slides"
            className="btn-secondary text-xs flex items-center gap-2 py-2.5 px-4 rounded-xl"
          >
            <Layers size={15} className="text-orange" />
            Manage Hero Slider
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs flex items-center gap-2 py-2.5 px-4 rounded-xl"
          >
            <ExternalLink size={15} />
            Preview Home
          </a>
        </div>
      </div>

      {/* Hero Slides Info Banner */}
      <div className="p-5 bg-charcoal border border-gray-border/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-offwhite">
              Hero Section Background Slides
            </h3>
            <p className="text-xs text-gray-muted">
              The primary hero carousel slides are managed with title, subtitle, CTA links, and image ordering.
            </p>
          </div>
        </div>
        <Link
          to="/admin/hero-slides"
          className="btn-primary text-xs py-2 px-4 rounded-lg font-heading font-semibold shrink-0"
        >
          GO TO HERO SLIDES →
        </Link>
      </div>

      {/* Media Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mediaItems.map((item) => {
          const isUploading = uploadingSlot === item.slot_key
          const previewUrl = previewUrls[item.slot_key]
          const displayImage = previewUrl || item.image_url
          const status = statusMessage?.slot === item.slot_key ? statusMessage : null
          const currentAlt = altTexts[item.slot_key] !== undefined ? altTexts[item.slot_key] : item.alt_text

          return (
            <div
              key={item.slot_key}
              className="bg-navy border border-gray-border/60 rounded-2xl overflow-hidden shadow-card flex flex-col justify-between"
            >
              {/* Image Preview Box */}
              <div>
                <div className="relative aspect-video bg-charcoal overflow-hidden border-b border-gray-border/40">
                  <img
                    src={displayImage}
                    alt={item.alt_text}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Slot Tag */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-orange font-semibold">
                    {item.slot_key}
                  </div>

                  {/* Preview Badge */}
                  {previewUrl && (
                    <div className="absolute top-3 right-3 bg-orange text-black px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Eye size={12} />
                      Unsaved Preview
                    </div>
                  )}

                  {/* Slot Title Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-heading font-bold text-base text-offwhite truncate">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-offwhite/60 truncate font-body">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Slot Details & Alt Text */}
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-heading font-medium uppercase tracking-wider text-offwhite/80 mb-1.5">
                      Alt Text (SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      value={currentAlt}
                      onChange={(e) => setAltTexts((prev) => ({ ...prev, [item.slot_key]: e.target.value }))}
                      placeholder="Descriptive text for screen readers and SEO"
                      className="input-field text-xs py-2 w-full"
                    />
                  </div>

                  {/* Status Banner */}
                  {status && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        status.type === 'success'
                          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}
                    >
                      {status.type === 'success' ? (
                        <Check size={14} className="shrink-0" />
                      ) : (
                        <AlertCircle size={14} className="shrink-0" />
                      )}
                      <span>{status.text}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 border-t border-gray-border/20 mt-2 flex items-center justify-between gap-3">
                {previewUrl ? (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => handleCancelPreview(item.slot_key)}
                      disabled={isUploading}
                      className="btn-secondary text-xs py-2.5 px-4 rounded-xl flex-1 text-center"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => handleSaveSlot(item)}
                      disabled={isUploading}
                      className="btn-primary text-xs py-2.5 px-4 rounded-xl flex-1 flex items-center justify-center gap-2 font-heading font-bold"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          UPLOADING...
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          SAVE CHANGES
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <label className="btn-secondary text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center gap-2 hover:border-orange/50 transition-colors">
                      <Upload size={14} className="text-orange" />
                      REPLACE IMAGE
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileSelect(item.slot_key, e)}
                      />
                    </label>

                    {currentAlt !== item.alt_text && (
                      <button
                        onClick={() => handleSaveSlot(item)}
                        disabled={isUploading}
                        className="btn-primary text-xs py-2.5 px-4 rounded-xl font-heading font-bold"
                      >
                        SAVE ALT TEXT
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
