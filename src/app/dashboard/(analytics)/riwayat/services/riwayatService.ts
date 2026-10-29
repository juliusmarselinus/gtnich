import { createClient } from '@/lib/supabase/client'
import { RiwayatPenjualan, RiwayatPO } from '../types'

export const riwayatService = {
  async getPenjualanList(): Promise<RiwayatPenjualan[]> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Pengguna tidak terautentikasi')

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching riwayat penjualan:', error)
      throw new Error(`Gagal memuat riwayat penjualan: ${error.message}`)
    }

    return (data || []).map(row => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerName: row.customer_name || 'Pelanggan Umum',
      customerPhone: row.customer_phone,
      channel: row.channel || 'Toko Langsung',
      status: row.status || 'selesai',
      paymentMethod: row.payment_method || 'Tunai / Cash',
      paymentStatus: row.payment_status || 'Lunas',
      subtotal: Number(row.subtotal) || 0,
      discount: Number(row.discount) || 0,
      shippingFee: Number(row.shipping_fee) || 0,
      totalPrice: Number(row.total_price) || 0,
      totalHPP: Number(row.total_hpp) || 0,
      profit: Number(row.profit) || 0,
      cashierName: row.cashier_name || 'Kasir Dapur',
      notes: row.notes,
      createdAt: row.created_at,
      items: (row.order_items || []).map((i: any) => ({
        id: i.id,
        orderId: i.order_id,
        menuId: i.menu_id,
        namaMenu: i.nama_menu,
        qty: Number(i.qty) || 0,
        hargaJual: Number(i.harga_jual) || 0,
        hpp: Number(i.hpp) || 0,
        subtotal: Number(i.subtotal) || 0,
      })),
    }))
  },

  async getPOList(): Promise<RiwayatPO[]> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Pengguna tidak terautentikasi')

    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, po_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching riwayat PO:', error)
      throw new Error(`Gagal memuat riwayat PO: ${error.message}`)
    }

    return (data || []).map(row => ({
      id: row.id,
      noPO: row.no_po,
      supplierId: row.supplier_id,
      namaSupplier: row.nama_supplier || 'Supplier Umum',
      status: row.status,
      totalEstimasi: Number(row.total_estimasi) || 0,
      totalAktual: Number(row.total_aktual) || 0,
      tanggalBuat: row.tanggal_buat || row.created_at,
      tanggalTerima: row.tanggal_terima,
      catatan: row.catatan,
      createdAt: row.created_at,
      items: (row.po_items || []).map((i: any) => ({
        id: i.id,
        bahanId: i.bahan_id,
        namaBahan: i.nama_bahan,
        qty: Number(i.qty) || 0,
        satuan: i.satuan || 'satuan',
        hargaEstimasi: Number(i.harga_estimasi) || 0,
        hargaAktual: Number(i.harga_aktual) || 0,
        stokSebelum: Number(i.stok_sebelum) || 0,
        diterima: Boolean(i.diterima),
      })),
    }))
  },
}
