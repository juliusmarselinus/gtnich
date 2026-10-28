import { createClient } from '@/lib/supabase/client'

export interface DashboardMetricSummary {
  omzetHariIni: number
  omzetChange: string
  totalOrders: number
  totalMenus: number
  lowStockCount: number
}

export interface DashboardRevenueDay {
  date: string
  revenue: number
  orders: number
}

export interface DashboardRecentOrder {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone?: string | null
  totalPrice: number
  status: string
  paymentStatus: string
  paymentMethod: string
  channel: string
  createdAt: string
  items: {
    id: string
    namaMenu: string
    qty: number
    hargaJual: number
    subtotal: number
  }[]
}

export interface DashboardBestSellerMenu {
  id: string
  name: string
  category: string
  emoji: string
  price: number
  sold: number
}

export interface DashboardLowStockBahan {
  id: string
  name: string
  satuan: string
  stock: number
  stockMinimum: number
}

export interface DashboardData {
  metrics: DashboardMetricSummary
  revenueChart: DashboardRevenueDay[]
  recentOrders: DashboardRecentOrder[]
  bestSellers: DashboardBestSellerMenu[]
  lowStockItems: DashboardLowStockBahan[]
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Pengguna tidak terautentikasi')

    // Fetch data paralel
    const [ordersRes, menusRes, bahanRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('menus').select('*').eq('user_id', user.id),
      supabase.from('bahan').select('*').eq('user_id', user.id),
    ])

    const orders = ordersRes.data || []
    const menus = menusRes.data || []
    const bahan = bahanRes.data || []

    // 1. Kalkulasi Omzet Hari Ini & Pesanan
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let omzetHariIni = 0
    let omzetKemarin = 0

    orders.forEach(o => {
      const orderDateStr = (o.created_at || '').split('T')[0]
      const price = Number(o.total_price) || 0
      if (orderDateStr === todayStr) {
        omzetHariIni += price
      } else if (orderDateStr === yesterdayStr) {
        omzetKemarin += price
      }
    })

    // Jika belum ada penjualan hari ini tetapi ada total penjualan, gunakan omzet terakhir
    if (omzetHariIni === 0 && orders.length > 0) {
      omzetHariIni = orders.slice(0, 3).reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    }

    let omzetChange = '+0%'
    if (omzetKemarin > 0) {
      const diff = ((omzetHariIni - omzetKemarin) / omzetKemarin) * 100
      omzetChange = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
    } else if (omzetHariIni > 0) {
      omzetChange = '+100%'
    }

    // 2. Stok Bahan Menipis
    const lowStockItems: DashboardLowStockBahan[] = bahan
      .filter(b => {
        const stok = Number(b.stok) || 0
        const min = Number(b.stok_minimum) || 0
        return min > 0 ? stok <= min : stok < 5
      })
      .map(b => ({
        id: b.id,
        name: b.nama,
        satuan: b.satuan,
        stock: Number(b.stok) || 0,
        stockMinimum: Number(b.stok_minimum) || 0,
      }))

    // 3. Arus Kas 7 Hari Terakhir
    const revenueMap: Record<string, { revenue: number; orders: number; label: string }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      revenueMap[dateKey] = { revenue: 0, orders: 0, label }
    }

    orders.forEach(o => {
      const dateKey = (o.created_at || '').split('T')[0]
      if (revenueMap[dateKey]) {
        revenueMap[dateKey].revenue += Number(o.total_price) || 0
        revenueMap[dateKey].orders += 1
      }
    })

    const revenueChart: DashboardRevenueDay[] = Object.values(revenueMap).map(v => ({
      date: v.label,
      revenue: v.revenue,
      orders: v.orders,
    }))

    // 4. Transaksi Masuk Terbaru
    const recentOrders: DashboardRecentOrder[] = orders.slice(0, 6).map(o => ({
      id: o.id,
      invoiceNumber: o.invoice_number,
      customerName: o.customer_name || 'Pelanggan Umum',
      customerPhone: o.customer_phone,
      totalPrice: Number(o.total_price) || 0,
      status: o.status || 'selesai',
      paymentStatus: o.payment_status || 'Lunas',
      paymentMethod: o.payment_method || 'Tunai / Cash',
      channel: o.channel || 'Toko Langsung',
      createdAt: o.created_at,
      items: (o.order_items || []).map((i: any) => ({
        id: i.id,
        namaMenu: i.nama_menu,
        qty: Number(i.qty) || 0,
        hargaJual: Number(i.harga_jual) || 0,
        subtotal: Number(i.subtotal) || 0,
      })),
    }))

    // 5. Best Seller Menu (Dihitung dari order_items)
    const menuSoldCount: Record<string, number> = {}
    orders.forEach(o => {
      ;(o.order_items || []).forEach((item: any) => {
        const id = item.menu_id || item.nama_menu
        menuSoldCount[id] = (menuSoldCount[id] || 0) + (Number(item.qty) || 0)
      })
    })

    const bestSellers: DashboardBestSellerMenu[] = menus
      .map(m => ({
        id: m.id,
        name: m.nama,
        category: m.kategori || 'Umum',
        emoji: m.emoji || '🍽️',
        price: Number(m.harga_jual) || 0,
        sold: menuSoldCount[m.id] || menuSoldCount[m.nama] || 0,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4)

    return {
      metrics: {
        omzetHariIni,
        omzetChange,
        totalOrders: orders.length,
        totalMenus: menus.length,
        lowStockCount: lowStockItems.length,
      },
      revenueChart,
      recentOrders,
      bestSellers,
      lowStockItems,
    }
  },
}
