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
import { RefreshCw, AlertCircle, ShoppingCart, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { data, isLoading, error, refresh } = useDashboard()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleSelectOrder = (ord: DashboardRecentOrder) => {
    // Map to Order format expected by ReceiptDrawer
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
        title="Ringkasan Operasional Dapur"
        subtitle="Pantau omzet harian, pesanan terbaru, dan batas aman persediaan bahan dari database"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-7xl mx-auto">
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

        {/* Chart & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
