'use client'

import Topbar from '@/components/Topbar'
import { useRekomendasi } from './hooks/useRekomendasi'
import { RekomendasiTipe } from './types'
import {
  Lightbulb,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

const TIPE_CONFIG: Record<
  RekomendasiTipe,
  { icon: React.ElementType; colorCls: string; badgeCls: string }
> = {
  Stok: { icon: Package, colorCls: 'text-blue-600', badgeCls: 'bg-blue-50 text-blue-700' },
  Keuangan: { icon: DollarSign, colorCls: 'text-amber-600', badgeCls: 'bg-amber-50 text-amber-700' },
  Penjualan: {
    icon: TrendingUp,
    colorCls: 'text-emerald-600',
    badgeCls: 'bg-emerald-50 text-emerald-700',
  },
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  tinggi: { label: 'Prioritas Tinggi', cls: 'bg-rose-50 text-rose-700' },
  sedang: { label: 'Prioritas Sedang', cls: 'bg-amber-50 text-amber-700' },
  rendah: { label: 'Prioritas Rendah', cls: 'bg-slate-100 text-slate-600' },
}

export default function RekomendasiPage() {
  const { items, summary, filter, setFilter, isLoading, error, refresh } = useRekomendasi()

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Rekomendasi Pintar Dapur"
        subtitle="Insight dan anjuran prediktif berbasis data riil stok gudang, tren penjualan kasir, dan kalkulasi profitabilitas"
      />

      <main className="p-6 md:p-8 space-y-7 max-w-5xl mx-auto">
        {/* Banner Clay Card */}
        <div className="clay-card p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 clay-pill">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-base font-extrabold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
              <span>DapurTwin AI Intelligence</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Sistem menganalisis inventori langsung dari database Supabase dan mendeteksi{' '}
              <span className="font-bold text-emerald-600">{summary.total} insight strategis</span>{' '}
              untuk kelancaran operasional dapur.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {summary.kritisCount > 0 ? (
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full clay-pill flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
                <span>{summary.kritisCount} Tindakan Kritis</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full clay-pill flex-shrink-0">
                ✓ Operasional Stabil
              </div>
            )}

            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              title="Perbarui Rekomendasi"
              className="p-2.5 clay-btn rounded-xl text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Gagal Mengambil Rekomendasi</p>
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

        {/* Filter Clay Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {[
            { key: 'all', label: `Semua (${summary.total})` },
            { key: 'Stok', label: `Stok Bahan (${summary.stokCount})` },
            { key: 'Keuangan', label: `Keuangan & Tagihan (${summary.keuanganCount})` },
            { key: 'Penjualan', label: `Pola Penjualan (${summary.penjualanCount})` },
          ].map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key as RekomendasiTipe | 'all')}
              className={clsx(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer',
                filter === f.key
                  ? 'clay-btn-primary'
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading State Skeleton */}
        {isLoading && !items.length ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="clay-card p-6 h-32 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="clay-card p-12 text-center text-slate-400">
            <Lightbulb className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">Tidak ada rekomendasi khusus saat ini</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Semua persediaan stok, tagihan supplier, dan pola menu dapur berada dalam kondisi optimal.
            </p>
          </div>
        ) : (
          /* Recommendation Cards */
          <div className="space-y-4">
            {items.map(r => {
              const tipeCfg = TIPE_CONFIG[r.tipe]
              const priCfg = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.sedang
              const Icon = tipeCfg.icon

              return (
                <div key={r.id} className="clay-card p-6 space-y-3.5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 clay-pill">
                        <Icon className={clsx('w-5 h-5', tipeCfg.colorCls)} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">{r.judul}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={clsx(
                              'inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold clay-pill',
                              tipeCfg.badgeCls
                            )}
                          >
                            {r.tipe}
                          </span>
                          <span
                            className={clsx(
                              'inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold clay-pill',
                              priCfg.cls
                            )}
                          >
                            {priCfg.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Gauge */}
                    <div className="flex-shrink-0 text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Tingkat Keyakinan
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-2 clay-inset rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${r.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-emerald-600 font-mono">
                          {r.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed sm:pl-14 font-medium">
                    {r.deskripsi}
                  </p>

                  {r.actionLink && (
                    <div className="sm:pl-14 pt-1">
                      <Link
                        href={r.actionLink}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <span>{r.actionLabel || 'Tindak lanjuti'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
