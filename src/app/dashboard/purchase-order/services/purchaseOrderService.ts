import { createClient } from '@/lib/supabase/client'
import { PurchaseOrder, POItem, POStatus, CreatePOInput, SupplierOption, BahanOption } from '../types'

interface RawPOItemDB {
  id: string
  user_id: string
  po_id: string
  bahan_id: string
  nama_bahan: string
  satuan: string
  qty: number | string
  harga_estimasi: number | string
  harga_aktual: number | string
  stok_sebelum: number | string
  diterima: boolean
  created_at: string
}

interface RawPODB {
  id: string
  user_id: string
  no_po: string
  supplier_id: string | null
  nama_supplier: string
  status: POStatus
  total_estimasi: number | string
  total_aktual: number | string
  tanggal_buat: string
  tanggal_terima: string | null
  catatan: string | null
  created_at: string
  updated_at: string
  po_items?: RawPOItemDB[] | null
}

function mapPOFromDB(row: RawPODB): PurchaseOrder {
  const items: POItem[] = (row.po_items || []).map(i => ({
    id: i.id,
    poId: i.po_id,
    bahanId: i.bahan_id,
    namaBahan: i.nama_bahan,
    satuan: i.satuan,
    qty: Number(i.qty) || 0,
    hargaEstimasi: Number(i.harga_estimasi) || 0,
    hargaAktual: Number(i.harga_aktual) || 0,
    stokSebelum: Number(i.stok_sebelum) || 0,
    diterima: !!i.diterima,
  }))

  return {
    id: row.id,
    userId: row.user_id,
    noPO: row.no_po,
    supplierId: row.supplier_id,
    namaSupplier: row.nama_supplier,
    status: row.status,
    totalEstimasi: Number(row.total_estimasi) || 0,
    totalAktual: Number(row.total_aktual) || 0,
    tanggalBuat: row.tanggal_buat ? new Date(row.tanggal_buat).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
    tanggalTerima: row.tanggal_terima,
    catatan: row.catatan,
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const purchaseOrderService = {
  // Ambil daftar PO beserta item-itemnya
  async getAll(): Promise<PurchaseOrder[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, po_items(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchase_orders:', error)
      throw new Error(error.message || 'Gagal memuat daftar purchase order.')
    }

    return (data as RawPODB[] || []).map(mapPOFromDB)
  },

  // Ambil daftar supplier untuk dropdown wizard
  async getSuppliers(): Promise<SupplierOption[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, nama, kategori, minimal_order')
      .order('nama', { ascending: true })

    if (error) {
      console.warn('Error fetching suppliers for PO:', error)
      return []
    }

    return (data || []).map(s => ({
      id: s.id,
      nama: s.nama,
      kategori: s.kategori || undefined,
      minimalOrder: Number(s.minimal_order) || 0,
    }))
  },

  // Ambil daftar bahan baku aktif untuk dropdown item
  async getBahanList(): Promise<BahanOption[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('bahan')
      .select('id, nama, satuan, harga_per_satuan, stok')
      .order('nama', { ascending: true })

    if (error) {
      console.warn('Error fetching bahan for PO:', error)
      return []
    }

    return (data || []).map(b => ({
      id: b.id,
      nama: b.nama,
      satuan: b.satuan,
      hargaPerSatuan: Number(b.harga_per_satuan) || 0,
      stok: Number(b.stok) || 0,
    }))
  },

  // Buat Purchase Order Baru beserta Items
  async createPO(input: CreatePOInput): Promise<PurchaseOrder> {
    const supabase = createClient()
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()

    if (sessionErr || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }
    const userId = sessionData.session.user.id

    // Generate No. PO unik
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randCode = Math.floor(100 + Math.random() * 900)
    const noPO = `PO/${todayStr}/${randCode}`

    const totalEstimasi = input.items.reduce((sum, item) => sum + item.qty * item.hargaEstimasi, 0)

    // 1. Simpan Header PO
    const { data: poData, error: poErr } = await supabase
      .from('purchase_orders')
      .insert({
        user_id: userId,
        no_po: noPO,
        supplier_id: input.supplierId,
        nama_supplier: input.namaSupplier,
        status: 'draft',
        total_estimasi: totalEstimasi,
        total_aktual: 0,
        tanggal_buat: new Date().toISOString(),
        catatan: input.catatan?.trim() || null,
      })
      .select('*')
      .single()

    if (poErr) {
      console.error('Error inserting purchase_orders:', poErr)
      throw new Error(`Gagal membuat PO: ${poErr.message}`)
    }

    const poId = poData.id

    // 2. Simpan Item-item PO
    const itemsPayload = input.items.map(item => ({
      user_id: userId,
      po_id: poId,
      bahan_id: item.bahanId,
      nama_bahan: item.namaBahan,
      satuan: item.satuan,
      qty: item.qty,
      harga_estimasi: item.hargaEstimasi,
      harga_aktual: 0,
      stok_sebelum: item.stokSebelum,
      diterima: false,
    }))

    const { data: itemsData, error: itemsErr } = await supabase
      .from('po_items')
      .insert(itemsPayload)
      .select('*')

    if (itemsErr) {
      console.error('Error inserting po_items:', itemsErr)
      throw new Error(`Gagal menyimpan item PO: ${itemsErr.message}`)
    }

    return mapPOFromDB({
      ...poData,
      po_items: itemsData,
    })
  },

  // Perbarui Status PO (misal: 'draft' -> 'dikirim' -> 'diterima' -> 'tagihan')
  // JIKA status berubah menjadi 'diterima', otomatis masukkan stok bahan (+) dan catat di stok_logs
  async updateStatus(poId: string, newStatus: POStatus): Promise<void> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) throw new Error('Sesi auth tidak ditemukan.')

    // 1. Ambil data PO saat ini beserta item
    const { data: currentPO, error: fetchErr } = await supabase
      .from('purchase_orders')
      .select('*, po_items(*)')
      .eq('id', poId)
      .single()

    if (fetchErr || !currentPO) {
      throw new Error('Data Purchase Order tidak ditemukan.')
    }

    // 2. Update status PO
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }
    if (newStatus === 'diterima' && !currentPO.tanggal_terima) {
      updatePayload.tanggal_terima = new Date().toISOString()
      // Jika harga aktual belum diisi, set sama dengan estimasi
      if (Number(currentPO.total_aktual) === 0) {
        updatePayload.total_aktual = currentPO.total_estimasi
      }
    }

    const { error: poUpdateErr } = await supabase
      .from('purchase_orders')
      .update(updatePayload)
      .eq('id', poId)

    if (poUpdateErr) {
      throw new Error(`Gagal update status PO: ${poUpdateErr.message}`)
    }

    // 3. JIKA DITERIMA: Tambahkan stok bahan & catat log mutasi
    if (newStatus === 'diterima' && currentPO.status !== 'diterima') {
      const items = currentPO.po_items as RawPOItemDB[]
      for (const item of items) {
        // Ambil stok terkini
        const { data: bhn } = await supabase
          .from('bahan')
          .select('stok')
          .eq('id', item.bahan_id)
          .single()

        const currentStock = bhn ? Number(bhn.stok) || 0 : 0
        const itemQty = Number(item.qty) || 0
        const newStock = Number((currentStock + itemQty).toFixed(3))

        // Update stok fisik di tabel bahan
        await supabase
          .from('bahan')
          .update({ stok: newStock, updated_at: new Date().toISOString() })
          .eq('id', item.bahan_id)

        // Catat ke tabel stok_logs (sumber: 'PO')
        await supabase.from('stok_logs').insert({
          user_id: userId,
          bahan_id: item.bahan_id,
          perubahan: itemQty,
          stok_sebelum: currentStock,
          stok_sesudah: newStock,
          sumber: 'PO',
          reference_id: poId,
          catatan: `Penerimaan barang PO: ${currentPO.no_po} dari ${currentPO.nama_supplier}`,
        })

        // Tandai item diterima
        await supabase
          .from('po_items')
          .update({ diterima: true })
          .eq('id', item.id)
      }

      // Catat ke supplier_riwayat jika supplier_id ada
      if (currentPO.supplier_id) {
        await supabase.from('supplier_riwayat').insert({
          user_id: userId,
          supplier_id: currentPO.supplier_id,
          tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          keterangan: `Penerimaan ${currentPO.no_po} (${items.length} item bahan)`,
          jumlah: Number(currentPO.total_estimasi) || 0,
        })
      }
    }
  },
}
