import { createClient } from '@/lib/supabase/client'
import { Supplier, SupplierFormData, RiwayatSupplier } from '../types'

interface RawSupplierDB {
  id: string
  user_id: string
  code: string | null
  nama: string
  telepon: string | null
  alamat: string | null
  kategori: string | null
  harga_rata_rata?: number | string | null
  minimal_order: number | string | null
  created_at: string
  updated_at: string
  supplier_riwayat?: Array<{
    id: string
    supplier_id: string
    tanggal: string
    keterangan: string
    jumlah: number | string
    created_at: string
  }> | null
}

function mapSupplierFromDB(row: RawSupplierDB): Supplier {
  const riwayat: RiwayatSupplier[] = (row.supplier_riwayat || []).map(r => ({
    id: r.id,
    supplierId: r.supplier_id,
    tanggal: r.tanggal,
    keterangan: r.keterangan,
    jumlah: Number(r.jumlah) || 0,
    createdAt: r.created_at,
  }))

  return {
    id: row.id,
    userId: row.user_id,
    code: row.code ?? undefined,
    nama: row.nama,
    telepon: row.telepon || '-',
    alamat: row.alamat || '-',
    kategori: row.kategori || 'Umum',
    hargaRataRata: Number(row.harga_rata_rata) || 0,
    minimalOrder: Number(row.minimal_order) || 0,
    riwayat,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .select('*, supplier_riwayat(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching suppliers:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(error.message || 'Gagal mengambil data supplier dari Supabase.')
    }

    return (data as RawSupplierDB[] || []).map(mapSupplierFromDB)
  },

  async create(form: SupplierFormData): Promise<Supplier> {
    const supabase = createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }

    const userId = sessionData.session.user.id

    // Pastikan profil user sudah ada di public.profiles
    await supabase
      .from('profiles')
      .upsert({ id: userId, store_name: 'Dapur Saya' }, { onConflict: 'id' })

    // Payload dinamis: sertakan field standar
    const payload: Record<string, unknown> = {
      user_id: userId,
      nama: form.nama.trim(),
      telepon: form.telepon.trim() || '-',
      alamat: form.alamat.trim() || '-',
      kategori: form.kategori.trim() || 'Umum',
      minimal_order: Number(form.minimalOrder) || 0,
    }

    // Coba insert dengan harga_rata_rata terlebih dahulu
    let result = await supabase
      .from('suppliers')
      .insert({ ...payload, harga_rata_rata: Number(form.hargaRataRata) || 0 })
      .select('*, supplier_riwayat(*)')
      .single()

    // Jika kolom harga_rata_rata belum ditambahkan di PostgreSQL, insert tanpa kolom tersebut
    if (result.error && result.error.message.includes('harga_rata_rata')) {
      result = await supabase
        .from('suppliers')
        .insert(payload)
        .select('*, supplier_riwayat(*)')
        .single()
    }

    if (result.error) {
      console.error('Error creating supplier detail:', {
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code,
      })
      const detailedMsg = result.error.message 
        ? `${result.error.message}${result.error.details ? ` (${result.error.details})` : ''}` 
        : 'Gagal menambahkan supplier ke Supabase.'
      throw new Error(detailedMsg)
    }

    return mapSupplierFromDB(result.data as RawSupplierDB)
  },

  async update(id: string, form: SupplierFormData): Promise<Supplier> {
    const supabase = createClient()

    const payload: Record<string, unknown> = {
      nama: form.nama.trim(),
      telepon: form.telepon.trim() || '-',
      alamat: form.alamat.trim() || '-',
      kategori: form.kategori.trim() || 'Umum',
      minimal_order: Number(form.minimalOrder) || 0,
      updated_at: new Date().toISOString(),
    }

    let result = await supabase
      .from('suppliers')
      .update({ ...payload, harga_rata_rata: Number(form.hargaRataRata) || 0 })
      .eq('id', id)
      .select('*, supplier_riwayat(*)')
      .single()

    if (result.error && result.error.message.includes('harga_rata_rata')) {
      result = await supabase
        .from('suppliers')
        .update(payload)
        .eq('id', id)
        .select('*, supplier_riwayat(*)')
        .single()
    }

    if (result.error) {
      console.error('Error updating supplier detail:', {
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code,
      })
      throw new Error(result.error.message || 'Gagal memperbarui data supplier.')
    }

    return mapSupplierFromDB(result.data as RawSupplierDB)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('suppliers').delete().eq('id', id)

    if (error) {
      console.error('Error deleting supplier detail:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(error.message || 'Gagal menghapus supplier.')
    }
  },
}
