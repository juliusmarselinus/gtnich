'use client'

import { BahanKondisi } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Package, Clock, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react'
import clsx from 'clsx'

interface KondisiCardGridProps {
  list: BahanKondisi[]
}

const FRESHNESS_BADGE = {
  segar: {
    label: 'Segar & Aman',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    icon: ShieldCheck,
  },
  mendekati_expire: {
    label: 'Segera Olah (Exp < 3 Hari)',
    cls: 'bg-amber-50 text-amber-700 border-amber-200/50',
    icon: AlertTriangle,
  },
  kadaluarsa: {
    label: 'Lewat Kedaluwarsa',
    cls: 'bg-rose-50 text-rose-700 border-rose-200/50',
    icon: ShieldAlert,
  },
  tidak_diketahui: {
    label: 'Belum Dianalisis',
    cls: 'bg-slate-100 text-slate-600',
    icon: Clock,
  },
}

export default function KondisiCardGrid({ list }: KondisiCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {list.map(b => {
        const isLowStock = b.stok <= b.stokMinimum
        const pct = b.stokMinimum > 0 ? Math.min(100, (b.stok / (b.stokMinimum * 3)) * 100) : 100

        const freshness = b.aiStatusFreshness ? FRESHNESS_BADGE[b.aiStatusFreshness] : FRESHNESS_BADGE.tidak_diketahui
        const FreshIcon = freshness.icon

        const tglMasukStr = new Date(b.tanggalMasuk).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

        const tglExpireStr = b.aiEstimasiExpire
          ? new Date(b.aiEstimasiExpire).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-'

        return (
          <div key={b.id} className="clay-card p-6 space-y-4 hover:shadow-md transition-shadow">
            {/* Header Bahan & Badge Freshness AI */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center clay-pill flex-shrink-0">
                  <Package className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{b.nama}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {b.code || b.id.slice(0, 8)} • Masuk: {tglMasukStr}
                  </p>
                </div>
              </div>

              <span
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold clay-pill border flex-shrink-0',
                  freshness.cls
                )}
              >
                <FreshIcon className="w-3.5 h-3.5" />
                {freshness.label}
              </span>
            </div>

            {/* AI Shelf-life Prediction Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Estimasi Expire (AI):
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {tglExpireStr}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Sisa Waktu Pemakaian:</span>
                <span
                  className={clsx(
                    'font-mono font-black text-xs px-2 py-0.5 rounded-lg',
                    b.aiSisaHari !== null && b.aiSisaHari !== undefined
                      ? b.aiSisaHari <= 0
                        ? 'bg-rose-100 text-rose-700'
                        : b.aiSisaHari <= 3
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-400'
                  )}
                >
                  {b.aiSisaHari !== null && b.aiSisaHari !== undefined
                    ? b.aiSisaHari <= 0
                      ? 'Sudah Kadaluarsa'
                      : `${b.aiSisaHari} Hari Lagi`
                    : '-'}
                </span>
              </div>

              {b.aiAnalysis?.tipsPenyimpanan && (
                <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/50">
                  💡 {b.aiAnalysis.tipsPenyimpanan}
                </p>
              )}
            </div>

            {/* Level Kapasitas Stok */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Ketersediaan Stok</span>
                <span className={clsx(isLowStock ? 'text-rose-500 font-extrabold' : 'text-slate-600')}>
                  {b.stok} / min. {b.stokMinimum} {b.satuan}
                </span>
              </div>
              <div className="h-2 clay-inset p-0.5 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Footer Harga & Supplier */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
              <span className="font-mono whitespace-nowrap">{formatRupiah(b.hargaPerSatuan)}/{b.satuan}</span>
              <span className="text-right text-[11px] text-slate-400 font-medium truncate" title={b.namaSupplier}>
                {b.namaSupplier}
              </span>
            </div>
          </div>
        )
      })}

      {list.length === 0 && (
        <div className="col-span-full clay-card py-16 text-center text-slate-400 text-sm font-medium">
          Tidak ada bahan yang sesuai filter.
        </div>
      )}
    </div>
  )
}
