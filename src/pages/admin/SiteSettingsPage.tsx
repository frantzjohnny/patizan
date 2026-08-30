import { useState, useEffect } from 'react'
import { useSiteSettings, useUpdateSiteSettings } from '../../hooks/useSettings'
import { Save, Sliders, Shield, Megaphone } from 'lucide-react'
import { STUDIO_POLICY_DEFAULT } from '../../lib/constants'
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
  })

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
      })
    }
  }, [settings])

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form)
      toast.success('Site settings updated!')
    } catch {
      toast.error('Failed to update settings')
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-muted">Loading settings...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-offwhite">Website Customization & Policies</h2>
          <p className="text-gray-muted text-sm mt-1">
            Control the homepage headlines, promotional announcement bar, and client booking terms.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="btn-primary rounded-xl text-sm flex items-center gap-2"
        >
          <Save size={16} />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Promotional banner settings */}
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

      {/* Hero section customization */}
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

      {/* Booking policy */}
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
