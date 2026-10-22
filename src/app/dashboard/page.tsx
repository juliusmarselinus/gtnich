'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/ui/StatCard'
import RevenueChart from '@/components/RevenueChart'
import Badge from '@/components/ui/Badge'
import ReceiptDrawer from '@/components/ReceiptDrawer'
import { stats, orders as initialOrders, products, formatRupiah, Order } from '@/lib/mock-data'
import { ArrowRight, ChevronRight, Package, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const recentOrders = ordersList.slice(0, 5)
  const lowStockProducts = products.filter((p) => p.stock < 5)
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 3)

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Ringkasan Operasional"
        subtitle="Pantau omzet harian, pesanan terbaru, dan batas aman persediaan"
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            helperText="WhatsApp & Web"
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
          <div className="lg:col-span-2 bg-[#FFFFFF] rounded-xl p-5 border border-[#EAE5DF] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">
                  Arus Kas 7 Hari Terakhir
                </h3>
                <p className="text-[11px] text-[#9C9589]">
                  Total akumulasi penjualan bersih toko
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-[#3E6B48]">
                +18.4% minggu ini
              </span>
            </div>
            <RevenueChart />
          </div>

          {/* Recent Orders Card */}
          <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#EAE5DF] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F4F0EB]">
                <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">
                  Transaksi Masuk
                </h3>
                <Link
                  href="/dashboard/orders"
                  className="text-[11px] text-[#3E6B48] hover:underline font-medium"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="divide-y divide-[#F4F0EB]">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="py-3 flex items-center justify-between hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="font-medium text-xs text-[#1F1D1A] group-hover:text-[#3E6B48] transition-colors">
                        {ord.customerName}
                      </p>
                      <p className="text-[10px] text-[#9C9589] font-mono">
                        {ord.invoiceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold text-[#1F1D1A]">
                        {formatRupiah(ord.totalPrice)}
                      </p>
                      <span className="text-[10px] text-[#6B665F]">
                        {ord.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-[#9C9589] text-center pt-3 border-t border-[#F4F0EB]">
              Klik nama transaksi untuk membuka struk kasir
            </p>
          </div>
        </div>

        {/* Low Stock & Best Sellers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#EAE5DF] shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">
              Produk Paling Banyak Terjual
            </h3>
            <div className="divide-y divide-[#F4F0EB]">
              {bestSellers.map((item, idx) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-medium text-[#1F1D1A]">{item.name}</p>
                      <p className="text-[10px] text-[#9C9589] font-mono">{formatRupiah(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-[#3E6B48]">
                      {item.sold} terjual
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Attention */}
          <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#EAE5DF] shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">
              Peringatan Stok Minimum
            </h3>
            <div className="divide-y divide-[#F4F0EB]">
              {lowStockProducts.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-medium text-[#1F1D1A]">{item.name}</p>
                      <p className="text-[10px] text-[#9C9589]">{item.category}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      item.stock === 0
                        ? 'bg-[#FAEDE8] text-[#C85A32] border border-[#F0D4C9]'
                        : 'bg-[#FAF8F5] text-[#6B665F] border border-[#EAE5DF]'
                    }`}
                  >
                    {item.stock === 0 ? 'Habis (0)' : `Sisa ${item.stock} pcs`}
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
