'use client'

import Topbar from '@/components/Topbar'
import CustomSelect from '@/components/ui/CustomSelect'
import { useLaporan } from './hooks/useLaporan'
import { TimeRangeFilter } from './types'
import SummaryCards from './components/SummaryCards'
import TrendChart from './components/TrendChart'
import UsageAndMenuBreakdown from './components/UsageAndMenuBreakdown'
import ChannelAndPaymentSection from './components/ChannelAndPaymentSection'
import RecentSalesTable from './components/RecentSalesTable'
import { RefreshCw, AlertCircle, Download } from 'lucide-react'

const RANGE_OPTIONS = [
  { label: '7 Hari Terakhir', value: '7d' },
  { label: '30 Hari Terakhir', value: '30d' },
  { label: 'Bulan Ini', value: 'this_month' },
  { label: 'Semua Waktu', value: 'all' },
]

export default function LaporanPage() {
  const { data, range, isLoading, error, handleRangeChange, handleRefresh } = useLaporan()

  const currentOption = RANGE_OPTIONS.find(o => o.value === range) || RANGE_OPTIONS[0]

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Laporan & Statistik Dapur"
        subtitle="Analisis real-time omzet, estimasi profit bersih, konsumsi bahan baku, dan performa menu dari database"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-7xl mx-auto">
        {/* Controls Bar: Filter Waktu & Action Buttons */}
        <div className="clay-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Periode Laporan:
            </span>
            <div className="w-48">
              <CustomSelect
                value={currentOption.label}
                onChange={selectedLabel => {
                  const match = RANGE_OPTIONS.find(o => o.label === selectedLabel)
                  if (match) handleRangeChange(match.value as TimeRangeFilter)
                }}
                options={RANGE_OPTIONS.map(o => o.label)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3.5 py-2 clay-btn rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 clay-btn rounded-xl text-xs font-bold text-[#FF8F2B] bg-[#FFF6EC] hover:bg-[#FFE2C2]/50 border border-[#FFE2C2] flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Gagal Mengambil Data Laporan</p>
              <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && !data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="clay-card p-6 h-28 animate-pulse bg-slate-100" />
              ))}
            </div>
            <div className="clay-card p-6 h-72 animate-pulse bg-slate-100" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="clay-card p-6 h-64 animate-pulse bg-slate-100" />
              <div className="clay-card p-6 h-64 animate-pulse bg-slate-100" />
            </div>
          </div>
        ) : (
          data && (
            <>
              {/* 1. Summary Cards */}
              <SummaryCards summary={data.summary} />

              {/* 2. Tren Omzet & Profit */}
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
