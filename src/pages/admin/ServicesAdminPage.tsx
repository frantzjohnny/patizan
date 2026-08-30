import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import { useServices, useCreateService, useUpdateService, useDeleteService } from '../../hooks/useServices'
import { uploadImage } from '../../lib/storage'
import { getErrorMessage } from '../../lib/supabaseErrors'
import { formatCurrency, slugify } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { Service } from '../../types'

function ServiceModal({
  service,
  onClose,
}: {
  service?: Service
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: service?.name || '',
    slug: service?.slug || '',
    short_description: service?.short_description || '',
    description: service?.description || '',
    image_url: service?.image_url || '',
    starting_price: service?.starting_price?.toString() || '',
    is_featured: service?.is_featured ?? false,
    is_active: service?.is_active ?? true,
    display_order: service?.display_order ?? 0,
  })

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const create = useCreateService()
  const update = useUpdateService()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const publicUrl = await uploadImage('site-assets', file, 'services')
      setForm((prev) => ({ ...prev, image_url: publicUrl }))
      toast.success('Image uploaded successfully!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload image'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        starting_price: form.starting_price ? parseFloat(form.starting_price) : null,
      }
      if (service) {
        await update.mutateAsync({ id: service.id, ...payload })
        toast.success('Service updated!')
      } else {
        await create.mutateAsync(payload)
        toast.success('Service created!')
      }
      onClose()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save service'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-lg my-8">
        <h3 className="font-heading font-bold text-xl text-offwhite mb-6">
          {service ? 'Edit Service' : 'New Service'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label-field">Service Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
              className="input-field rounded-xl"
              placeholder="e.g. Recording"
            />
          </div>
          <div>
            <label className="label-field">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input-field rounded-xl"
              placeholder="recording"
            />
          </div>
          <div>
            <label className="label-field">Short Description</label>
            <input
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              className="input-field rounded-xl"
              placeholder="One line summary for cards"
            />
          </div>
          <div>
            <label className="label-field">Full Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="input-field rounded-xl resize-none"
              placeholder="Detailed description for service page"
            />
          </div>

          {/* Image URL & Upload */}
          <div>
            <label className="label-field">Service Image (URL or Upload)</label>
            <div className="flex gap-2">
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                className="input-field rounded-xl flex-1 text-xs"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-offwhite text-xs font-heading font-medium flex items-center gap-1.5 shrink-0"
              >
                <Upload size={14} />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
            {form.image_url && (
              <div className="mt-2 h-20 rounded-xl overflow-hidden border border-white/10 relative">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Starting Price ($)</label>
              <input
                type="number"
                value={form.starting_price}
                onChange={(e) => setForm({ ...form, starting_price: e.target.value })}
                className="input-field rounded-xl"
                placeholder="40"
              />
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

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite text-xs font-heading font-semibold">
                Set as Featured Service (Large Hero Card on Homepage)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite/70 text-xs font-body">
                Active (visible on website)
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={handleSave}
            disabled={create.isPending || update.isPending}
            className="btn-primary rounded-xl text-xs px-6 py-2.5"
          >
            {create.isPending || update.isPending ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ServicesAdminPage() {
  const { data: services = [], isLoading } = useServices(false)
  const deleteService = useDeleteService()
  const updateService = useUpdateService()
  const [editingService, setEditingService] = useState<Service | undefined>()
  const [showModal, setShowModal] = useState(false)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete service "${name}"? This cannot be undone.`)) return
    try {
      await deleteService.mutateAsync(id)
      toast.success('Service deleted.')
    } catch {
      toast.error('Failed to delete service')
    }
  }

  const handleToggleFeatured = async (service: Service) => {
    try {
      await updateService.mutateAsync({
        id: service.id,
        is_featured: !service.is_featured,
      })
      toast.success(service.is_featured ? 'Featured status removed' : 'Set as Featured Service')
    } catch {
      toast.error('Failed to update featured status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Services Management</h1>
          <p className="text-gray-muted text-xs mt-1">Control studio services, pricing, imagery, and homepage prominence.</p>
        </div>
        <button
          onClick={() => { setEditingService(undefined); setShowModal(true) }}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          New Service
        </button>
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Starting Price</th>
              <th>Order</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}><div className="h-8 bg-charcoal-light rounded animate-pulse" /></td>
                </tr>
              ))
            ) : (
              services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-offwhite/40">
                          <ImageIcon size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-semibold text-offwhite text-sm">{service.name}</p>
                        <p className="text-xs text-gray-muted line-clamp-1">{service.short_description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm font-heading font-bold text-offwhite">
                    {service.starting_price ? formatCurrency(service.starting_price) : '—'}
                  </td>
                  <td className="text-sm font-mono text-offwhite/70">{service.display_order}</td>
                  <td>
                    <button
                      onClick={() => handleToggleFeatured(service)}
                      className={`text-[10px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${
                        service.is_featured
                          ? 'bg-orange/20 border border-orange text-orange'
                          : 'bg-white/5 border border-white/10 text-offwhite/40 hover:text-offwhite'
                      }`}
                    >
                      {service.is_featured ? 'Featured' : 'Standard'}
                    </button>
                  </td>
                  <td>
                    <span className={service.is_active ? 'badge-approved' : 'badge-cancelled'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingService(service); setShowModal(true) }}
                        className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
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
        <ServiceModal
          service={editingService}
          onClose={() => { setShowModal(false); setEditingService(undefined) }}
        />
      )}
    </div>
  )
}
