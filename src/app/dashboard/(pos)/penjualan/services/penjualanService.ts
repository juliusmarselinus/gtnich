import { createClient } from '@/lib/supabase/client'
import { menuService } from '@/app/dashboard/(pos)/menu/services/menuService'
import { MenuItem } from '@/app/dashboard/(pos)/menu/types'
import { CartItem, CheckoutFormInput, OrderRecord, OrderItemRecord } from '../types'

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  }
}

export const penjualanService = {
  // Ambil menu aktif beserta komposisi resepnya langsung dari Supabase
  async getKatalogMenu(): Promise<MenuItem[]> {
    const menus = await menuService.getAll()
    return menus.filter(m => m.isActive)
  },

  // Ambil transaksi penjualan terkini milik user
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

    return (data as RawOrderDB[] || []).map(mapOrderFromDB)
  },

  // Simpan transaksi penjualan kasir (POS)
  // 1. Simpan order ke orders
  // 2. Simpan setiap item ke order_items
  // 3. Potong stok bahan baku sesuai komposisi resep
  // 4. Catat mutasi keluar (-) di stok_logs
  async createPenjualan(cart: CartItem[], form: CheckoutFormInput): Promise<OrderRecord> {
    if (cart.length === 0) {
      throw new Error('Keranjang belanja masih kosong.')
    }

    const supabase = createClient()
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()

    if (sessionErr || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }
    const userId = sessionData.session.user.id

    // Hitung akumulasi angka
    const subtotal = cart.reduce((s, c) => s + c.hargaJual * c.cartQty, 0)
    const totalHPP = cart.reduce((s, c) => s + c.hpp * c.cartQty, 0)
    const discount = form.discount || 0
    const totalPrice = Math.max(0, subtotal - discount)
    const profit = totalPrice - totalHPP

    // Generate Invoice Number Unik
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randCode = Math.floor(100 + Math.random() * 900)
    const invoiceNumber = `INV/${todayStr}/${randCode}`

    const customerName = form.customerName?.trim() || 'Pelanggan Umum'
    const customerPhone = form.customerPhone?.trim() || null
    const channel = normalizeOrderChannel(form.channel)
    const paymentMethod = form.paymentMethod || 'Tunai / Cash'
    const cashierName = form.cashierName || 'Kasir Dapur'
    const notes = form.notes?.trim() || null

    // 1. Insert ke tabel orders
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        channel,
        status: 'selesai',
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
      })
      .select('*')
      .single()

    if (orderErr || !orderData) {
      console.error('Error insert order:', orderErr)
      throw new Error(`Gagal mencatat transaksi: ${orderErr?.message || 'Unknown error'}`)
    }

    const orderId = orderData.id

    // 2. Insert order_items
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

    // 3. Potong stok bahan baku & catat stok_logs
    // Kita agregasikan total kebutuhan bahan dari semua menu yang dibeli di cart
    const bahanDeductionMap = new Map<string, { namaBahan: string; qtyToDeduct: number }>()

    for (const item of cart) {
      if (item.resep && item.resep.length > 0) {
        for (const r of item.resep) {
          const totalBahanNeeded = r.qty * item.cartQty
          const existing = bahanDeductionMap.get(r.bahanId)
          if (existing) {
            existing.qtyToDeduct += totalBahanNeeded
          } else {
            bahanDeductionMap.set(r.bahanId, {
              namaBahan: r.namaBahan,
              qtyToDeduct: totalBahanNeeded,
            })
          }
        }
      }
    }

    // Eksekusi pemotongan stok & pencatatan mutasi
    for (const [bahanId, { namaBahan, qtyToDeduct }] of Array.from(bahanDeductionMap.entries())) {
      // Ambil stok bahan saat ini
      const { data: bhn } = await supabase
        .from('bahan')
        .select('stok, satuan')
        .eq('id', bahanId)
        .single()

      if (bhn) {
        const currentStock = Number(bhn.stok) || 0
        const roundedDeduct = Number(qtyToDeduct.toFixed(3))
        const newStock = Number((currentStock - roundedDeduct).toFixed(3))

        // Update stok fisik
        await supabase
          .from('bahan')
          .update({
            stok: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bahanId)

        // Catat ke stok_logs (sumber: Penjualan)
        await supabase.from('stok_logs').insert({
          user_id: userId,
          bahan_id: bahanId,
          perubahan: -roundedDeduct, // Nilai negatif untuk mutasi keluar
          stok_sebelum: currentStock,
          stok_sesudah: newStock,
          sumber: 'Penjualan',
          reference_id: orderId,
          catatan: `Penjualan ${invoiceNumber}: Terpakai ${roundedDeduct} ${bhn.satuan}`,
        })
      }
    }

    return mapOrderFromDB({
      ...orderData,
      order_items: itemsData || [],
    })
  },
}
