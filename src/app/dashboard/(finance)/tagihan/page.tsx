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
  Wallet,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import { formatRupiah } from '@/lib/mock-data'
import clsx from 'clsx'
import DapiMascot from '@/components/ui/DapiMascot'
import { useToast } from '@/context/ToastContext'

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
  const [modalMode, setModalMode] = useState<'detail' | 'bayar'>('detail')
  const toast = useToast()

  const handlePayTagihanWithToast = async (input: any) => {
    try {
      await payTagihan(input)
      toast.success(
        'Pembayaran Tagihan Berhasil',
        `PO ${input.noPO} senilai ${formatRupiah(input.nominalBayar)} telah ditandai lunas.`
      )
    } catch (err: any) {
      toast.error('Gagal Memproses Pembayaran', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  // Tentukan status mood maskot Dapi dan judul headline dinamis
  const heroStatus = {
    mood: summary.countBelumLunas > 0 ? ('khawatir' as const) : ('senang' as const),
    title:
      summary.countBelumLunas > 0
        ? `${summary.countBelumLunas} tagihan menunggu pelunasan`
        : 'Semua tagihan supplier lunas',
    subtitle:
      summary.countBelumLunas > 0
        ? `Total kewajiban tempo ${formatRupiah(summary.totalBelumLunas)}. Segera selesaikan pembayaran ke distributor.`
        : 'Arus kas pengadaan bahan baku aman. Tidak ada tagihan supplier yang tertunda.',
  }

  const STAT_CARDS = [
    {
      key: 'all' as const,
      label: 'Total Tagihan',
      count: summary.totalCount,
      amount: summary.totalNominal,
      hint: 'Faktur barang masuk',
      icon: Receipt,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FFB800] bg-[#FFFBF2]',
    },
    {
      key: 'belum_lunas' as const,
      label: 'Belum Lunas',
      count: summary.countBelumLunas,
      amount: summary.totalBelumLunas,
      hint: 'Menunggu pembayaran',
      icon: Clock,
      iconBg: 'bg-[#FDE8E4] text-[#D8431F]',
      activeRing: 'ring-2 ring-[#D8431F] bg-[#FEF4F2]',
    },
    {
      key: 'lunas' as const,
      label: 'Sudah Lunas',
      count: summary.countLunas,
      amount: summary.totalLunas,
      hint: 'Telah terbayar penuh',
      icon: CheckCircle2,
      iconBg: 'bg-[#E8F5E4] text-[#2D7A1F]',
      activeRing: 'ring-2 ring-[#228B5B] bg-[#F4FAF2]',
    },
  ]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Tagihan Pembelian (Invoices)"
        subtitle="Kelola rincian kewajiban pembayaran faktur barang masuk dari distributor/supplier"
      />

      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
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
                <Wallet className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Keuangan & Kewajiban PO
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
                {summary.totalCount} faktur masuk
              </span>

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                Total tempo {formatRupiah(summary.totalNominal)}
              </span>

              {summary.countBelumLunas > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D8431F] text-white px-3 py-1.5 text-xs font-bold shadow-xs">
                  <Clock className="w-3 h-3" />
                  {formatRupiah(summary.totalBelumLunas)} belum bayar
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 3 Interactive Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            const isActive = statusBayarFilter === card.key
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setStatusBayarFilter(card.key)}
                className={clsx(
                  'flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left cursor-pointer hover:shadow-sm',
                  isActive
                    ? card.activeRing
                    : 'bg-white border-[#EBE6DC] hover:border-[#FFB800]/50'
                )}
              >
                <div
                  className={clsx(
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold',
                    card.iconBg
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      {card.label}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {card.count} PO
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-black text-[#2B1D00] font-mono leading-tight mt-0.5">
                    {formatRupiah(card.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{card.hint}</p>
                </div>
              </button>
            )
          })}
        </section>

        {/* Filter Bar & Search */}
        <section className="bg-white rounded-2xl border border-[#EBE6DC] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari no. faktur PO, supplier..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/70 transition shadow-2xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/purchase-order"
                className="h-10 px-4 rounded-xl bg-[#F7F5F0] hover:bg-[#EFECE6] text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Pembelian Stok (PO)</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1 px-1">
                Filter Distributor / Supplier
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
              <label className="text-[11px] font-bold text-slate-500 block mb-1 px-1">
                Status Pelunasan Tagihan
              </label>
              <div className="flex items-center gap-2">
                {[
                  { key: 'all', label: 'Semua Status' },
                  { key: 'belum_lunas', label: 'Belum Lunas' },
                  { key: 'lunas', label: 'Lunas' },
                ].map(b => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setStatusBayarFilter(b.key as any)}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center',
                      statusBayarFilter === b.key
                        ? 'bg-[#2B1D00] text-white shadow-xs'
                        : 'bg-[#F7F5F0] text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Table Tagihan */}
        {loading ? (
          <div className="rounded-[28px] bg-white border border-[#EBE6DC] py-20 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#FFB800]" />
            <p className="text-xs font-bold text-slate-600">Mengambil daftar tagihan supplier dari database...</p>
          </div>
        ) : (
          <TagihanTable
            list={list}
            onSelectDetail={po => {
              setSelectedPO(po)
              setModalMode('detail')
            }}
            onBayar={po => {
              setSelectedPO(po)
              setModalMode('bayar')
            }}
          />
        )}
      </main>

      {/* Modal Detail & Pembayaran Tagihan */}
      <TagihanDetailModal
        isOpen={!!selectedPO}
        onClose={() => setSelectedPO(null)}
        po={selectedPO}
        initialMode={modalMode}
        onBayarSuccess={handlePayTagihanWithToast}
      />
    </div>
  )
}
