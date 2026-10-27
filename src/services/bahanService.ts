import { createClient } from '@/lib/supabase/client'
import { Bahan, BahanFormData, Supplier } from '@/types/bahan'

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
      console.error('Error fetching bahan:', error)
      throw new Error(error.message)
    }

    return (data as RawBahanDB[]).map(mapBahanFromDB)
  },

  async getSuppliers(): Promise<Supplier[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, nama, kategori, telepon')
      .order('nama', { ascending: true })

    if (error) {
      console.error('Error fetching suppliers:', error)
      throw new Error(error.message)
    }

    return data as Supplier[]
  },

  async create(form: BahanFormData): Promise<Bahan> {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      throw new Error('Anda harus login terlebih dahulu.')
    }

    const payload = {
      user_id: userData.user.id,
      nama: form.nama,
      satuan: form.satuan,
      harga_per_satuan: form.hargaPerSatuan,
      stok: form.stok,
      stok_minimum: form.stokMinimum,
      supplier_id: form.supplierId || null,
    }

    const { data, error } = await supabase
      .from('bahan')
      .insert(payload)
      .select('*, suppliers(id, nama)')
      .single()

    if (error) {
      console.error('Error creating bahan:', error)
      throw new Error(error.message)
    }

    return mapBahanFromDB(data as RawBahanDB)
  },

  async update(id: string, form: BahanFormData): Promise<Bahan> {
    const supabase = createClient()

    const payload = {
      nama: form.nama,
      satuan: form.satuan,
      harga_per_satuan: form.hargaPerSatuan,
      stok: form.stok,
      stok_minimum: form.stokMinimum,
      supplier_id: form.supplierId || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('bahan')
      .update(payload)
      .eq('id', id)
      .select('*, suppliers(id, nama)')
      .single()

    if (error) {
      console.error('Error updating bahan:', error)
      throw new Error(error.message)
    }

    return mapBahanFromDB(data as RawBahanDB)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('bahan').delete().eq('id', id)

    if (error) {
      console.error('Error deleting bahan:', error)
      throw new Error(error.message)
    }
  },
}
