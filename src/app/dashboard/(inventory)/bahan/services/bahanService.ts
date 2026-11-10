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
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    let query = supabase
      .from('bahan')
      .select('*, suppliers(id, nama)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

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
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    let query = supabase
      .from('suppliers')
      .select('id, nama, kategori, telepon')
      .order('nama', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

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

    // 1. Ambil data bahan sebelum diupdate untuk mengecek apakah ada perubahan satuan dasar
    const { data: currentBahan } = await supabase
      .from('bahan')
      .select('stok, satuan, harga_per_satuan')
      .eq('id', id)
      .single()

    const oldSatuan = (currentBahan?.satuan || '').toLowerCase().trim()
    const newSatuan = form.satuan.toLowerCase().trim()
    const currentStok = Number(currentBahan?.stok) || 0

    // Jika satuan dasar berubah (misal dari kg ke gram atau sebaliknya),
    // sesuaikan angka stok dan harga satuan agar proporsional dan total valuasi nilai persediaan dapur tetap sama
    let updatedStok = currentStok
    let updatedHarga = Number(form.hargaPerSatuan) || 0

    if (oldSatuan && newSatuan && oldSatuan !== newSatuan) {
      // getUnitConversionFactor(oldSatuan, newSatuan):
      // Contoh: kg ke gram => factor = 1000
      // => stok baru = 5 * 1000 = 5000 gram
      // => harga baru = 20.000 / 1000 = Rp 20 / gram
      const { getUnitConversionFactor } = await import('@/lib/satuan')
      const factor = getUnitConversionFactor(oldSatuan, newSatuan)
      if (factor > 0) {
        updatedStok = Number((currentStok * factor).toFixed(3))
        // Jika harga per satuan yang diinput sama dengan harga asli belum terkonversi, konversikan secara proporsional
        const origHarga = Number(currentBahan?.harga_per_satuan) || 0
        if (Math.abs(updatedHarga - origHarga) < 0.01) {
          updatedHarga = Math.round((origHarga / factor) * 100) / 100
        }
      }
    }

    const payload: Record<string, any> = {
      nama: form.nama.trim(),
      satuan: form.satuan.trim(),
      harga_per_satuan: updatedHarga,
      stok_minimum: Number(form.stokMinimum) || 0,
      supplier_id: form.supplierId && form.supplierId.trim() !== '' ? form.supplierId : null,
      updated_at: new Date().toISOString(),
    }

    // Hanya update stok jika satuan dasar mengalami perubahan konversi
    if (oldSatuan !== newSatuan) {
      payload.stok = updatedStok
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

    // Jika terjadi konversi satuan stok, catat jejak audit penyesuaian ke stok_logs
    // serta sesuaikan kuantitas pemakaian bahan di seluruh resep_items menu
    if (oldSatuan !== newSatuan) {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      if (userId && currentStok !== updatedStok) {
        try {
          await supabase.from('stok_logs').insert({
            user_id: userId,
            bahan_id: id,
            perubahan: Number((updatedStok - currentStok).toFixed(3)),
            stok_sebelum: currentStok,
            stok_sesudah: updatedStok,
            sumber: 'Penyesuaian',
            catatan: `Konversi format satuan master: ${currentStok} ${oldSatuan} ➔ ${updatedStok} ${newSatuan}`,
          })
        } catch (err: unknown) {
          console.warn('Gagal catat audit konversi satuan:', err)
        }
      }

      // SINKRONISASI RESEP: Jika satuan bahan berubah (misal gram -> kg atau sebaliknya),
      // update kuantitas di resep_items agar nilainya tetap ekuivalen (misal 200 gram -> 0.2 kg).
      const { getUnitConversionFactor } = await import('@/lib/satuan')
      const factor = getUnitConversionFactor(oldSatuan, newSatuan)

      if (factor > 0 && factor !== 1) {
        try {
          const { data: existingResepItems, error: fetchResepErr } = await supabase
            .from('resep_items')
            .select('id, qty, menu_id')
            .eq('bahan_id', id)

          if (!fetchResepErr && existingResepItems && existingResepItems.length > 0) {
            await Promise.all(
              existingResepItems.map(rItem => {
                const oldQty = Number(rItem.qty) || 0
                const newQty = Number((oldQty * factor).toFixed(5))

                return supabase
                  .from('resep_items')
                  .update({ qty: newQty })
                  .eq('id', rItem.id)
              })
            )
          }
        } catch (err: unknown) {
          console.warn('Gagal sinkronisasi konversi resep_items:', err)
        }
      }
    }

    return mapBahanFromDB(data as RawBahanDB)
  },

  /**
   * Cek apakah bahan saat ini digunakan dalam resep menu masakan
   */
  async checkBahanUsage(bahanId: string): Promise<{ isUsed: boolean; menuNames: string[] }> {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('resep_items')
        .select('id, menu_id, menus(id, nama)')
        .eq('bahan_id', bahanId)

      if (error) {
        console.warn('Check bahan usage warning:', error.message)
        return { isUsed: false, menuNames: [] }
      }

      const menuNames: string[] = []
      if (data && Array.isArray(data)) {
        for (const item of data) {
          const menuData = (item as any).menus
          if (menuData && menuData.nama) {
            if (!menuNames.includes(menuData.nama)) {
              menuNames.push(menuData.nama)
            }
          }
        }
      }

      return {
        isUsed: menuNames.length > 0,
        menuNames,
      }
    } catch (err) {
      console.warn('Exception checking bahan usage:', err)
      return { isUsed: false, menuNames: [] }
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()

    // 1. Validasi cek apakah bahan memiliki stok fisik aktif
    const { data: currentBahan, error: fetchErr } = await supabase
      .from('bahan')
      .select('nama, stok, satuan')
      .eq('id', id)
      .single()

    if (!fetchErr && currentBahan && Number(currentBahan.stok) > 0) {
      throw new Error(
        `Bahan "${currentBahan.nama}" masih memiliki sisa stok (${currentBahan.stok} ${currentBahan.satuan}). Sesuaikan stok menjadi 0 terlebih dahulu sebelum menghapus.`
      )
    }

    // 2. Validasi cek foreign key constraint resep_items
    const { isUsed, menuNames } = await this.checkBahanUsage(id)
    if (isUsed) {
      const namesStr = menuNames.slice(0, 3).join(', ')
      throw new Error(
        `Bahan ini masih digunakan dalam resep menu: ${namesStr}. Harap hapus atau lepaskan bahan ini dari resep menu masakan tersebut terlebih dahulu.`
      )
    }

    const { error } = await supabase.from('bahan').delete().eq('id', id)

    if (error) {
      console.error('Error deleting bahan:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      if (error.message.includes('violates foreign key constraint') || error.code === '23503') {
        throw new Error(
          'Bahan ini tidak dapat dihapus karena masih terhubung dengan data lain (resep menu masakan, riwayat mutasi stok, atau purchase order).'
        )
      }

      throw new Error(error.message || 'Gagal menghapus bahan.')
    }
  },
}
