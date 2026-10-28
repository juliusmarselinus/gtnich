export type TimeRangeFilter = '7d' | '30d' | 'this_month' | 'all'

export interface DailyTrendItem {
  date: string
  rawDate: string
  penjualan: number
  profit: number
  hpp: number
  transaksi: number
}

export interface BahanUsageItem {
  nama: string
  satuan: string
  qty: number
  totalEstimasiBiaya: number
}

export interface MenuSalesBreakdownItem {
  name: string
  qty: number
  revenue: number
  profit: number
}

export interface ChannelBreakdownItem {
  channel: string
  count: number
  totalRevenue: number
}

export interface PaymentBreakdownItem {
  paymentMethod: string
  count: number
  totalRevenue: number
}

export interface LaporanSummary {
  totalRevenue: number
  totalHPP: number
  totalProfit: number
  profitMargin: number
  totalTransaksi: number
  averageBasketSize: number
  totalBahanTerpakaiJenis: number
  totalPOApproved: number
  totalBiayaPengadaan: number
}

export interface LaporanData {
  summary: LaporanSummary
  trend: DailyTrendItem[]
  bahanUsage: BahanUsageItem[]
  menuBreakdown: MenuSalesBreakdownItem[]
  channelBreakdown: ChannelBreakdownItem[]
  paymentBreakdown: PaymentBreakdownItem[]
  recentSales: {
    id: string
    invoiceNumber: string
    customerName: string
    channel: string
    paymentMethod: string
    totalPrice: number
    profit: number
    createdAt: string
  }[]
}
