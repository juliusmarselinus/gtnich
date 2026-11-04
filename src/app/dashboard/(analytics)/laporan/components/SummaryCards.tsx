'use client'

import { formatRupiah } from '@/lib/mock-data'
import { LaporanSummary } from '../types'
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  PackageMinus,
  ShoppingCart,
  Percent,
} from 'lucide-react'
import clsx from 'clsx'

interface SummaryCardsProps {
  summary: LaporanSummary
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Omzet',
      value: formatRupiah(summary.totalRevenue),
      sub: `${summary.totalTransaksi} transaksi selesai`,
      icon: DollarSign,
      tint: 'bg-[#FFF3CC]',
      iconBg: 'bg-[#FFB800]/30',
      textColor: 'text-[#2B1D00]',
      mutedColor: 'text-[#8A5A00]/70',
    },
    {
      label: 'Est. Profit Bersih',
      value: formatRupiah(summary.totalProfit),
      sub: `${summary.profitMargin}% margin rata-rata`,
      icon: TrendingUp,
      tint: 'bg-[#E6F5E4]',
      iconBg: 'bg-[#2D7A1F]/20',
      textColor: summary.totalProfit >= 0 ? 'text-[#1A6B40]' : 'text-[#D8431F]',
      mutedColor: 'text-[#2D7A1F]/60',
    },
    {
      label: 'Rata-rata per Trx (AOV)',
      value: formatRupiah(summary.averageBasketSize),
      sub: 'Nominal per transaksi pelanggan',
      icon: ShoppingBag,
      tint: 'bg-[#E0F2FE]',
      iconBg: 'bg-[#0369A1]/20',
      textColor: 'text-[#2B1D00]',
      mutedColor: 'text-[#0369A1]/60',
    },
    {
      label: 'Total HPP / Beban Modal',
      value: formatRupiah(summary.totalHPP),
      sub: 'Akumulasi biaya bahan baku resep',
      icon: Percent,
      tint: 'bg-[#FFF3CC]',
      iconBg: 'bg-[#FFB800]/30',
      textColor: 'text-[#2B1D00]',
      mutedColor: 'text-[#8A5A00]/70',
    },
    {
      label: 'Bahan Baku Terpakai',
      value: `${summary.totalBahanTerpakaiJenis}`,
      sub: 'Jenis bahan termutasi dari resep',
      icon: PackageMinus,
      tint: 'bg-[#FDE8E4]',
      iconBg: 'bg-[#D8431F]/20',
      textColor: 'text-[#2B1D00]',
      mutedColor: 'text-[#D8431F]/60',
    },
    {
      label: 'Pengadaan PO Selesai',
      value: formatRupiah(summary.totalBiayaPengadaan),
      sub: `${summary.totalPOApproved} pesanan disetujui`,
      icon: ShoppingCart,
      tint: 'bg-[#EDE9FF]',
      iconBg: 'bg-[#7E22CE]/15',
      textColor: 'text-[#2B1D00]',
      mutedColor: 'text-[#7E22CE]/60',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map(c => {
        const Icon = c.icon
        return (
          <div
            key={c.label}
            className={clsx(
              'relative overflow-hidden rounded-[28px] p-5 flex flex-col gap-4 min-h-[140px]',
              c.tint,
              'shadow-[0_6px_14px_rgba(120,80,30,0.08)] hover:shadow-[0_14px_28px_rgba(120,80,30,0.14)] hover:-translate-y-0.5 transition-all duration-200'
            )}
          >
            {/* Dekorasi lingkaran sudut kanan bawah */}
            <span
              aria-hidden
              className="absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-white/45"
            />

            {/* Baris atas: label + icon */}
            <div className="relative flex items-center justify-between">
              <span className={clsx('text-sm font-extrabold', c.textColor)}>
                {c.label}
              </span>
              <span
                className={clsx(
                  'h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0',
                  c.iconBg
                )}
              >
                <Icon className={clsx('w-4 h-4', c.textColor)} />
              </span>
            </div>

            {/* Baris bawah: angka + sub-label */}
            <div className="relative min-w-0">
              <p className={clsx('text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight truncate', c.textColor)}>
                {c.value}
              </p>
              <p className={clsx('text-xs mt-1.5 line-clamp-1', c.mutedColor)}>{c.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
