import { createClient } from '@/lib/supabase/client'
import { purchaseOrderService } from '../../purchase-order/services/purchaseOrderService'
import { PurchaseOrder, PelunasanInput } from '../types'

export const tagihanService = {
  // Ambil semua PO yang sudah berada di fase tagihan atau diterima
  async getTagihanList(): Promise<PurchaseOrder[]> {
    const all = await purchaseOrderService.getAll()
    // Prioritaskan yang statusnya 'tagihan' atau 'diterima'
    return all.filter(p => p.status === 'tagihan' || p.status === 'diterima')
  },

  // Catat pelunasan tagihan
  async payTagihan(input: PelunasanInput): Promise<void> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) throw new Error('Sesi auth tidak ditemukan.')

    // Update catatan PO bahwa tagihan telah lunas dibayar
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const notePayment = `[LUNAS ${nowStr}] Metode: ${input.metodePembayaran} • Nominal: Rp ${input.nominalBayar.toLocaleString('id-ID')}${input.catatan ? ' • ' + input.catatan : ''}`

    // Ambil catatan PO eksisting
    const { data: currentPO } = await supabase
      .from('purchase_orders')
      .select('catatan')
      .eq('id', input.poId)
      .single()

    const newCatatan = currentPO?.catatan
      ? `${currentPO.catatan} | ${notePayment}`
      : notePayment

    const { error } = await supabase
      .from('purchase_orders')
      .update({
        catatan: newCatatan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.poId)

    if (error) {
      throw new Error(`Gagal mencatat pelunasan tagihan: ${error.message}`)
    }
  },
}
