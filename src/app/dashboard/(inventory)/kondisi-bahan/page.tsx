'use client'

import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiHead from '@/components/ui/DapiHead'
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
  Trash2,
} from 'lucide-react'
import clsx from 'clsx'
import { CardGridSkeleton } from '@/components/ui/Skeleton'

const STATUS_CARDS = [
  {
    key: 'segar',
    label: 'Kondisi Segar',
    hint: 'Masa simpan aman & prima',
    Icon: CheckCircle,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
  {
    key: 'mendekati_expire',
    label: 'Segera Olah',
    hint: 'Exp < 3 hari lagi',
    Icon: AlertTriangle,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'kadaluarsa',
    label: 'Kadaluarsa',
    hint: 'Perlu pemusnahan stok',
    Icon: XCircle,
    tint: 'bg-[#FDE8E4]',
    on: 'bg-[#D8431F] text-white',
  },
  {
    key: 'low_stock',
    label: 'Stok Kritis',
    hint: 'Stok ≤ batas minimum',
    Icon: Package2,
    tint: 'bg-[#F2D9CC]',
    on: 'bg-[#C2502F] text-white',
  },
] as const

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

  const FILTER_TABS = [
    { key: 'all', label: `Semua (${counts.total})` },
    { key: 'segar', label: `Segar (${counts.segar})` },
    { key: 'mendekati_expire', label: `Mendekati Expire (${counts.mendekati})` },
    { key: 'kadaluarsa', label: `Kadaluarsa (${counts.expired})` },
    { key: 'sudah_dimusnahkan', label: `Dimusnahkan (${counts.dimusnahkan})` },
  ]

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Kondisi & Kesegaran Bahan"
        subtitle="Pantau bahan yang menipis atau mendekati tanggal kedaluwarsa sebelum rusak"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
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

        {/* Banner utama: Dapi keluar dari kotak */}
        <section className="relative mt-10 sm:mt-12 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-5 sm:p-8 md:p-10 md:max-w-[58%]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-kopi">
              {heroStatus.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              {heroStatus.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Stok Segar:</span>
                <span className="font-mono font-black text-[#7F9A2E]">{counts.segar}</span>
              </div>
              {counts.mendekati > 0 && (
                <div className="h-11 px-5 rounded-full bg-[#FFF6D6] text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap border border-[#FFE49A]/80">
                  <span>Mendekati Expire:</span>
                  <span className="font-mono font-black text-[#8A5A00]">{counts.mendekati}</span>
                </div>
              )}
              {counts.expired > 0 && (
                <div className="h-11 px-5 rounded-full bg-[#D8431F] text-white text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                  <span>Kadaluarsa:</span>
                  <span className="font-mono font-black text-white">{counts.expired} batch</span>
                </div>
              )}
            </div>
          </div>

          {/* Kartu status miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">MUTU</span>
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
        <div data-tour="kondisi-status-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_CARDS.map(st => {
            const active = filterFreshness === st.key
            const val =
              st.key === 'segar'
                ? counts.segar
                : st.key === 'mendekati_expire'
                ? counts.mendekati
                : st.key === 'kadaluarsa'
                ? counts.expired
                : counts.lowStock

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => {
                  if (st.key === 'low_stock') return
                  setFilterFreshness(filterFreshness === st.key ? 'all' : st.key)
                }}
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

        {/* Filter Pills & Search Bar */}
        <div data-tour="kondisi-filter-bar" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

        {/* Loading Skeleton or Grid Cards */}
        {loading ? (
          <CardGridSkeleton count={6} cardHeight="h-72" />
        ) : (
          <div data-tour="kondisi-card-grid">
            <KondisiCardGrid
              list={list}
              onKurangiStok={handleKurangiStok}
              onRefresh={refresh}
            />
          </div>
        )}
      </main>
    </div>
  )
}
