'use client'

import Topbar from '@/components/Topbar'
import { useRiwayat } from './hooks/useRiwayat'
import RiwayatPenjualanTable from './components/RiwayatPenjualanTable'
import RiwayatPOTable from './components/RiwayatPOTable'
import {
  Search,
  RefreshCw,
  AlertCircle,
  Receipt,
  Truck,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

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
        title="Riwayat Aktivitas Dapur"
        subtitle="Arsip log transaksi penjualan kasir dan riwayat pesanan purchase order ke distributor dari database"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Navigation Tabs and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setTab('penjualan')}
              className={clsx(
                'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                tab === 'penjualan'
                  ? 'clay-btn-primary'
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Penjualan Menu</span>
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                  tab === 'penjualan' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'clay-btn-primary'
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Pembelian Stok</span>
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                  tab === 'po' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                )}
              >
                {totalPOCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  tab === 'penjualan'
                    ? 'Cari invoice, menu, pelanggan...'
                    : 'Cari nomor PO, supplier, bahan...'
                }
                className="w-full pl-9 pr-3 py-2 clay-inset text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              title="Perbarui Data"
              className="p-2.5 clay-btn rounded-xl text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {tab === 'penjualan' ? (
              <Link
                href="/dashboard/penjualan"
                className="px-3.5 py-2 clay-btn rounded-xl text-xs font-bold text-[#FF8F2B] bg-[#FFF6EC] hover:bg-[#FFE2C2]/50 border border-[#FFE2C2] flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Kasir Baru</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/dashboard/purchase-order"
                className="px-3.5 py-2 clay-btn rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1.5 whitespace-nowrap"
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
          <div className="clay-card p-8 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : tab === 'penjualan' ? (
          <RiwayatPenjualanTable penjualanList={penjualanList} />
        ) : (
          <RiwayatPOTable poList={poList} />
        )}
      </main>
    </div>
  )
}
