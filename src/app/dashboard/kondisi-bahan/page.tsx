'use client'

import Topbar from '@/components/Topbar'
import { bahanList, suppliers } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react'
import clsx from 'clsx'

function stockStatus(stok: number, min: number): 'habis' | 'rendah' | 'ok' {
  if (stok === 0) return 'habis'
  if (stok <= min) return 'rendah'
  return 'ok'
}

const statusConfig = {
  ok: {
    label: 'Aman',
    icon: CheckCircle,
    badgeCls: 'bg-emerald-50 text-emerald-700',
    barCls: 'bg-emerald-500',
  },
  rendah: {
    label: 'Rendah',
    icon: AlertTriangle,
    badgeCls: 'bg-amber-50 text-amber-700',
    barCls: 'bg-amber-500',
  },
  habis: {
    label: 'Habis',
    icon: XCircle,
    badgeCls: 'bg-rose-50 text-rose-700',
    barCls: 'bg-rose-500',
  },
}

export default function KondisiBahanPage() {
  const ok = bahanList.filter(b => stockStatus(b.stok, b.stokMinimum) === 'ok')
  const rendah = bahanList.filter(b => stockStatus(b.stok, b.stokMinimum) === 'rendah')
  const habis = bahanList.filter(b => stockStatus(b.stok, b.stokMinimum) === 'habis')

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Kondisi Bahan & Inventory" subtitle="Pantau level persediaan bahan baku secara visual dengan indikator ambang batas" />

      <main className="p-8 space-y-7 max-w-7xl mx-auto">
        {/* Summary Clay Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Stok Kondisi Aman', count: ok.length, icon: CheckCircle, colorCls: 'text-emerald-600', pillCls: 'bg-emerald-50' },
            { label: 'Stok Mendekati Habis', count: rendah.length, icon: AlertTriangle, colorCls: 'text-amber-600', pillCls: 'bg-amber-50' },
            { label: 'Stok Kosong / Habis', count: habis.length, icon: XCircle, colorCls: 'text-rose-600', pillCls: 'bg-rose-50' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="clay-card p-6 flex items-center gap-5">
                <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center clay-pill flex-shrink-0', s.pillCls)}>
                  <Icon className={clsx('w-7 h-7', s.colorCls)} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800 font-mono">{s.count}</p>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ingredient Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {bahanList.map(b => {
            const st = stockStatus(b.stok, b.stokMinimum)
            const cfg = statusConfig[st]
            const Icon = cfg.icon
            const pct = b.stokMinimum > 0 ? Math.min(100, (b.stok / (b.stokMinimum * 3)) * 100) : 100
            const supplierName = suppliers.find(s => s.id === b.supplierId)?.nama ?? '-'

            return (
              <div key={b.id} className="clay-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center clay-pill flex-shrink-0">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{b.nama}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{b.id}</p>
                    </div>
                  </div>
                  <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold clay-pill', cfg.badgeCls)}>
                    <Icon className="w-3.5 h-3.5" /> {cfg.label}
                  </span>
                </div>

                {/* Progress Level Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Level Kapasitas</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 clay-inset p-0.5 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all duration-500', cfg.barCls)} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="clay-inset p-2.5 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stok Saat Ini</p>
                    <p className="text-sm font-black text-slate-800 font-mono mt-0.5">{b.stok} <span className="text-[10px] font-bold text-slate-400">{b.satuan}</span></p>
                  </div>
                  <div className="clay-inset p-2.5 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Batas Minimum</p>
                    <p className="text-sm font-black text-slate-800 font-mono mt-0.5">{b.stokMinimum} <span className="text-[10px] font-bold text-slate-400">{b.satuan}</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                  <span className="font-mono">{formatRupiah(b.hargaPerSatuan)}/{b.satuan}</span>
                  <span className="truncate max-w-[55%] text-right text-[11px] text-slate-400">{supplierName}</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
