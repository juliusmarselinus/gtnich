'use client'

import clsx from 'clsx'

interface SkeletonProps {
  className?: string
}

/**
 * Elemen dasar skeleton dengan efek shimmer animasi dan warna tema DapurTwin
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-2xl bg-gradient-to-r from-[#F2ECE1] via-[#E8DEC8]/60 to-[#F2ECE1] bg-[length:200%_100%]',
        className
      )}
    />
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
          className="relative overflow-hidden rounded-[28px] p-5 bg-[#FBF8F2] border border-[#EBE6DC] shadow-xs flex flex-col justify-between min-h-[140px] space-y-4"
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

/**
 * Skeleton untuk Table (PO, Tagihan, Supplier, Stok-Log, Riwayat)
 */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-[0_14px_34px_rgba(120,80,30,0.06)] overflow-hidden">
      {/* Header Table */}
      <div className="p-5 sm:p-6 border-b border-[#F4EFE6] flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40 rounded-full" />
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

/**
 * Skeleton untuk Grid Card (Bahan, Menu, Kondisi Bahan, Proses Pesanan)
 */
export function CardGridSkeleton({ count = 6, cardHeight = 'h-64' }: { count?: number; cardHeight?: string }) {
  return (
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
  )
}

/**
 * Skeleton untuk Halaman Laporan Analytics
 */
export function LaporanSkeleton() {
  return (
    <div className="space-y-6">
      {/* 6 Metrik Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-white border border-[#EBE6DC] p-4 space-y-3">
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
