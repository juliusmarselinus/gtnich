'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
import StokLogTable from './components/StokLogTable'
import OpnameTable from './components/OpnameTable'
import ManualMutasiModal from './components/ManualMutasiModal'
import { useStokLog } from './hooks/useStokLog'
import {
  Database,
  ClipboardCheck,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
} from 'lucide-react'
import clsx from 'clsx'
import { useToast } from '@/context/ToastContext'

export default function StokLogPage() {
  const {
    logs,
    rawLogsCount,
    bahanList,
    opnameList,
    summary,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    filterSource,
    setFilterSource,
    updateOpnameAktual,
    saveOpname,
    recordManualMutasi,
    refresh,
  } = useStokLog()

  const [tab, setTab] = useState<'log' | 'opname'>('log')
  const [showModal, setShowModal] = useState(false)
  const toast = useToast()

  const handleSaveOpnameWithToast = async (): Promise<number> => {
    try {
      const count = await saveOpname()
      toast.success(
        'Stock Opname Berhasil Disimpan',
        `Penyesuaian selisih fisik (${count} item) telah diaudit dan stok gudang diperbarui.`
      )
      return count
    } catch (err: any) {
      toast.error('Gagal Menyimpan Opname', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  const handleRecordManualMutasiWithToast = async (input: any) => {
    try {
      await recordManualMutasi(input)
      toast.success(
        'Mutasi Stok Manual Tercatat',
        `Perubahan stok sebesar ${input.perubahan > 0 ? '+' : ''}${input.perubahan} berhasil dibukukan.`
      )
    } catch (err: any) {
      toast.error('Gagal Mencatat Mutasi', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  // Hero Status
  const selisihCount = opnameList.filter(e => e.selisih !== 0).length
  const heroStatus = {
    mood: (selisihCount > 0 ? 'khawatir' : 'senang') as 'khawatir' | 'senang',
    title:
      selisihCount > 0
        ? `Ada ${selisihCount} Selisih Fisik di Gudang`
        : `${rawLogsCount} Catatan Mutasi Stok Tercatat`,
    subtitle:
      selisihCount > 0
        ? 'Perhitungan fisik opname mendeteksi selisih dengan database sistem. Segera tinjau tab Stock Opname untuk rekonsiliasi.'
        : 'Audit menyeluruh pergerakan bahan dari PO, Penjualan, maupun penyesuaian opname secara transparan dan akurat.',
  }

  const STAT_CARDS = [
    {
      key: 'total_logs',
      label: 'Total Riwayat Log',
      value: summary.totalLogs,
      unit: 'catatan',
      hint: 'Semua jejak mutasi bahan',
      icon: Database,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FFB800] bg-[#FFFBF2]',
    },
    {
      key: 'masuk',
      label: 'Total Mutasi Masuk',
      value: `+${summary.masukCount.toFixed(1)}`,
      unit: 'unit',
      hint: 'Pasokan PO & barang masuk',
      icon: ArrowDownCircle,
      iconBg: 'bg-[#E8F5E4] text-[#2D7A1F]',
      activeRing: 'ring-2 ring-[#228B5B] bg-[#F4FAF2]',
    },
    {
      key: 'keluar',
      label: 'Total Mutasi Keluar',
      value: `-${summary.keluarCount.toFixed(1)}`,
      unit: 'unit',
      hint: 'Pemakaian resep & buang',
      icon: ArrowUpCircle,
      iconBg: 'bg-[#FDE8E4] text-[#D8431F]',
      activeRing: 'ring-2 ring-[#D8431F] bg-[#FEF4F2]',
    },
  ]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Stok Log & Stock Opname"
        subtitle="Audit jejak mutasi bahan otomatis (PO, Penjualan, Manual) dan rekonsiliasi perhitungan fisik gudang dapur"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk mengakses riwayat audit stok.
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
                <History className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Audit Inventori & Buku Mutasi
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
                {rawLogsCount} entri transaksi
              </span>

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                {bahanList.length} jenis bahan diaudit
              </span>

              {selisihCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D8431F] text-white px-3 py-1.5 text-xs font-bold shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {selisihCount} selisih fisik gudang
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Mini Stat Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            return (
              <div
                key={card.key}
                className="p-4 sm:p-5 rounded-[22px] bg-white border border-[#EBE6DC] shadow-xs"
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
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight font-mono">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-[#8C8275]">{card.unit}</span>
                </div>
                <p className="text-[11px] text-[#A69C8E] mt-1.5 font-medium">{card.hint}</p>
              </div>
            )
          })}
        </div>

        {/* Navigasi Tab & Tombol Aksi Manual */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#FCFAF6] border border-[#F0EBE1]">
            {[
              { key: 'log', label: `Buku Mutasi Stok (${rawLogsCount})`, icon: Database },
              { key: 'opname', label: `Stock Opname Fisik (${bahanList.length} Bahan)`, icon: ClipboardCheck },
            ].map(t => {
              const Icon = t.icon
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key as 'log' | 'opname')}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    active
                      ? 'bg-[#2B261F] text-white shadow-xs'
                      : 'text-[#7A7062] hover:text-[#2B261F] hover:bg-white'
                  )}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              )
            })}
          </div>

          {tab === 'log' && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={bahanList.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white font-bold text-xs shadow-xs hover:shadow-md hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Catat Mutasi Manual
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="rounded-[32px] bg-white border border-[#EBE6DC] p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#FF6B00]" />
            <p className="text-xs font-semibold text-[#7A7062]">
              Mengambil data mutasi stok dari database...
            </p>
          </div>
        ) : (
          <>
            {/* Tab 1: Log Table */}
            {tab === 'log' && (
              <StokLogTable
                logs={logs}
                search={search}
                onSearchChange={setSearch}
                filterSource={filterSource}
                onFilterSourceChange={setFilterSource}
              />
            )}

            {/* Tab 2: Stock Opname Table */}
            {tab === 'opname' && (
              <OpnameTable
                entries={opnameList}
                onUpdateAktual={updateOpnameAktual}
                onSave={handleSaveOpnameWithToast}
              />
            )}
          </>
        )}
      </main>

      {/* Modal Input Mutasi Manual */}
      <ManualMutasiModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleRecordManualMutasiWithToast}
        bahanList={bahanList}
      />
    </div>
  )
}
