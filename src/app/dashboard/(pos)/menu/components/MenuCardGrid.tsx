'use client'

import { MenuItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChefHat, TrendingUp, Edit2, Trash2 } from 'lucide-react'

interface MenuCardGridProps {
  list: MenuItem[]
  onEdit: (m: MenuItem) => void
  onDelete: (id: string) => void
}

export default function MenuCardGrid({
  list,
  onEdit,
  onDelete,
}: MenuCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {list.map(m => (
        <div key={m.id} className="clay-card p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-9 h-9 rounded-2xl bg-[#FFF6EC] text-[#FF8F2B] flex items-center justify-center text-lg clay-pill flex-shrink-0">
                  {m.emoji || <ChefHat className="w-4 h-4" />}
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 leading-tight">{m.nama}</h3>
                  {m.sku && <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {m.sku}</p>}
                </div>
              </div>
              <span className="text-[10px] px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                {m.kategori}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(m)}
                title="Edit Menu"
                className="p-2 rounded-xl clay-btn text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(m.id)}
                title="Hapus Menu"
                className="p-2 rounded-xl clay-btn text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pricing Pods */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="clay-inset p-2.5 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. HPP</p>
              <p className="text-xs font-black text-slate-800 mt-0.5 font-mono">{formatRupiah(m.estimasiHPP)}</p>
            </div>
            <div className="clay-inset p-2.5 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harga Jual</p>
              <p className="text-xs font-black text-slate-800 mt-0.5 font-mono">{formatRupiah(m.hargaJual)}</p>
            </div>
            <div className="bg-[#FFF6EC] rounded-xl p-2.5 border border-[#FFE2C2] shadow-[inset_1px_1px_2px_#ffffff]">
              <p className="text-[10px] text-[#FF8F2B] font-bold uppercase tracking-wider">Margin Laba</p>
              <p className="text-xs font-black text-[#C86400] mt-0.5 flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {m.profitPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Resep Items Komposisi */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Komposisi Resep ({m.resep.length} Bahan)
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {m.resep.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">{r.namaBahan}</span>
                  <span className="text-slate-500 font-mono font-bold">
                    {r.qty} {r.satuan}
                  </span>
                </div>
              ))}
              {m.resep.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada bahan dalam resep menu ini.</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {list.length === 0 && (
        <div className="col-span-full clay-card py-16 text-center text-slate-400 text-sm font-medium">
          Tidak ada menu masakan yang ditemukan di database.
        </div>
      )}
    </div>
  )
}
