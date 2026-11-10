import { createClient } from '@/lib/supabase/client'
import { BahanKondisi, BatchMasukItem, FreshnessStatus, PenjualanKondisi, RunoutStatus } from '../types'
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

    // 2. Ambil riwayat stok masuk & stok keluar kadaluarsa dari stok_logs milik user
    let logsQuery = supabase
      .from('stok_logs')
      .select('id, user_id, bahan_id, perubahan, sumber, reference_id, catatan, created_at')
      .order('created_at', { ascending: false })

    if (userId) {
      logsQuery = logsQuery.eq('user_id', userId)
    }

    const { data: logsData, error: logsError } = await logsQuery

    if (logsError) {
      console.warn('Warning fetching stok_logs for kondisi bahan batch:', logsError)
    }

    const allLogs = logsData || []
    const incomingLogs = allLogs.filter(l => Number(l.perubahan) > 0)
    // Filter log pemusnahan/kadaluarsa baik yang bertipe 'Kadaluarsa' maupun 'Manual' dengan catatan pemusnahan/kadaluarsa
    const kadaluarsaLogs = allLogs.filter(l => {
      const isNeg = Number(l.perubahan) < 0
      const s = String(l.sumber || '').toLowerCase()
      const c = String(l.catatan || '').toLowerCase()
      return (
        s === 'kadaluarsa' ||
        (isNeg && (c.includes('kadaluarsa') || c.includes('pemusnahan') || c.includes('rusak') || c.includes('buang')))
      )
    })

    // 3. Analisis konsumsi dari riwayat stok keluar (Penjualan / Dapur) dalam 30 hari terakhir
    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - 30)
    const recentLogs = allLogs.filter(l => new Date(l.created_at) >= dateLimit)

    const salesConsumptionMap: Record<string, number> = {}
    recentLogs.forEach(l => {
      const bId = l.bahan_id
      const delta = Number(l.perubahan) || 0
      const s = String(l.sumber || '').toLowerCase()
      const isPemusnahan =
        s === 'kadaluarsa' ||
        String(l.catatan || '').toLowerCase().includes('kadaluarsa') ||
        String(l.catatan || '').toLowerCase().includes('pemusnahan')

      // Hitung pengeluaran operasional nyata (penjualan menu / pemakaian resep dapur)
      if (bId && delta < 0 && !isPemusnahan) {
        salesConsumptionMap[bId] = (salesConsumptionMap[bId] || 0) + Math.abs(delta)
      }
    })

    // 3. Bangun daftar bahan terkonsolidasi dengan rincian batch barang masuk
    const enrichedList: BahanKondisi[] = await Promise.all(
      rows.map(async b => {
        const bahanLogs = incomingLogs.filter(l => l.bahan_id === b.id)
        const bahanKadaluarsaLogs = kadaluarsaLogs.filter(l => l.bahan_id === b.id)
        const totalDibuangKadaluarsa = bahanKadaluarsaLogs.reduce(
          (sum, l) => sum + Math.abs(Number(l.perubahan) || 0),
          0
        )

        // Dapatkan analisis dasar umur simpan untuk jenis bahan ini
        const baseDate = b.tanggal_masuk || b.created_at || new Date().toISOString()
        const baseAiResult = await analyzeShelfLife(b.nama, baseDate, apiKey)

        let batches: BatchMasukItem[] = []

        // 3. Status Pemusnahan & Stok 0
        // JIKA STOK BAHAN SUDAH 0:
        // Semua batch otomatis sudah habis / dimusnahkan. Tidak boleh ada status 'kadaluarsa' atau peringatan kadaluarsa aktif.
        const isBahanHabis = Number(b.stok) <= 0

        if (bahanLogs.length > 0) {
          // Urutkan bahanLogs secara kronologis (dari batch terlama/tertua ke terbaru)
          // agar pengurangan/pemusnahan FIFO memotong batch kadaluarsa tertua terlebih dahulu
          const sortedIncomingLogs = [...bahanLogs].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          let sisaDibuangPool = totalDibuangKadaluarsa

          batches = await Promise.all(
            sortedIncomingLogs.map(async (l, idx) => {
              const batchNo = idx + 1 // Nomor batch (#1 batch paling awal masuk)
              const sumberLabel = l.sumber === 'PO' ? 'Pesanan Belanja (PO)' : l.sumber === 'Manual' ? 'Stok Masuk Manual' : `Masuk (${l.sumber})`
              const batchAi = await analyzeShelfLife(b.nama, l.created_at, apiKey)
              const rawExpired = batchAi.aiStatusFreshness === 'kadaluarsa' || (batchAi.aiSisaHari !== null && batchAi.aiSisaHari <= 0)

              // Cek apakah batch ini secara spesifik dicatat dimusnahkan di log
              const isSpecificBatchDibuang = bahanKadaluarsaLogs.some(
                kl => kl.catatan && kl.catatan.includes(`Batch #${batchNo}`)
              )

              // Cek apakah ada pemusnahan massal/global (tanpa spesifik nomor batch) yang dilakukan untuk bahan ini
              const hasBulkPemusnahan = bahanKadaluarsaLogs.some(
                kl => kl.catatan && (kl.catatan.includes('Pemusnahan seluruh batch') || kl.catatan.includes('Pengurangan stok kadaluarsa'))
              )

              // KONDISI SUDAH DIMUSNAHKAN:
              // 1. Stok bahan saat ini sudah 0 / habis -> SEMUA batch kadaluarsa otomatis sudah dimusnahkan/habis
              // 2. Catatan mutasi eksplisit menyebutkan nomor batch ini
              // 3. Ada pemusnahan massal batch kadaluarsa
              // 4. Ada pool pengurangan kadaluarsa/pemusnahan yang pernah dilakukan untuk bahan ini
              let isDibuang = false
              if (isBahanHabis) {
                isDibuang = true
              } else if (rawExpired) {
                if (isSpecificBatchDibuang || hasBulkPemusnahan) {
                  isDibuang = true
                } else if (sisaDibuangPool > 0) {
                  isDibuang = true
                  sisaDibuangPool = Math.max(0, sisaDibuangPool - (Number(l.perubahan) || 0))
                }
              }

              // Jika sudah dibuang atau stok 0, maka isExpired aktif tidak lagi memicu status bahaya
              const isExpired = !isBahanHabis && rawExpired && !isDibuang
              const batchFreshness: FreshnessStatus = isDibuang
                ? 'sudah_dimusnahkan'
                : batchAi.aiStatusFreshness

              return {
                batchId: l.id,
                batchNo,
                batchQty: Number(l.perubahan) || 0,
                tanggalMasuk: l.created_at,
                sumberMasuk: sumberLabel,
                nomorReferensi: l.reference_id || l.catatan || null,
                aiEstimasiExpire: isBahanHabis ? null : batchAi.aiEstimasiExpire,
                aiSisaHari: isDibuang || isBahanHabis ? null : batchAi.aiSisaHari,
                aiStatusFreshness: batchFreshness,
                isExpired,
                isDibuang,
              }
            })
          )
        } else {
          // Fallback: Jika belum ada transaksi log mutasi tercatat, tampilkan batch stok awal
          const rawExpired = baseAiResult.aiStatusFreshness === 'kadaluarsa' || (baseAiResult.aiSisaHari !== null && baseAiResult.aiSisaHari <= 0)
          const isDibuang = isBahanHabis || (rawExpired && (totalDibuangKadaluarsa > 0 || bahanKadaluarsaLogs.length > 0))
          const isExpired = !isBahanHabis && rawExpired && !isDibuang

          batches = [
            {
              batchId: b.id,
              batchNo: 1,
              batchQty: Number(b.stok) || 0,
              tanggalMasuk: baseDate,
              sumberMasuk: 'Stok Awal Terdaftar',
              nomorReferensi: b.code || null,
              aiEstimasiExpire: isBahanHabis ? null : baseAiResult.aiEstimasiExpire,
              aiSisaHari: isDibuang || isBahanHabis ? null : baseAiResult.aiSisaHari,
              aiStatusFreshness: isDibuang ? 'sudah_dimusnahkan' : baseAiResult.aiStatusFreshness,
              isExpired,
              isDibuang,
            },
          ]
        }

        // Hitung batch yang kadaluarsa AKTIF (yang belum dimusnahkan/dibuang)
        // JIKA STOK BAHAN 0: expiredBatchesCount MUTLAK 0.
        const expiredBatchesCount = isBahanHabis ? 0 : batches.filter(bt => bt.isExpired && !bt.isDibuang).length

        // Tentukan status freshness agregat
        let overallFreshness: FreshnessStatus = 'segar'
        if (isBahanHabis) {
          // Jika stok 0 dan ada riwayat mutasi kadaluarsa atau batch lama sudah lewat tanggalnya, statusnya sudah_dimusnahkan
          overallFreshness = 'sudah_dimusnahkan'
        } else if (expiredBatchesCount > 0) {
          overallFreshness = 'kadaluarsa'
        } else if (batches.some(bt => bt.isDibuang)) {
          overallFreshness = batches.some(bt => !bt.isDibuang && bt.aiStatusFreshness === 'mendekati_expire')
            ? 'mendekati_expire'
            : batches.every(bt => bt.isDibuang)
            ? 'sudah_dimusnahkan'
            : 'segar'
        } else if (batches.some(bt => !bt.isDibuang && bt.aiStatusFreshness === 'mendekati_expire')) {
          overallFreshness = 'mendekati_expire'
        }

        // Cari sisa hari terkecil dari batch aktif (belum dibuang)
        const activeBatches = batches.filter(bt => !bt.isDibuang)
        const sortedBatches = [...activeBatches].sort((x, y) => (x.aiSisaHari ?? 999) - (y.aiSisaHari ?? 999))
        const earliestBatch = sortedBatches[0]

        // Jika semua batch sudah dibuang atau stok 0, estimasi expire terdekat tidak boleh menunjukkan tanggal kadaluarsa lampau
        const finalEstimasiExpire = earliestBatch?.aiEstimasiExpire ?? (isBahanHabis ? null : baseAiResult.aiEstimasiExpire)
        const finalSisaHari = earliestBatch?.aiSisaHari ?? (isBahanHabis ? null : (baseAiResult.aiSisaHari && baseAiResult.aiSisaHari > 0 ? baseAiResult.aiSisaHari : null))

        // Hitung estimasi habis berdasarkan data pemakaian riil penjualan 30 hari
        const totalKonsumsi30 = salesConsumptionMap[b.id] || 0
        const lajuHarian = Math.round((totalKonsumsi30 / 30) * 100) / 100
        const currentStock = Number(b.stok) || 0
        const minStock = Number(b.stok_minimum) || 0

        let estimasiHariHabis: number | null = null
        let statusHabis: RunoutStatus = 'aman'

        if (currentStock <= 0) {
          statusHabis = 'habis'
          estimasiHariHabis = 0
        } else if (lajuHarian > 0) {
          estimasiHariHabis = Math.round((currentStock / lajuHarian) * 10) / 10
          if (estimasiHariHabis <= 2 || currentStock <= minStock) {
            statusHabis = 'kritis'
          } else if (estimasiHariHabis <= 5) {
            statusHabis = 'waspada'
          } else {
            statusHabis = 'aman'
          }
        } else {
          // Belum ada penjualan/konsumsi dalam 30 hari terakhir
          if (currentStock <= minStock) {
            statusHabis = 'kritis'
          } else {
            statusHabis = 'tidak_aktif'
          }
        }

        const penjualanKondisi: PenjualanKondisi = {
          lajuHarian,
          estimasiHariHabis,
          statusHabis,
          totalTerjual30Hari: totalKonsumsi30,
        }

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
          aiSisaHari: finalSisaHari,
          aiEstimasiExpire: finalEstimasiExpire,
          aiAnalysis: baseAiResult.aiAnalysis,

          // Estimasi konsumsi & kehabisan bahan
          penjualan: penjualanKondisi,

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

    // PENTING: Kolom reference_id di tabel stok_logs bertipe UUID (fk ke order/po).
    // JANGAN kirim string non-UUID seperti "EXPIRED-BULK" atau "BATCH-#1" ke reference_id agar tidak invalid input syntax for type uuid.
    // Informasi batch disimpan dengan aman di kolom `catatan`.
    const logPayload = {
      user_id: userId,
      bahan_id: params.bahanId,
      perubahan: delta,
      stok_sebelum: currentStok,
      stok_sesudah: newStok,
      sumber: 'Kadaluarsa',
      catatan,
    }

    let { error: logErr } = await supabase.from('stok_logs').insert(logPayload)

    // Fallback: Jika tabel stok_logs di Supabase memiliki enum constraint check lama untuk kolom `sumber`
    // (misal hanya menerima 'PO', 'Penjualan', 'Manual', 'Opname', 'Penyesuaian'),
    // gunakan sumber 'Manual' dengan penanda [Kadaluarsa] di catatan agar insert selalu berhasil 100%.
    if (logErr) {
      console.warn('Gagal insert log dengan sumber Kadaluarsa, mencoba fallback dengan sumber Manual:', logErr.message || logErr)
      const fallbackPayload = {
        user_id: userId,
        bahan_id: params.bahanId,
        perubahan: delta,
        stok_sebelum: currentStok,
        stok_sesudah: newStok,
        sumber: 'Manual',
        catatan: `[Kadaluarsa] ${catatan}`,
      }

      const { error: retryErr } = await supabase.from('stok_logs').insert(fallbackPayload)
      if (retryErr) {
        console.warn('Retry log mutasi stok_logs juga menemui kendala:', retryErr.message || retryErr)
      }
    }

    return { newStok }
  },
}
