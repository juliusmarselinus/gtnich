import { createClient } from '@/lib/supabase/client'
import { BahanKondisi, BatchMasukItem } from '../types'
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
  // Ambil data stok per batch / per barang masuk dari database dan riwayat stok_logs
  // Tidak langsung mengakumulasi semua stok agar analisis shelf-life & kadaluarsa akurat per transaksi masuk
  async getBahanKondisi(apiKey?: string): Promise<BahanKondisi[]> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    // 1. Ambil data master bahan milik user
    let bahanQuery = supabase
      .from('bahan')
      .select('*, suppliers(id, nama)')
      .order('nama', { ascending: true })

    if (userId) {
      bahanQuery = bahanQuery.eq('user_id', userId)
    }

    const { data: bahanData, error: bahanError } = await bahanQuery

    if (bahanError) {
      console.error('Error fetching bahan kondisi:', bahanError)
      throw new Error(bahanError.message || 'Gagal memuat kondisi bahan dari database.')
    }

    const rows = (bahanData as RawBahanDB[]) || []
    if (rows.length === 0) return []

    // 2. Ambil riwayat stok masuk dari stok_logs (perubahan > 0) milik user
    let logsQuery = supabase
      .from('stok_logs')
      .select('id, user_id, bahan_id, perubahan, sumber, reference_id, catatan, created_at')
      .gt('perubahan', 0)
      .order('created_at', { ascending: false })

    if (userId) {
      logsQuery = logsQuery.eq('user_id', userId)
    }

    const { data: logsData, error: logsError } = await logsQuery

    if (logsError) {
      console.warn('Warning fetching stok_logs for kondisi bahan batch:', logsError)
    }

    const incomingLogs = logsData || []

    // 3. Bangun daftar bahan terkonsolidasi dengan rincian batch barang masuk
    const enrichedList: BahanKondisi[] = await Promise.all(
      rows.map(async b => {
        const bahanLogs = incomingLogs.filter(l => l.bahan_id === b.id)

        // Dapatkan analisis dasar umur simpan untuk jenis bahan ini
        const baseDate = b.tanggal_masuk || b.created_at || new Date().toISOString()
        const baseAiResult = await analyzeShelfLife(b.nama, baseDate, apiKey)

        let batches: BatchMasukItem[] = []

        if (bahanLogs.length > 0) {
          // Buat rincian per batch masuk dengan penomoran urut
          batches = await Promise.all(
            bahanLogs.map(async (l, idx) => {
              const batchNo = bahanLogs.length - idx // Nomor batch (#1 batch paling awal, #2 berikutnya, dst)
              const sumberLabel = l.sumber === 'PO' ? 'Pesanan Belanja (PO)' : l.sumber === 'Manual' ? 'Stok Masuk Manual' : `Masuk (${l.sumber})`
              const batchAi = await analyzeShelfLife(b.nama, l.created_at, apiKey)
              const isExpired = batchAi.aiStatusFreshness === 'kadaluarsa' || (batchAi.aiSisaHari !== null && batchAi.aiSisaHari <= 0)

              return {
                batchId: l.id,
                batchNo,
                batchQty: Number(l.perubahan) || 0,
                tanggalMasuk: l.created_at,
                sumberMasuk: sumberLabel,
                nomorReferensi: l.reference_id || l.catatan || null,
                aiEstimasiExpire: batchAi.aiEstimasiExpire,
                aiSisaHari: batchAi.aiSisaHari,
                aiStatusFreshness: batchAi.aiStatusFreshness,
                isExpired,
              }
            })
          )
        } else {
          // Fallback: Jika belum ada transaksi log mutasi tercatat, tampilkan batch stok awal
          const isExpired = baseAiResult.aiStatusFreshness === 'kadaluarsa' || (baseAiResult.aiSisaHari !== null && baseAiResult.aiSisaHari <= 0)
          batches = [
            {
              batchId: b.id,
              batchNo: 1,
              batchQty: Number(b.stok) || 0,
              tanggalMasuk: baseDate,
              sumberMasuk: 'Stok Awal Terdaftar',
              nomorReferensi: b.code || null,
              aiEstimasiExpire: baseAiResult.aiEstimasiExpire,
              aiSisaHari: baseAiResult.aiSisaHari,
              aiStatusFreshness: baseAiResult.aiStatusFreshness,
              isExpired,
            },
          ]
        }

        // Hitung batch yang kadaluarsa
        const expiredBatchesCount = batches.filter(bt => bt.isExpired).length

        // Tentukan status freshness agregat (jika ada batch kadaluarsa, tandai perlu tindakan)
        let overallFreshness: BahanKondisi['aiStatusFreshness'] = 'segar'
        if (expiredBatchesCount > 0) {
          overallFreshness = 'kadaluarsa'
        } else if (batches.some(bt => bt.aiStatusFreshness === 'mendekati_expire')) {
          overallFreshness = 'mendekati_expire'
        }

        // Cari sisa hari terkecil (batch yang paling mendesak/segera expire)
        const sortedBatches = [...batches].sort((x, y) => (x.aiSisaHari ?? 999) - (y.aiSisaHari ?? 999))
        const earliestBatch = sortedBatches[0]

        return {
          id: b.id,
          userId: b.user_id,
          code: b.code,
          nama: b.nama,
          satuan: b.satuan,
          hargaPerSatuan: Number(b.harga_per_satuan) || 0,
          totalStok: Number(b.stok) || 0,
          stokMinimum: Number(b.stok_minimum) || 0,
          supplierId: b.supplier_id,
          namaSupplier: b.suppliers?.nama || '-',
          tanggalExpireManual: b.tanggal_expire || null,

          // Analisis terdekat
          aiStatusFreshness: overallFreshness,
          aiSisaHari: earliestBatch?.aiSisaHari ?? baseAiResult.aiSisaHari,
          aiEstimasiExpire: earliestBatch?.aiEstimasiExpire ?? baseAiResult.aiEstimasiExpire,
          aiAnalysis: baseAiResult.aiAnalysis,

          // Rincian batch dalam 1 card
          batches,
          expiredBatchesCount,

          createdAt: b.created_at,
          updatedAt: b.updated_at,
        }
      })
    )

    // Urutkan bahan berdasarkan prioritas: yang memiliki batch kadaluarsa atau sisa hari tersedikit paling atas
    return enrichedList.sort((a, b) => {
      if (a.expiredBatchesCount !== b.expiredBatchesCount) {
        return b.expiredBatchesCount - a.expiredBatchesCount
      }
      return (a.aiSisaHari ?? 999) - (b.aiSisaHari ?? 999)
    })
  },

  /**
   * Proses pengurangan / pemusnahan stok bahan yang kadaluarsa atau rusak.
   * Mengurangi stok di tabel 'bahan' dan mencatat jejak audit ke 'stok_logs'
   * dengan sumber 'Kadaluarsa' dan delta negatif.
   */
  async kurangiStokKadaluarsa(params: {
    bahanId: string
    jumlah: number
    alasan?: string
    nomorBatch?: number
  }): Promise<{ newStok: number }> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) {
      throw new Error('Sesi pengguna tidak valid. Silakan login kembali.')
    }

    if (params.jumlah <= 0) {
      throw new Error('Jumlah pengurangan stok harus lebih dari 0.')
    }

    // 1. Ambil data bahan saat ini
    const { data: bahan, error: bahanErr } = await supabase
      .from('bahan')
      .select('id, nama, stok, satuan')
      .eq('id', params.bahanId)
      .eq('user_id', userId)
      .single()

    if (bahanErr || !bahan) {
      throw new Error('Data bahan tidak ditemukan atau akses ditolak.')
    }

    const currentStok = Number(bahan.stok) || 0
    const delta = -Math.abs(params.jumlah)
    const newStok = Math.max(0, Number((currentStok + delta).toFixed(3)))

    // 2. Update stok bahan
    const { error: updateErr } = await supabase
      .from('bahan')
      .update({
        stok: newStok,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.bahanId)
      .eq('user_id', userId)

    if (updateErr) {
      throw new Error(`Gagal memperbarui stok bahan: ${updateErr.message}`)
    }

    // 3. Catat mutasi audit di stok_logs
    const catatan = params.alasan?.trim()
      ? `Pengurangan stok kadaluarsa/rusak: ${params.alasan.trim()}${params.nomorBatch ? ` (Batch #${params.nomorBatch})` : ''}`
      : `Pemusnahan bahan kadaluarsa/rusak${params.nomorBatch ? ` (Batch #${params.nomorBatch})` : ''}`

    const { error: logErr } = await supabase.from('stok_logs').insert({
      user_id: userId,
      bahan_id: params.bahanId,
      perubahan: delta,
      stok_sebelum: currentStok,
      stok_sesudah: newStok,
      sumber: 'Kadaluarsa',
      catatan,
    })

    if (logErr) {
      console.warn('Gagal mencatat log mutasi stok_logs:', logErr)
    }

    return { newStok }
  },
}
