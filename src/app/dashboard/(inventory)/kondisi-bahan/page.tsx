'use client'

import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
import KondisiCardGrid from './components/KondisiCardGrid'
import { useKondisiBahan } from './hooks/useKondisiBahan'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
  Package2,
  Clock,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'

export default function KondisiBahanPage() {
  const {
    list,
    counts,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    filterFreshness,
    setFilterFreshness,
    refresh,
    handleKurangiStok,
  } = useKondisiBahan()

  // Status & Mood Dapi
  const hasCritical = counts.expired > 0
  const hasWarning = counts.mendekati > 0
  const heroStatus = {
    mood: (hasCritical ? 'khawatir' : 'senang') as 'khawatir' | 'senang',
    title: hasCritical
      ? `${counts.expired} Bahan Telah Kadaluarsa!`
      : hasWarning
      ? `${counts.mendekati} Bahan Perlu Segera Diolah`
      : 'Semua Stok Bahan Baku Aman & Segar',
    subtitle: hasCritical
      ? 'Ada stok bahan yang melewati batas kedaluwarsa. Segera musnahkan atau sesuaikan stok agar kualitas masakan terjaga.'
      : hasWarning
      ? 'Beberapa persediaan dapur mendekati batas kadaluarsa (< 3 hari). Prioritaskan untuk menu hari ini.'
      : 'Sistem memantau shelf-life dan estimasi tanggal kedaluwarsa secara otomatis untuk setiap batch masuk.',
  }

  const STAT_CARDS = [
    {
      key: 'segar',
      label: 'Kondisi Segar',
      value: counts.segar,
      unit: 'bahan',
      hint: 'Masa simpan aman & prima',
      icon: CheckCircle,
      iconBg: 'bg-[#E8F5E4] text-[#2D7A1F]',
      activeRing: 'ring-2 ring-[#228B5B] bg-[#F4FAF2]',
    },
    {
      key: 'mendekati_expire',
      label: 'Segera Olah',
      value: counts.mendekati,
      unit: 'bahan',
      hint: 'Exp < 3 hari lagi',
      icon: AlertTriangle,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FFB800] bg-[#FFFBF2]',
    },
    {
      key: 'kadaluarsa',
      label: 'Kadaluarsa',
      value: counts.expired,
      unit: 'batch',
      hint: 'Perlu pemusnahan stok',
      icon: XCircle,
      iconBg: 'bg-[#FDE8E4] text-[#D8431F]',
      activeRing: 'ring-2 ring-[#D8431F] bg-[#FEF4F2]',
    },
    {
      key: 'low_stock',
      label: 'Stok Minimum',
      value: counts.lowStock,
      unit: 'item',
      hint: 'Stok <= batas minimum',
      icon: Package2,
      iconBg: 'bg-[#FFF0E6] text-[#FF6B00]',
      activeRing: 'ring-2 ring-[#FF6B00] bg-[#FFF9F5]',
    },
  ]

  const FILTER_TABS = [
    { key: 'all', label: `Semua (${counts.total})` },
    { key: 'segar', label: `Segar (${counts.segar})` },
    { key: 'mendekati_expire', label: `Mendekati Expire (${counts.mendekati})` },
    { key: 'kadaluarsa', label: `Kadaluarsa (${counts.expired})` },
    { key: 'sudah_dimusnahkan', label: `Dimusnahkan (${counts.dimusnahkan})` },
  ]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Kondisi Bahan & Inventory"
        subtitle="Analisis masa simpan (shelf-life), prediksi tanggal kedaluwarsa AI sejak barang masuk, dan monitoring level stok gudang"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk mengakses data bahan baku.
              </span>
            </div>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1.5 hover:bg-amber-700 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Akun
            </Link>
          </div>
        )}

        {/* Notifikasi Error */}
        {error && userEmail && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refresh()}
              className="font-bold underline flex items-center gap-1 hover:text-rose-900 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Muat ulang
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
                <Clock className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Monitoring Shelf-Life & Mutu Bahan
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D00] tracking-tight leading-tight">
              {heroStatus.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#4D3300] font-medium max-w-xl">
              {heroStatus.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#2B1D00] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#228B5B]" />
                {counts.segar} bahan segar
              </span>

              {counts.mendekati > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6D6] px-3.5 py-1.5 text-xs font-bold text-[#8A5A00] border border-[#FFE49A]/80 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
                  {counts.mendekati} mendekati expire
                </span>
              )}

              {counts.expired > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D8431F] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs">
                  <XCircle className="w-3.5 h-3.5" />
                  {counts.expired} batch kadaluarsa
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            const isSelected = filterFreshness === card.key

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  if (card.key === 'low_stock') return
                  setFilterFreshness(filterFreshness === card.key ? 'all' : card.key)
                }}
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

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_TABS.map(tab => {
              const active = filterFreshness === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterFreshness(tab.key)}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer',
                    active
                      ? 'bg-[#2B261F] text-white shadow-xs'
                      : 'bg-white text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama bahan / supplier..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Loading Spinner or Grid Cards */}
        {loading ? (
          <div className="rounded-[32px] bg-white border border-[#EBE6DC] p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#FF6B00]" />
            <p className="text-xs font-semibold text-[#7A7062]">
              Menganalisis masa simpan dan memuat bahan...
            </p>
          </div>
        ) : (
          <KondisiCardGrid
            list={list}
            onKurangiStok={handleKurangiStok}
            onRefresh={refresh}
          />
        )}
      </main>
    </div>
  )
}
