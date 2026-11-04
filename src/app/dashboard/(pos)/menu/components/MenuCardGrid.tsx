'use client'

import { useState, useMemo } from 'react'
import { MenuItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChefHat, TrendingUp, Edit2, Trash2, ImageOff } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'

interface MenuCardGridProps {
  list: MenuItem[]
  bahanList?: any[]
  onEdit: (m: MenuItem) => void
  onDelete: (m: MenuItem) => void
  onOpenAdd?: () => void
}

export default function MenuCardGrid({
  list,
  onEdit,
  onDelete,
}: MenuCardGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 9

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return list.slice(start, start + PAGE_SIZE)
  }, [list, currentPage])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedList.map(m => (
          <div
            key={m.id}
            className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_4px_20px_rgba(120,80,30,0.06)] overflow-hidden flex flex-col justify-between hover:shadow-[0_12px_28px_rgba(120,80,30,0.12)] hover:-translate-y-1 transition-all duration-200"
          >
            {/* Banner No Image / Visual Menu */}
            <div className="relative w-full aspect-[16/7] bg-gradient-to-br from-[#FFF9EC] via-[#FDF6E2] to-[#F7F2E7] border-b border-[#F0E8D8] flex items-center justify-center overflow-hidden">
              <div className="flex flex-col items-center gap-1.5 text-slate-400 select-none">
                <span className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-[#EFE5D0] flex items-center justify-center text-2xl">
                  {m.emoji || <ImageOff className="w-5 h-5 text-slate-300" />}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ImageOff className="w-3 h-3 text-slate-300" />
                  No Image Menu
                </span>
              </div>

              {/* Badge Kategori */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-kopi font-extrabold uppercase tracking-wider shadow-2xs border border-[#EBE6DC]">
                  {m.kategori}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(m)}
                  title="Edit Menu"
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-kopi hover:bg-white shadow-2xs border border-[#EBE6DC] flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(m)}
                  title="Hapus Menu"
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 shadow-2xs border border-[#EBE6DC] flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Konten Card */}
            <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-1">
                  {m.nama}
                </h3>
                {m.sku ? (
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">SKU: {m.sku}</p>
                ) : (
                  <p className="text-[10.5px] text-slate-400 italic mt-0.5">Tanpa kode SKU</p>
                )}
              </div>

              {/* Pricing Pods */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-[#FCFAF6] border border-[#F2ECE1]">
                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Est. HPP</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5 font-mono truncate">{formatRupiah(m.estimasiHPP)}</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#FCFAF6] border border-[#F2ECE1]">
                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Harga Jual</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5 font-mono truncate">{formatRupiah(m.hargaJual)}</p>
                </div>
                <div className="bg-[#FFF6EC] rounded-2xl p-2.5 border border-[#FFE2C2]">
                  <p className="text-[9.5px] text-[#FF8F2B] font-bold uppercase tracking-wider">Margin</p>
                  <p className="text-xs font-black text-[#C86400] mt-0.5 flex items-center justify-center gap-0.5 font-mono">
                    <TrendingUp className="w-3 h-3 flex-shrink-0" /> {m.profitPercent.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Resep Items Komposisi */}
              <div className="pt-2 border-t border-[#F2ECE1]">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Komposisi Resep ({m.resep.length} Bahan)
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {m.resep.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#FAF8F2] border border-[#F0EBE1]"
                    >
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">{r.namaBahan}</span>
                      <span className="text-slate-500 font-mono font-bold text-[11px]">
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
          </div>
        ))}

        {list.length === 0 && (
          <div className="col-span-full rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs py-16 text-center text-slate-400 text-sm font-medium">
            Tidak ada menu masakan yang ditemukan di database.
          </div>
        )}
      </div>

      <div className="rounded-[28px] bg-white border border-[#EBE6DC] p-2 sm:p-3 shadow-xs">
        <Pagination
          currentPage={currentPage}
          totalItems={list.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="menu & resep masakan"
        />
      </div>
    </div>
  )
}
