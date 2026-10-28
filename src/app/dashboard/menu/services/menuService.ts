import { createClient } from '@/lib/supabase/client'
import { MenuItem, ResepItemDetail, MenuFormData, BahanOption } from '../types'
import { getUnitConversionFactor } from '@/lib/satuan'

interface RawResepItemDB {
  id: string
  user_id: string
  menu_id: string
  bahan_id: string
  qty: number | string
  created_at: string
  bahan?: {
    id: string
    nama: string
    satuan: string
    harga_per_satuan: number | string
    stok: number | string
  } | null
}

interface RawMenuDB {
  id: string
  user_id: string
  code: string | null
  sku: string | null
  nama: string
  kategori: string
  emoji: string | null
  harga_jual: number | string
  estimasi_hpp: number | string
  is_active: boolean
  created_at: string
  updated_at: string
  resep_items?: RawResepItemDB[] | null
}

function mapMenuFromDB(row: RawMenuDB): MenuItem {
  const resep: ResepItemDetail[] = (row.resep_items || []).map(r => {
    const hargaMaster = Number(r.bahan?.harga_per_satuan) || 0
    const qty = Number(r.qty) || 0
    const satuanBase = r.bahan?.satuan || 'item'

    // qty yang tersimpan di resep_items sudah dalam ekuivalensi unit base
    const subtotalHPP = qty * hargaMaster

    return {
      id: r.id,
      userId: r.user_id,
      menuId: r.menu_id,
      bahanId: r.bahan_id,
      namaBahan: r.bahan?.nama || 'Bahan Dihapus',
      satuan: satuanBase,
      satuanBase,
      hargaPerSatuan: hargaMaster,
      qty,
      subtotalHPP,
    }
  })

  // Hitung total HPP riil
  const calculatedHPP = resep.reduce((sum, item) => sum + item.subtotalHPP, 0)
  const hargaJual = Number(row.harga_jual) || 0
  const estimasiHPP = calculatedHPP > 0 ? calculatedHPP : Number(row.estimasi_hpp) || 0
  const profit = hargaJual - estimasiHPP
  const profitPercent = hargaJual > 0 ? (profit / hargaJual) * 100 : 0

  return {
    id: row.id,
    userId: row.user_id,
    code: row.code,
    sku: row.sku,
    nama: row.nama,
    kategori: row.kategori,
    emoji: row.emoji || '🍲',
    hargaJual,
    estimasiHPP,
    profit,
    profitPercent,
    isActive: row.is_active ?? true,
    resep,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const menuService = {
  // Ambil semua bahan baku aktif
  async getBahanList(): Promise<BahanOption[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('bahan')
      .select('id, nama, satuan, harga_per_satuan, stok')
      .order('nama', { ascending: true })

    if (error) {
      console.error('Error fetching bahan for menu resep:', error)
      throw new Error(error.message)
    }

    return (data || []).map(b => ({
      id: b.id,
      nama: b.nama,
      satuan: b.satuan,
      hargaPerSatuan: Number(b.harga_per_satuan) || 0,
      stok: Number(b.stok) || 0,
    }))
  },

  // Ambil semua menu
  async getAll(): Promise<MenuItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menus')
      .select('*, resep_items(*, bahan(id, nama, satuan, harga_per_satuan, stok))')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching menus:', error)
      throw new Error(error.message || 'Gagal mengambil data menu masakan.')
    }

    return (data as RawMenuDB[] || []).map(mapMenuFromDB)
  },

  // Buat menu baru dengan normalisasi satuan resep
  async create(form: MenuFormData): Promise<MenuItem> {
    const supabase = createClient()
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()

    if (sessionErr || !sessionData?.session?.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login terlebih dahulu.')
    }
    const userId = sessionData.session.user.id

    const bahanList = await this.getBahanList()

    // Hitung total estimasi HPP dan konversi qty resep ke satuan master bahan
    let totalHPP = 0
    const convertedResep = form.resep.map(r => {
      const bhn = bahanList.find(b => b.id === r.bahanId)
      const baseUnit = bhn?.satuan || r.satuan || 'item'
      const recipeUnit = r.satuan || baseUnit
      const factor = getUnitConversionFactor(recipeUnit, baseUnit)
      const qtyInBaseUnit = Number((r.qty * factor).toFixed(5))

      const price = bhn ? bhn.hargaPerSatuan : 0
      totalHPP += price * qtyInBaseUnit

      return {
        bahan_id: r.bahanId,
        qty: qtyInBaseUnit,
      }
    })

    // 1. Simpan Header Menu
    const { data: menuData, error: menuErr } = await supabase
      .from('menus')
      .insert({
        user_id: userId,
        nama: form.nama.trim(),
        kategori: form.kategori.trim() || 'Camilan',
        sku: form.sku?.trim() || null,
        emoji: form.emoji?.trim() || '🍲',
        harga_jual: Number(form.hargaJual) || 0,
        estimasi_hpp: Math.round(totalHPP),
        is_active: true,
      })
      .select('*')
      .single()

    if (menuErr) {
      console.error('Error inserting menu:', menuErr)
      throw new Error(`Gagal menyimpan menu: ${menuErr.message}`)
    }

    const menuId = menuData.id

    // 2. Simpan Resep Items
    if (convertedResep.length > 0) {
      const resepPayload = convertedResep.map(r => ({
        user_id: userId,
        menu_id: menuId,
        bahan_id: r.bahan_id,
        qty: r.qty,
      }))

      const { error: resepErr } = await supabase
        .from('resep_items')
        .insert(resepPayload)

      if (resepErr) {
        console.error('Error inserting resep_items:', resepErr)
        throw new Error(`Gagal menyimpan komposisi resep: ${resepErr.message}`)
      }
    }

    const { data: completeMenu } = await supabase
      .from('menus')
      .select('*, resep_items(*, bahan(id, nama, satuan, harga_per_satuan, stok))')
      .eq('id', menuId)
      .single()

    return mapMenuFromDB(completeMenu as RawMenuDB)
  },

  // Update Menu & Ganti Resep Items
  async update(id: string, form: MenuFormData): Promise<MenuItem> {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) throw new Error('Sesi login tidak ditemukan.')

    const bahanList = await this.getBahanList()

    let totalHPP = 0
    const convertedResep = form.resep.map(r => {
      const bhn = bahanList.find(b => b.id === r.bahanId)
      const baseUnit = bhn?.satuan || r.satuan || 'item'
      const recipeUnit = r.satuan || baseUnit
      const factor = getUnitConversionFactor(recipeUnit, baseUnit)
      const qtyInBaseUnit = Number((r.qty * factor).toFixed(5))

      const price = bhn ? bhn.hargaPerSatuan : 0
      totalHPP += price * qtyInBaseUnit

      return {
        bahan_id: r.bahanId,
        qty: qtyInBaseUnit,
      }
    })

    // 1. Update Header Menu
    const { error: menuErr } = await supabase
      .from('menus')
      .update({
        nama: form.nama.trim(),
        kategori: form.kategori.trim() || 'Camilan',
        sku: form.sku?.trim() || null,
        emoji: form.emoji?.trim() || '🍲',
        harga_jual: Number(form.hargaJual) || 0,
        estimasi_hpp: Math.round(totalHPP),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (menuErr) {
      throw new Error(`Gagal memperbarui menu: ${menuErr.message}`)
    }

    // 2. Hapus resep_items lama dan masukkan yang baru
    await supabase.from('resep_items').delete().eq('menu_id', id)

    if (convertedResep.length > 0) {
      const resepPayload = convertedResep.map(r => ({
        user_id: userId,
        menu_id: id,
        bahan_id: r.bahan_id,
        qty: r.qty,
      }))

      const { error: resepErr } = await supabase
        .from('resep_items')
        .insert(resepPayload)

      if (resepErr) {
        throw new Error(`Gagal memperbarui komposisi resep: ${resepErr.message}`)
      }
    }

    const { data: completeMenu } = await supabase
      .from('menus')
      .select('*, resep_items(*, bahan(id, nama, satuan, harga_per_satuan, stok))')
      .eq('id', id)
      .single()

    return mapMenuFromDB(completeMenu as RawMenuDB)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('menus').delete().eq('id', id)

    if (error) {
      console.error('Error deleting menu:', error)
      throw new Error(error.message || 'Gagal menghapus menu.')
    }
  },
}
