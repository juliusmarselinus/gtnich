'use client'

import { formatRupiah } from '@/lib/mock-data'
import { LaporanSummary } from '../types'
import { TrendingUp, ShoppingBag, DollarSign, PackageMinus, ShoppingCart, Percent } from 'lucide-react'

interface SummaryCardsProps {
  summary: LaporanSummary
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Omzet Terkumpul',
      value: formatRupiah(summary.totalRevenue),
      sub: `${summary.totalTransaksi} transaksi penjualan selesai`,
      icon: DollarSign,
      color: 'text-[#FF8F2B]',
      bg: 'bg-[#FFF6EC]',
    },
    {
      label: 'Total Estimasi Profit Bersih',
      value: formatRupiah(summary.totalProfit),
      sub: `${summary.profitMargin}% margin keuntungan rata-rata`,
      icon: TrendingUp,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: 'Rata-rata Keranjang (AOV)',
      value: formatRupiah(summary.averageBasketSize),
      sub: 'Nominal per transaksi pelanggan',
      icon: ShoppingBag,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Total HPP / Beban Pokok',
      value: formatRupiah(summary.totalHPP),
      sub: `Biaya modal resep terjual`,
      icon: Percent,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Bahan Baku Terpakai',
      value: `${summary.totalBahanTerpakaiJenis} Jenis`,
      sub: 'Termutasi otomatis dari resep kasir',
      icon: PackageMinus,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Pengadaan PO Selesai',
      value: formatRupiah(summary.totalBiayaPengadaan),
      sub: `${summary.totalPOApproved} PO berhasil diterima & ditagihkan`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(c => {
        const Icon = c.icon
        return (
          <div key={c.label} className="clay-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {c.label}
              </span>
              <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 font-mono tracking-tight">
              {c.value}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold">{c.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
