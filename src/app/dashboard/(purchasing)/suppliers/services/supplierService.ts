import { createClient } from '@/lib/supabase/client'
import { Supplier, SupplierFormData, RiwayatSupplier, SupplierCategory } from '../types'

interface RawSupplierDB {
  id: string
  user_id: string
  code: string | null
  nama: string
  telepon: string | null
  alamat: string | null
  kategori?: string | null
  category_id?: string | null
  minimal_order: number | string | null
  created_at: string
  updated_at: string
  supplier_categories?: {
    id: string
    nama: string
    deskripsi?: string | null
  } | null
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

  const category: SupplierCategory | null = row.supplier_categories
    ? {
        id: row.supplier_categories.id,
        nama: row.supplier_categories.nama,
        deskripsi: row.supplier_categories.deskripsi,
      }
    : null

  const kategoriNama = category?.nama || row.kategori || 'Umum'

  return {
    id: row.id,
    userId: row.user_id,
    code: row.code ?? undefined,
    nama: row.nama,
    telepon: row.telepon || '-',
    alamat: row.alamat || '-',
    categoryId: row.category_id || category?.id || null,
    category,
    kategoriNama,
    minimalOrder: Number(row.minimal_order) || 0,
    riwayat,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const supplierService = {
  // Ambil daftar kategori master
  async getCategories(): Promise<SupplierCategory[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('supplier_categories')
      .select('*')
      .order('nama', { ascending: true })

    if (error) {
      console.warn('supplier_categories table note:', error.message)
      return []
    }

    return (data || []) as SupplierCategory[]
  },

  // Tambah kategori baru
  async createCategory(nama: string, deskripsi?: string): Promise<SupplierCategory> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    const payload: Record<string, unknown> = {
      nama: nama.trim(),
      deskripsi: deskripsi?.trim() || null,
    }
    if (userId) payload.user_id = userId

    const { data, error } = await supabase
      .from('supplier_categories')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message || 'Gagal menambahkan kategori supplier.')
    }

    return data as SupplierCategory
  },

  // Ambil semua supplier (dengan relasi kategori dan riwayat)
  async getAll(): Promise<Supplier[]> {
    const supabase = createClient()

    // Coba query dengan join supplier_categories
    const withJoin = await supabase
      .from('suppliers')
      .select('*, supplier_categories(id, nama, deskripsi), supplier_riwayat(*)')
      .order('created_at', { ascending: false })

    if (!withJoin.error && withJoin.data) {
      return (withJoin.data as RawSupplierDB[]).map(mapSupplierFromDB)
    }

    // Fallback jika migrasi FK supplier_categories belum dijalankan di DB
    const fallback = await supabase
      .from('suppliers')
      .select('*, supplier_riwayat(*)')
      .order('created_at', { ascending: false })

    if (fallback.error) {
      console.error('Error fetching suppliers:', fallback.error)
      throw new Error(fallback.error.message || 'Gagal mengambil data supplier.')
    }

    return (fallback.data as RawSupplierDB[] || []).map(mapSupplierFromDB)
  },

  // Buat Supplier Baru (tanpa harga_rata_rata)
  async create(form: SupplierFormData): Promise<Supplier> {
    const supabase = createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }

    const userId = sessionData.session.user.id

    // Pastikan user memiliki profil
    await supabase
      .from('profiles')
      .upsert({ id: userId, store_name: 'Dapur Saya' }, { onConflict: 'id' })

    // Tangani jika ada input kategori baru
    let categoryId = form.categoryId || null
    let kategoriText = 'Umum'

    if (form.kategoriBaru && form.kategoriBaru.trim()) {
      try {
        const newCat = await this.createCategory(form.kategoriBaru.trim())
        categoryId = newCat.id
        kategoriText = newCat.nama
      } catch (err: unknown) {
        console.warn('Create category inline fallback:', err)
        kategoriText = form.kategoriBaru.trim()
      }
    }

    const payload: Record<string, unknown> = {
      user_id: userId,
      nama: form.nama.trim(),
      telepon: form.telepon.trim() || '-',
      alamat: form.alamat.trim() || '-',
      minimal_order: Number(form.minimalOrder) || 0,
    }

    // Sertakan category_id jika tabel sudah dimigrasi
    if (categoryId) {
      payload.category_id = categoryId
    }
    // Sertakan kategori (teks legacy jika kolom masih ada di DB)
    if (kategoriText) {
      payload.kategori = kategoriText
    }

    // 1. Coba insert dengan category_id
    let res = await supabase
      .from('suppliers')
      .insert(payload)
      .select('*, supplier_categories(id, nama, deskripsi), supplier_riwayat(*)')
      .single()

    // 2. Jika category_id belum ada di tabel suppliers Supabase, hapus category_id dan ulangi
    if (res.error && res.error.message.includes('category_id')) {
      delete payload.category_id
      payload.kategori = kategoriText

      res = await supabase
        .from('suppliers')
        .insert(payload)
        .select('*, supplier_riwayat(*)')
        .single()
    }

    if (res.error) {
      console.error('Error creating supplier detail:', res.error)
      throw new Error(res.error.message || 'Gagal menambahkan supplier.')
    }

    return mapSupplierFromDB(res.data as RawSupplierDB)
  },

  // Update Supplier (tanpa harga_rata_rata)
  async update(id: string, form: SupplierFormData): Promise<Supplier> {
    const supabase = createClient()

    let categoryId = form.categoryId || null
    let kategoriText = 'Umum'

    if (form.kategoriBaru && form.kategoriBaru.trim()) {
      try {
        const newCat = await this.createCategory(form.kategoriBaru.trim())
        categoryId = newCat.id
        kategoriText = newCat.nama
      } catch (err: unknown) {
        console.warn('Update category inline fallback:', err)
        kategoriText = form.kategoriBaru.trim()
      }
    }

    const payload: Record<string, unknown> = {
      nama: form.nama.trim(),
      telepon: form.telepon.trim() || '-',
      alamat: form.alamat.trim() || '-',
      minimal_order: Number(form.minimalOrder) || 0,
      updated_at: new Date().toISOString(),
    }

    if (categoryId) payload.category_id = categoryId
    if (kategoriText) payload.kategori = kategoriText

    let res = await supabase
      .from('suppliers')
      .update(payload)
      .eq('id', id)
      .select('*, supplier_categories(id, nama, deskripsi), supplier_riwayat(*)')
      .single()

    if (res.error && res.error.message.includes('category_id')) {
      delete payload.category_id
      payload.kategori = kategoriText

      res = await supabase
        .from('suppliers')
        .update(payload)
        .eq('id', id)
        .select('*, supplier_riwayat(*)')
        .single()
    }

    if (res.error) {
      console.error('Error updating supplier detail:', res.error)
      throw new Error(res.error.message || 'Gagal memperbarui data supplier.')
    }

    return mapSupplierFromDB(res.data as RawSupplierDB)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('suppliers').delete().eq('id', id)

    if (error) {
      console.error('Error deleting supplier detail:', error)
      throw new Error(error.message || 'Gagal menghapus supplier.')
    }
  },
}
