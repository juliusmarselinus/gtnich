'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { rekomendasiList, RekomendasiTipe } from '@/lib/dapur-data'
import { Lightbulb, Package, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const TIPE_CONFIG: Record<RekomendasiTipe, { icon: React.ElementType; colorCls: string; badgeCls: string }> = {
  Stok: { icon: Package, colorCls: 'text-blue-600', badgeCls: 'bg-blue-50 text-blue-700' },
  Keuangan: { icon: DollarSign, colorCls: 'text-amber-600', badgeCls: 'bg-amber-50 text-amber-700' },
  Penjualan: { icon: TrendingUp, colorCls: 'text-emerald-600', badgeCls: 'bg-emerald-50 text-emerald-700' },
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  tinggi: { label: 'Prioritas Tinggi', cls: 'bg-rose-50 text-rose-700' },
  sedang: { label: 'Prioritas Sedang', cls: 'bg-amber-50 text-amber-700' },
  rendah: { label: 'Prioritas Rendah', cls: 'bg-slate-100 text-slate-600' },
}

export default function RekomendasiPage() {
  const [filter, setFilter] = useState<RekomendasiTipe | 'all'>('all')

  const filtered = rekomendasiList.filter(r => filter === 'all' || r.tipe === filter)
  const sorted = [...filtered].sort((a, b) => {
    const order = { tinggi: 0, sedang: 1, rendah: 2 }
    return order[a.priority] - order[b.priority]
  })

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Rekomendasi Pintar Dapur" subtitle="Insight dan anjuran berbasis histori inventori, tren konsumsi, dan kalkulasi profitabilitas" />

      <main className="p-8 space-y-7 max-w-5xl mx-auto">
        {/* Banner Clay Card */}
        <div className="clay-card p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 clay-pill">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-800">DapurTwin AI Intelligence</p>
            <p className="text-xs text-slate-500 mt-0.5">Sistem mendeteksi <span className="font-bold text-emerald-600">{rekomendasiList.length} insight prediktif</span> dari kalkulasi log mutasi bahan dan tren pesanan kasir terkini.</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full clay-pill flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
            <span>{rekomendasiList.filter(r => r.priority === 'tinggi').length} Tindakan Kritis</span>
          </div>
        </div>

        {/* Filter Clay Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {(['all', 'Stok', 'Keuangan', 'Penjualan'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all',
                filter === f ? 'clay-btn-primary' : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              {f === 'all' ? `Semua (${rekomendasiList.length})` : f === 'Stok' ? `Stok (${rekomendasiList.filter(r => r.tipe === 'Stok').length})` : f === 'Keuangan' ? `Keuangan (${rekomendasiList.filter(r => r.tipe === 'Keuangan').length})` : `Penjualan (${rekomendasiList.filter(r => r.tipe === 'Penjualan').length})`}
            </button>
          ))}
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-4">
          {sorted.map(r => {
            const tipeCfg = TIPE_CONFIG[r.tipe]
            const priCfg = PRIORITY_CONFIG[r.priority]
            const Icon = tipeCfg.icon

            return (
              <div key={r.id} className="clay-card p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 clay-pill">
                      <Icon className={clsx('w-5 h-5', tipeCfg.colorCls)} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{r.judul}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold clay-pill', tipeCfg.badgeCls)}>{r.tipe}</span>
                        <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold clay-pill', priCfg.cls)}>{priCfg.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tingkat Keyakinan</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 h-2 clay-inset rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.confidence}%` }} />
                      </div>
                      <span className="text-xs font-black text-emerald-600 font-mono">{r.confidence}%</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-14 font-medium">{r.deskripsi}</p>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
