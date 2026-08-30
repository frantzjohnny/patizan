import { useState } from 'react'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useServices, useServicePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '../../hooks/useServices'
import { formatCurrency } from '../../lib/utils'
import { getErrorMessage } from '../../lib/supabaseErrors'
import toast from 'react-hot-toast'
import type { ServicePackage } from '../../types'

function PackageModal({
  pkg,
  services,
  onClose,
}: {
  pkg?: ServicePackage
  services: { id: string; name: string }[]
  onClose: () => void
}) {
  const [form, setForm] = useState({
    service_id: pkg?.service_id || services[0]?.id || '',
    name: pkg?.name || '',
    duration_hours: pkg?.duration_hours?.toString() || '1',
    price: pkg?.price?.toString() || '',
    description: pkg?.description || '',
    engineer_included: pkg?.engineer_included ?? true,
    is_featured: pkg?.is_featured ?? false,
    is_active: pkg?.is_active ?? true,
    display_order: pkg?.display_order ?? 0,
  })

  const create = useCreatePackage()
  const update = useUpdatePackage()

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        duration_hours: parseFloat(form.duration_hours),
        price: parseFloat(form.price),
        display_order: parseInt(form.display_order.toString()) || 0,
      }
      if (pkg) {
        await update.mutateAsync({ id: pkg.id, ...payload })
        toast.success('Package updated!')
      } else {
        await create.mutateAsync(payload)
        toast.success('Package created!')
      }
      onClose()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save package'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-lg my-8">
        <h3 className="font-heading font-bold text-xl text-offwhite mb-6">
          {pkg ? 'Edit Package' : 'New Package'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label-field">Service *</label>
            <select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              className="input-field rounded-xl"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Package Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Full Session — 8 Hours"
              className="input-field rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Duration (Hours) *</label>
              <input
                type="number"
                step="0.5"
                value={form.duration_hours}
                onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                className="input-field rounded-xl"
              />
            </div>
            <div>
              <label className="label-field">Price ($) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field rounded-xl"
                placeholder="300"
              />
            </div>
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
          <div>
            <label className="label-field">Description (Rate Card Details)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Complete studio lockout for albums and major projects..."
              className="input-field rounded-xl resize-none"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite text-xs font-heading font-semibold">
                Set as Featured / Highlighted Package
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.engineer_included}
                onChange={(e) => setForm({ ...form, engineer_included: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite/80 text-xs">
                Dedicated Audio Engineer Included
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-orange"
              />
              <span className="text-offwhite/70 text-xs">
                Active (visible on rate card & booking)
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.name || !form.price || create.isPending || update.isPending}
            className="btn-primary rounded-xl text-xs px-6 py-2.5 disabled:opacity-40"
          >
            {create.isPending || update.isPending ? 'Saving...' : 'Save Package'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PricingAdminPage() {
  const { data: services = [] } = useServices(false)
  const { data: packages = [], isLoading } = useServicePackages(undefined, false)
  const updatePkg = useUpdatePackage()
  const deletePkg = useDeletePackage()

  const [showModal, setShowModal] = useState(false)
  const [editingPkg, setEditingPkg] = useState<ServicePackage | undefined>()

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete package "${name}"?`)) return
    try {
      await deletePkg.mutateAsync(id)
      toast.success('Package deleted.')
    } catch {
      toast.error('Failed to delete package')
    }
  }

  const handleToggleFeatured = async (pkg: ServicePackage) => {
    try {
      await updatePkg.mutateAsync({
        id: pkg.id,
        is_featured: !pkg.is_featured,
      })
      toast.success(pkg.is_featured ? 'Featured status removed' : 'Set as Featured Package')
    } catch {
      toast.error('Failed to update package status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Session Packages & Rates</h1>
          <p className="text-gray-muted text-xs mt-1">Manage studio rate cards, hour tiers, engineer inclusion, and featured highlight.</p>
        </div>
        <button
          onClick={() => { setEditingPkg(undefined); setShowModal(true) }}
          className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} />
          New Package
        </button>
      </div>

      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Service</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Engineer</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8}>
                      <div className="h-8 bg-charcoal-light rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-muted">
                    No pricing packages found.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>
                      <div>
                        <p className="font-heading font-semibold text-offwhite text-sm">{pkg.name}</p>
                        <p className="text-xs text-gray-muted line-clamp-1">{pkg.description}</p>
                      </div>
                    </td>
                    <td className="text-xs text-offwhite/80">{pkg.service?.name || 'Recording'}</td>
                    <td className="text-sm font-mono text-offwhite/70">{pkg.duration_hours}h</td>
                    <td className="font-heading font-bold text-orange text-sm">{formatCurrency(pkg.price)}</td>
                    <td>
                      {pkg.engineer_included ? (
                        <span className="text-emerald-400 text-xs font-heading font-semibold flex items-center gap-1">
                          <Check size={12} /> Yes
                        </span>
                      ) : (
                        <span className="text-offwhite/40 text-xs">No</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(pkg)}
                        className={`text-[10px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${
                          pkg.is_featured
                            ? 'bg-orange/20 border border-orange text-orange'
                            : 'bg-white/5 border border-white/10 text-offwhite/40 hover:text-offwhite'
                        }`}
                      >
                        {pkg.is_featured ? 'Featured' : 'Standard'}
                      </button>
                    </td>
                    <td>
                      <span className={pkg.is_active ? 'badge-approved' : 'badge-cancelled'}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingPkg(pkg); setShowModal(true) }}
                          className="p-1.5 text-gray-muted hover:text-offwhite transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id, pkg.name)}
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
      </div>

      {showModal && (
        <PackageModal
          pkg={editingPkg}
          services={services}
          onClose={() => { setShowModal(false); setEditingPkg(undefined) }}
        />
      )}
    </div>
  )
}
