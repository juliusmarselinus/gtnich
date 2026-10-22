'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import RevenueChart from '@/components/RevenueChart'
import StatCard from '@/components/ui/StatCard'
import { revenueData, formatRupiah } from '@/lib/mock-data'
import { Calendar, Download } from 'lucide-react'

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false)

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalOrders = revenueData.reduce((acc, curr) => acc + curr.orders, 0)
  const avgOrder = Math.round(totalRevenue / totalOrders)

  const handleExport = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      window.print()
    }, 600)
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Laporan Keuangan"
        subtitle="Evaluasi berkala transaksi kasir dan rekonsiliasi arus kas"
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#6B665F]">
            <Calendar className="w-3.5 h-3.5 text-[#3E6B48]" />
            <span>Periode 02 Sep - 08 Sep 2026</span>
          </div>

          <button
            onClick={handleExport}
            className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#EAE5DF] hover:bg-[#F4F0EB] text-[#1F1D1A] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B665F]" />
            <span>{downloading ? 'Menyiapkan...' : 'Unduh Laporan'}</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Penerimaan Bersih"
            value={formatRupiah(totalRevenue)}
            change="+22.8%"
            trend="up"
            helperText="7 hari terakhir"
          />
          <StatCard
            title="Frekuensi Transaksi"
            value={`${totalOrders} transaksi`}
            helperText="Tingkat retur: 0%"
          />
          <StatCard
            title="Rata-rata Nilai Belanja"
            value={formatRupiah(avgOrder)}
            change="+5.4%"
            trend="up"
            helperText="Rata-rata per struk"
          />
        </div>

        {/* Chart View */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#EAE5DF] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">
              Grafik Penjualan Harian
            </h3>
            <span className="text-[11px] text-[#6B665F]">Sesi 02-08 Sep</span>
          </div>
          <RevenueChart />
        </div>

        {/* Daily Breakdown Table */}
        <div className="bg-[#FFFFFF] rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EAE5DF]">
            <h4 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">
              Rincian Buku Kas Harian
            </h4>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#EAE5DF] text-[#6B665F] uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-5">Tanggal</th>
                <th className="py-3 px-5 text-center">Volume Order</th>
                <th className="py-3 px-5 text-right">Total Penerimaan</th>
                <th className="py-3 px-5 text-right">Rata-rata Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F0EB]">
              {revenueData.map((row) => (
                <tr key={row.date} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-medium text-[#1F1D1A]">{row.date} 2026</td>
                  <td className="py-3.5 px-5 text-center font-mono text-[#6B665F]">
                    {row.orders} transaksi
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-semibold text-[#1F1D1A]">
                    {formatRupiah(row.revenue)}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono text-[#6B665F]">
                    {formatRupiah(Math.round(row.revenue / row.orders))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
