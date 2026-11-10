'use client'

import { useState, useMemo } from 'react'
import Topbar from '@/components/Topbar'
import { useProsesPesanan } from './hooks/useProsesPesanan'
import PesananCard from './components/PesananCard'
import { ReceiptModal, orderToReceipt } from '@/app/dashboard/(pos)/penjualan/components/Receipt'
import { PesananWithKebutuhan } from './types'
import DapiHead from '@/components/ui/DapiHead'
import Pagination from '@/components/ui/Pagination'
import {
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  LogIn,
  CookingPot,
  ListOrdered,
  Plus,
  SlidersHorizontal,
  History,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { CardGridSkeleton } from '@/components/ui/Skeleton'

export default function ProsesPesananPage() {
  const {
    pesananList,
    counts,
    loading,
    error,
    userEmail,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    busyOrderId,
    handleUpdateStatus,
    handleTandaiLunas,
    refresh,
  } = useProsesPesanan()

  const [receiptOrder, setReceiptOrder] = useState<PesananWithKebutuhan | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 9

  const paginatedPesanan = useMemo(() => {
    return pesananList.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [pesananList, currentPage, pageSize])

  const STATUS_CARDS = [
    {
      key: 'preorder',
      label: 'Pre-Order Masuk',
      count: counts.preorder,
      hint: 'Pesanan PO belum dimasak',
      Icon: Clock,
      tint: 'bg-[#E3DCF3]',
      on: 'bg-[#6B5BB5] text-white',
    },
    {
      key: 'diproses',
      label: 'Sedang Dimasak',
      count: counts.diproses,
      hint: 'Dalam proses dapur',
      Icon: CookingPot,
      tint: 'bg-[#F2D9CC]',
      on: 'bg-[#C2502F] text-white',
    },
    {
      key: 'selesai',
      label: 'Selesai & Disajikan',
      count: counts.selesai,
      hint: 'Siap diambil / diserahkan',
      Icon: CheckCircle,
      tint: 'bg-[#E2EBC0]',
      on: 'bg-[#7F9A2E] text-white',
    },
    {
      key: 'semua',
      label: 'Semua Pesanan',
      count: counts.total,
      hint: 'Total seluruh antrean',
      Icon: ListOrdered,
      tint: 'bg-[#FFEDB3]',
      on: 'bg-kuning text-kopi',
    },
  ]

  const FILTER_TABS = [
    { key: 'preorder', label: 'Pre-Order', count: counts.preorder, on: 'bg-[#6B5BB5] text-white' },
    { key: 'diproses', label: 'Sedang Diproses', count: counts.diproses, on: 'bg-[#C2502F] text-white' },
    { key: 'menunggu', label: 'Menunggu', count: counts.menunggu, on: 'bg-[#E5A000] text-white' },
    { key: 'selesai', label: 'Selesai', count: counts.selesai, on: 'bg-[#7F9A2E] text-white' },
    { key: 'batal', label: 'Batal', count: counts.batal, on: 'bg-slate-700 text-white' },
    { key: 'semua', label: 'Semua', count: counts.total, on: 'bg-kopi text-white' },
  ]

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Antrean Pesanan & Pre-Order"
        subtitle="Pantau pesanan yang harus dimasak dan siapkan pesanan pre-order tepat waktu"
        actions={
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              title="Perbarui daftar pesanan"
              className="flex h-9 sm:h-10 px-2.5 sm:px-3.5 items-center gap-1.5 rounded-full bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs border border-[#E8DCC8] cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
              <span className="hidden md:inline">Segarkan</span>
            </button>
            <Link
              href="/dashboard/penjualan"
              title="Input Penjualan / Transaksi Baru"
              aria-label="Input Penjualan"
              className="flex h-9 sm:h-10 px-2.5 sm:px-4 items-center gap-1.5 rounded-full bg-[#FF8F2B] hover:bg-[#E57A18] text-white text-xs font-bold transition-all shadow-xs active:scale-95 whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Input Penjualan</span>
            </Link>
          </div>
        }
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-7xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Sesi akun belum terhubung. Silakan masuk ke akun DapurTwin Anda untuk mengelola antrean pesanan.
              </span>
            </div>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1.5 hover:bg-amber-700 transition-colors shadow-xs"
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

        {/* Hero Banner DapurTwin: Dapi menyembul dari hero */}
        <section className="relative mt-8 sm:mt-10 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-5 sm:p-8 md:p-10 md:max-w-[58%]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-kopi">
              Antrean &amp; Proses Pesanan
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              Pantau antrean pesanan masuk, cek kesiapan bahan dapur otomatis, dan selesaikan pesanan tepat waktu.
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard/riwayat"
                className="h-11 px-5 rounded-full bg-white/80 hover:bg-white text-kopi text-sm font-bold flex items-center gap-2 active:scale-95 transition-all duration-150 whitespace-nowrap shadow-xs"
              >
                <History className="w-4 h-4" /> Riwayat Transaksi
              </Link>
              <Link
                href="/dashboard/bahan"
                className="h-11 px-5 rounded-full border-2 border-kopi text-kopi text-sm font-bold flex items-center gap-2 hover:bg-kopi/5 active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                <Store className="w-4 h-4" /> Cek Stok Bahan
              </Link>
            </div>
          </div>

          {/* Dapi menyembul keluar */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* Ringkasan Status Flow KPI Antrean Pesanan */}
        <div data-tour="proses-status-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_CARDS.map(st => {
            const active = activeTab === st.key
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setActiveTab(st.key as any)}
                className={clsx(
                  'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col justify-between min-h-[140px] transition-all duration-200 cursor-pointer hover:-translate-y-1 active:scale-95 group',
                  active
                    ? clsx(st.on, 'shadow-[0_18px_30px_rgba(43,34,28,0.22)] scale-[1.02]')
                    : clsx(st.tint, 'text-kopi shadow-[0_6px_14px_rgba(120,80,30,0.08)] hover:shadow-md')
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'absolute -right-10 -bottom-12 h-36 w-36 rounded-full transition-transform duration-300 group-hover:scale-110',
                    active ? 'bg-white/20' : 'bg-white/55'
                  )}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm sm:text-base font-extrabold">{st.label}</span>
                  <span
                    className={clsx(
                      'h-9 w-9 rounded-full flex items-center justify-center transition-transform duration-200',
                      active ? 'bg-white/30 scale-105' : 'bg-white/60 group-hover:scale-105'
                    )}
                  >
                    <st.Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="relative">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight leading-none font-mono">
                    {st.count}
                  </p>
                  <p className={clsx('text-xs mt-1.5', active ? 'opacity-85' : 'text-kopi-muted')}>
                    {st.hint}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Search & Filter Status Pills */}
        <div data-tour="proses-filter-bar" className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-kopi-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Cari no. nota, pelanggan, menu..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-white text-sm text-kopi placeholder:text-kopi-muted/70 shadow-[0_4px_14px_rgba(120,80,30,0.08)] outline-none focus:ring-2 focus:ring-kuning border border-transparent focus:border-kuning"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none flex-nowrap">
            <span className="text-[11px] font-bold text-kopi-muted uppercase tracking-wider flex items-center gap-1.5 mr-1 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Status
            </span>
            {FILTER_TABS.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key as any)
                    setCurrentPage(1)
                  }}
                  className={clsx(
                    'h-10 pl-4 pr-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-2 active:scale-95 flex-shrink-0 whitespace-nowrap',
                    isActive
                      ? clsx(tab.on, 'shadow-[0_8px_16px_rgba(43,34,28,0.2)]')
                      : 'bg-white text-kopi shadow-[0_2px_8px_rgba(120,80,30,0.06)] hover:bg-[#FFF8EC]'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={clsx(
                      'h-7 min-w-7 px-1.5 rounded-full font-mono text-[11px] font-extrabold flex items-center justify-center',
                      isActive ? 'bg-white/25 text-inherit' : 'bg-[#F2ECE1] text-kopi-muted'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading Skeleton atau Card Grid Pesanan */}
        {loading ? (
          <CardGridSkeleton count={6} cardHeight="h-80" />
        ) : pesananList.length === 0 ? (
          <div className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_4px_20px_rgba(120,80,30,0.06)] py-16 text-center text-kopi-muted text-xs font-medium space-y-2">
            <CookingPot className="w-10 h-10 text-kopi-muted/40 mx-auto" />
            <p className="text-sm font-bold text-kopi">Tidak ada pesanan pada kategori filter ini</p>
            <p className="text-[11px]">Coba pilih filter lain atau buat transaksi penjualan / pre-order baru.</p>
          </div>
        ) : (
          <>
            <div data-tour="proses-order-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedPesanan.map(order => (
                <PesananCard
                  key={order.id}
                  order={order}
                  busy={Boolean(busyOrderId)}
                  onUpdateStatus={handleUpdateStatus}
                  onTandaiLunas={handleTandaiLunas}
                  onViewReceipt={o => setReceiptOrder(o)}
                />
              ))}
            </div>

            {pesananList.length > pageSize && (
              <div className="pt-2">
                <Pagination
                  currentPage={currentPage}
                  totalItems={pesananList.length}
                  pageSize={pageSize}
                  onPageChange={page => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 350, behavior: 'smooth' })
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Struk Transaksi */}
      {receiptOrder && (
        <ReceiptModal
          data={orderToReceipt(receiptOrder)}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  )
}
