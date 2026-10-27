'use client'

import { Bahan, StockCondition } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Edit2, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'

const statusConfig: Record<StockCondition, { label: string; icon: typeof CheckCircle; cls: string }> = {
  ok: { label: 'Aman', icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-700' },
  rendah: { label: 'Rendah', icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700' },
  habis: { label: 'Habis', icon: XCircle, cls: 'bg-rose-50 text-rose-700' },
}

interface BahanTableProps {
  list: Bahan[]
  getStockCondition: (b: Bahan) => StockCondition
  onEdit: (b: Bahan) => void
  onDelete: (id: string) => void
}

export default function BahanTable({
  list,
  getStockCondition,
  onEdit,
  onDelete,
}: BahanTableProps) {
  return (
    <div className="clay-card overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Nama Bahan
            </th>
            <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Satuan
            </th>
            <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Harga/Satuan
            </th>
            <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Stok Saat Ini
            </th>
            <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Min. Stok
            </th>
            <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Kondisi
            </th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {list.map(b => {
            const st = getStockCondition(b)
            const cfg = statusConfig[st]
            const Icon = cfg.icon

            return (
              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 text-sm">{b.nama}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {b.code || b.id.slice(0, 8)}
                    {b.supplier?.nama && ` • ${b.supplier.nama}`}
                  </p>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-500">{b.satuan}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                  {formatRupiah(b.hargaPerSatuan)}
                </td>
                <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">
                  {b.stok}
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-400">
                  {b.stokMinimum}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold clay-pill',
                      cfg.cls
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" /> {cfg.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(b)}
                      title="Edit"
                      className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
                      title="Hapus"
                      className="p-2 rounded-xl clay-btn text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {list.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm font-medium">
          Tidak ada bahan ditemukan.
        </div>
      )}
    </div>
  )
}
