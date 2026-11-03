'use client'

import { useMemo } from 'react'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
import { useLaporan } from './hooks/useLaporan'
import { TimeRangeFilter } from './types'
import SummaryCards from './components/SummaryCards'
import TrendChart from './components/TrendChart'
import UsageAndMenuBreakdown from './components/UsageAndMenuBreakdown'
import ChannelAndPaymentSection from './components/ChannelAndPaymentSection'
import RecentSalesTable from './components/RecentSalesTable'
import { generateLaporanPrintHTML } from './services/laporanPrintGenerator'
import { formatRupiah } from '@/lib/mock-data'
import { RefreshCw, AlertCircle, Printer, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const RANGE_OPTIONS: { label: string; value: TimeRangeFilter }[] = [
  { label: '7 Hari Terakhir', value: '7d' },
  { label: '30 Hari Terakhir', value: '30d' },
  { label: 'Bulan Ini', value: 'this_month' },
  { label: 'Semua Waktu', value: 'all' },
]

export default function LaporanPage() {
  const { data, range, isLoading, error, handleRangeChange, handleRefresh } = useLaporan()

  const currentOption = RANGE_OPTIONS.find(o => o.value === range) || RANGE_OPTIONS[0]

  const handlePrint = () => {
    if (!data) return
    const html = generateLaporanPrintHTML(data, currentOption.label)
    const printWindow = window.open('', '_blank', 'width=900,height=800')
    if (!printWindow) {
      window.print()
      return
    }
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 400)
  }

  // Headline hero dinamis berdasarkan omzet dan profit
  const heroStatus = useMemo(() => {
    if (!data || data.summary.totalTransaksi === 0) {
      return {
        badge: 'Belum Ada Transaksi',
        title: 'Belum ada transaksi di periode ini',
        subtitle: 'Catat transaksi di kasir penjualan atau ubah filter periode untuk melihat kinerja finansial.',
        mood: 'khawatir' as const,
      }
    }
    if (data.summary.totalProfit > 0 && data.summary.profitMargin >= 30) {
      return {
        badge: 'Kinerja Finansial Prima',
        title: `Profit Bersih ${formatRupiah(data.summary.totalProfit)} (${data.summary.profitMargin}%)`,
        subtitle: `Total omzet tercatat ${formatRupiah(data.summary.totalRevenue)} dari ${data.summary.totalTransaksi} transaksi penjualan selesai.`,
        mood: 'senang' as const,
      }
    }
    return {
      badge: 'Rekapitulasi Keuangan Dapur',
      title: 'Analisis Laba Bersih & Arus Finansial',
      subtitle: `Omzet ${formatRupiah(data.summary.totalRevenue)} dengan efisiensi HPP resep terpantau aktif.`,
      mood: 'senang' as const,
    }
  }, [data])

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Laporan & Statistik Keuangan"
        subtitle="Analisis real-time omzet, estimasi profit bersih, margin laba, dan efisiensi konsumsi bahan baku"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-7xl mx-auto">
        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#FDE8E4] border border-[#FAD3CB] text-[#B3361B] text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Gagal Mengambil Data Laporan</p>
                <p className="text-[11px] text-[#D8431F] mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3.5 py-1.5 rounded-xl bg-[#D8431F] text-white font-bold text-xs hover:bg-[#c03917] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Hero Section dengan Maskot Dapi */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[180px] shadow-xs">
          <div className="absolute right-48 top-5 w-16 h-16 rounded-full bg-[#FF7A59] hidden md:block opacity-80" />
          <div className="absolute right-80 bottom-2 w-10 h-10 rounded-full bg-[#FFE17D] hidden md:block" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[#2B1D00] text-xs font-bold mb-3">
              <span>{heroStatus.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2B1D00] tracking-tight leading-tight">
              {heroStatus.title}
            </h2>
            <p className="text-sm font-medium text-[#2B1D00]/85 mt-2 max-w-md">
              {heroStatus.subtitle}
            </p>

            {/* Quick Hero Metrics */}
            {data && (
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-[#2B1D00]">
                <div className="px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-xs">
                  <span>Omzet: </span>
                  <span className="font-black">{formatRupiah(data.summary.totalRevenue)}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-xs">
                  <span>Margin: </span>
                  <span className="font-black">{data.summary.profitMargin}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-xs">
                  <span>Transaksi: </span>
                  <span className="font-black">{data.summary.totalTransaksi} Pesanan</span>
                </div>
              </div>
            )}
          </div>

          {/* Maskot Dapi peeking */}
          <div className="absolute -bottom-2 -right-4 sm:right-2 md:right-8 w-40 sm:w-48 md:w-56 pointer-events-none select-none">
            <DapiMascot mood={heroStatus.mood} className="w-full h-auto drop-shadow-md" />
          </div>
        </section>

        {/* Controls Bar: Filter Periode & Action Buttons */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE6DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Periode:</span>
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleRangeChange(opt.value)}
                className={clsx(
                  'px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap',
                  range === opt.value
                    ? 'bg-[#2B1D00] text-white shadow-xs'
                    : 'bg-[#F7F5F0] text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 justify-end flex-shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-full bg-[#FFF6D6] hover:bg-[#FFE49A] text-[#8A5A00] font-black text-xs flex items-center gap-2 cursor-pointer transition-all border border-[#FFE49A] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-full bg-[#D8431F] hover:bg-[#c03917] text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </section>

        {/* Loading State Skeleton */}
        {isLoading && !data ? (
          <div className="rounded-[28px] bg-white border border-[#EBE6DC] py-20 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#FFB800]" />
            <p className="text-xs font-bold text-slate-600">
              Menghitung rekapitulasi keuangan dapur dari database Supabase...
            </p>
          </div>
        ) : (
          data && (
            <>
              {/* 1. Summary Cards (6 Metrik Utama) */}
              <SummaryCards summary={data.summary} />

              {/* 2. Tren Omzet & Profit Area Chart */}
              <TrendChart trend={data.trend} rangeLabel={currentOption.label} />

              {/* 3. Bahan Usage & Menu Terlaris Breakdown */}
              <UsageAndMenuBreakdown
                bahanUsage={data.bahanUsage}
                menuBreakdown={data.menuBreakdown}
              />

              {/* 4. Saluran Penjualan & Preferensi Pembayaran */}
              <ChannelAndPaymentSection
                channelBreakdown={data.channelBreakdown}
                paymentBreakdown={data.paymentBreakdown}
              />

              {/* 5. Transaksi Penjualan Terakhir */}
              <RecentSalesTable sales={data.recentSales} />
            </>
          )
        )}
      </main>
    </div>
  )
}
