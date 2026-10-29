import { createClient } from '@/lib/supabase/client'
import { Bahan, BahanFormData, Supplier } from '../types'

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
  suppliers?: {
    id: string
    nama: string
  } | null
}

function mapBahanFromDB(row: RawBahanDB): Bahan {
  return {
    id: row.id,
    userId: row.user_id,
    code: row.code ?? undefined,
    nama: row.nama,
    satuan: row.satuan,
    hargaPerSatuan: Number(row.harga_per_satuan) || 0,
    stok: Number(row.stok) || 0,
    stokMinimum: Number(row.stok_minimum) || 0,
    supplierId: row.supplier_id,
    supplier: row.suppliers
      ? {
          id: row.suppliers.id,
          nama: row.suppliers.nama,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const bahanService = {
  async getAll(): Promise<Bahan[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('bahan')
      .select('*, suppliers(id, nama)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bahan:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(error.message || 'Gagal mengambil data bahan dari Supabase.')
    }

    return (data as RawBahanDB[] || []).map(mapBahanFromDB)
  },

  async getSuppliers(): Promise<Supplier[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, nama, kategori, telepon')
      .order('nama', { ascending: true })

    if (error) {
      console.warn('Suppliers note:', error.message)
      return []
    }

    return (data || []) as Supplier[]
  },

  async create(form: BahanFormData): Promise<Bahan> {
    const supabase = createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }

    const userId = sessionData.session.user.id

    // Pastikan record profil toko ada untuk menghindari Foreign Key constraint violation
    await supabase
      .from('profiles')
      .upsert({ id: userId, store_name: 'Dapur Saya' }, { onConflict: 'id' })

    const payload = {
      user_id: userId,
      nama: form.nama.trim(),
      satuan: form.satuan.trim(),
      harga_per_satuan: Number(form.hargaPerSatuan) || 0,
      stok: Number(form.stok) || 0,
      stok_minimum: Number(form.stokMinimum) || 0,
      supplier_id: form.supplierId && form.supplierId.trim() !== '' ? form.supplierId : null,
    }

    const { data, error } = await supabase
      .from('bahan')
      .insert(payload)
      .select('*, suppliers(id, nama)')
      .single()

    if (error) {
      console.error('Error creating bahan detail:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      const detailedMsg = error.message 
        ? `${error.message}${error.details ? ` (${error.details})` : ''}` 
        : 'Gagal menambahkan bahan ke Supabase.'
      throw new Error(detailedMsg)
    }

    return mapBahanFromDB(data as RawBahanDB)
  },

  async update(id: string, form: BahanFormData): Promise<Bahan> {
    const supabase = createClient()

    const payload = {
      nama: form.nama.trim(),
      satuan: form.satuan.trim(),
      harga_per_satuan: Number(form.hargaPerSatuan) || 0,
      stok: Number(form.stok) || 0,
      stok_minimum: Number(form.stokMinimum) || 0,
      supplier_id: form.supplierId && form.supplierId.trim() !== '' ? form.supplierId : null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('bahan')
      .update(payload)
      .eq('id', id)
      .select('*, suppliers(id, nama)')
      .single()

    if (error) {
      console.error('Error updating bahan:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(error.message || 'Gagal memperbarui bahan.')
    }

    return mapBahanFromDB(data as RawBahanDB)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('bahan').delete().eq('id', id)

    if (error) {
      console.error('Error deleting bahan:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(error.message || 'Gagal menghapus bahan.')
    }
  },
}
