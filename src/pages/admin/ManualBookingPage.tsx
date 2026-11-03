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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Criar Reserva Manual</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="full_name" placeholder="Nome completo" value={form.full_name} onChange={handleChange} className="input" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" required />
        <input name="phone" placeholder="Telefone" value={form.phone} onChange={handleChange} className="input" required />
        <select name="service_id" onChange={handleChange} className="input" required>
          <option value="">Selecione o Serviço</option>
          {/* Populate options via a hook or static list */}
        </select>
        <select name="package_id" onChange={handleChange} className="input">
          <option value="">Selecione o Pacote (opcional)</option>
        </select>
        <input name="preferred_date" type="date" value={form.preferred_date} onChange={handleChange} className="input" required />
        <input name="preferred_start_time" type="time" value={form.preferred_start_time} onChange={handleChange} className="input" required />
        <textarea name="notes" placeholder="Observações" value={form.notes} onChange={handleChange} className="input" />
        <input name="coupon_code" placeholder="Código do Cupom" value={form.coupon_code} onChange={handleChange} className="input" />
        <input name="promoter_phone" placeholder="Telefone do Promotor" value={form.promoter_phone} onChange={handleChange} className="input" />
        <button type="submit" className="btn-primary">Salvar Reserva</button>
      </form>
    </div>
  )
}
