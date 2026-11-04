'use client'

import Topbar from '@/components/Topbar'
import DapiHead from '@/components/ui/DapiHead'
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

const STATUS_CARDS = [
  {
    key: 'all' as const,
    label: 'Total Insight',
    hint: 'Semua anjuran dapur',
    Icon: Lightbulb,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'Stok' as const,
    label: 'Stok Bahan',
    hint: 'Kebutuhan reorder gudang',
    Icon: Package,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
  {
    key: 'Keuangan' as const,
    label: 'Keuangan & Biaya',
    hint: 'Tempo faktur distributor',
    Icon: DollarSign,
    tint: 'bg-[#F2D9CC]',
    on: 'bg-[#C2502F] text-white',
  },
  {
    key: 'Penjualan' as const,
    label: 'Pola Penjualan',
    hint: 'Optimalisasi omzet & margin',
    Icon: TrendingUp,
    tint: 'bg-[#E3DCF3]',
    on: 'bg-[#6B5BB5] text-white',
  },
] as const

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

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Rekomendasi Pintar Dapur"
        subtitle="Insight dan anjuran prediktif berbasis data riil stok gudang, tren penjualan kasir, dan kalkulasi profitabilitas"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
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

        {/* Banner utama: Dapi keluar dari kotak */}
        <section className="relative mt-10 sm:mt-12 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-6 sm:p-10 md:max-w-[58%]">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-kopi">
              {heroStatus.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              {heroStatus.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={refresh}
                disabled={isLoading}
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw className={clsx('w-4 h-4 flex-shrink-0', isLoading && 'animate-spin')} />
                Analisis Ulang
              </button>
              {summary.kritisCount > 0 ? (
                <div className="h-11 px-5 rounded-full bg-[#D8431F] text-white text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                  <span>Tindakan Kritis:</span>
                  <span className="font-mono font-black text-white">{summary.kritisCount}</span>
                </div>
              ) : (
                <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-[#7F9A2E]" />
                  <span>Operasional Stabil</span>
                </div>
              )}
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Total Insight:</span>
                <span className="font-mono font-black text-kopi">{summary.total}</span>
              </div>
            </div>
          </div>

          {/* Kartu rekomendasi miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">INSIGHT</span>
            <span className="h-2 rounded bg-krim-garis" />
            <span className="h-2 w-[70%] rounded bg-krim-garis" />
            <span className="h-2 w-[85%] rounded bg-krim-garis" />
          </div>

          {/* Dapi menyembul keluar dari atas kotak */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* Status Flow Stats Card Identik PO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_CARDS.map(st => {
            const active = filter === st.key
            const val =
              st.key === 'all'
                ? summary.total
                : st.key === 'Stok'
                ? summary.stokCount
                : st.key === 'Keuangan'
                ? summary.keuanganCount
                : summary.penjualanCount

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setFilter(st.key as RekomendasiTipe | 'all')}
                className={clsx(
                  'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col gap-4 min-h-[140px] transition-all cursor-pointer hover:-translate-y-0.5',
                  active
                    ? clsx(st.on, 'shadow-[0_18px_30px_rgba(43,34,28,0.22)]')
                    : clsx(st.tint, 'text-kopi shadow-[0_6px_14px_rgba(120,80,30,0.08)]')
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'absolute -right-10 -bottom-12 h-36 w-36 rounded-full',
                    active ? 'bg-white/20' : 'bg-white/55'
                  )}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm sm:text-base font-extrabold">{st.label}</span>
                  <span
                    className={clsx(
                      'h-9 w-9 rounded-full flex items-center justify-center',
                      active ? 'bg-white/30' : 'bg-white/60'
                    )}
                  >
                    <st.Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="relative">
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none">
                    {val}
                  </p>
                  <p className={clsx('text-xs mt-1.5 truncate', active ? 'opacity-85' : 'text-kopi-muted')}>
                    {st.hint}
                  </p>
                </div>
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
