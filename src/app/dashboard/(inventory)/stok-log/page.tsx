'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import StokLogTable from './components/StokLogTable'
import OpnameTable from './components/OpnameTable'
import ManualMutasiModal from './components/ManualMutasiModal'
import { useStokLog } from './hooks/useStokLog'
import { Database, ClipboardCheck, Plus, Loader2, AlertCircle, RefreshCw, LogIn, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import clsx from 'clsx'

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

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Stok Log & Stock Opname"
        subtitle="Audit jejak mutasi bahan otomatis (PO, Penjualan, Manual) dan rekonsiliasi perhitungan fisik gudang dapur"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
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
              className="font-bold underline flex items-center gap-1 hover:text-rose-900"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Muat ulang
            </button>
          </div>
        )}

        {/* Mini Stat Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="clay-card p-4.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Riwayat Log</p>
              <p className="text-2xl font-black text-slate-800 font-mono mt-1">{summary.totalLogs}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="clay-card p-4.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#FF8F2B] uppercase tracking-wider">Total Mutasi Masuk</p>
              <p className="text-2xl font-black text-[#C86400] font-mono mt-1">+{summary.masukCount.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF6EC] flex items-center justify-center text-[#FF8F2B]">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="clay-card p-4.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Total Mutasi Keluar</p>
              <p className="text-2xl font-black text-rose-600 font-mono mt-1">-{summary.keluarCount.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigasi Tab & Tombol Aksi Manual */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex gap-2.5">
            {[
              { key: 'log', label: `Buku Mutasi Stok (${rawLogsCount})`, icon: Database },
              { key: 'opname', label: `Stock Opname Fisik (${bahanList.length} Bahan)`, icon: ClipboardCheck },
            ].map(t => {
              const Icon = t.icon
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as 'log' | 'opname')}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                    active ? 'clay-btn-primary shadow-sm' : 'clay-btn text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              )
            })}
          </div>

          {tab === 'log' && (
            <button
              onClick={() => setShowModal(true)}
              disabled={bahanList.length === 0}
              className="clay-btn-primary flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Catat Mutasi Manual
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF8F2B]" />
            <p className="text-xs font-semibold">Mengambil data mutasi stok dari database Supabase...</p>
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
                onSave={saveOpname}
              />
            )}
          </>
        )}
      </main>

      {/* Modal Input Mutasi Manual */}
      <ManualMutasiModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={recordManualMutasi}
        bahanList={bahanList}
      />
    </div>
  )
}
