'use client'

import clsx from 'clsx'
import { ChefHat, Sparkles } from 'lucide-react'
import DapiMascot from './DapiMascot'
import DapiHead from './DapiHead'
import SunCloud from './SunCloud'

interface SkeletonProps {
  className?: string
}

/**
 * Elemen dasar skeleton dengan efek shimmer animasi dan warna hangat tema DapurTwin
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-2xl bg-gradient-to-r from-[#F2ECE1] via-[#EAE1D0]/70 to-[#F2ECE1] bg-[length:200%_100%]',
        className
      )}
    />
  )
}

interface MascotSkeletonProps {
  variant?: 'banner' | 'card' | 'tasks' | 'fullscreen' | 'inline'
  message?: string
  submessage?: string
  className?: string
}

/**
 * Loading Skeleton Utama Menggunakan Maskot Dapi
 * Menghadirkan Dapi koki lucu yang aktif menyapa pengguna saat data sedang dimuat.
 */
export function MascotSkeleton({
  variant = 'banner',
  message,
  submessage,
  className,
}: MascotSkeletonProps) {
  if (variant === 'inline') {
    return (
      <div
        className={clsx(
          'inline-flex items-center gap-2.5 rounded-full bg-[#FFF6D6] border border-[#FFE49A] px-3.5 py-1.5 shadow-2xs',
          className
        )}
      >
        <DapiHead size={22} mood="senang" className="anim-dapi-float shrink-0" />
        <span className="text-xs font-bold text-kopi">
          {message || 'Dapi lagi memuat data...'}
        </span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={clsx(
          'relative overflow-hidden rounded-[28px] bg-white border border-[#EBE3D7] p-6 shadow-[0_4px_20px_rgba(140,100,30,0.06)] flex flex-col justify-between space-y-4',
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <DapiHead size={44} mood="senang" className="anim-dapi-float anim-dapi-glow" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-kopi">
                {message || 'Dapi Menyiapkan Data'}
              </p>
              <p className="text-[11px] text-kopi-muted">
                {submessage || 'Sedang mengambil catatan dapur...'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF6D6] text-[10px] font-bold text-kuning-teks border border-[#FFE49A]">
            <Sparkles className="w-3 h-3 text-kuning" /> Memuat
          </span>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-[#F4EFE6]">
          <Skeleton className="h-4 w-3/4 rounded-full" />
          <Skeleton className="h-3.5 w-1/2 rounded-full" />
          <Skeleton className="h-9 w-full rounded-full mt-2" />
        </div>
      </div>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <div
        className={clsx(
          'min-h-[380px] w-full flex flex-col items-center justify-center p-8 text-center space-y-4',
          className
        )}
      >
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-kuning/30 to-koral/15 blur-xl" />
          <DapiMascot
            width={160}
            mood="senang"
            className="relative anim-dapi-float anim-dapi-glow drop-shadow-[0_12px_24px_rgba(255,184,0,0.35)]"
          />
        </div>

        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-xl font-black text-kopi">
            {message || 'Dapi Sedang Menyiapkan Dapur...'}
          </h3>
          <p className="text-xs text-kopi-muted font-medium">
            {submessage || 'Mohon tunggu sebentar selagi kami mengumpulkan data stok dan transaksi Anda.'}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-2.5 w-20 rounded-full" />
          <Skeleton className="h-2.5 w-12 rounded-full bg-kuning/60" />
          <Skeleton className="h-2.5 w-16 rounded-full" />
        </div>
      </div>
    )
  }

  if (variant === 'tasks') {
    return (
      <section
        aria-label="Loading Tugas dari Dapi"
        className={clsx('flex w-full min-w-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-kartu', className)}
      >
        {/* Header Kuning Khas Tugas Dari Dapi */}
        <div className="relative h-40 overflow-hidden bg-kuning px-6 py-5">
          <SunCloud className="left-[46%] top-4 h-12 w-28 opacity-75" />
          <span className="relative block text-[13px] font-semibold text-[#5A3E05]">
            Dari Dapi
          </span>
          <div className="relative mt-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-kopi">
                {message || 'Dapi cek dapur dulu…'}
              </h2>
            </div>
            <p className="text-xs text-[#5A3E05]/90 font-medium">
              {submessage || 'Sedang menghitung sisa bahan & transaksi hari ini'}
            </p>
          </div>

          {/* Maskot Dapi Koki Melayang */}
          <DapiMascot
            width={168}
            mood="senang"
            className="absolute -bottom-14 right-4 hidden sm:block anim-dapi-float anim-dapi-glow"
          />
        </div>

        {/* List Tugas Shimmer */}
        <div className="flex flex-col px-3.5 pb-3.5 pt-2 divide-y divide-[#F6ECDD]">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-3">
              <Skeleton className="h-11 w-11 rounded-[14px] shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-3/5 rounded-full" />
                <Skeleton className="h-3 w-2/5 rounded-full" />
              </div>
              <Skeleton className="h-9 w-24 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Default: Banner Card Menarik dengan Maskot Dapi
  return (
    <section
      className={clsx(
        'relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FFF8E7] via-white to-[#FFF4D6] border border-[#FFE49A] p-6 sm:p-7 shadow-[0_8px_28px_rgba(140,100,30,0.08)]',
        className
      )}
    >
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE49A]/80 text-[#8A5A00] text-xs font-bold border border-[#FFD25F]">
            <span>Asisten Dapi Sedang Bekerja</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-kopi tracking-tight">
              {message || 'Menyiapkan Data Dapur Anda...'}
            </h3>
            <p className="text-xs sm:text-sm text-kopi-muted font-medium">
              {submessage || 'Dapi sedang menyelaraskan resep, batas aman stok, dan riwayat pesanan.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        <div className="relative shrink-0 flex items-center justify-center">
          <div className="absolute -inset-3 rounded-full bg-kuning/25 blur-xl animate-pulse" />
          <DapiMascot
            width={140}
            mood="senang"
            className="relative anim-dapi-float anim-dapi-glow drop-shadow-[0_8px_16px_rgba(255,184,0,0.35)]"
          />
        </div>
      </div>
    </section>
  )
}

// Alias agar fleksibel dipanggil dengan nama `DapiMascotSkeleton` atau `MascotSkeleton`
export const DapiMascotSkeleton = MascotSkeleton

/**
 * Skeleton untuk Kartu Omzet Hari Ini di Dashboard
 */
export function OmzetCardSkeleton() {
  return (
    <section className="flex flex-1 flex-col gap-2 rounded-[28px] bg-white p-[22px] shadow-kartu border border-slate-100/70">
      <Skeleton className="h-4 w-28 rounded-full" />
      <div className="flex items-baseline gap-2.5 my-1">
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-32 rounded-full" />
      <div className="mt-2 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
    </section>
  )
}

/**
 * Skeleton untuk Kartu Kembaran Dapur di Dashboard
 */
export function KembaranCardSkeleton() {
  return (
    <section className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-[28px] bg-kuning-muda p-[22px]">
      <svg aria-hidden="true" width="130" height="84" viewBox="0 0 140 90" className="absolute -right-3 -top-2 opacity-60">
        <circle cx="50" cy="45" r="38" fill="none" stroke="#FFE19A" strokeWidth="9" />
        <circle cx="90" cy="45" r="38" fill="none" stroke="#FFE19A" strokeWidth="9" strokeDasharray="13 9" />
      </svg>
      <Skeleton className="h-4 w-36 rounded-full bg-white/60" />
      <Skeleton className="h-7 w-48 rounded-xl bg-white/80 my-1" />
      <Skeleton className="h-3.5 w-64 rounded-full bg-white/60" />
      <Skeleton className="mt-auto h-[38px] w-36 rounded-full bg-white self-start" />
    </section>
  )
}

/**
 * Skeleton untuk Strip Pesanan Berjalan (Active Order Strip)
 */
export function ActiveOrderStripSkeleton() {
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-[28px] bg-kuning px-[18px] py-3.5 shadow-sm">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-koral shadow-xs animate-pulse">
        <ChefHat className="h-5 w-5" />
      </span>
      <div className="flex-1 space-y-1.5 min-w-[200px]">
        <Skeleton className="h-4 w-52 rounded-full bg-white/80" />
        <Skeleton className="h-3 w-36 rounded-full bg-white/60" />
      </div>
      <Skeleton className="h-[38px] w-28 rounded-full bg-white shrink-0" />
    </section>
  )
}

/**
 * Skeleton untuk Status Flow Stat Cards (4 kolom)
 */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={clsx('grid gap-4', count === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6')}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-[28px] p-5 bg-white border border-[#EBE6DC] shadow-xs flex flex-col justify-between min-h-[140px] space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-9 w-16 rounded-xl" />
            <Skeleton className="h-3 w-32 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  cols?: number
  withMascot?: boolean
  title?: string
}

/**
 * Skeleton untuk Table (PO, Tagihan, Supplier, Stok-Log, Riwayat)
 * Dilengkapi kehadiran Maskot Dapi ramah di bagian header.
 */
export function TableSkeleton({
  rows = 6,
  withMascot = true,
  title,
}: TableSkeletonProps) {
  return (
    <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-[0_14px_34px_rgba(120,80,30,0.06)] overflow-hidden">
      {/* Header Table dengan Maskot Dapi */}
      <div className="p-5 sm:p-6 border-b border-[#F4EFE6] flex items-center justify-between gap-4">
        {withMascot ? (
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <DapiHead size={34} mood="senang" className="anim-dapi-float" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-kopi">
                  {title || 'Dapi Sedang Memuat Data...'}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-kuning animate-ping" />
              </div>
              <p className="text-[11px] text-kopi-muted font-medium">
                Sinkronisasi tabel dengan catatan dapur
              </p>
            </div>
          </div>
        ) : (
          <Skeleton className="h-5 w-40 rounded-full" />
        )}

        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Row list */}
      <div className="p-4 sm:p-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FCFAF5] border border-[#F2ECE1]"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3 rounded-full" />
                <Skeleton className="h-3 w-1/4 rounded-full" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface CardGridSkeletonProps {
  count?: number
  cardHeight?: string
  withMascot?: boolean
}

/**
 * Skeleton untuk Grid Card (Bahan, Menu, Kondisi Bahan, Proses Pesanan)
 * Dilengkapi sapaan maskot Dapi koki di atas grid.
 */
export function CardGridSkeleton({
  count = 6,
  cardHeight = 'h-64',
  withMascot = true,
}: CardGridSkeletonProps) {
  return (
    <div className="space-y-4">
      {withMascot && (
        <div className="flex items-center justify-between p-4 rounded-[24px] bg-[#FFF8E7] border border-[#FFE49A] shadow-xs">
          <div className="flex items-center gap-3">
            <DapiHead size={34} mood="senang" className="anim-dapi-float shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-kopi">Menyiapkan Katalog...</p>
              <p className="text-[11px] text-kopi-muted font-medium">
                Dapi sedang mengecek ketersediaan kartu & bahan dapur
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#8A5A00] bg-white px-3 py-1 rounded-full shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-koral animate-pulse" />
            <span>Memuat data</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_4px_20px_rgba(120,80,30,0.06)] p-5 sm:p-6 flex flex-col justify-between space-y-4',
              cardHeight
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-5 w-3/4 rounded-full" />
                <Skeleton className="h-3.5 w-1/2 rounded-full" />
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#F2ECE1]">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton untuk Halaman Laporan Analytics
 */
export function LaporanSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner Maskot */}
      <MascotSkeleton
        variant="banner"
        message="Dapi Sedang Menganalisis Laporan Keuangan"
        submessage="Menghitung omzet, laba kotor, HPP aktual, serta efisiensi pengeluaran bahan dapur."
      />

      {/* 6 Metrik Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-white border border-[#EBE6DC] p-4 space-y-3 shadow-xs">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="rounded-3xl bg-white border border-[#EBE6DC] p-6 space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-44 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-[#EBE6DC] p-6 space-y-3 shadow-xs">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="rounded-3xl bg-white border border-[#EBE6DC] p-6 space-y-3 shadow-xs">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton untuk Halaman Rekomendasi AI & Simulasi
 */
export function RekomendasiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <MascotSkeleton
        variant="banner"
        message="Asisten AI Sedang Mengolah Rekomendasi"
        submessage="Dapi menganalisis tren konsumsi bahan dan memperkirakan kebutuhan kuliner dapur Anda."
      />

      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[30px] bg-white border border-[#EBE6DC] p-6 sm:p-7 shadow-[0_4px_20px_rgba(120,80,30,0.06)] space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton untuk POS Penjualan Menu Grid
 */
export function PenjualanKatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-[#EBE6DC] p-3.5 flex flex-col justify-between min-h-[170px] space-y-3 shadow-2xs"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#F2ECE1]">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
