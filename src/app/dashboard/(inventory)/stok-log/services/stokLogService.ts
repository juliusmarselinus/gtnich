import { createClient } from '@/lib/supabase/client'
import { StokLog, BahanSimple, OpnameEntry, ManualMutasiInput, StokLogSource } from '../types'

interface RawLogDB {
  id: string
  user_id: string
  bahan_id: string
  perubahan: number | string
  stok_sebelum: number | string
  stok_sesudah: number | string
  sumber: StokLogSource
  reference_id?: string | null
  catatan?: string | null
  created_at: string
  bahan?: {
    id: string
    nama: string
    satuan: string
    code?: string | null
  } | null
}

const KNOWN_UNITS = [
  'kg',
  'gram',
  'gr',
  'g',
  'liter',
  'l',
  'ml',
  'butir',
  'pcs',
  'sachet',
  'bungkus',
  'kaleng',
  'botol',
  'pack',
  'lembar',
  'sdm',
  'sdt',
  'ikat',
  'tray',
  'dus',
  'karton',
  'bal',
  'karung',
  'porsi',
  'cup',
]

/**
 * Ekstrak satuan historis yang berlaku saat mutasi stok dicatat.
 * Log stok bersifat immutable: jika satuan bahan diubah di masa depan,
 * log lama tetap menampilkan satuan historis aslinya saat transaksi terjadi.
 */
function resolveHistoricalUnit(catatan?: string | null, fallbackUnit = 'item'): string {
  if (!catatan) return fallbackUnit

  // 1. Pola konversi satuan master: "... 10 kg ➔ 10000 gram" -> simpan satuan target konversi
  const convMatch = catatan.match(/(?:➔|->)\s*[\d,.]+\s*([a-zA-Z]+)/)
  if (convMatch && KNOWN_UNITS.includes(convMatch[1].toLowerCase())) {
    return convMatch[1].toLowerCase()
  }

  // 2. Pola dalam tanda kurung, misal (10 kg) atau (Selisih: +5 kg) atau (= 10000 gram)
  const bracketMatch = catatan.match(/\((?:[^)]*?(?:Selisih:|[=,]|Batch\s*#\d+)[^)]*?)?([+-]?\s*[\d,.]+)\s*([a-zA-Z]+)\)/i)
  if (bracketMatch && KNOWN_UNITS.includes(bracketMatch[2].toLowerCase())) {
    return bracketMatch[2].toLowerCase()
  }

  // 3. Pola tindakan operasional: "Terpakai 0.5 kg", "Masuk 5 kg", "diverifikasi: 10 kg", "stok dikembalikan 2 kg", "Pemusnahan ... 5 kg"
  const actionMatch = catatan.match(/(?:Terpakai|Masuk|keluar|Pemusnahan|Pengurangan|stok dikembalikan|diverifikasi:?)\s*([+-]?\s*[\d,.]+)\s*([a-zA-Z]+)/i)
  if (actionMatch && KNOWN_UNITS.includes(actionMatch[2].toLowerCase())) {
    return actionMatch[2].toLowerCase()
  }

  // 4. Pola kata satuan yang terkandung dalam catatan
  for (const u of KNOWN_UNITS) {
    const reg = new RegExp(`(?:^|[^a-zA-Z0-9])${u}(?:$|[^a-zA-Z0-9])`, 'i')
    if (reg.test(catatan)) return u
  }

  return fallbackUnit
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoStr
  }
}

export const stokLogService = {
  // Ambil data bahan aktif milik user untuk opname & mutasi
  async getBahanList(): Promise<BahanSimple[]> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    let query = supabase
      .from('bahan')
      .select('id, code, nama, satuan, stok')
      .order('nama', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bahan for stok log:', error)
      throw new Error(error.message)
    }

    return (data || []).map(b => ({
      id: b.id,
      code: b.code,
      nama: b.nama,
      satuan: b.satuan,
      stok: Number(b.stok) || 0,
    }))
  },

  // Ambil riwayat log mutasi milik user
  async getLogs(): Promise<StokLog[]> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    let query = supabase
      .from('stok_logs')
      .select('*, bahan(id, nama, satuan, code)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching stok_logs:', error)
      throw new Error(error.message || 'Gagal mengambil riwayat mutasi stok.')
    }

    return (data as RawLogDB[] || []).map(row => {
      const historicalSatuan = resolveHistoricalUnit(row.catatan, row.bahan?.satuan || 'item')

      return {
        id: row.id,
        userId: row.user_id,
        bahanId: row.bahan_id,
        namaBahan: row.bahan?.nama || 'Bahan Dihapus',
        satuan: historicalSatuan,
        perubahan: Number(row.perubahan) || 0,
        stokSebelum: Number(row.stok_sebelum) || 0,
        stokSesudah: Number(row.stok_sesudah) || 0,
        sumber: row.sumber,
        referenceId: row.reference_id,
        catatan: row.catatan,
        createdAt: row.created_at,
        tanggalFormatted: formatDate(row.created_at),
      }
    })
  },

  // Input Mutasi Manual (Masuk / Keluar) dengan sinkronisasi ke tabel bahan
  async recordManualMutasi(input: ManualMutasiInput): Promise<StokLog> {
    const supabase = createClient()
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()

    if (sessionErr || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }
    const userId = sessionData.session.user.id

    // 1. Ambil stok terkini dari tabel bahan
    const { data: bahan, error: bahanErr } = await supabase
      .from('bahan')
      .select('id, nama, satuan, stok')
      .eq('id', input.bahanId)
      .single()

    if (bahanErr || !bahan) {
      throw new Error('Bahan baku tidak ditemukan di database.')
    }

    const currentStok = Number(bahan.stok) || 0
    const delta = input.tipe === 'masuk' ? Math.abs(input.jumlah) : -Math.abs(input.jumlah)
    const newStok = Number((currentStok + delta).toFixed(3))

    if (newStok < 0) {
      throw new Error(`Stok tidak mencukupi untuk dikeluarkan. Stok saat ini: ${currentStok} ${bahan.satuan}`)
    }

    // 2. Update stok di tabel bahan
    const { error: updateErr } = await supabase
      .from('bahan')
      .update({ stok: newStok, updated_at: new Date().toISOString() })
      .eq('id', input.bahanId)

    if (updateErr) {
      throw new Error(`Gagal memperbarui stok bahan: ${updateErr.message}`)
    }

    // 3. Catat di tabel stok_logs
    const baseCatatan = input.catatan?.trim() || (input.tipe === 'masuk' ? 'Penambahan manual' : 'Pengurangan/rusak manual')
    const finalCatatan = `${baseCatatan} (${delta > 0 ? '+' : ''}${delta} ${bahan.satuan})`

    const { data: logData, error: logErr } = await supabase
      .from('stok_logs')
      .insert({
        user_id: userId,
        bahan_id: input.bahanId,
        perubahan: delta,
        stok_sebelum: currentStok,
        stok_sesudah: newStok,
        sumber: 'Manual',
        catatan: finalCatatan,
      })
      .select('*, bahan(id, nama, satuan, code)')
      .single()

    if (logErr) {
      console.error('Error inserting stok_log:', logErr)
      throw new Error(`Gagal mencatat log mutasi: ${logErr.message}`)
    }

    const row = logData as RawLogDB
    return {
      id: row.id,
      userId: row.user_id,
      bahanId: row.bahan_id,
      namaBahan: row.bahan?.nama || bahan.nama,
      satuan: resolveHistoricalUnit(row.catatan, bahan.satuan),
      perubahan: Number(row.perubahan) || 0,
      stokSebelum: Number(row.stok_sebelum) || 0,
      stokSesudah: Number(row.stok_sesudah) || 0,
      sumber: row.sumber,
      referenceId: row.reference_id,
      catatan: row.catatan,
      createdAt: row.created_at,
      tanggalFormatted: formatDate(row.created_at),
    }
  },

  // Simpan hasil Stock Opname (hanya memperbarui bahan yang memiliki selisih)
  async saveStockOpname(entries: OpnameEntry[]): Promise<number> {
    const supabase = createClient()
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()

    if (sessionErr || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }
    const userId = sessionData.session.user.id

    // Filter hanya yang memiliki selisih
    const changed = entries.filter(e => e.selisih !== 0)
    if (changed.length === 0) return 0

    let count = 0
    await Promise.all(
      changed.map(async item => {
        // 1. Update stok bahan ke stok hitungan fisik aktual
        const { error: updErr } = await supabase
          .from('bahan')
          .update({ stok: item.stokAktual, updated_at: new Date().toISOString() })
          .eq('id', item.bahanId)

        if (updErr) {
          console.error(`Gagal update opname bahan ${item.namaBahan}:`, updErr)
          return
        }

        // 2. Masukkan jejak audit ke stok_logs
        await supabase.from('stok_logs').insert({
          user_id: userId,
          bahan_id: item.bahanId,
          perubahan: item.selisih,
          stok_sebelum: item.stokSystem,
          stok_sesudah: item.stokAktual,
          sumber: 'Opname',
          catatan: `Penyesuaian hasil Stock Opname Gudang (Selisih: ${item.selisih > 0 ? '+' : ''}${item.selisih} ${item.satuan})`,
        })

        count++
      })
    )

    return count
  },
}
