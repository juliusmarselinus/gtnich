'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiHead from '@/components/ui/DapiHead'
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
import { TableSkeleton } from '@/components/ui/Skeleton'

const STATUS_CARDS = [
  {
    key: 'total_logs',
    label: 'Total Mutasi',
    hint: 'Semua jejak mutasi bahan',
    Icon: Database,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'masuk',
    label: 'Mutasi Masuk',
    hint: 'Pasokan PO & barang masuk',
    Icon: ArrowDownCircle,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
  {
    key: 'keluar',
    label: 'Mutasi Keluar',
    hint: 'Pemakaian resep & buang',
    Icon: ArrowUpCircle,
    tint: 'bg-[#FDE8E4]',
    on: 'bg-[#D8431F] text-white',
  },
] as const

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
        ? 'Pengecekan fisik mendeteksi selisih dengan stok di sistem. Segera tinjau tab Cek Fisik (Opname).'
        : 'Audit menyeluruh pergerakan bahan dari PO, Penjualan, maupun penyesuaian opname secara transparan dan akurat.',
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Riwayat Stok & Cek Fisik"
        subtitle="Lihat catatan keluar-masuk bahan dan cocokkan jumlah fisik di dapur dengan aplikasi"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Sesi akun belum terhubung. Silakan masuk ke akun DapurTwin Anda untuk melihat riwayat mutasi stok.
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

          <div className="relative flex flex-col gap-3 p-6 sm:p-10 md:max-w-[58%]">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-kopi">
              {heroStatus.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              {heroStatus.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowModal(true)}
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 flex-shrink-0" /> Mutasi Manual
              </button>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Entri Transaksi:</span>
                <span className="font-mono font-black text-kopi">{rawLogsCount}</span>
              </div>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Bahan Diaudit:</span>
                <span className="font-mono font-black text-[#7F9A2E]">{bahanList.length}</span>
              </div>
              {selisihCount > 0 && (
                <div className="h-11 px-5 rounded-full bg-[#D8431F] text-white text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                  <span>Selisih Fisik:</span>
                  <span className="font-mono font-black text-white">{selisihCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Kartu audit miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">AUDIT</span>
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
        <div data-tour="stok-log-status-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATUS_CARDS.map(st => {
            const val =
              st.key === 'total_logs'
                ? summary.totalLogs
                : st.key === 'masuk'
                ? `+${summary.masukCount.toFixed(1)}`
                : `-${summary.keluarCount.toFixed(1)}`

            return (
              <div
                key={st.key}
                className={clsx(
                  'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col gap-4 min-h-[140px] transition-all',
                  st.tint,
                  'text-kopi shadow-[0_6px_14px_rgba(120,80,30,0.08)]'
                )}
              >
                <span
                  aria-hidden
                  className="absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-white/55"
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm sm:text-base font-extrabold">{st.label}</span>
                  <span className="h-9 w-9 rounded-full flex items-center justify-center bg-white/60">
                    <st.Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="relative">
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none">
                    {val}
                  </p>
                  <p className="text-xs mt-1.5 truncate text-kopi-muted">
                    {st.hint}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigasi Tab & Tombol Aksi Manual */}
        <div data-tour="stok-log-tab-bar" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
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

        {/* Loading Skeleton */}
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
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
