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
    label: 'OK',
    icon: CheckCircle,
    cardCls: 'border-[#C5DBC9] bg-[#EAF0EC]/40',
    badgeCls: 'bg-[#EAF0EC] text-[#3E6B48] border-[#C5DBC9]',
    barCls: 'bg-[#3E6B48]',
  },
  rendah: {
    label: 'Rendah',
    icon: AlertTriangle,
    cardCls: 'border-amber-200 bg-amber-50/40',
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-200',
    barCls: 'bg-amber-400',
  },
  habis: {
    label: 'Habis',
    icon: XCircle,
    cardCls: 'border-red-200 bg-red-50/40',
    badgeCls: 'bg-red-50 text-red-600 border-red-200',
    barCls: 'bg-red-500',
  },
}

export default function KondisiBahanPage() {
  const ok = bahanList.filter(b => stockStatus(b.stok, b.stokMinimum) === 'ok')
  const rendah = bahanList.filter(b => stockStatus(b.stok, b.stokMinimum) === 'rendah')
  const habis = bahanList.filter(b => stockStatus(b.stok, b.stokMinimum) === 'habis')

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Kondisi Bahan" subtitle="Pantau status stok semua bahan baku secara visual" />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Stok OK', count: ok.length, icon: CheckCircle, cls: 'text-[#3E6B48]', bg: 'bg-[#EAF0EC]' },
            { label: 'Stok Rendah', count: rendah.length, icon: AlertTriangle, cls: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Stok Habis', count: habis.length, icon: XCircle, cls: 'text-red-600', bg: 'bg-red-50' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 flex items-center gap-4">
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', s.bg)}>
                  <Icon className={clsx('w-6 h-6', s.cls)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1F1D1A]">{s.count}</p>
                  <p className="text-xs text-[#9C9589] font-medium">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ingredient Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bahanList.map(b => {
            const st = stockStatus(b.stok, b.stokMinimum)
            const cfg = statusConfig[st]
            const Icon = cfg.icon
            const pct = b.stokMinimum > 0 ? Math.min(100, (b.stok / (b.stokMinimum * 3)) * 100) : 100
            const supplierName = suppliers.find(s => s.id === b.supplierId)?.nama ?? '-'

            return (
              <div key={b.id} className={clsx('rounded-xl border shadow-2xs p-5 space-y-3 transition-all', cfg.cardCls)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center border border-white/50">
                      <Package className="w-4 h-4 text-[#9C9589]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F1D1A]">{b.nama}</p>
                      <p className="text-[10px] text-[#9C9589]">{b.id}</p>
                    </div>
                  </div>
                  <span className={clsx('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold', cfg.badgeCls)}>
                    <Icon className="w-3 h-3" /> {cfg.label}
                  </span>
                </div>

                {/* Stock Bar */}
                <div>
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', cfg.barCls)} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-[10px] text-[#9C9589] font-medium">Stok Saat Ini</p>
                    <p className="text-sm font-bold text-[#1F1D1A] font-mono">{b.stok} <span className="text-[10px] font-normal text-[#9C9589]">{b.satuan}</span></p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-[10px] text-[#9C9589] font-medium">Minimum</p>
                    <p className="text-sm font-bold text-[#1F1D1A] font-mono">{b.stokMinimum} <span className="text-[10px] font-normal text-[#9C9589]">{b.satuan}</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#9C9589]">
                  <span>{formatRupiah(b.hargaPerSatuan)}/{b.satuan}</span>
                  <span className="truncate max-w-[60%] text-right">{supplierName}</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
