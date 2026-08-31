import { useState, useEffect, useRef } from 'react'
import { useSiteSettings, useUpdateSiteSettings } from '../../hooks/useSettings'
import { Save, Sliders, Shield, Megaphone, Globe, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import { STUDIO_POLICY_DEFAULT } from '../../lib/constants'
import { DEFAULT_STUDIO_SEO_IMAGE } from '../../data/studioImages'
import toast from 'react-hot-toast'

export default function SiteSettingsPage() {
  const { data: settings, isLoading } = useSiteSettings()
  const updateSettings = useUpdateSiteSettings()

  const [form, setForm] = useState({
    hero_title: 'YOUR SOUND.\nYOUR SPACE.',
    hero_subtitle:
      'Professional recording, production, mixing, mastering and creative studio services in Tamarac, Florida.',
    hero_cta_primary: 'BOOK A SESSION',
    hero_cta_secondary: 'EXPLORE THE STUDIO',
    promo_message: "When you record a complete music, you'll receive a free visualizer in the studio.",
    promo_message_enabled: true,
    studio_policy: STUDIO_POLICY_DEFAULT,
    deposit_percentage: 50,
    seo_title: 'Patizan Records | Recording Studio in Tamarac, FL',
    meta_description:
      'Professional recording, music production, mixing, mastering, podcast and creative studio services in Tamarac, Florida.',
    og_image_url: `https://patizanrecords.com${DEFAULT_STUDIO_SEO_IMAGE}`,
    canonical_url: 'https://patizanrecords.com',
  })

  const [uploadingSeoImage, setUploadingSeoImage] = useState(false)
  const seoFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (settings) {
      setForm({
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        hero_cta_primary: settings.hero_cta_primary || 'BOOK A SESSION',
        hero_cta_secondary: settings.hero_cta_secondary || 'EXPLORE THE STUDIO',
        promo_message: settings.promo_message || '',
        promo_message_enabled: settings.promo_message_enabled ?? true,
        studio_policy: settings.studio_policy || '',
        deposit_percentage: settings.deposit_percentage || 50,
        seo_title: settings.seo_title || 'Patizan Records | Recording Studio in Tamarac, FL',
        meta_description:
          settings.meta_description ||
          'Professional recording, music production, mixing, mastering, podcast and creative studio services in Tamarac, Florida.',
        og_image_url:
          settings.og_image_url || `https://patizanrecords.com${DEFAULT_STUDIO_SEO_IMAGE}`,
        canonical_url: settings.canonical_url || 'https://patizanrecords.com',
      })
    }
  }, [settings])

  const handleSeoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingSeoImage(true)
    try {
      const publicUrl = await uploadImage('site-assets', file, 'seo')
      setForm((prev) => ({ ...prev, og_image_url: publicUrl }))
      toast.success('Social preview image uploaded successfully!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload social preview image'))
    } finally {
      setUploadingSeoImage(false)
    }
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form)
      toast.success('Site settings and SEO metadata saved!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update settings'))
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-muted">Loading settings...</div>
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-offwhite">Website Customization & SEO</h2>
          <p className="text-gray-muted text-sm mt-1">
            Control homepage headlines, SEO & social sharing preview images, promotional banner, and studio terms.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending || uploadingSeoImage}
          className="btn-primary rounded-xl text-sm flex items-center gap-2"
        >
          <Save size={16} />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* ─── SEO & Social Preview CMS ─── */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Globe size={20} className="text-orange" />
          <div>
            <h3 className="font-heading font-bold text-lg text-offwhite">SEO & Social Sharing Preview (Open Graph)</h3>
            <p className="text-xs text-offwhite/60">
              Controls how Patizan Records appears when shared on WhatsApp, Facebook, Instagram, X/Twitter, and LinkedIn.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="label-field">Site / Meta Title</label>
              <input
                value={form.seo_title}
                onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                placeholder="Patizan Records | Recording Studio in Tamarac, FL"
                className="input-field rounded-xl"
              />
              <p className="text-[11px] text-offwhite/40 mt-1">Recommended: 50-60 characters</p>
            </div>

            <div>
              <label className="label-field">Meta Description</label>
              <textarea
                value={form.meta_description}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                rows={3}
                placeholder="Professional recording, music production, mixing, mastering..."
                className="input-field rounded-xl resize-none text-xs"
              />
              <p className="text-[11px] text-offwhite/40 mt-1">Recommended: 120-160 characters</p>
            </div>

            <div>
              <label className="label-field">Canonical URL</label>
              <input
                value={form.canonical_url}
                onChange={(e) => setForm({ ...form, canonical_url: e.target.value })}
                placeholder="https://patizanrecords.com"
                className="input-field rounded-xl"
              />
            </div>

            <div>
              <label className="label-field">Social Preview Image (1200 × 630 px)</label>
              <div className="flex gap-2">
                <input
                  value={form.og_image_url}
                  onChange={(e) => setForm({ ...form, og_image_url: e.target.value })}
                  placeholder="https://..."
                  className="input-field rounded-xl flex-1 text-xs"
                />
                <input
                  type="file"
                  ref={seoFileInputRef}
                  onChange={handleSeoImageUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => seoFileInputRef.current?.click()}
                  disabled={uploadingSeoImage}
                  className="px-3.5 py-2 rounded-xl bg-orange hover:bg-[#FFA043] text-black text-xs font-heading font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Upload size={14} />
                  <span>{uploadingSeoImage ? 'Uploading...' : 'Replace Image'}</span>
                </button>
              </div>
              <p className="text-[11px] text-offwhite/40 mt-1">Formats: JPG, PNG, WEBP. Optimal size: 1200x630</p>
            </div>
          </div>

          {/* Social Card Preview */}
          <div>
            <label className="label-field mb-2 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-gold" />
              <span>Live Social Card Preview</span>
            </label>
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/60 shadow-2xl">
              {/* Image Preview (1200:630 ratio) */}
              <div className="aspect-[1200/630] w-full bg-charcoal relative overflow-hidden">
                {form.og_image_url ? (
                  <img
                    src={form.og_image_url}
                    alt="Social Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-offwhite/40 text-xs gap-2">
                    <ImageIcon size={28} />
                    <span>No preview image uploaded</span>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-offwhite/70 border border-white/10">
                  1200 × 630
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-1 bg-[#141414] border-t border-white/10">
                <p className="text-[10px] font-mono uppercase tracking-wider text-offwhite/40 flex items-center gap-1">
                  <span>{form.canonical_url.replace(/^https?:\/\//, '') || 'patizanrecords.com'}</span>
                  <ExternalLink size={10} />
                </p>
                <p className="font-heading font-bold text-sm text-offwhite line-clamp-1">
                  {form.seo_title || 'Patizan Records | Recording Studio in Tamarac, FL'}
                </p>
                <p className="text-xs text-offwhite/60 line-clamp-2 leading-relaxed">
                  {form.meta_description || 'Professional recording, music production, mixing, mastering...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Promotional Banner Settings ─── */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone size={18} className="text-orange" />
          <h3 className="font-heading font-bold text-base text-offwhite">Promotional Banner</h3>
        </div>

        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={form.promo_message_enabled}
            onChange={(e) => setForm({ ...form, promo_message_enabled: e.target.checked })}
            className="accent-orange"
          />
          <span className="text-offwhite text-sm font-medium">Enable Promo Announcement Bar</span>
        </label>

        <div>
          <label className="label-field">Promo Message</label>
          <input
            value={form.promo_message}
            onChange={(e) => setForm({ ...form, promo_message: e.target.value })}
            placeholder="Special offer or studio announcement..."
            className="input-field rounded-xl"
          />
        </div>
      </div>

      {/* ─── Hero Section Customization ─── */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sliders size={18} className="text-orange" />
          <h3 className="font-heading font-bold text-base text-offwhite">Homepage Hero Content</h3>
        </div>

        <div>
          <label className="label-field">Hero Headline (use linebreaks for split lines)</label>
          <textarea
            value={form.hero_title}
            onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
            rows={2}
            className="input-field rounded-xl resize-none font-heading font-bold"
          />
        </div>

        <div>
          <label className="label-field">Hero Subtitle</label>
          <textarea
            value={form.hero_subtitle}
            onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
            rows={2}
            className="input-field rounded-xl resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Primary Button Text</label>
            <input
              value={form.hero_cta_primary}
              onChange={(e) => setForm({ ...form, hero_cta_primary: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
          <div>
            <label className="label-field">Secondary Button Text</label>
            <input
              value={form.hero_cta_secondary}
              onChange={(e) => setForm({ ...form, hero_cta_secondary: e.target.value })}
              className="input-field rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* ─── Booking Policy ─── */}
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-orange" />
          <h3 className="font-heading font-bold text-base text-offwhite">Studio Policy & Terms</h3>
        </div>

        <div className="w-48">
          <label className="label-field">Deposit Percentage (%)</label>
          <input
            type="number"
            value={form.deposit_percentage}
            onChange={(e) => setForm({ ...form, deposit_percentage: parseInt(e.target.value) || 0 })}
            className="input-field rounded-xl"
          />
        </div>

        <div>
          <label className="label-field">Studio Policy Text (shown in booking step 5)</label>
          <textarea
            value={form.studio_policy}
            onChange={(e) => setForm({ ...form, studio_policy: e.target.value })}
            rows={5}
            className="input-field rounded-xl resize-none font-body text-sm"
          />
        </div>
      </div>
    </div>
  )
}

