import { createClient } from '@/lib/supabase/client'
import { RekomendasiItem, RekomendasiSummary } from '../types'
import { formatRupiah } from '@/lib/mock-data'

export const rekomendasiService = {
  async getRekomendasi(): Promise<{ items: RekomendasiItem[]; summary: RekomendasiSummary }> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Pengguna tidak terautentikasi')

    // 1. Ambil bahan & supplier
    const { data: bahanList } = await supabase
      .from('bahan')
      .select('*, suppliers(id, nama)')
      .eq('user_id', user.id)

    // 2. Ambil menu & resep
    const { data: menuList } = await supabase
      .from('menus')
      .select('*, resep_items(*)')
      .eq('user_id', user.id)

    // 3. Ambil pesanan kasir & item
    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // 4. Ambil purchase orders
    const { data: poList } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const items: RekomendasiItem[] = []

    // ─── A. Analisis Stok Bahan Baku ──────────────────────────────────────────
    ;(bahanList || []).forEach(b => {
      const stok = Number(b.stok) || 0
      const stokMin = Number(b.stok_minimum) || 0
      const namaSupplier = b.suppliers?.nama ? ` dari ${b.suppliers.nama}` : ''

      if (stok <= 0) {
        items.push({
          id: `stok-habis-${b.id}`,
          tipe: 'Stok',
          judul: `Reorder Segera: Stok ${b.nama} Habis`,
          deskripsi: `Stok ${b.nama} saat ini habis (0 ${b.satuan}). Semua menu yang membutuhkan bahan ini tidak dapat diproduksi di dapur. Segera terbitkan Purchase Order${namaSupplier}.`,
          confidence: 99,
          priority: 'tinggi',
          actionLink: '/dashboard/purchase-order',
          actionLabel: 'Buat PO Bahan Ini',
          relatedId: b.id,
        })
      } else if (stok < stokMin) {
        items.push({
          id: `stok-kritis-${b.id}`,
          tipe: 'Stok',
          judul: `Stok ${b.nama} di Bawah Batas Minimum`,
          deskripsi: `Stok tersisa ${stok} ${b.satuan}, berada di bawah batas aman minimum (${stokMin} ${b.satuan}). Disarankan segera melakukan restock${namaSupplier} sebelum habis saat jam ramai.`,
          confidence: 94,
          priority: 'tinggi',
          actionLink: '/dashboard/purchase-order',
          actionLabel: 'Restock via PO',
          relatedId: b.id,
        })
      } else if (stokMin > 0 && stok <= stokMin * 1.25) {
        items.push({
          id: `stok-waspada-${b.id}`,
          tipe: 'Stok',
          judul: `Stok ${b.nama} Mendekati Batas Minimum`,
          deskripsi: `Stok ${b.nama} saat ini ${stok} ${b.satuan} (mendekati batas aman ${stokMin} ${b.satuan}). Rencanakan pengadaan berikutnya agar operasional dapur tidak terganggu.`,
          confidence: 82,
          priority: 'sedang',
          actionLink: '/dashboard/purchase-order',
          actionLabel: 'Rencanakan PO',
          relatedId: b.id,
        })
      }
    })

    // ─── B. Analisis Tagihan PO & Keuangan ────────────────────────────────────
    const pendingTagihan = (poList || []).filter(
      po => po.status === 'tagihan' || (po.status === 'diterima' && !po.catatan?.includes('LUNAS'))
    )

    pendingTagihan.forEach(po => {
      const nominal = Number(po.total_aktual || po.total_estimasi) || 0
      const isTagihanStatus = po.status === 'tagihan'
      items.push({
        id: `keuangan-po-${po.id}`,
        tipe: 'Keuangan',
        judul: isTagihanStatus
          ? `Tagihan ${po.no_po} Menunggu Pembayaran`
          : `PO ${po.no_po} Belum Diselesaikan Pembayarannya`,
        deskripsi: `Pengadaan bahan dari ${po.nama_supplier || 'Supplier'} sebesar ${formatRupiah(
          nominal
        )} belum ditandai lunas. Pastikan arus kas operasional mencukupi untuk pembayaran supplier.`,
        confidence: 96,
        priority: isTagihanStatus ? 'tinggi' : 'sedang',
        actionLink: '/dashboard/tagihan',
        actionLabel: 'Lihat Tagihan Supplier',
        relatedId: po.id,
      })
    })

    // ─── C. Analisis Menu & Penjualan ────────────────────────────────────────
    // Agregasi porsi menu terjual
    const menuSalesMap: Record<string, { qty: number; revenue: number; profit: number }> = {}
    ;(orders || []).forEach(o => {
      ;(o.order_items || []).forEach((item: any) => {
        const name = item.nama_menu
        if (!menuSalesMap[name]) {
          menuSalesMap[name] = { qty: 0, revenue: 0, profit: 0 }
        }
        const qty = Number(item.qty) || 0
        const rev = Number(item.subtotal) || (Number(item.harga_jual) || 0) * qty
        const hpp = (Number(item.hpp) || 0) * qty
        menuSalesMap[name].qty += qty
        menuSalesMap[name].revenue += rev
        menuSalesMap[name].profit += rev - hpp
      })
    })

    const topSellingMenu = Object.entries(menuSalesMap).sort((a, b) => b[1].qty - a[1].qty)[0]
    if (topSellingMenu && topSellingMenu[1].qty > 0) {
      items.push({
        id: 'penjualan-terlaris',
        tipe: 'Penjualan',
        judul: `Menu "${topSellingMenu[0]}" Menjadi Menu Terlaris`,
        deskripsi: `Tercatat telah terjual ${topSellingMenu[1].qty} porsi dengan akumulasi omzet ${formatRupiah(
          topSellingMenu[1].revenue
        )} (estimasi laba ${formatRupiah(
          topSellingMenu[1].profit
        )}). Pastikan bahan baku untuk resep menu ini selalu dalam kondisi stok prima.`,
        confidence: 90,
        priority: 'sedang',
        actionLink: '/dashboard/laporan',
        actionLabel: 'Lihat Statistik Penjualan',
      })
    }

    // Analisis Margin Menu dari DB
    ;(menuList || []).forEach(m => {
      const harga = Number(m.harga_jual) || 0
      const hpp = Number(m.estimasi_hpp) || 0
      if (harga > 0) {
        const marginPct = ((harga - hpp) / harga) * 100
        if (marginPct >= 50) {
          items.push({
            id: `keuangan-margin-tinggi-${m.id}`,
            tipe: 'Keuangan',
            judul: `Margin Sangat Tinggi: "${m.nama}" (${marginPct.toFixed(1)}%)`,
            deskripsi: `Menu ${m.nama} memiliki margin laba kotor sebesar ${marginPct.toFixed(
              1
            )}% (Harga jual ${formatRupiah(harga)} vs HPP ${formatRupiah(
              hpp
            )}). Menu ini sangat prospektif untuk dijadikan andalan promosi / bundling kasir.`,
            confidence: 88,
            priority: 'rendah',
            actionLink: '/dashboard/menu',
            actionLabel: 'Kelola Menu',
            relatedId: m.id,
          })
        } else if (marginPct > 0 && marginPct < 20) {
          items.push({
            id: `keuangan-margin-tipis-${m.id}`,
            tipe: 'Keuangan',
            judul: `Perhatian: Margin Menu "${m.nama}" Relatif Tipis (${marginPct.toFixed(1)}%)`,
            deskripsi: `Harga jual ${formatRupiah(harga)} mendekati HPP ${formatRupiah(
              hpp
            )}. Pertimbangkan penyesuaian harga jual atau negosiasi ulang harga bahan baku ke supplier agar margin dapur lebih sehat.`,
            confidence: 85,
            priority: 'sedang',
            actionLink: '/dashboard/simulasi',
            actionLabel: 'Simulasikan HPP',
            relatedId: m.id,
          })
        }
      }
    })

    // Analisis Pola Saluran Penjualan
    if ((orders || []).length > 0) {
      const channelCount: Record<string, number> = {}
      orders!.forEach(o => {
        const ch = o.channel || 'Toko Langsung'
        channelCount[ch] = (channelCount[ch] || 0) + 1
      })
      const topChannel = Object.entries(channelCount).sort((a, b) => b[1] - a[1])[0]
      if (topChannel) {
        const pct = Math.round((topChannel[1] / orders!.length) * 100)
        items.push({
          id: 'penjualan-channel-dominan',
          tipe: 'Penjualan',
          judul: `Saluran "${topChannel[0]}" Mendominasi Transaksi`,
          deskripsi: `Sebesar ${pct}% pesanan pelanggan masuk melalui saluran ${topChannel[0]}. Optimalkan kecepatan pelayanan dan ketersediaan stok khusus untuk pesanan kanal ini.`,
          confidence: 84,
          priority: 'rendah',
          actionLink: '/dashboard/penjualan',
          actionLabel: 'Buka Kasir Penjualan',
        })
      }
    }

    // Urutkan prioritas: tinggi > sedang > rendah
    const priorityOrder = { tinggi: 0, sedang: 1, rendah: 2 }
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    const summary: RekomendasiSummary = {
      total: items.length,
      kritisCount: items.filter(i => i.priority === 'tinggi').length,
      stokCount: items.filter(i => i.tipe === 'Stok').length,
      keuanganCount: items.filter(i => i.tipe === 'Keuangan').length,
      penjualanCount: items.filter(i => i.tipe === 'Penjualan').length,
    }

    return { items, summary }
  },
}
