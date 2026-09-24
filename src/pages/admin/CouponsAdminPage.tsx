import { useState } from 'react'
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  History,
  DollarSign,
  Percent,
  Search,
  AlertCircle,
} from 'lucide-react'
import {
  useCoupons,
  useCouponUsage,
  useCreateCoupon,
  useUpdateCoupon,
  useToggleCouponActive,
  useDeleteCoupon,
} from '../../hooks/useCoupons'
import { formatCurrency, formatDate, cn } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { Coupon } from '../../types'

// ─── Create / Edit Coupon Modal ──────────────────────────────
function CouponModal({
  coupon,
  onClose,
}: {
  coupon?: Coupon | null
  onClose: () => void
}) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    promoter_name: coupon?.promoter_name || '',
    promoter_phone: coupon?.promoter_phone || '',
    discount_percentage: coupon?.discount_percentage?.toString() || '10',
    commission_percentage: coupon?.commission_percentage?.toString() || '10',
    is_active: coupon?.is_active ?? true,
  })

  const create = useCreateCoupon()
  const update = useUpdateCoupon()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanCode = form.code.trim().toUpperCase()
    const cleanName = form.promoter_name.trim()
    const cleanPhone = form.promoter_phone.trim()
    const discountPct = parseFloat(form.discount_percentage)
    const commPct = parseFloat(form.commission_percentage)

    if (!cleanCode) {
      toast.error('Coupon code is required.')
      return
    }
    if (!cleanName) {
      toast.error('Promoter name is required.')
      return
    }
    if (!cleanPhone) {
      toast.error('Promoter WhatsApp number is required.')
      return
    }
    if (isNaN(discountPct) || discountPct < 0 || discountPct > 100) {
      toast.error('Customer discount must be between 0% and 100%.')
      return
    }
    if (isNaN(commPct) || commPct < 0 || commPct > 100) {
      toast.error('Promoter commission must be between 0% and 100%.')
      return
    }

    try {
      if (coupon) {
        await update.mutateAsync({
          id: coupon.id,
          code: cleanCode,
          promoter_name: cleanName,
          promoter_phone: cleanPhone,
          discount_percentage: discountPct,
          commission_percentage: commPct,
          is_active: form.is_active,
        })
        toast.success(`Coupon ${cleanCode} updated!`)
      } else {
        await create.mutateAsync({
          code: cleanCode,
          promoter_name: cleanName,
          promoter_phone: cleanPhone,
          discount_percentage: discountPct,
          commission_percentage: commPct,
          is_active: form.is_active,
        })
        toast.success(`Coupon ${cleanCode} created!`)
      }
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save coupon.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-lg my-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange/10 border border-orange/30 flex items-center justify-center text-orange">
              <Tag size={18} />
            </div>
            <h3 className="font-heading font-bold text-xl text-offwhite">
              {coupon ? 'Edit Promotional Coupon' : 'Create Promotional Coupon'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-muted hover:text-offwhite transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label-field">Coupon Code *</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. PATIZAN10"
              className="input-field rounded-xl font-mono uppercase tracking-wider text-base"
              required
            />
            <p className="text-gray-muted text-xs mt-1">Codes are automatically converted to uppercase.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Promoter Name *</label>
              <input
                value={form.promoter_name}
                onChange={(e) => setForm({ ...form, promoter_name: e.target.value })}
                placeholder="e.g. Michael"
                className="input-field rounded-xl"
                required
              />
            </div>
            <div>
              <label className="label-field">Promoter WhatsApp *</label>
              <input
                value={form.promoter_phone}
                onChange={(e) => setForm({ ...form, promoter_phone: e.target.value })}
                placeholder="e.g. +19592056476"
                className="input-field rounded-xl font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Customer Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={form.discount_percentage}
                  onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
                  className="input-field rounded-xl pr-8"
                  required
                />
                <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-muted" />
              </div>
              <p className="text-gray-muted text-xs mt-1">Default: 10% off for customer</p>
            </div>
            <div>
              <label className="label-field">Promoter Commission (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={form.commission_percentage}
                  onChange={(e) => setForm({ ...form, commission_percentage: e.target.value })}
                  className="input-field rounded-xl pr-8"
                  required
                />
                <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-muted" />
              </div>
              <p className="text-gray-muted text-xs mt-1">Default: 10% commission</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded accent-orange"
              />
              <span className="text-offwhite text-sm">Active (Customer can use this coupon)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending || update.isPending}
              className="btn-primary rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {create.isPending || update.isPending ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
              <Check size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Usage History Modal ──────────────────────────────────────
function UsageHistoryModal({
  coupon,
  onClose,
}: {
  coupon: Coupon
  onClose: () => void
}) {
  const { data: usage = [], isLoading } = useCouponUsage(coupon.id)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-charcoal border border-gray-border rounded-2xl p-6 md:p-8 w-full max-w-4xl my-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-lg text-orange bg-orange/10 px-2.5 py-0.5 rounded-lg border border-orange/30">
                {coupon.code}
              </span>
              <span className="text-offwhite font-heading font-semibold text-lg">
                Usage History
              </span>
            </div>
            <p className="text-gray-muted text-xs">
              Promoter: <strong className="text-offwhite">{coupon.promoter_name}</strong> ({coupon.promoter_phone})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-muted hover:text-offwhite transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/40 border border-gray-border/50 rounded-xl p-4">
            <span className="text-gray-muted text-xs block mb-1 uppercase tracking-wider">Total Usages</span>
            <span className="font-heading font-bold text-xl text-offwhite">{usage.length}</span>
          </div>
          <div className="bg-black/40 border border-gray-border/50 rounded-xl p-4">
            <span className="text-gray-muted text-xs block mb-1 uppercase tracking-wider">Total Customer Discounts</span>
            <span className="font-heading font-bold text-xl text-green-400">
              {formatCurrency(usage.reduce((sum, u) => sum + (Number(u.discount_amount) || 0), 0))}
            </span>
          </div>
          <div className="bg-black/40 border border-gray-border/50 rounded-xl p-4">
            <span className="text-gray-muted text-xs block mb-1 uppercase tracking-wider">Total Promoter Commission</span>
            <span className="font-heading font-bold text-xl text-orange">
              {formatCurrency(usage.reduce((sum, u) => sum + (Number(u.commission_amount) || 0), 0))}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-gray-muted">Loading usage history...</div>
        ) : usage.length === 0 ? (
          <div className="py-12 text-center text-gray-muted bg-black/20 rounded-xl border border-dashed border-gray-border">
            <AlertCircle size={28} className="mx-auto mb-2 text-gray-muted/50" />
            <p className="text-sm">No customer bookings have used coupon <span className="font-mono text-offwhite">{coupon.code}</span> yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-heading font-semibold uppercase tracking-wider text-gray-muted border-b border-gray-border bg-charcoal sticky top-0">
                <tr>
                  <th className="pb-3 pr-4">Date & Time</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Contact</th>
                  <th className="pb-3 pr-4 text-right">Original</th>
                  <th className="pb-3 pr-4 text-right">Discount</th>
                  <th className="pb-3 pr-4 text-right">Final</th>
                  <th className="pb-3 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border/50 font-body">
                {usage.map((u) => (
                  <tr key={u.id} className="hover:bg-black/20 transition-colors">
                    <td className="py-3 pr-4 text-xs text-gray-muted whitespace-nowrap">
                      {formatDate(u.created_at, 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="py-3 pr-4 font-medium text-offwhite whitespace-nowrap">
                      {u.customer_name}
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-muted">
                      <div>{u.customer_phone}</div>
                      <div className="truncate max-w-[150px]">{u.customer_email}</div>
                    </td>
                    <td className="py-3 pr-4 text-right text-offwhite/80 font-mono text-xs">
                      {formatCurrency(u.original_amount)}
                    </td>
                    <td className="py-3 pr-4 text-right text-green-400 font-mono text-xs whitespace-nowrap">
                      -{formatCurrency(u.discount_amount)} ({u.discount_percentage}%)
                    </td>
                    <td className="py-3 pr-4 text-right text-offwhite font-mono text-xs font-bold">
                      {formatCurrency(u.final_amount)}
                    </td>
                    <td className="py-3 text-right text-orange font-mono text-xs font-bold whitespace-nowrap">
                      {formatCurrency(u.commission_amount)} ({u.commission_percentage}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-border">
          <button onClick={onClose} className="btn-ghost rounded-xl text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Coupons Page ─────────────────────────────────
export default function CouponsAdminPage() {
  const { data: coupons = [], isLoading } = useCoupons()
  const toggleActive = useToggleCouponActive()
  const deleteCoupon = useDeleteCoupon()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalCoupon, setModalCoupon] = useState<Coupon | null | undefined>(undefined)
  const [historyCoupon, setHistoryCoupon] = useState<Coupon | null>(null)

  // Filter coupons
  const filtered = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.promoter_name.toLowerCase().includes(search.toLowerCase()) ||
      c.promoter_phone.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (statusFilter === 'active') return c.is_active
    if (statusFilter === 'inactive') return !c.is_active
    return true
  })

  // Global KPIs
  const totalActive = coupons.filter((c) => c.is_active).length
  const totalUsages = coupons.reduce((sum, c) => sum + (c.uses_count || 0), 0)
  const totalDiscounts = coupons.reduce((sum, c) => sum + (c.total_discount_amount || 0), 0)
  const totalCommissions = coupons.reduce((sum, c) => sum + (c.total_commission_amount || 0), 0)

  const handleToggle = async (coupon: Coupon) => {
    try {
      await toggleActive.mutateAsync({ id: coupon.id, is_active: !coupon.is_active })
      toast.success(`Coupon ${coupon.code} ${!coupon.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to change coupon status')
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return
    try {
      await deleteCoupon.mutateAsync(coupon.id)
      toast.success(`Coupon ${coupon.code} deleted`)
    } catch {
      toast.error('Failed to delete coupon')
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-offwhite">Coupons & Promoters</h1>
          <p className="text-gray-muted text-sm mt-1">
            Manage promotional discount codes and promoter commissions. Promoters do not require accounts.
          </p>
        </div>
        <button
          onClick={() => setModalCoupon(null)}
          className="btn-primary rounded-xl text-sm flex items-center gap-2 shrink-0"
        >
          <Plus size={16} />
          New Coupon
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-charcoal border border-gray-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gray-muted">
              Active Coupons
            </span>
            <Tag size={16} className="text-orange" />
          </div>
          <div className="font-heading font-bold text-2xl text-offwhite">{totalActive}</div>
          <p className="text-[11px] text-gray-muted mt-1">{coupons.length} total codes created</p>
        </div>

        <div className="bg-charcoal border border-gray-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gray-muted">
              Total Usages
            </span>
            <Check size={16} className="text-orange" />
          </div>
          <div className="font-heading font-bold text-2xl text-offwhite">{totalUsages}</div>
          <p className="text-[11px] text-gray-muted mt-1">Bookings with promotional code</p>
        </div>

        <div className="bg-charcoal border border-gray-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gray-muted">
              Total Discounts
            </span>
            <DollarSign size={16} className="text-green-400" />
          </div>
          <div className="font-heading font-bold text-2xl text-green-400">
            {formatCurrency(totalDiscounts)}
          </div>
          <p className="text-[11px] text-gray-muted mt-1">Savings granted to clients</p>
        </div>

        <div className="bg-charcoal border border-gray-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gray-muted">
              Promoter Commission
            </span>
            <DollarSign size={16} className="text-orange" />
          </div>
          <div className="font-heading font-bold text-2xl text-orange">
            {formatCurrency(totalCommissions)}
          </div>
          <p className="text-[11px] text-gray-muted mt-1">Total commissions generated</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input
            type="text"
            placeholder="Search by code, promoter name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field rounded-xl pl-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider transition-all',
                statusFilter === filter
                  ? 'bg-orange text-black'
                  : 'bg-charcoal border border-gray-border text-gray-muted hover:text-offwhite'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-charcoal border border-gray-border rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-gray-muted">Loading coupons...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-muted">
            <Tag size={36} className="mx-auto mb-3 text-gray-muted/40" />
            <p className="text-base text-offwhite font-medium mb-1">No coupons found</p>
            <p className="text-xs text-gray-muted">Create a coupon to start offering promotions with promoters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-heading font-semibold uppercase tracking-wider text-gray-muted border-b border-gray-border bg-charcoal-light/50">
                <tr>
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Promoter & WhatsApp</th>
                  <th className="py-4 px-6 text-center">Discount</th>
                  <th className="py-4 px-6 text-center">Commission</th>
                  <th className="py-4 px-6 text-center">Uses</th>
                  <th className="py-4 px-6 text-right">Total Discount</th>
                  <th className="py-4 px-6 text-right">Commission</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border/50 font-body">
                {filtered.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-charcoal-light/30 transition-colors">
                    {/* Code */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-offwhite bg-black/60 px-3 py-1 rounded-lg border border-gray-border">
                          {coupon.code}
                        </span>
                      </div>
                    </td>

                    {/* Promoter & Phone */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-offwhite">{coupon.promoter_name}</div>
                      <div className="text-xs font-mono text-gray-muted">{coupon.promoter_phone}</div>
                    </td>

                    {/* Discount % */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        {coupon.discount_percentage}%
                      </span>
                    </td>

                    {/* Commission % */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange/10 text-orange border border-orange/20">
                        {coupon.commission_percentage}%
                      </span>
                    </td>

                    {/* Uses */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setHistoryCoupon(coupon)}
                        className="font-mono font-bold text-offwhite hover:text-orange transition-colors underline decoration-dotted"
                        title="Click to view usage history"
                      >
                        {coupon.uses_count || 0}
                      </button>
                    </td>

                    {/* Total Discount Given */}
                    <td className="py-4 px-6 text-right font-mono text-sm text-green-400">
                      {formatCurrency(coupon.total_discount_amount || 0)}
                    </td>

                    {/* Total Commission Generated */}
                    <td className="py-4 px-6 text-right font-mono text-sm font-semibold text-orange">
                      {formatCurrency(coupon.total_commission_amount || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggle(coupon)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold transition-all',
                          coupon.is_active
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                        )}
                        title="Click to toggle active state"
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', coupon.is_active ? 'bg-green-400' : 'bg-gray-400')} />
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setHistoryCoupon(coupon)}
                          className="p-2 text-gray-muted hover:text-orange hover:bg-black/30 rounded-lg transition-colors"
                          title="View Usage History"
                        >
                          <History size={16} />
                        </button>
                        <button
                          onClick={() => setModalCoupon(coupon)}
                          className="p-2 text-gray-muted hover:text-offwhite hover:bg-black/30 rounded-lg transition-colors"
                          title="Edit Coupon"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="p-2 text-gray-muted hover:text-red-400 hover:bg-black/30 rounded-lg transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalCoupon !== undefined && (
        <CouponModal coupon={modalCoupon} onClose={() => setModalCoupon(undefined)} />
      )}

      {/* Usage History Modal */}
      {historyCoupon && (
        <UsageHistoryModal coupon={historyCoupon} onClose={() => setHistoryCoupon(null)} />
      )}
    </div>
  )
}
