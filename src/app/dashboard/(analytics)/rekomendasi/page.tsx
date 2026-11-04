'use client'

import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
import { useRekomendasi } from './hooks/useRekomendasi'
import { RekomendasiTipe } from './types'
import {
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

const TIPE_CONFIG: Record<
  RekomendasiTipe,
  { icon: React.ElementType; colorCls: string; badgeCls: string; iconBg: string }
> = {
  Stok: {
    icon: Package,
    colorCls: 'text-[#0284C7]',
    badgeCls: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
  },
  Keuangan: {
    icon: DollarSign,
    colorCls: 'text-[#8A5A00]',
    badgeCls: 'bg-[#FFF6D6] text-[#8A5A00] border-[#FFE49A]',
    iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
  },
  Penjualan: {
    icon: TrendingUp,
    colorCls: 'text-[#FF6B00]',
    badgeCls: 'bg-[#FFF0E6] text-[#FF6B00] border-[#FFD9C7]',
    iconBg: 'bg-[#FFF0E6] text-[#FF6B00]',
  },
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  tinggi: { label: 'Prioritas Tinggi', cls: 'bg-[#FEF4F2] text-[#D8431F] border-[#F9C2B8]' },
  sedang: { label: 'Prioritas Sedang', cls: 'bg-[#FFF6D6] text-[#8A5A00] border-[#FFE49A]' },
  rendah: { label: 'Prioritas Rendah', cls: 'bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]' },
}

export default function RekomendasiPage() {
  const { items, summary, filter, setFilter, isLoading, error, refresh } = useRekomendasi()

  const heroStatus = {
    mood: (summary.kritisCount > 0 ? 'khawatir' : 'senang') as 'khawatir' | 'senang',
    title:
      summary.kritisCount > 0
        ? `Ada ${summary.kritisCount} Tindakan Kritis Dapur!`
        : `${summary.total} Rekomendasi Siap Dijalankan`,
    subtitle:
      summary.kritisCount > 0
        ? 'Sistem mendeteksi indikasi stok menipis, selisih persediaan, atau tagihan tempo yang perlu segera Anda selesaikan.'
        : 'Analisis cerdas dari stok gudang, tren pesanan kasir, dan profitabilitas menu untuk meningkatkan efisiensi operasional.',
  }

  const STAT_CARDS = [
    {
      key: 'all' as const,
      label: 'Total Insight',
      value: summary.total,
      unit: 'anjuran',
      hint: 'Semua rekomendasi aktif',
      icon: Lightbulb,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FFB800] bg-[#FFFBF2]',
    },
    {
      key: 'Stok' as const,
      label: 'Stok & Pasokan',
      value: summary.stokCount,
      unit: 'isu',
      hint: 'Kebutuhan reorder bahan',
      icon: Package,
      iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
      activeRing: 'ring-2 ring-[#0284C7] bg-[#F0F9FF]',
    },
    {
      key: 'Keuangan' as const,
      label: 'Keuangan & Biaya',
      value: summary.keuanganCount,
      unit: 'tagihan',
      hint: 'Tempo faktur distributor',
      icon: DollarSign,
      iconBg: 'bg-[#FFF0E6] text-[#FF6B00]',
      activeRing: 'ring-2 ring-[#FF6B00] bg-[#FFF9F5]',
    },
    {
      key: 'Penjualan' as const,
      label: 'Pola Penjualan',
      value: summary.penjualanCount,
      unit: 'menu',
      hint: 'Optimalisasi omzet & margin',
      icon: TrendingUp,
      iconBg: 'bg-[#E8F5E4] text-[#2D7A1F]',
      activeRing: 'ring-2 ring-[#228B5B] bg-[#F4FAF2]',
    },
  ]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Rekomendasi Pintar Dapur"
        subtitle="Insight dan anjuran prediktif berbasis data riil stok gudang, tren penjualan kasir, dan kalkulasi profitabilitas"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Gagal Mengambil Rekomendasi</p>
              <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Hero Section dengan Maskot Dapi */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[180px] shadow-xs">
          <div className="absolute right-48 top-5 w-16 h-16 rounded-full bg-[#FF7A59] hidden md:block opacity-80" />
          <div className="absolute right-36 top-16 w-28 h-8 rounded-full bg-white/90 hidden md:block" />

          {/* Maskot Dapi */}
          <div className="absolute right-4 sm:right-8 bottom-0 pointer-events-none">
            <DapiMascot
              width={150}
              mood={heroStatus.mood}
              className="translate-y-6 drop-shadow-xs"
            />
          </div>

          <div className="relative space-y-3 pr-28 sm:pr-48">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#2B1D00]/10 flex items-center justify-center text-[#2B1D00]">
                <Lightbulb className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Analisis & Tindakan Strategis
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D00] tracking-tight leading-tight">
              {heroStatus.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#4D3300] font-medium max-w-xl">
              {heroStatus.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {summary.kritisCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D8431F] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {summary.kritisCount} tindakan kritis
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#2B1D00] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#228B5B]" />
                  Operasional dapur stabil
                </span>
              )}

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                {summary.total} insight terdeteksi
              </span>
            </div>
          </div>
        </section>

        {/* 4 Stat Cards Interaktif */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            const isSelected = filter === card.key

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setFilter(card.key as RekomendasiTipe | 'all')}
                className={clsx(
                  'text-left p-4 sm:p-5 rounded-[22px] bg-white border border-[#EBE6DC] shadow-xs transition-all hover:shadow-md cursor-pointer',
                  isSelected && card.activeRing
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A7062]">
                    {card.label}
                  </span>
                  <span className={clsx('w-8 h-8 rounded-xl flex items-center justify-center', card.iconBg)}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-[#8C8275]">{card.unit}</span>
                </div>
                <p className="text-[11px] text-[#A69C8E] mt-1.5 font-medium">{card.hint}</p>
              </button>
            )
          })}
        </div>

        {/* Action Header: Filter Pills & Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all', label: `Semua (${summary.total})` },
              { key: 'Stok', label: `Stok Bahan (${summary.stokCount})` },
              { key: 'Keuangan', label: `Keuangan & Tagihan (${summary.keuanganCount})` },
              { key: 'Penjualan', label: `Pola Penjualan (${summary.penjualanCount})` },
            ].map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key as RekomendasiTipe | 'all')}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                  filter === f.key
                    ? 'bg-[#2B261F] text-white shadow-xs'
                    : 'bg-white text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="px-4 py-2 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-[#7A7062] hover:text-[#2B261F] hover:bg-[#FFF9EC] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF6B00]' : ''}`} />
            <span>Perbarui Analisis</span>
          </button>
        </div>

        {/* Loading State or Recommendation Cards */}
        {isLoading && !items.length ? (
          <div className="rounded-[32px] bg-white border border-[#EBE6DC] p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <RefreshCw className="w-7 h-7 animate-spin text-[#FF6B00]" />
            <p className="text-xs font-semibold text-[#7A7062]">
              Menganalisis indikator performa & rekomendasi dapur...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs p-16 text-center text-[#8C8275]">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#2B261F]">Tidak ada anjuran mendesak saat ini</p>
            <p className="text-xs text-[#8C8275] mt-1 max-w-sm mx-auto">
              Semua persediaan stok bahan, tagihan supplier, dan pola menu dapur berada dalam kondisi optimal.
            </p>
          </div>
        ) : (
          /* Recommendation Cards List */
          <div className="space-y-4">
            {items.map(r => {
              const tipeCfg = TIPE_CONFIG[r.tipe]
              const priCfg = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.sedang
              const Icon = tipeCfg.icon

              return (
                <div
                  key={r.id}
                  className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-xs p-5 sm:p-6 space-y-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-start gap-3.5">
                      <div className={clsx('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold', tipeCfg.iconBg)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#2B261F] group-hover:text-[#FF6B00] transition-colors">
                          {r.judul}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={clsx(
                              'inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs',
                              tipeCfg.badgeCls
                            )}
                          >
                            {r.tipe}
                          </span>
                          <span
                            className={clsx(
                              'inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs',
                              priCfg.cls
                            )}
                          >
                            {priCfg.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Gauge */}
                    <div className="flex-shrink-0 text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-[#F0EBE1]">
                      <p className="text-[10px] text-[#8C8275] font-bold uppercase tracking-wider">
                        Tingkat Akurasi
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-2 bg-[#F5F2EB] rounded-full overflow-hidden p-0.5 border border-[#EBE6DC]">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] rounded-full"
                            style={{ width: `${r.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-[#FF6B00] font-mono">
                          {r.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#7A7062] leading-relaxed sm:pl-14 font-medium">
                    {r.deskripsi}
                  </p>

                  {r.actionLink && (
                    <div className="sm:pl-14 pt-1">
                      <Link
                        href={r.actionLink}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9EC] border border-[#FFE49A]/80 text-xs font-bold text-[#8A5A00] hover:text-[#2B1D00] hover:bg-[#FFEFC7] transition-all shadow-xs"
                      >
                        <span>{r.actionLabel || 'Tindak lanjuti'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
