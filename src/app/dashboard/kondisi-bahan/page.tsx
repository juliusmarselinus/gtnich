'use client'

import Link from 'next/link'
import Topbar from '@/components/Topbar'
import APIKeyConfigBar from './components/APIKeyConfigBar'
import KondisiCardGrid from './components/KondisiCardGrid'
import { useKondisiBahan } from './hooks/useKondisiBahan'
import { CheckCircle, AlertTriangle, XCircle, Search, Loader2, AlertCircle, RefreshCw, LogIn, Sparkles } from 'lucide-react'
import clsx from 'clsx'

export default function KondisiBahanPage() {
  const {
    list,
    counts,
    loading,
    error,
    userEmail,
    apiKey,
    saveApiKey,
    search,
    setSearch,
    filterFreshness,
    setFilterFreshness,
    refresh,
  } = useKondisiBahan()

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Kondisi Bahan & Inventory"
        subtitle="Analisis masa simpan (shelf-life), prediksi tanggal kedaluwarsa AI sejak barang masuk, dan monitoring level stok gudang"
      />

      <main className="p-8 space-y-7 max-w-7xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk mengakses data bahan baku.
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

        {/* AI Key Bar */}
        <APIKeyConfigBar
          apiKey={apiKey}
          onSaveKey={saveApiKey}
          onRefreshAnalysis={refresh}
        />

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="clay-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center clay-pill flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 font-mono">{counts.segar}</p>
              <p className="text-[11px] text-slate-400 font-bold">Kondisi Segar / Awet</p>
            </div>
          </div>

          <div className="clay-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center clay-pill flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 font-mono">{counts.mendekati}</p>
              <p className="text-[11px] text-slate-400 font-bold">Segera Olah (Exp &lt; 3 Hari)</p>
            </div>
          </div>

          <div className="clay-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center clay-pill flex-shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 font-mono">{counts.expired}</p>
              <p className="text-[11px] text-slate-400 font-bold">Kadaluarsa</p>
            </div>
          </div>

          <div className="clay-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center clay-pill flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 font-mono">{counts.lowStock}</p>
              <p className="text-[11px] text-slate-400 font-bold">Stok &le; Batas Min.</p>
            </div>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: `Semua Bahan (${counts.total})` },
              { key: 'segar', label: `Segar (${counts.segar})` },
              { key: 'mendekati_expire', label: `Mendekati Expire (${counts.mendekati})` },
              { key: 'kadaluarsa', label: `Kadaluarsa (${counts.expired})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterFreshness(tab.key)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  filterFreshness === tab.key ? 'clay-btn-primary shadow-sm' : 'clay-btn text-slate-600 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama bahan / supplier..."
              className="w-full pl-10 pr-4 py-2 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Loading Spinner or Grid Cards */}
        {loading ? (
          <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Menganalisis masa simpan dan memuat bahan...</p>
          </div>
        ) : (
          <KondisiCardGrid list={list} />
        )}
      </main>
    </div>
  )
}
