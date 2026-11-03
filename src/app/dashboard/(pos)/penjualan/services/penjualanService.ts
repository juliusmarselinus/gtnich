import { createClient } from '@/lib/supabase/client'
import { menuService } from '@/app/dashboard/(pos)/menu/services/menuService'
import { MenuItem } from '@/app/dashboard/(pos)/menu/types'
import { CartItem, CheckoutFormInput, OrderRecord, OrderItemRecord, OrderStatus } from '../types'

interface RawOrderDB {
  id: string
  user_id: string
  customer_id?: string | null
  invoice_number: string
  customer_name: string
  customer_phone?: string | null
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
  order_items?: RawOrderItemDB[] | null
}

interface RawOrderItemDB {
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
}

function normalizeOrderChannel(channel?: string): 'WhatsApp' | 'Toko Langsung' | 'Katalog Online' {
  if (!channel) return 'Toko Langsung'
  const lower = channel.toLowerCase()
  if (lower.includes('whatsapp') || lower.includes('wa')) return 'WhatsApp'
  if (lower.includes('online') || lower.includes('katalog') || lower.includes('web')) return 'Katalog Online'
  return 'Toko Langsung'
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

  return {
    id: row.id,
    userId: row.user_id,
    customerId: row.customer_id,
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    channel: row.channel,
    status: row.status,
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

export const penjualanService = {
  async getKatalogMenu(): Promise<MenuItem[]> {
    const menus = await menuService.getAll()
    return menus.filter(m => m.isActive)
  },

  // Stok semua bahan: { [bahanId]: stok }
  async getStokBahan(): Promise<Record<string, number>> {
    const supabase = createClient()
    const { data, error } = await supabase.from('bahan').select('id, stok')
    if (error) {
      console.warn('Error fetching stok bahan:', error)
      return {}
    }
    return Object.fromEntries((data || []).map(b => [b.id as string, Number(b.stok) || 0]))
  },

  async getRecentOrders(limit = 10): Promise<OrderRecord[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Error fetching orders:', error)
      return []
    }

    return ((data as RawOrderDB[]) || []).map(mapOrderFromDB)
  },

  // Potong stok untuk pesanan pre-order saat mulai diproses (berdasarkan resep menu saat ini)
  async potongStokPesanan(order: OrderRecord): Promise<void> {
    const supabase = createClient()
    const menus = await menuService.getAll()
    const need = new Map<string, { namaBahan: string; qty: number }>()
    for (const item of order.items || []) {
      const menu = menus.find(m => m.id === item.menuId)
      for (const r of menu?.resep || []) {
        const add = r.qty * item.qty
        const cur = need.get(r.bahanId)
        if (cur) cur.qty += add
        else need.set(r.bahanId, { namaBahan: r.namaBahan, qty: add })
      }
    }

    const stokNow = await penjualanService.getStokBahan()
    for (const [id, { namaBahan, qty }] of Array.from(need.entries())) {
      if ((stokNow[id] ?? 0) + 1e-9 < qty) {
        throw new Error(`Stok ${namaBahan} tidak cukup untuk memproses pre-order ini.`)
      }
    }

    for (const [bahanId, { qty }] of Array.from(need.entries())) {
      const { data: bhn } = await supabase.from('bahan').select('stok, satuan').eq('id', bahanId).single()
      if (!bhn) continue
      const currentStock = Number(bhn.stok) || 0
      const deduct = Number(qty.toFixed(3))
      const newStock = Number((currentStock - deduct).toFixed(3))
      await supabase.from('bahan').update({ stok: newStock, updated_at: new Date().toISOString() }).eq('id', bahanId)
      await supabase.from('stok_logs').insert({
        user_id: order.userId,
        bahan_id: bahanId,
        perubahan: -deduct,
        stok_sebelum: currentStock,
        stok_sesudah: newStock,
        sumber: 'Penjualan',
        reference_id: order.id,
        catatan: `Pre-order ${order.invoiceNumber} diproses: Terpakai ${deduct} ${bhn.satuan}`,
      })
    }
  },

  // Kembalikan stok yang pernah dipotong untuk pesanan ini (dibaca dari stok_logs)
  async kembalikanStokPesanan(order: OrderRecord): Promise<void> {
    const supabase = createClient()
    const { data: logs } = await supabase
      .from('stok_logs')
      .select('bahan_id, perubahan')
      .eq('reference_id', order.id)
      .eq('sumber', 'Penjualan')

    for (const log of logs || []) {
      const qtyBack = -Number(log.perubahan) || 0
      if (qtyBack <= 0) continue
      const { data: bhn } = await supabase.from('bahan').select('stok, satuan').eq('id', log.bahan_id).single()
      if (!bhn) continue
      const currentStock = Number(bhn.stok) || 0
      const newStock = Number((currentStock + qtyBack).toFixed(3))
      await supabase.from('bahan').update({ stok: newStock, updated_at: new Date().toISOString() }).eq('id', log.bahan_id)
      await supabase.from('stok_logs').insert({
        user_id: order.userId,
        bahan_id: log.bahan_id,
        perubahan: qtyBack,
        stok_sebelum: currentStock,
        stok_sesudah: newStock,
        sumber: 'Pembatalan Penjualan',
        reference_id: order.id,
        catatan: `Pesanan ${order.invoiceNumber} dibatalkan: stok dikembalikan ${qtyBack} ${bhn.satuan}`,
      })
    }
  },

  async updateStatusPesanan(order: OrderRecord, statusBaru: OrderStatus): Promise<void> {
    const dari = order.status
    const boleh: Record<string, OrderStatus[]> = {
      preorder: ['diproses', 'batal'],
      menunggu: ['diproses', 'batal'],
      diproses: ['selesai', 'batal'],
    }
    if (!boleh[dari]?.includes(statusBaru)) {
      throw new Error(`Status "${dari}" tidak bisa diubah ke "${statusBaru}".`)
    }

    if (dari === 'preorder' && statusBaru === 'diproses') {
      await penjualanService.potongStokPesanan(order)
    }
    if (statusBaru === 'batal' && dari !== 'preorder') {
      await penjualanService.kembalikanStokPesanan(order)
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: statusBaru, updated_at: new Date().toISOString() })
      .eq('id', order.id)
    if (error) throw new Error(`Gagal mengubah status: ${error.message}`)
  },

  // 1. Validasi stok  2. Simpan order  3. Simpan item  4. Potong stok  5. Catat stok_logs
  async createPenjualan(cart: CartItem[], form: CheckoutFormInput): Promise<OrderRecord> {
    if (cart.length === 0) {
      throw new Error('Keranjang belanja masih kosong.')
    }

    // Validasi stok terbaru langsung dari database
    const need = new Map<string, { namaBahan: string; qty: number }>()
    for (const item of cart) {
      for (const r of item.resep || []) {
        const cur = need.get(r.bahanId)
        const add = r.qty * item.cartQty
        if (cur) cur.qty += add
        else need.set(r.bahanId, { namaBahan: r.namaBahan, qty: add })
      }
    }
    const stokNow: Record<string, number> = form.isPreOrder ? {} : await penjualanService.getStokBahan()
    for (const [id, { namaBahan, qty }] of form.isPreOrder ? [] : Array.from(need.entries())) {
      if ((stokNow[id] ?? 0) + 1e-9 < qty) {
        throw new Error(`Stok ${namaBahan} tidak cukup untuk pesanan ini. Muat ulang halaman lalu kurangi porsinya.`)
      }
    }

    const supabase = createClient()
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()

    if (sessionErr || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }
    const userId = sessionData.session.user.id

    const subtotal = cart.reduce((s, c) => s + c.hargaJual * c.cartQty, 0)
    const totalHPP = cart.reduce((s, c) => s + c.hpp * c.cartQty, 0)
    const discount = form.discount || 0
    const totalPrice = Math.max(0, subtotal - discount)
    const profit = totalPrice - totalHPP

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randCode = Math.floor(100 + Math.random() * 900)
    const invoiceNumber = `INV/${todayStr}/${randCode}`

    const customerName = form.customerName?.trim() || 'Pelanggan Umum'
    const customerPhone = form.customerPhone?.trim() || null
    const customerEmail = form.customerEmail?.trim() || null
    const channel = normalizeOrderChannel(form.channel)
    const paymentMethod = form.paymentMethod || 'Tunai / Cash'
    const cashierName = form.cashierName || 'Kasir Dapur'
    const notes = form.notes?.trim() || null

    // 1. orders
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        channel,
        status: form.isPreOrder ? 'preorder' : 'menunggu',
        payment_method: paymentMethod,
        payment_status: 'Lunas',
        subtotal,
        discount,
        shipping_fee: 0,
        total_price: totalPrice,
        total_hpp: totalHPP,
        profit,
        cashier_name: cashierName,
        notes,
        cash_received: form.cashReceived ?? null,
        change_amount: form.changeAmount ?? null,
        midtrans_order_id: form.midtransOrderId ?? null,
      })
      .select('*')
      .single()

    if (orderErr || !orderData) {
      console.error('Error insert order:', orderErr)
      throw new Error(`Gagal mencatat transaksi: ${orderErr?.message || 'Unknown error'}`)
    }

    const orderId = orderData.id

    // 2. order_items
    const orderItemsPayload = cart.map(c => ({
      user_id: userId,
      order_id: orderId,
      menu_id: c.menuId,
      nama_menu: c.namaMenu,
      qty: c.cartQty,
      harga_jual: c.hargaJual,
      hpp: c.hpp,
      subtotal: c.hargaJual * c.cartQty,
    }))

    const { data: itemsData, error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)
      .select('*')

    if (itemsErr) {
      console.error('Error insert order_items:', itemsErr)
    }

    // 3. Potong stok + stok_logs
    const bahanDeductionMap = new Map<string, { namaBahan: string; qtyToDeduct: number }>()
    for (const item of cart) {
      for (const r of item.resep || []) {
        const totalBahanNeeded = r.qty * item.cartQty
        const existing = bahanDeductionMap.get(r.bahanId)
        if (existing) existing.qtyToDeduct += totalBahanNeeded
        else bahanDeductionMap.set(r.bahanId, { namaBahan: r.namaBahan, qtyToDeduct: totalBahanNeeded })
      }
    }

    for (const [bahanId, { qtyToDeduct }] of form.isPreOrder ? [] : Array.from(bahanDeductionMap.entries())) {
      const { data: bhn } = await supabase
        .from('bahan')
        .select('stok, satuan')
        .eq('id', bahanId)
        .single()

      if (bhn) {
        const currentStock = Number(bhn.stok) || 0
        const roundedDeduct = Number(qtyToDeduct.toFixed(3))
        const newStock = Number((currentStock - roundedDeduct).toFixed(3))

        await supabase
          .from('bahan')
          .update({ stok: newStock, updated_at: new Date().toISOString() })
          .eq('id', bahanId)

        await supabase.from('stok_logs').insert({
          user_id: userId,
          bahan_id: bahanId,
          perubahan: -roundedDeduct,
          stok_sebelum: currentStock,
          stok_sesudah: newStock,
          sumber: 'Penjualan',
          reference_id: orderId,
          catatan: `Penjualan ${invoiceNumber}: Terpakai ${roundedDeduct} ${bhn.satuan}`,
        })
      }
    }

    // 4. Kirim notifikasi transaksi & struk via Email Resend (non-blocking)
    try {
      const ownerEmail = sessionData.session.user.email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, store_name')
        .eq('id', userId)
        .single()

      const storeName = profile?.store_name || 'DapurTwin'
      const ownerName = profile?.full_name || ownerEmail?.split('@')[0] || 'Chef / Owner'

      const emailPayload = {
        ownerEmail: ownerEmail || null,
        customerEmail: customerEmail || null,
        storeName,
        ownerName,
        invoiceNumber,
        customerName,
        customerPhone,
        paymentMethod,
        paymentStatus: 'Lunas',
        subtotal,
        discount,
        totalPrice,
        cashReceived: form.cashReceived ?? null,
        changeAmount: form.changeAmount ?? null,
        cashierName,
        notes,
        items: cart.map(c => ({
          namaMenu: c.namaMenu,
          qty: c.cartQty,
          hargaJual: c.hargaJual,
          subtotal: c.hargaJual * c.cartQty,
        })),
        createdAt: orderData.created_at,
      }

      // Panggil endpoint internal notify-sale
      fetch('/api/notify-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      }).catch(err => {
        console.warn('Background notify-sale request error:', err)
      })
    } catch (notifyErr) {
      console.warn('Gagal memicu pengiriman email transaksi:', notifyErr)
    }

    const finalOrder = mapOrderFromDB({ ...orderData, order_items: itemsData || [] })
    if (customerEmail) {
      finalOrder.customerEmail = customerEmail
    }
    return finalOrder
  },
}