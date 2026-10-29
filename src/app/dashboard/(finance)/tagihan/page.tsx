'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import TagihanTable from './components/TagihanTable'
import TagihanDetailModal from './components/TagihanDetailModal'
import { useTagihan } from './hooks/useTagihan'
import { PurchaseOrder } from './types'
import {
  Receipt,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import { formatRupiah } from '@/lib/mock-data'
import clsx from 'clsx'

export default function TagihanPage() {
  const {
    list,
    suppliers,
    summary,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    supplierFilter,
    setSupplierFilter,
    statusBayarFilter,
    setStatusBayarFilter,
    payTagihan,
    refresh,
  } = useTagihan()

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Tagihan Pembelian (Invoices)"
        subtitle="Kelola rincian kewajiban pembayaran faktur barang masuk dari distributor/supplier"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk mengelola Tagihan.
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

        {/* Kartu Ringkasan Finansial Tagihan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="clay-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Total Tagihan Masuk
              </span>
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black font-mono text-slate-800">
              {formatRupiah(summary.totalNominal)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Dari total {summary.totalCount} faktur purchase order
            </p>
          </div>

          <div className="clay-card p-5 space-y-2 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                Belum Terbayar (Hutang)
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black font-mono text-amber-600">
              {formatRupiah(summary.totalBelumLunas)}
            </p>
            <p className="text-[11px] text-amber-700/80 font-medium">
              {summary.countBelumLunas} tagihan menunggu pelunasan
            </p>
          </div>

          <div className="clay-card p-5 space-y-2 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
                Sudah Dilunasi
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-600">
              {formatRupiah(summary.totalLunas)}
            </p>
            <p className="text-[11px] text-emerald-700/80 font-medium">
              {summary.countLunas} tagihan telah dibayar
            </p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="clay-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari no. faktur PO, supplier..."
                className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/purchase-order"
                className="clay-btn flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Purchase Order</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Filter Supplier
              </label>
              <CustomSelect
                value={supplierFilter}
                onChange={val => setSupplierFilter(val)}
                options={[
                  { value: 'all', label: 'Semua Supplier' },
                  ...suppliers.map(s => ({ value: s.id, label: s.nama })),
                ]}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Status Pelunasan
              </label>
              <div className="flex items-center gap-2">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'belum_lunas', label: 'Belum Lunas' },
                  { key: 'lunas', label: 'Lunas' },
                ].map(b => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setStatusBayarFilter(b.key as any)}
                    className={clsx(
                      'flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      statusBayarFilter === b.key
                        ? 'clay-btn-primary text-white shadow-sm'
                        : 'clay-btn text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Tagihan */}
        {loading ? (
          <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Mengambil daftar tagihan supplier...</p>
          </div>
        ) : (
          <TagihanTable
            list={list}
            onSelectDetail={po => setSelectedPO(po)}
            onBayar={po => setSelectedPO(po)}
          />
        )}
      </main>

      {/* Modal Detail & Pembayaran Tagihan */}
      <TagihanDetailModal
        isOpen={!!selectedPO}
        onClose={() => setSelectedPO(null)}
        po={selectedPO}
        onBayarSuccess={payTagihan}
      />
    </div>
  )
}
