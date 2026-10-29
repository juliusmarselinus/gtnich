'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/ui/StatCard'
import ReceiptDrawer from '@/components/ReceiptDrawer'
import { formatRupiah, Order } from '@/lib/mock-data'
import { useDashboard } from './hooks/useDashboard'
import { DashboardRecentOrder } from './services/dashboardService'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  RefreshCw,
  AlertCircle,
  ShoppingCart,
  ArrowRight,
  Package,
  ClipboardList,
  Receipt,
  ChefHat,
  Truck,
  BoxSelect,
  Database,
  BarChart2,
  History,
  Sparkles,
  Lightbulb,
  Image as ImageIcon,
  Layers,
} from 'lucide-react'

// Definisi katalog modul dengan sub-modul (fitur-fiturnya)
const modulesCatalog = [
  {
    id: 'operasional',
    title: 'Modul Operasional',
    badge: '3 Fitur',
    color: 'from-emerald-500 to-teal-500',
    description: 'Aktivitas kasir harian, transaksi penjualan, pemesanan ke distributor, dan penagihan supplier.',
    icon: ShoppingCart,
    items: [
      {
        href: '/dashboard/penjualan',
        label: 'Input Penjualan',
        desc: 'Kasir POS cepat & auto potong stok',
        icon: ShoppingCart,
      },
      {
        href: '/dashboard/purchase-order',
        label: 'Purchase Order',
        desc: 'Pemesanan bahan & verifikasi barang',
        icon: ClipboardList,
      },
      {
        href: '/dashboard/tagihan',
        label: 'Tagihan Supplier',
        desc: 'Monitoring invoice tempo & pembayaran',
        icon: Receipt,
      },
    ],
  },
  {
    id: 'inventaris',
    title: 'Modul Inventaris',
    badge: '5 Fitur',
    color: 'from-amber-500 to-orange-500',
    description: 'Master data bahan baku, formula resep, vendor supplier, visualisasi stok, dan stock opname fisik.',
    icon: Package,
    items: [
      {
        href: '/dashboard/bahan',
        label: 'Data Bahan',
        desc: 'Katalog bahan, satuan & harga pokok',
        icon: Package,
      },
      {
        href: '/dashboard/menu',
        label: 'Menu & Resep',
        desc: 'Kalkulasi HPP & harga jual laba',
        icon: ChefHat,
      },
      {
        href: '/dashboard/suppliers',
        label: 'Data Supplier',
        desc: 'Vendor rekanan, histori & min order',
        icon: Truck,
      },
      {
        href: '/dashboard/kondisi-bahan',
        label: 'Kondisi Bahan',
        desc: 'Visual meter stok aman vs kritis',
        icon: BoxSelect,
      },
      {
        href: '/dashboard/stok-log',
        label: 'Stok Log & Opname',
        desc: 'Log mutasi & form rekonsiliasi fisik',
        icon: Database,
      },
    ],
  },
  {
    id: 'analitik',
    title: 'Modul Analitik & Laporan',
    badge: '4 Fitur',
    color: 'from-blue-500 to-indigo-500',
    description: 'Visualisasi keuangan, grafik konsumsi bahan, histori lengkap, simulasi laba, dan rekomendasi cerdas.',
    icon: BarChart2,
    items: [
      {
        href: '/dashboard/laporan',
        label: 'Laporan Keuangan',
        desc: 'Omzet, margin laba & grafik konsumsi',
        icon: BarChart2,
      },
      {
        href: '/dashboard/riwayat',
        label: 'Riwayat Transaksi',
        desc: 'Arsip log seluruh transaksi penjualan & PO',
        icon: History,
      },
      {
        href: '/dashboard/simulasi',
        label: 'Simulasi Bisnis',
        desc: 'Proyeksi profit & fluktuasi harga bahan',
        icon: Sparkles,
      },
      {
        href: '/dashboard/rekomendasi',
        label: 'Rekomendasi AI',
        desc: 'Insight prediktif restock & efisiensi',
        icon: Lightbulb,
      },
    ],
  },
  {
    id: 'tools',
    title: 'Modul Tools & Utilitas',
    badge: '1 Fitur',
    color: 'from-purple-500 to-pink-500',
    description: 'Alat bantu otomatisasi proses input manual nota belanja dapur.',
    icon: Sparkles,
    items: [
      {
        href: '/dashboard/ocr-nota',
        label: 'OCR Nota',
        desc: 'Scan foto nota belanja jadi data digital',
        icon: ImageIcon,
      },
    ],
  },
]

export default function DashboardPage() {
  const { data, isLoading, error, refresh } = useDashboard()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleSelectOrder = (ord: DashboardRecentOrder) => {
    const mappedOrder: Order = {
      id: ord.id,
      invoiceNumber: ord.invoiceNumber,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone || '-',
      channel: ord.channel as any,
      status: ord.status as any,
      paymentMethod: ord.paymentMethod as any,
      paymentStatus: ord.paymentStatus as any,
      subtotal: ord.totalPrice,
      discount: 0,
      shippingFee: 0,
      totalPrice: ord.totalPrice,
      qtyTotal: ord.items.reduce((sum, item) => sum + item.qty, 0),
      cashierName: 'Kasir Dapur',
      createdAt: ord.createdAt,
      items: ord.items.map(item => ({
        id: item.id,
        productId: item.id,
        name: item.namaMenu,
        price: item.hargaJual,
        qty: item.qty,
        subtotal: item.subtotal,
      })),
    }
    setSelectedOrder(mappedOrder)
  }

  const metrics = data?.metrics
  const revenueChart = data?.revenueChart || []
  const recentOrders = data?.recentOrders || []
  const bestSellers = data?.bestSellers || []
  const lowStockItems = data?.lowStockItems || []

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Overview DapurTwin"
        subtitle="Pusat kendali operasional, status modul sistem, dan indikator utama persediaan"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Omzet Terkumpul"
            value={metrics ? formatRupiah(metrics.omzetHariIni) : '...'}
            change={metrics?.omzetChange}
            trend={metrics?.omzetChange.startsWith('-') ? 'down' : 'up'}
            helperText="vs. kemarin"
          />
          <StatCard
            title="Pesanan Berjalan"
            value={metrics ? `${metrics.totalOrders} order` : '...'}
            change="+Real-time"
            trend="up"
            helperText="WhatsApp & Kasir Langsung"
          />
          <StatCard
            title="Menu & Resep Aktif"
            value={metrics ? `${metrics.totalMenus} Menu` : '...'}
            helperText="Tersedia di katalog kasir"
          />
          <StatCard
            title="Stok Bahan Menipis"
            value={metrics ? `${metrics.lowStockCount} bahan` : '...'}
            change={metrics && metrics.lowStockCount > 0 ? 'Perlu restock PO' : 'Stok aman'}
            trend={metrics && metrics.lowStockCount > 0 ? 'down' : 'up'}
            helperText="Di bawah stok minimum"
          />
        </div>

        {/* ========================================================================= */}
        {/* SEKSI UTAMA OVERVIEW: DAFTAR MODUL DENGAN FITUR HORIZONTAL               */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Modul Sistem DapurTwin
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Setiap modul tersusun terstruktur dengan sub-modul berjejer horizontal
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full clay-pill border border-slate-200/60">
              4 Modul Terintegrasi
            </span>
          </div>

          <div className="space-y-6">
            {modulesCatalog.map(mod => {
              const ModIcon = mod.icon
              return (
                <div key={mod.id} className="clay-card p-5 sm:p-6 space-y-4">
                  {/* Baris Header Modul */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shadow-md shadow-emerald-500/10 flex-shrink-0`}
                      >
                        <ModIcon className="w-5 h-5 drop-shadow" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-800">
                            {mod.title}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {mod.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DAFTAR SUB-MODUL BERJAJAR SECARA HORIZONTAL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 pt-1">
                    {mod.items.map(item => {
                      const ItemIcon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="group p-4 rounded-2xl bg-white/75 hover:bg-white border border-slate-200/70 hover:border-emerald-300 transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col justify-between space-y-3 cursor-pointer"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-2xs">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                {item.label}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-emerald-600 font-semibold">
                            <span>Buka Modul</span>
                            <span>→</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chart & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 clay-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Arus Kas 7 Hari Terakhir
                </h3>
                <p className="text-[11px] text-slate-400">
                  Total akumulasi penjualan operasional dari database orders
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refresh}
                  disabled={isLoading}
                  title="Segarkan Data"
                  className="p-1.5 rounded-xl clay-btn text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  href="/dashboard/laporan"
                  className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full clay-pill hover:bg-emerald-100 transition-colors"
                >
                  Lihat Statistik Lengkap →
                </Link>
              </div>
            </div>

            <div className="pt-2">
              {revenueChart.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                  Belum ada data penjualan tercatat.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={revenueChart}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    />
                    <Tooltip
                      formatter={(v: any) => [formatRupiah(Number(v) || 0), 'Omzet']}
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 16,
                        border: '1px solid #cbd5e1',
                        boxShadow: '4px 4px 12px #d8e2ed',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="clay-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transaksi Masuk
                </h3>
                <Link
                  href="/dashboard/riwayat"
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  Lihat Semua
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Belum ada transaksi penjualan masuk.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map(ord => (
                    <div
                      key={ord.id}
                      onClick={() => handleSelectOrder(ord)}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2.5 rounded-xl transition-colors cursor-pointer group"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-800 group-hover:text-emerald-600 transition-colors">
                          {ord.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {ord.invoiceNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-slate-800">
                          {formatRupiah(ord.totalPrice)}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          {ord.channel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Klik nota untuk rincian</span>
              <Link
                href="/dashboard/penjualan"
                className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Buka Kasir
              </Link>
            </div>
          </div>
        </div>

        {/* Low Stock & Best Sellers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div className="clay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Menu Terlaris Dapur
              </h3>
              <Link
                href="/dashboard/menu"
                className="text-[11px] text-emerald-600 font-bold hover:underline"
              >
                Kelola Menu
              </Link>
            </div>

            {bestSellers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada menu di database.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bestSellers.map(item => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-2xl bg-slate-50 clay-pill">
                        {item.emoji}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.name}</p>
                        <p className="text-[11px] text-emerald-600 font-mono font-semibold">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 clay-pill">
                        {item.sold} porsi terjual
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Attention */}
          <div className="clay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Peringatan Stok Bahan Baku
              </h3>
              <Link
                href="/dashboard/purchase-order"
                className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                Buat PO <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600 font-medium bg-emerald-50/50 rounded-2xl border border-emerald-100">
                ✓ Seluruh bahan baku berada dalam kondisi aman di atas batas minimum.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockItems.map(item => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Batas minimum: {item.stockMinimum} {item.satuan}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold clay-pill ${
                        item.stock === 0
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.stock === 0
                        ? `Habis (0 ${item.satuan})`
                        : `Sisa ${item.stock} ${item.satuan}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Slide-over Receipt Drawer */}
      <ReceiptDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}
