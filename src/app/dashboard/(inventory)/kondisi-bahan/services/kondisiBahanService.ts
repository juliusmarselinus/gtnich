import { createClient } from '@/lib/supabase/client'
import { BahanKondisi } from '../types'
import { analyzeShelfLife } from './expiryAIService'

interface RawBahanDB {
  id: string
  user_id: string
  code: string | null
  nama: string
  satuan: string
  harga_per_satuan: number | string
  stok: number | string
  stok_minimum: number | string
  supplier_id: string | null
  created_at: string
  updated_at: string
  tanggal_masuk?: string | null
  tanggal_expire?: string | null
  suppliers?: {
    id: string
    nama: string
  } | null
}

export const kondisiBahanService = {
  // Ambil semua bahan dari database dan jalankan analisis kedaluwarsa AI
  async getBahanKondisi(apiKey?: string): Promise<BahanKondisi[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('bahan')
      .select('*, suppliers(id, nama)')
      .order('stok', { ascending: true })

    if (error) {
      console.error('Error fetching bahan kondisi:', error)
      throw new Error(error.message || 'Gagal memuat kondisi bahan dari database.')
    }

    const rows = (data as RawBahanDB[]) || []

    // Jalankan analisis shelf-life untuk tiap bahan secara paralel
    const enrichedList = await Promise.all(
      rows.map(async row => {
        const tanggalMasuk = row.tanggal_masuk || row.created_at || new Date().toISOString()
        const aiResult = await analyzeShelfLife(row.nama, tanggalMasuk, apiKey)

        return {
          id: row.id,
          userId: row.user_id,
          code: row.code,
          nama: row.nama,
          satuan: row.satuan,
          hargaPerSatuan: Number(row.harga_per_satuan) || 0,
          stok: Number(row.stok) || 0,
          stokMinimum: Number(row.stok_minimum) || 0,
          supplierId: row.supplier_id,
          namaSupplier: row.suppliers?.nama || '-',
          tanggalMasuk,
          tanggalExpireManual: row.tanggal_expire || null,

          // Hasil Analisis AI
          aiEstimasiExpire: aiResult.aiEstimasiExpire,
          aiSisaHari: aiResult.aiSisaHari,
          aiStatusFreshness: aiResult.aiStatusFreshness,
          aiAnalysis: aiResult.aiAnalysis,

          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
      })
    )

    return enrichedList
  },
}
