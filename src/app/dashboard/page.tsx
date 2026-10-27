'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/ui/StatCard'
import RevenueChart from '@/components/RevenueChart'
import ReceiptDrawer from '@/components/ReceiptDrawer'
import { stats, orders as initialOrders, products, formatRupiah, Order } from '@/lib/mock-data'
import Link from 'next/link'

export default function DashboardPage() {
  const [ordersList] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const recentOrders = ordersList.slice(0, 5)
  const lowStockProducts = products.filter((p) => p.stock < 5)
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 3)

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Ringkasan Operasional Dapur"
        subtitle="Pantau omzet harian, pesanan terbaru, dan batas aman persediaan bahan"
      />

      <main className="p-8 space-y-7 max-w-7xl mx-auto">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Omzet Hari Ini"
            value={formatRupiah(stats.totalRevenue)}
            change="+14.5%"
            trend="up"
            helperText="vs. kemarin"
          />
          <StatCard
            title="Pesanan Berjalan"
            value={`${stats.totalOrders} order`}
            change="+8.2%"
            trend="up"
            helperText="WhatsApp & POS"
          />
          <StatCard
            title="Produk Aktif"
            value={`${stats.totalProducts} SKU`}
            helperText="Tersedia di etalase"
          />
          <StatCard
            title="Stok Menipis"
            value={`${stats.lowStockCount} produk`}
            change="Perlu restock"
            trend="down"
            helperText="< 5 pcs di gudang"
          />
        </div>

        {/* Chart & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 clay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Arus Kas 7 Hari Terakhir
                </h3>
                <p className="text-[11px] text-slate-400">
                  Total akumulasi penjualan bersih operasional DapurTwin
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full clay-pill">
                +18.4% minggu ini
              </span>
            </div>
            <div className="pt-2">
              <RevenueChart />
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

              <div className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
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
                      <span className="text-[10px] text-slate-500 font-medium">
                        {ord.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center pt-3 border-t border-slate-100 font-medium">
              Klik transaksi untuk membuka nota struk
            </p>
          </div>
        </div>

        {/* Low Stock & Best Sellers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div className="clay-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Menu Paling Laris
            </h3>
            <div className="divide-y divide-slate-100">
              {bestSellers.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-2xl bg-slate-50 clay-pill">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-emerald-600 font-mono font-semibold">{formatRupiah(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 clay-pill">
                      {item.sold} porsi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Attention */}
          <div className="clay-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Peringatan Stok Minimum
            </h3>
            <div className="divide-y divide-slate-100">
              {lowStockProducts.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-2xl bg-slate-50 clay-pill">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.category}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold clay-pill ${
                      item.stock === 0
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.stock === 0 ? 'Habis (0)' : `Sisa ${item.stock} unit`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Slide-over Receipt Drawer */}
      <ReceiptDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
