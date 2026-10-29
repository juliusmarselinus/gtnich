import { createClient } from '@/lib/supabase/client'
import { ParsedItem, OCRScanResult, SupplierOption, BahanOption } from '../types'
import { parseReceiptRawText } from './tesseractParser'
import Tesseract from 'tesseract.js'

// Mock fallback jika tidak ada teks terbaca sama sekali
const FALLBACK_ITEMS: ParsedItem[] = [
  { nama: 'Tepung Terigu Segitiga Biru', qty: 5, satuan: 'kg', harga: 12500 },
  { nama: 'Gula Pasir Kristal Putih', qty: 3, satuan: 'kg', harga: 14000 },
  { nama: 'Minyak Goreng Sawit', qty: 2, satuan: 'liter', harga: 17000 },
  { nama: 'Biji Kopi Robusta', qty: 50, satuan: 'gram', harga: 3000 },
  { nama: 'Telur Ayam Segar', qty: 30, satuan: 'butir', harga: 2800 },
]

export const ocrService = {
  // Ambil daftar supplier & bahan dari database untuk dropdown / matching
  async getContextData(): Promise<{ suppliers: SupplierOption[]; bahanList: BahanOption[] }> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Pengguna tidak terautentikasi')

    const [{ data: suppliers }, { data: bahanList }] = await Promise.all([
      supabase.from('suppliers').select('id, nama').eq('user_id', user.id).order('nama'),
      supabase
        .from('bahan')
        .select('id, nama, satuan, harga_per_satuan, stok')
        .eq('user_id', user.id)
        .order('nama'),
    ])

    return {
      suppliers: (suppliers || []).map(s => ({ id: s.id, nama: s.nama })),
      bahanList: (bahanList || []).map(b => ({
        id: b.id,
        nama: b.nama,
        satuan: b.satuan,
        hargaPerSatuan: Number(b.harga_per_satuan) || 0,
        stok: Number(b.stok) || 0,
      })),
    }
  },

  // Scan file nota menggunakan 9Router Vision AI (opencode-code / gemini-3.1-flash-lite)
  async parseReceiptImage(
    file: File,
    existingBahanList: BahanOption[] = [],
    onProgress?: (progress: number, status: string) => void
  ): Promise<OCRScanResult> {
    try {
      if (onProgress) onProgress(20, 'Mengunggah gambar nota ke AI Vision...')

      const formData = new FormData()
      formData.append('file', file)
      const existingNames = existingBahanList.map(b => b.nama)
      formData.append('existingBahan', existingNames.join(', '))

      if (onProgress) onProgress(50, 'Menganalisis nota via 9Router (Gemini 3.1 Flash Lite)...')

      const response = await fetch('/dashboard/ocr-nota/api', {
        method: 'POST',
        body: formData,
      })

      const resJson = await response.json()

      if (!response.ok || !resJson.success) {
        throw new Error(
          resJson.error || `Gagal memproses gambar nota (Status: ${response.status})`
        )
      }

      if (onProgress) onProgress(90, 'Menyusun hasil ekstraksi item...')

      const parsed: OCRScanResult = resJson.data

      // Validasi & normalisasi hasil OCR
      const items: ParsedItem[] = (parsed.items || []).map(i => {
        // Coba match ke master bahan
        const found = existingBahanList.find(
          b => b.nama.toLowerCase() === (i.nama || '').toLowerCase()
        )
        return {
          nama: i.nama || 'Item Bahan',
          qty: Number(i.qty) > 0 ? Number(i.qty) : 1,
          satuan: (i.satuan || 'pcs').toLowerCase(),
          harga: Number(i.harga) || 0,
          matchedBahanId: found?.id,
        }
      })

      const total =
        Number(parsed.totalAkumulasi) ||
        items.reduce((sum, item) => sum + item.qty * item.harga, 0)

      if (onProgress) onProgress(100, 'Selesai mengekstrak!')

      return {
        supplierName: parsed.supplierName || undefined,
        tanggalNota: parsed.tanggalNota || new Date().toISOString().split('T')[0],
        nomorNota: parsed.nomorNota || undefined,
        items,
        totalAkumulasi: total,
        catatan: parsed.catatan || 'Model: 9Router opencode-code (gemini-3.1-flash-lite)',
      }
    } catch (err: any) {
      console.error('OCR API error:', err)
      throw new Error(
        err.message || 'Gagal memproses gambar nota. Pastikan gambar tidak rusak dan coba lagi.'
      )
    }
  },

  // Simpan hasil scan langsung ke Database: Menjadi Purchase Order (PO) & Opsional update stok
  async saveToPurchaseOrder(payload: {
    supplierId?: string
    supplierName: string
    nomorPO: string
    tanggalBuat: string
    items: ParsedItem[]
    catatan?: string
    updateStokDirectly?: boolean
  }): Promise<{ poId: string; noPO: string }> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Pengguna tidak terautentikasi')

    const totalEstimasi = payload.items.reduce((sum, i) => sum + i.qty * i.harga, 0)
    const status = payload.updateStokDirectly ? 'diterima' : 'draft'

    // 1. Buat record Purchase Order
    const { data: po, error: poErr } = await supabase
      .from('purchase_orders')
      .insert({
        user_id: user.id,
        no_po: payload.nomorPO,
        supplier_id: payload.supplierId || null,
        nama_supplier: payload.supplierName,
        status: status,
        total_estimasi: totalEstimasi,
        total_aktual: payload.updateStokDirectly ? totalEstimasi : 0,
        tanggal_buat: new Date(payload.tanggalBuat).toISOString(),
        tanggal_terima: payload.updateStokDirectly ? new Date().toISOString() : null,
        catatan: payload.catatan || 'Diimpor otomatis dari scan OCR Nota Pembelian',
      })
      .select('id, no_po')
      .single()

    if (poErr || !po) {
      console.error('Error creating PO from OCR:', poErr)
      throw new Error(`Gagal menyimpan Purchase Order: ${poErr?.message || 'Database error'}`)
    }

    // 2. Simpan PO Items & Sinkronisasi Bahan
    for (const item of payload.items) {
      let bahanId = item.matchedBahanId || null

      // Jika update stok langsung dicentang, kita update atau insert bahan
      if (payload.updateStokDirectly) {
        if (!bahanId) {
          // Cari bahan berdasarkan nama
          const { data: existingBahan } = await supabase
            .from('bahan')
            .select('id, stok, satuan')
            .eq('user_id', user.id)
            .ilike('nama', item.nama.trim())
            .maybeSingle()

          if (existingBahan) {
            bahanId = existingBahan.id
            const stokBaru = (Number(existingBahan.stok) || 0) + item.qty
            await supabase.from('bahan').update({ stok: stokBaru }).eq('id', existingBahan.id)

            // Catat ke stok_logs
            await supabase.from('stok_logs').insert({
              user_id: user.id,
              bahan_id: existingBahan.id,
              perubahan: item.qty,
              stok_sebelum: Number(existingBahan.stok) || 0,
              stok_sesudah: stokBaru,
              sumber: 'PO',
              reference_id: po.id,
              catatan: `Impor OCR Nota ${payload.nomorPO}: Masuk ${item.qty} ${item.satuan}`,
            })
          } else {
            // Buat bahan baru otomatis
            const { data: newBahan } = await supabase
              .from('bahan')
              .insert({
                user_id: user.id,
                nama: item.nama.trim(),
                satuan: item.satuan,
                harga_per_satuan: item.harga,
                stok: item.qty,
                stok_minimum: 5,
                supplier_id: payload.supplierId || null,
              })
              .select('id')
              .single()

            if (newBahan) {
              bahanId = newBahan.id
              // Catat stok_logs bahan baru
              await supabase.from('stok_logs').insert({
                user_id: user.id,
                bahan_id: newBahan.id,
                perubahan: item.qty,
                stok_sebelum: 0,
                stok_sesudah: item.qty,
                sumber: 'PO',
                reference_id: po.id,
                catatan: `Bahan baru dari OCR Nota ${payload.nomorPO}: ${item.qty} ${item.satuan}`,
              })
            }
          }
        } else {
          // Update stok dari bahan yang sudah dipilih
          const { data: existingBahan } = await supabase
            .from('bahan')
            .select('id, stok')
            .eq('id', bahanId)
            .single()

          if (existingBahan) {
            const stokBaru = (Number(existingBahan.stok) || 0) + item.qty
            await supabase.from('bahan').update({ stok: stokBaru }).eq('id', bahanId)

            await supabase.from('stok_logs').insert({
              user_id: user.id,
              bahan_id: bahanId,
              perubahan: item.qty,
              stok_sebelum: Number(existingBahan.stok) || 0,
              stok_sesudah: stokBaru,
              sumber: 'PO',
              reference_id: po.id,
              catatan: `Penerimaan OCR Nota ${payload.nomorPO}: Masuk ${item.qty} ${item.satuan}`,
            })
          }
        }
      }

      // Masukkan ke po_items
      await supabase.from('po_items').insert({
        po_id: po.id,
        user_id: user.id,
        bahan_id: bahanId,
        nama_bahan: item.nama,
        qty: item.qty,
        satuan: item.satuan,
        harga_estimasi: item.harga,
        harga_aktual: payload.updateStokDirectly ? item.harga : 0,
        stok_sebelum: 0,
        diterima: payload.updateStokDirectly,
      })
    }

    return { poId: po.id, noPO: po.no_po }
  },
}
