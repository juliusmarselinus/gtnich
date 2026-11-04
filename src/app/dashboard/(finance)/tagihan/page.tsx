'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import TagihanTable from './components/TagihanTable'
import TagihanDetailModal from './components/TagihanDetailModal'
import { useTagihan } from './hooks/useTagihan'
import { PurchaseOrder } from './types'
import { formatRupiah } from '@/lib/mock-data'
import {
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogIn,
  Search,
  SlidersHorizontal,
  Wallet,
  ReceiptText,
  Loader2,
} from 'lucide-react'
import clsx from 'clsx'
import DapiHead from '@/components/ui/DapiHead'
import { useToast } from '@/context/ToastContext'

const STATUS_CARDS = [
  {
    key: 'all' as const,
    label: 'Total Tagihan',
    hint: 'Faktur barang masuk',
    Icon: Receipt,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'belum_lunas' as const,
    label: 'Belum Lunas',
    hint: 'Menunggu pembayaran',
    Icon: Clock,
    tint: 'bg-[#F2D9CC]',
    on: 'bg-[#C2502F] text-white',
  },
  {
    key: 'lunas' as const,
    label: 'Sudah Lunas',
    hint: 'Telah terbayar penuh',
    Icon: CheckCircle2,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
] as const

export default function TagihanPage() {
  const {
    list,
    summary,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    statusBayarFilter,
    setStatusBayarFilter,
    supplierFilter,
    setSupplierFilter,
    suppliers,
    payTagihan,
    refresh,
  } = useTagihan()

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [modalMode, setModalMode] = useState<'detail' | 'bayar'>('detail')
  const toast = useToast()

  const handleProsesBayarWithToast = async (payload: any) => {
    try {
      await payTagihan(payload)
      toast.success(
        'Pembayaran Tagihan Berhasil',
        `Pelunasan untuk ${payload.noPO || 'Tagihan'} sebesar ${formatRupiah(payload.nominal)} berhasil dicatat.`
      )
    } catch (err: any) {
      toast.error('Gagal Memproses Pembayaran', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  return (
    <div className="flex-1 pb-24 lg:pb-16">
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

        {/* Hero Banner DapurTwin identik Purchase Order */}
        <section className="relative mt-10 sm:mt-12 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-6 sm:p-10 md:max-w-[58%]">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-kopi">
              Tagihan Supplier
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              Pantau faktur barang masuk dari distributor, jadwal jatuh tempo, dan riwayat pelunasan belanja dapur.
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard/purchase-order"
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap"
              >
                <ReceiptText className="w-4 h-4 flex-shrink-0" /> Halaman Purchase Order
              </Link>
              <span className="h-11 px-5 rounded-full bg-white/80 text-kopi text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-xs">
                <Wallet className="w-4 h-4 text-[#C2502F]" />
                Tempo: {formatRupiah(summary.totalBelumLunas)}
              </span>
            </div>
          </div>

          {/* Kartu faktur miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">FAKTUR</span>
            <span className="h-2 rounded bg-krim-garis" />
            <span className="h-2 w-[70%] rounded bg-krim-garis" />
            <span className="h-2 w-[85%] rounded bg-krim-garis" />
          </div>

          {/* Dapi menyembul keluar */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* Status Flow Stats Card (Desain Card Identik PO: rounded-[28px], circle backdrop, typography) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATUS_CARDS.map(st => {
            const active = statusBayarFilter === st.key
            const count =
              st.key === 'all'
                ? summary.totalCount
                : st.key === 'belum_lunas'
                ? summary.countBelumLunas
                : summary.countLunas
            const amount =
              st.key === 'all'
                ? summary.totalNominal
                : st.key === 'belum_lunas'
                ? summary.totalBelumLunas
                : summary.totalLunas

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setStatusBayarFilter(st.key)}
                className={clsx(
                  'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col justify-between min-h-[145px] transition-all cursor-pointer hover:-translate-y-0.5',
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
                <div className="relative pt-1 min-w-0">
                  <p
                    className="text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-tight font-mono whitespace-nowrap break-keep"
                    title={formatRupiah(amount)}
                  >
                    {formatRupiah(amount)}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-current/10">
                    <p className={clsx('text-xs font-bold whitespace-nowrap', active ? 'opacity-90' : 'text-kopi-muted')}>
                      {count} Tagihan PO
                    </p>
                    <span className={clsx('text-[11px] whitespace-nowrap', active ? 'opacity-75' : 'text-kopi-muted/80')}>
                      {st.hint}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Search & Filter Status (Identik PO Pill Style) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-kopi-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari no. PO, supplier, atau catatan..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-white text-sm text-kopi placeholder:text-kopi-muted/70 shadow-[0_4px_14px_rgba(120,80,30,0.08)] outline-none focus:ring-2 focus:ring-kuning"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-kopi-muted uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Status Pelunasan
            </span>
            {[
              { key: 'all' as const, label: 'Semua Tagihan', count: summary.totalCount, on: 'bg-kopi text-white' },
              { key: 'belum_lunas' as const, label: 'Belum Lunas', count: summary.countBelumLunas, on: 'bg-[#C2502F] text-white' },
              { key: 'lunas' as const, label: 'Sudah Lunas', count: summary.countLunas, on: 'bg-[#7F9A2E] text-white' },
            ].map(f => {
              const isActive = statusBayarFilter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusBayarFilter(f.key)}
                  className={clsx(
                    'h-10 pl-4 pr-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
                    isActive
                      ? clsx(f.on, 'shadow-[0_8px_16px_rgba(43,34,28,0.18)]')
                      : 'bg-white text-kopi shadow-[0_3px_10px_rgba(120,80,30,0.08)] hover:-translate-y-0.5'
                  )}
                >
                  <span>{f.label}</span>
                  <span
                    className={clsx(
                      'min-w-[26px] h-[26px] px-1.5 rounded-full flex items-center justify-center text-[11px]',
                      isActive ? 'bg-white/30' : 'bg-krim'
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading / Tagihan Table */}
        {loading ? (
          <div className="rounded-[32px] bg-white shadow-[0_14px_34px_rgba(120,80,30,0.10)] py-20 flex flex-col items-center justify-center gap-3 text-kopi-muted">
            <Loader2 className="w-6 h-6 animate-spin text-kuning" />
            <p className="text-xs font-semibold">Mengambil data tagihan faktur dari database...</p>
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

      {/* Modal Detail & Pelunasan Tagihan */}
      {selectedPO && (
        <TagihanDetailModal
          isOpen={!!selectedPO}
          po={selectedPO}
          initialMode={modalMode}
          onClose={() => setSelectedPO(null)}
          onBayarSuccess={handleProsesBayarWithToast}
        />
      )}
    </div>
  )
}
