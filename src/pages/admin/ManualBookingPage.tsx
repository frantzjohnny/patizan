import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { dispatchBookingNotifications } from '../../lib/notifications'
import { useToast } from '../../hooks/useToast' // assuming toast hook exists

export default function ManualBookingPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    service_id: '',
    package_id: '',
    preferred_date: '',
    preferred_start_time: '',
    notes: '',
    coupon_code: '',
    promoter_phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from('bookings').insert({
        ...form,
        status: 'pending',
      }).select().single()
      if (error) throw error

      // Send notifications (owner & promoter if applicable)
      await dispatchBookingNotifications({
        bookingId: data.id,
        ownerData: {
          customerName: data.full_name,
          customerPhone: data.phone,
          customerEmail: data.email,
          serviceName: data.service?.name || '',
          selectedOptions: data.package?.name,
          preferredDate: data.preferred_date,
          preferredTime: data.preferred_start_time?.slice(0,5) || '',
          originalPrice: Number(data.original_amount) || 0,
          couponCode: data.coupon_code,
          discountAmount: Number(data.discount_amount) || 0,
          finalAmount: Number(data.final_amount) || 0,
          promoterName: data.promoter_name,
          promoterCommission: Number(data.promoter_commission_amount) || 0,
          additionalNotes: data.additional_notes,
        },
        promoterData: data.coupon_code && data.promoter_phone ? {
          couponCode: data.coupon_code,
          promoterPhone: data.promoter_phone,
          serviceName: data.service?.name || '',
          originalPrice: Number(data.original_amount) || 0,
          discountPercentage: Number(data.discount_percentage) || 0,
          discountAmount: Number(data.discount_amount) || 0,
          finalAmount: Number(data.final_amount) || 0,
          commissionAmount: Number(data.promoter_commission_amount) || 0,
        } : null,
      })

      toast.success('Reserva criada e notificações enviadas')
      navigate('/admin/bookings')
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao criar reserva')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-charcoal border border-gray-border rounded-2xl space-y-6">
      <h1 className="text-2xl font-heading font-bold text-offwhite mb-4">Criar Reserva Manual</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="full_name">Nome completo *</label>
          <input id="full_name" name="full_name" placeholder="Nome completo" value={form.full_name} onChange={handleChange} className="input-field rounded-xl" required />
        </div>
        {/* Email */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={handleChange} className="input-field rounded-xl" required />
        </div>
        {/* Phone */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="phone">Telefone *</label>
          <input id="phone" name="phone" placeholder="(99) 99999-9999" value={form.phone} onChange={handleChange} className="input-field rounded-xl" required />
        </div>
        {/* Service */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="service_id">Serviço *</label>
          <select id="service_id" name="service_id" onChange={handleChange} className="input-field rounded-xl" required>
            <option value="">Selecione o Serviço</option>
            {/* Populate options via a hook or static list */}
          </select>
        </div>
        {/* Package */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="package_id">Pacote (opcional)</label>
          <select id="package_id" name="package_id" onChange={handleChange} className="input-field rounded-xl">
            <option value="">Selecione o Pacote</option>
          </select>
        </div>
        {/* Preferred Date */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="preferred_date">Data desejada *</label>
          <input id="preferred_date" name="preferred_date" type="date" value={form.preferred_date} onChange={handleChange} className="input-field rounded-xl" required />
        </div>
        {/* Preferred Start Time */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="preferred_start_time">Horário *</label>
          <input id="preferred_start_time" name="preferred_start_time" type="time" value={form.preferred_start_time} onChange={handleChange} className="input-field rounded-xl" required />
        </div>
        {/* Notes */}
        <div className="md:col-span-2 space-y-1">
          <label className="label-field" htmlFor="notes">Observações</label>
          <textarea id="notes" name="notes" placeholder="Observações" value={form.notes} onChange={handleChange} className="input-field rounded-xl resize-none" rows={3} />
        </div>
        {/* Coupon Code */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="coupon_code">Código do Cupom</label>
          <input id="coupon_code" name="coupon_code" placeholder="Código do Cupom" value={form.coupon_code} onChange={handleChange} className="input-field rounded-xl" />
        </div>
        {/* Promoter Phone */}
        <div className="space-y-1">
          <label className="label-field" htmlFor="promoter_phone">Telefone do Promotor</label>
          <input id="promoter_phone" name="promoter_phone" placeholder="Telefone do Promotor" value={form.promoter_phone} onChange={handleChange} className="input-field rounded-xl" />
        </div>
        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end pt-4">
          <button type="submit" className="btn-primary rounded-xl px-6 py-2.5">Salvar Reserva</button>
        </div>
      </form>
    </div>
  )
}
