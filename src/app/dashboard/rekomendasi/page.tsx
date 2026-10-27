'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { rekomendasiList, Rekomendasi, RekomendasiTipe } from '@/lib/dapur-data'
import { Lightbulb, Package, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const TIPE_CONFIG: Record<RekomendasiTipe, { icon: React.ElementType; cls: string; badgeCls: string }> = {
  Stok: { icon: Package, cls: 'bg-blue-50 border-blue-200', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200' },
  Keuangan: { icon: DollarSign, cls: 'bg-amber-50 border-amber-200', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200' },
  Penjualan: { icon: TrendingUp, cls: 'bg-[#EAF0EC] border-[#C5DBC9]', badgeCls: 'bg-[#EAF0EC] text-[#3E6B48] border-[#C5DBC9]' },
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  tinggi: { label: 'Prioritas Tinggi', cls: 'bg-red-100 text-red-700 border-red-200' },
  sedang: { label: 'Prioritas Sedang', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  rendah: { label: 'Prioritas Rendah', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
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
      <Topbar title="Rekomendasi" subtitle="Saran cerdas berbasis data untuk optimasi dapur Anda" />

      <main className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-[#3E6B48]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1F1D1A]">Analisis Otomatis DapurTwin</p>
            <p className="text-xs text-[#9C9589] mt-0.5">Sistem menemukan <span className="font-semibold text-[#3E6B48]">{rekomendasiList.length} rekomendasi</span> berdasarkan data stok, penjualan, dan keuangan terkini.</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-[#9C9589]">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span><span className="font-bold text-red-600">{rekomendasiList.filter(r => r.priority === 'tinggi').length}</span> perlu tindakan segera</span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'Stok', 'Keuangan', 'Penjualan'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', filter === f ? 'bg-[#3E6B48] text-white' : 'bg-white border border-[#EAE5DF] text-[#9C9589] hover:bg-[#FAF8F5]')}
            >
              {f === 'all' ? `Semua (${rekomendasiList.length})` : f === 'Stok' ? `Stok (${rekomendasiList.filter(r => r.tipe === 'Stok').length})` : f === 'Keuangan' ? `Keuangan (${rekomendasiList.filter(r => r.tipe === 'Keuangan').length})` : `Penjualan (${rekomendasiList.filter(r => r.tipe === 'Penjualan').length})`}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {sorted.map(r => {
            const tipeCfg = TIPE_CONFIG[r.tipe]
            const priCfg = PRIORITY_CONFIG[r.priority]
            const Icon = tipeCfg.icon

            return (
              <div key={r.id} className={clsx('rounded-xl border shadow-2xs p-5 space-y-3 transition-all hover:shadow-md', tipeCfg.cls)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 border border-white/50">
                      <Icon className="w-4.5 h-4.5 text-[#3E6B48]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1F1D1A]">{r.judul}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={clsx('inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold', tipeCfg.badgeCls)}>{r.tipe}</span>
                        <span className={clsx('inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold', priCfg.cls)}>{priCfg.label}</span>
                      </div>
                    </div>
                  </div>
                  {/* Confidence */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-[#9C9589] font-medium">Confidence</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-16 h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3E6B48] rounded-full" style={{ width: `${r.confidence}%` }} />
                      </div>
                      <span className="text-xs font-bold text-[#3E6B48]">{r.confidence}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#1F1D1A]/80 leading-relaxed pl-12">{r.deskripsi}</p>
              </div>
            )
          })}
          {sorted.length === 0 && (
            <div className="text-center py-12 text-[#9C9589] text-sm">Tidak ada rekomendasi untuk kategori ini.</div>
          )}
        </div>
      </main>
    </div>
  )
}
