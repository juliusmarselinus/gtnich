'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import { formatRupiah } from '@/lib/mock-data'
import { DashboardLowStockBahan, DashboardBestSellerMenu } from '../services/dashboardService'
import DapiMiniIllustration from '@/components/ui/DapiMiniIllustration'

interface LoginStyleMetricsGridProps {
  metrics?: {
    omzetHariIni: number
    omzetChange: string
    totalOrders: number
    totalMenus: number
    lowStockCount: number
  }
  bestSellers?: DashboardBestSellerMenu[]
  lowStockItems?: DashboardLowStockBahan[]
  isLoading?: boolean
}

export default function LoginStyleMetricsGrid({
  metrics,
  bestSellers = [],
  lowStockItems = [],
  isLoading = false,
}: LoginStyleMetricsGridProps) {
  const omzetVal = metrics?.omzetHariIni ?? 0
  const totalOrders = metrics?.totalOrders ?? 0
  const isUp = !metrics?.omzetChange?.startsWith('-')

  return (
    <div className="space-y-6 text-[#2B221C]">
      {/* 2 Card Ringkasan Utama: Omzet & Pesanan dengan Ilustrasi Dapi Mini Interaktif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card 1: Omzet Hari Ini */}
        <div className="group relative p-6 sm:p-7 rounded-3xl bg-white border border-[#F2E3D0] shadow-[0_15px_35px_-20px_rgba(178,98,20,0.18)] hover:shadow-[0_20px_40px_-20px_rgba(178,98,20,0.28)] transition-all flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6F5C4A]">
                Omzet Terkumpul Hari Ini
              </span>
              <div className="my-2.5">
                <h2 className="text-3xl sm:text-4xl font-black text-[#2B221C] tracking-tight font-mono">
                  {isLoading ? '...' : formatRupiah(omzetVal)}
                </h2>
              </div>
            </div>

            {/* Dapi Mini Maskot: Pembawa Koin Kasir */}
            <DapiMiniIllustration role="money" size={72} className="flex-shrink-0 -mr-1 -mt-1" />
          </div>

          <div className="pt-3.5 border-t border-[#F7EFE6] flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full ${
                isUp
                  ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                  : 'bg-[#FFF0EC] text-[#9A3412] border border-[#FFC2B5]'
              }`}
            >
              {isUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
              {metrics?.omzetChange || '+0%'}
            </span>
            <span className="text-[#6F5C4A] font-medium">dibandingkan kemarin</span>
          </div>
        </div>

        {/* Card 2: Pesanan Berjalan */}
        <div className="group relative p-6 sm:p-7 rounded-3xl bg-white border border-[#F2E3D0] shadow-[0_15px_35px_-20px_rgba(178,98,20,0.18)] hover:shadow-[0_20px_40px_-20px_rgba(178,98,20,0.28)] transition-all flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6F5C4A]">
                Pesanan Terproses
              </span>
              <div className="my-2.5 flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-[#2B221C] tracking-tight font-mono">
                  {isLoading ? '...' : totalOrders}
                </h2>
                <span className="text-sm font-bold text-[#6F5C4A]">order aktif</span>
              </div>
            </div>

            {/* Dapi Mini Maskot: Pencatat Tiket Pesanan */}
            <DapiMiniIllustration role="orders" size={72} className="flex-shrink-0 -mr-1 -mt-1" />
          </div>

          <div className="pt-3.5 border-t border-[#F7EFE6] flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B5560A] bg-[#FFF0E0] px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> Real-time Kasir & WA
            </span>
            <Link
              href="/dashboard/penjualan"
              className="text-[#B5560A] hover:text-[#FF8F28] font-bold flex items-center gap-1 hover:underline"
            >
              Lihat Kasir <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 2 Card Operasional: Menu Aktif & Bahan Kritis dengan Dapi Ilustrasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* Card Menu Terlaris / Aktif */}
        <div className="group relative p-6 sm:p-7 rounded-3xl bg-white border border-[#F2E3D0] shadow-[0_15px_35px_-20px_rgba(178,98,20,0.18)] hover:shadow-[0_20px_40px_-20px_rgba(178,98,20,0.28)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F7EFE6]">
            <div className="flex items-center gap-2.5">
              <DapiMiniIllustration role="recipe" size={38} />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2B221C]">
                Menu & Resep Aktif
              </h3>
            </div>
            <Link
              href="/dashboard/menu"
              className="text-xs font-bold text-[#B5560A] hover:underline flex items-center gap-1"
            >
              Kelola Menu <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-4">
            {bestSellers.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6F5C4A]">
                Belum ada menu yang tercatat di database.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bestSellers.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#FFFBF5] border-2 border-[#F2E3D0] flex flex-col items-center text-center hover:bg-white hover:border-[#FF9F3F] transition-all"
                  >
                    <span className="text-2xl mb-1">{item.emoji || '🍽️'}</span>
                    <span className="text-xs font-bold text-[#2B221C] truncate w-full" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#B5560A] mt-0.5">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="text-[10px] text-[#8C7A6B] mt-0.5">
                      {item.sold > 0 ? `${item.sold} porsi terjual` : item.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Bahan Kritis Dapur dengan Dapi Inventory */}
        <div className="group relative p-6 sm:p-7 rounded-3xl bg-white border border-[#F2E3D0] shadow-[0_15px_35px_-20px_rgba(178,98,20,0.18)] hover:shadow-[0_20px_40px_-20px_rgba(178,98,20,0.28)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F7EFE6]">
            <div className="flex items-center gap-2.5">
              <DapiMiniIllustration role="inventory" size={38} />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2B221C]">
                Bahan Perlu Pembelian (PO)
              </h3>
            </div>
            <Link
              href="/dashboard/purchase-order"
              className="text-xs font-bold text-[#B5560A] hover:underline flex items-center gap-1"
            >
              Kelola PO <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-4">
            {lowStockItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#065F46] font-bold bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0]">
                Semua stok bahan baku di atas batas aman!
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.slice(0, 3).map((b) => {
                  const isZero = b.stock <= 0
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-[#FFFBF5] border-2 border-[#F2E3D0] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#2B221C] truncate">{b.name}</p>
                        <p className="text-[11px] text-[#6F5C4A]">
                          Batas min: {b.stockMinimum || 5} {b.satuan}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isZero ? 'text-rose-600' : 'text-[#B5560A]'
                          }`}
                        >
                          {isZero ? 'Habis (0)' : `Sisa ${b.stock} ${b.satuan}`}
                        </span>
                      </div>

                      <Link
                        href="/dashboard/purchase-order"
                        className="px-3.5 py-1.5 rounded-full bg-[#FF8F28] hover:bg-[#FF9F3F] text-white text-[11px] font-bold shadow-[0_2px_0_#C9620C] active:translate-y-[1px] active:shadow-none transition-all"
                      >
                        Beli PO
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
