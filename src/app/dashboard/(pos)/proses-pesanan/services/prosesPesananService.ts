import { createClient } from '@/lib/supabase/client'
import { menuService } from '@/app/dashboard/(pos)/menu/services/menuService'
import { penjualanService } from '@/app/dashboard/(pos)/penjualan/services/penjualanService'
import { OrderRecord, OrderItemRecord, OrderStatus } from '@/app/dashboard/(pos)/penjualan/types'
import { BahanKebutuhanItem, PesananWithKebutuhan } from '../types'

interface RawOrderDB {
  id: string
  user_id: string
  customer_id?: string | null
  invoice_number: string
  customer_name: string
  customer_phone?: string | null
  table_number?: string | null
  channel: string
  status: string
  payment_method: string
  payment_status: string
  subtotal: number | string
  discount: number | string
  shipping_fee: number | string
  total_price: number | string
  total_hpp: number | string
  profit: number | string
  cashier_name: string
  notes?: string | null
  cash_received?: number | string | null
  change_amount?: number | string | null
  midtrans_order_id?: string | null
  created_at: string
  updated_at: string
  order_items?: Array<{
    id: string
    user_id: string
    order_id: string
    menu_id: string | null
    nama_menu: string
    qty: number | string
    harga_jual: number | string
    hpp: number | string
    subtotal: number | string
    created_at: string
  }> | null
}

function mapOrderFromDB(row: RawOrderDB): OrderRecord {
  const items: OrderItemRecord[] = (row.order_items || []).map(i => ({
    id: i.id,
    orderId: i.order_id,
    menuId: i.menu_id,
    namaMenu: i.nama_menu,
    qty: Number(i.qty) || 0,
    hargaJual: Number(i.harga_jual) || 0,
    hpp: Number(i.hpp) || 0,
    subtotal: Number(i.subtotal) || 0,
  }))

  let mappedStatus = row.status
  if (row.status === 'menunggu' && row.notes && row.notes.includes('[PREORDER]')) {
    mappedStatus = 'preorder'
  } else if (row.status === 'dibatalkan') {
    mappedStatus = 'batal'
  }

  return {
    id: row.id,
    userId: row.user_id,
    customerId: row.customer_id,
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    tableNumber: row.table_number || null,
    channel: row.channel,
    status: mappedStatus,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    shippingFee: Number(row.shipping_fee) || 0,
    totalPrice: Number(row.total_price) || 0,
    totalHPP: Number(row.total_hpp) || 0,
    profit: Number(row.profit) || 0,
    cashierName: row.cashier_name,
    notes: row.notes,
    cashReceived: row.cash_received == null ? null : Number(row.cash_received),
    changeAmount: row.change_amount == null ? null : Number(row.change_amount),
    midtransOrderId: row.midtrans_order_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  }
}

export const prosesPesananService = {
  /**
   * Mengambil semua pesanan dengan rincian item, stok bahan, dan kalkulasi kesiapan bahan baku resep
   */
  async getPesananList(): Promise<PesananWithKebutuhan[]> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: ordersData, error: ordersErr } = await query

    if (ordersErr) {
      console.error('Error fetching orders for proses pesanan:', ordersErr)
      throw new Error(ordersErr.message || 'Gagal memuat daftar pesanan.')
    }

    // Ambil resep menu dan stok bahan baku untuk kalkulasi ketersediaan bahan
    const [menus, stokBahanMap] = await Promise.all([
      menuService.getAll(),
      penjualanService.getStokBahan(),
    ])

    let bahanQuery = supabase
      .from('bahan')
      .select('id, nama, satuan')

    if (userId) {
      bahanQuery = bahanQuery.eq('user_id', userId)
    }

    const { data: allBahanData } = await bahanQuery

    const bahanMetaMap = new Map<string, { nama: string; satuan: string }>()
    for (const b of allBahanData || []) {
      bahanMetaMap.set(b.id, { nama: b.nama, satuan: b.satuan })
    }

    const rawList = ((ordersData as RawOrderDB[]) || []).map(mapOrderFromDB)

    // Perkaya pesanan dengan info kebutuhan bahan baku
    const enrichedList: PesananWithKebutuhan[] = rawList.map(order => {
      // Hitung akumulasi kebutuhan bahan untuk pesanan ini
      const needMap = new Map<string, number>()
      for (const item of order.items || []) {
        const m = menus.find(menu => menu.id === item.menuId)
        for (const r of m?.resep || []) {
          const qtyTotal = (Number(r.qty) || 0) * (Number(item.qty) || 0)
          needMap.set(r.bahanId, (needMap.get(r.bahanId) || 0) + qtyTotal)
        }
      }

      const kebutuhanBahan: BahanKebutuhanItem[] = []
      let bahanKurangCount = 0

      for (const [bahanId, qtyNeed] of Array.from(needMap.entries())) {
        const meta = bahanMetaMap.get(bahanId)
        const stokAda = stokBahanMap[bahanId] ?? 0
        const cukup = (stokAda + 1e-9) >= qtyNeed
        if (!cukup) bahanKurangCount++

        kebutuhanBahan.push({
          bahanId,
          namaBahan: meta?.nama || 'Bahan',
          satuan: meta?.satuan || 'item',
          qtyDibutuhkan: Number(qtyNeed.toFixed(3)),
          stokTersedia: stokAda,
          cukup,
        })
      }

      return {
        ...order,
        kebutuhanBahan,
        bisaDiproses: bahanKurangCount === 0,
        bahanKurangCount,
      }
    })

    return enrichedList
  },

  /**
   * Mengubah status pesanan (misal preorder/menunggu -> diproses -> selesai / batal)
   */
  async updateStatus(order: OrderRecord, statusBaru: OrderStatus): Promise<void> {
    await penjualanService.updateStatusPesanan(order, statusBaru)
  },

  /**
   * Menandai pembayaran lunas untuk pesanan 'Bayar di Kasir'
   */
  async tandaiLunasDiKasir(orderId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'Lunas',
        payment_method: 'Tunai di Kasir',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      console.warn('Direct update payment_status failed, trying RPC fallback:', error.message)
      // Coba fallback dengan RPC jika direct update terhalang enum atau trigger
      const { error: rpcErr } = await supabase.rpc('mark_order_paid_at_cashier', {
        p_order_id: orderId,
      })
      if (rpcErr) {
        throw new Error(`Gagal menandai lunas: ${error.message || rpcErr.message}`)
      }
    }
  },
}
