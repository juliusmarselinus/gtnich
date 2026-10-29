import { createClient } from '@/lib/supabase/client'
import {
  LaporanData,
  TimeRangeFilter,
  DailyTrendItem,
  BahanUsageItem,
  MenuSalesBreakdownItem,
  ChannelBreakdownItem,
  PaymentBreakdownItem,
} from '../types'

function getDateThreshold(range: TimeRangeFilter): Date | null {
  const now = new Date()
  if (range === '7d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (range === '30d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 29)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (range === 'this_month') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    d.setHours(0, 0, 0, 0)
    return d
  }
  return null
}

function formatDateShort(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return isoString
  }
}

export const laporanService = {
  async getLaporan(range: TimeRangeFilter = '7d'): Promise<LaporanData> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Pengguna tidak terautentikasi')
    }

    const threshold = getDateThreshold(range)

    // 1. Ambil orders dengan relasi order_items
    let ordersQuery = supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (threshold) {
      ordersQuery = ordersQuery.gte('created_at', threshold.toISOString())
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('Error fetching orders for laporan:', ordersError)
      throw new Error(`Gagal memuat data penjualan: ${ordersError.message}`)
    }

    // 2. Ambil data stok logs untuk pemakaian bahan
    let stokLogsQuery = supabase
      .from('stok_logs')
      .select('*, bahan(id, nama, satuan, harga_per_satuan)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (threshold) {
      stokLogsQuery = stokLogsQuery.gte('created_at', threshold.toISOString())
    }

    const { data: stokLogs, error: stokLogsError } = await stokLogsQuery
    if (stokLogsError) {
      console.warn('Warning fetching stok_logs for laporan:', stokLogsError)
    }

    // 3. Ambil total PO untuk perbandingan pengadaan (Opsional)
    let poQuery = supabase
      .from('purchase_orders')
      .select('id, total_aktual, total_estimasi, status, created_at')
      .eq('user_id', user.id)

    if (threshold) {
      poQuery = poQuery.gte('created_at', threshold.toISOString())
    }

    const { data: poList } = await poQuery

    // Kalkulasi Rekap Summary
    const validOrders = orders || []
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    const totalHPP = validOrders.reduce((sum, o) => sum + (Number(o.total_hpp) || 0), 0)
    const totalProfit = validOrders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0)
    const totalTransaksi = validOrders.length
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const averageBasketSize = totalTransaksi > 0 ? Math.round(totalRevenue / totalTransaksi) : 0

    // Hitung Pengadaan PO
    const validPO = poList || []
    const totalPOApproved = validPO.filter(p => p.status === 'selesai' || p.status === 'tagihan').length
    const totalBiayaPengadaan = validPO.reduce((sum, p) => sum + (Number(p.total_aktual || p.total_estimasi) || 0), 0)

    // Kalkulasi Trend Penjualan Harian
    const trendMap: Record<string, DailyTrendItem> = {}

    // Pre-populate hari untuk grafik jika 7d atau 30d
    if (range === '7d' || range === '30d') {
      const daysCount = range === '7d' ? 7 : 30
      const now = new Date()
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateKey = d.toISOString().split('T')[0]
        const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        trendMap[dateKey] = {
          date: displayDate,
          rawDate: dateKey,
          penjualan: 0,
          profit: 0,
          hpp: 0,
          transaksi: 0,
        }
      }
    }

    validOrders.forEach(o => {
      const dateKey = (o.created_at || '').split('T')[0]
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = {
          date: formatDateShort(o.created_at),
          rawDate: dateKey,
          penjualan: 0,
          profit: 0,
          hpp: 0,
          transaksi: 0,
        }
      }
      trendMap[dateKey].penjualan += Number(o.total_price) || 0
      trendMap[dateKey].profit += Number(o.profit) || 0
      trendMap[dateKey].hpp += Number(o.total_hpp) || 0
      trendMap[dateKey].transaksi += 1
    })

    const trend = Object.values(trendMap).sort((a, b) => a.rawDate.localeCompare(b.rawDate))

    // Kalkulasi Bahan Usage (dari stok_logs sumber Penjualan atau agregasi)
    const usageMap: Record<string, BahanUsageItem> = {}
    ;(stokLogs || []).forEach(log => {
      // Ambil log yang mengurangi stok karena Penjualan atau penggunaan
      if (log.perubahan < 0 && log.sumber === 'Penjualan') {
        const bahanName = log.bahan?.nama || 'Bahan Lain'
        const satuan = log.bahan?.satuan || 'satuan'
        const qtyUsed = Math.abs(Number(log.perubahan) || 0)
        const harga = Number(log.bahan?.harga_per_satuan) || 0

        if (!usageMap[bahanName]) {
          usageMap[bahanName] = {
            nama: bahanName,
            satuan,
            qty: 0,
            totalEstimasiBiaya: 0,
          }
        }
        usageMap[bahanName].qty += qtyUsed
        usageMap[bahanName].totalEstimasiBiaya += qtyUsed * harga
      }
    })

    const bahanUsage = Object.values(usageMap)
      .map(item => ({
        ...item,
        qty: Math.round(item.qty * 100) / 100,
        totalEstimasiBiaya: Math.round(item.totalEstimasiBiaya),
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)

    // Kalkulasi Menu Breakdown
    const menuMap: Record<string, MenuSalesBreakdownItem> = {}
    validOrders.forEach(o => {
      ;(o.order_items || []).forEach((item: any) => {
        const menuName = item.nama_menu || 'Menu Lain'
        const qty = Number(item.qty) || 0
        const revenue = Number(item.subtotal) || (Number(item.harga_jual) || 0) * qty
        const itemHPP = (Number(item.hpp) || 0) * qty
        const profit = revenue - itemHPP

        if (!menuMap[menuName]) {
          menuMap[menuName] = {
            name: menuName,
            qty: 0,
            revenue: 0,
            profit: 0,
          }
        }
        menuMap[menuName].qty += qty
        menuMap[menuName].revenue += revenue
        menuMap[menuName].profit += profit
      })
    })

    const menuBreakdown = Object.values(menuMap).sort((a, b) => b.qty - a.qty)

    // Breakdown Channel
    const channelMap: Record<string, { count: number; totalRevenue: number }> = {}
    validOrders.forEach(o => {
      const ch = o.channel || 'Lainnya'
      if (!channelMap[ch]) {
        channelMap[ch] = { count: 0, totalRevenue: 0 }
      }
      channelMap[ch].count += 1
      channelMap[ch].totalRevenue += Number(o.total_price) || 0
    })
    const channelBreakdown: ChannelBreakdownItem[] = Object.entries(channelMap).map(([channel, val]) => ({
      channel,
      count: val.count,
      totalRevenue: val.totalRevenue,
    }))

    // Breakdown Payment Method
    const paymentMap: Record<string, { count: number; totalRevenue: number }> = {}
    validOrders.forEach(o => {
      const pm = o.payment_method || 'Tunai / Cash'
      if (!paymentMap[pm]) {
        paymentMap[pm] = { count: 0, totalRevenue: 0 }
      }
      paymentMap[pm].count += 1
      paymentMap[pm].totalRevenue += Number(o.total_price) || 0
    })
    const paymentBreakdown: PaymentBreakdownItem[] = Object.entries(paymentMap).map(([paymentMethod, val]) => ({
      paymentMethod,
      count: val.count,
      totalRevenue: val.totalRevenue,
    }))

    // Recent Sales
    const recentSales = [...validOrders]
      .reverse()
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        invoiceNumber: o.invoice_number,
        customerName: o.customer_name,
        channel: o.channel,
        paymentMethod: o.payment_method,
        totalPrice: Number(o.total_price) || 0,
        profit: Number(o.profit) || 0,
        createdAt: o.created_at,
      }))

    return {
      summary: {
        totalRevenue,
        totalHPP,
        totalProfit,
        profitMargin: Math.round(profitMargin * 10) / 10,
        totalTransaksi,
        averageBasketSize,
        totalBahanTerpakaiJenis: Object.keys(usageMap).length,
        totalPOApproved,
        totalBiayaPengadaan,
      },
      trend,
      bahanUsage,
      menuBreakdown,
      channelBreakdown,
      paymentBreakdown,
      recentSales,
    }
  },
}
