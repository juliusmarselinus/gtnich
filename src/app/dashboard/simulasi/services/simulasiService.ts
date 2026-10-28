import { createClient } from '@/lib/supabase/client'
import { SimulasiMenuItem, SimulasiBahanItem, SimulasiResepItem } from '../types'

export const simulasiService = {
  async getSimulasiData(): Promise<{ menus: SimulasiMenuItem[]; bahanList: SimulasiBahanItem[] }> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Pengguna tidak terautentikasi')

    // 1. Ambil semua bahan baku aktif
    const { data: rawBahan, error: errBahan } = await supabase
      .from('bahan')
      .select('id, nama, satuan, harga_per_satuan, stok, stok_minimum')
      .eq('user_id', user.id)
      .order('nama', { ascending: true })

    if (errBahan) {
      console.error('Error fetching bahan for simulasi:', errBahan)
      throw new Error(`Gagal memuat bahan baku: ${errBahan.message}`)
    }

    const bahanList: SimulasiBahanItem[] = (rawBahan || []).map(b => ({
      id: b.id,
      nama: b.nama,
      satuan: b.satuan,
      hargaPerSatuan: Number(b.harga_per_satuan) || 0,
      stok: Number(b.stok) || 0,
      stokMinimum: Number(b.stok_minimum) || 0,
    }))

    const bahanMap = new Map<string, SimulasiBahanItem>()
    bahanList.forEach(b => bahanMap.set(b.id, b))

    // 2. Ambil semua menu beserta resep
    const { data: rawMenus, error: errMenus } = await supabase
      .from('menus')
      .select('*, resep_items(*, bahan(id, nama, satuan, harga_per_satuan, stok))')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('nama', { ascending: true })

    if (errMenus) {
      console.error('Error fetching menus for simulasi:', errMenus)
      throw new Error(`Gagal memuat data menu: ${errMenus.message}`)
    }

    const menus: SimulasiMenuItem[] = (rawMenus || []).map(m => {
      const hargaJual = Number(m.harga_jual) || 0
      const resep: SimulasiResepItem[] = (m.resep_items || []).map((r: any) => {
        const b = r.bahan || bahanMap.get(r.bahan_id)
        return {
          id: r.id,
          bahanId: r.bahan_id,
          namaBahan: b?.nama || 'Bahan',
          satuan: b?.satuan || 'satuan',
          qty: Number(r.qty) || 0,
          hargaPerSatuan: Number(b?.harga_per_satuan) || 0,
          stokTersedia: Number(b?.stok) || 0,
        }
      })

      // Hitung HPP dinamis dari resep jika estimasi_hpp belum terisi akurat
      const calculatedHPP = resep.reduce(
        (sum, r) => sum + r.qty * r.hargaPerSatuan,
        0
      )
      const estimasiHPP = Number(m.estimasi_hpp) || calculatedHPP
      const profitPercent =
        hargaJual > 0 ? Math.round(((hargaJual - estimasiHPP) / hargaJual) * 100) : 0

      return {
        id: m.id,
        nama: m.nama,
        kategori: m.kategori || 'Umum',
        emoji: m.emoji || '🍽️',
        hargaJual,
        estimasiHPP,
        profitPercent,
        resep,
      }
    })

    return { menus, bahanList }
  },
}
