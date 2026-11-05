'use client'

import Topbar from '@/components/Topbar'
import { useRiwayat } from './hooks/useRiwayat'
import RiwayatPenjualanTable from './components/RiwayatPenjualanTable'
import RiwayatPOTable from './components/RiwayatPOTable'
import DapiHead from '@/components/ui/DapiHead'
import {
  Search,
  RefreshCw,
  AlertCircle,
  Receipt,
  Truck,
  ArrowUpRight,
  History,
} from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { TableSkeleton } from '@/components/ui/Skeleton'

export default function RiwayatPage() {
  const {
    tab,
    setTab,
    penjualanList,
    poList,
    totalPenjualanCount,
    totalPOCount,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refresh,
  } = useRiwayat()

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Riwayat Nota & Belanja"
        subtitle="Daftar nota penjualan kasir dan riwayat pesanan belanja bahan yang sudah selesai"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto">

        {/* Hero Banner */}
        <section className="relative mt-2 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)] overflow-hidden">
          {/* Dekorasi lingkaran */}
          <span aria-hidden className="pointer-events-none absolute right-[18%] -top-20 h-72 w-72 rounded-full bg-white/20" />
          <span aria-hidden className="pointer-events-none absolute -right-12 -bottom-24 h-64 w-64 rounded-full bg-koral/20" />
          <span aria-hidden className="pointer-events-none absolute left-[48%] bottom-5 h-3 w-3 rounded-full bg-white/70" />

          <div className="relative flex flex-col gap-3 p-6 sm:p-10 md:max-w-[60%]">
            <div className="flex items-center gap-2 text-[#5A3A00]">
              <History className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Log Aktivitas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-kopi">
              Riwayat Dapur
            </h2>
            <p className="text-sm text-[#5A3A00] leading-snug">
              Semua transaksi kasir &amp; pesanan stok ke supplier tersimpan rapi di sini.
            </p>
            <div className="mt-1 flex flex-wrap gap-2.5">
              <span className="h-9 px-4 rounded-full bg-kopi/10 border border-kopi/20 text-kopi text-xs font-bold flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                {totalPenjualanCount} Penjualan
              </span>
              <span className="h-9 px-4 rounded-full bg-kopi/10 border border-kopi/20 text-kopi text-xs font-bold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                {totalPOCount} Purchase Order
              </span>
            </div>
          </div>

          {/* Dapi di pojok kanan */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={200} />
          </div>
        </section>

        {/* Tab + Search + Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setTab('penjualan')}
              className={clsx(
                'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                tab === 'penjualan'
                  ? 'bg-[#2B1D00] text-white shadow-[0_6px_16px_rgba(43,29,0,0.25)]'
                  : 'bg-[#FFF6E0] text-[#5A3A00] border border-[#F0D898] hover:bg-[#FFE49A]/50'
              )}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Penjualan Menu</span>
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                  tab === 'penjualan' ? 'bg-white/20 text-white' : 'bg-[#FFE49A] text-[#5A3A00]'
                )}
              >
                {totalPenjualanCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('po')}
              className={clsx(
                'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                tab === 'po'
                  ? 'bg-[#2B1D00] text-white shadow-[0_6px_16px_rgba(43,29,0,0.25)]'
                  : 'bg-[#FFF6E0] text-[#5A3A00] border border-[#F0D898] hover:bg-[#FFE49A]/50'
              )}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Pembelian Stok</span>
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                  tab === 'po' ? 'bg-white/20 text-white' : 'bg-[#FFE49A] text-[#5A3A00]'
                )}
              >
                {totalPOCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A7A55]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  tab === 'penjualan'
                    ? 'Cari invoice, menu, pelanggan...'
                    : 'Cari nomor PO, supplier, bahan...'
                }
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FFF6E0] border border-[#F0D898] text-xs text-[#2B1D00] placeholder:text-[#B8935A] outline-none focus:ring-2 focus:ring-[#FFB800]/40"
              />
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              title="Perbarui Data"
              className="p-2.5 rounded-xl bg-[#FFF6E0] border border-[#F0D898] text-[#8A5A00] hover:bg-[#FFE49A]/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {tab === 'penjualan' ? (
              <Link
                href="/dashboard/penjualan"
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#D8431F] bg-[#FDE8E4] border border-[#FAD3CB] hover:bg-[#FAD3CB]/70 flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <span>Kasir Baru</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/dashboard/purchase-order"
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#7E22CE] bg-[#EDE9FF] border border-[#DDD6FE] hover:bg-[#DDD6FE]/70 flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <span>Buat PO Baru</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Gagal Mengambil Data Riwayat</p>
              <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Content Area */}
        {isLoading && !penjualanList.length && !poList.length ? (
          <TableSkeleton rows={6} cols={5} />
        ) : tab === 'penjualan' ? (
          <RiwayatPenjualanTable penjualanList={penjualanList} />
        ) : (
          <RiwayatPOTable poList={poList} />
        )}
      </main>
    </div>
  )
}
