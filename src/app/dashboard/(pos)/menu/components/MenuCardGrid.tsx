'use client'

import { useState, useMemo } from 'react'
import { MenuItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { TrendingUp, Edit2, Trash2, ImageOff, Eye, EyeOff } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import clsx from 'clsx'

interface MenuCardGridProps {
  list: MenuItem[]
  bahanList?: any[]
  onEdit: (m: MenuItem) => void
  onDelete: (m: MenuItem) => void
  onToggleActive?: (m: MenuItem) => void
  onOpenAdd?: () => void
}

export default function MenuCardGrid({
  list,
  onEdit,
  onDelete,
  onToggleActive,
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
        {paginatedList.map(m => {
          const isActive = m.isActive !== false

          return (
            <div
              key={m.id}
              className={clsx(
                'rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_4px_20px_rgba(120,80,30,0.06)] overflow-hidden flex flex-col justify-between hover:shadow-[0_12px_28px_rgba(120,80,30,0.12)] hover:-translate-y-1 transition-all duration-200',
                !isActive && 'opacity-70 bg-slate-50/60 border-slate-300'
              )}
            >
              {/* Wrapper Mobile Horizontal / Desktop Vertical */}
              <div className="flex flex-row sm:flex-col flex-1 min-w-0">
                {/* Banner / Visual Menu: Horizontal di mobile, Banner aspect di desktop */}
                <div className="relative w-32 sm:w-full flex-shrink-0 sm:aspect-[16/7] bg-gradient-to-br from-[#FFF9EC] via-[#FDF6E2] to-[#F7F2E7] sm:border-b border-r sm:border-r-0 border-[#F0E8D8] flex items-center justify-center overflow-hidden">
                  <div className="flex flex-col items-center gap-1 sm:gap-1.5 text-slate-400 select-none p-2 sm:p-0">
                    <span className={clsx(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-2xs border border-[#EFE5D0] flex items-center justify-center text-xl sm:text-2xl',
                      !isActive && 'grayscale opacity-60'
                    )}>
                      {m.emoji || <ImageOff className="w-5 h-5 text-slate-300" />}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5 sm:gap-1">
                      <ImageOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300" />
                      <span className="hidden xs:inline">No Image</span>
                    </span>
                  </div>

                  {/* Badge Kategori & Status Aktif Desktop */}
                  <div className="hidden sm:flex absolute top-3 left-3 items-center gap-1.5">
                    <span className="text-[10px] px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#7A5A10] font-extrabold uppercase tracking-wider shadow-2xs border border-[#EBE6DC]">
                      {m.kategori}
                    </span>
                    {!isActive && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-700 text-white font-extrabold uppercase tracking-wider shadow-2xs">
                        Nonaktif
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Desktop */}
                  <div className="hidden sm:flex absolute top-3 right-3 items-center gap-1">
                    {onToggleActive && (
                      <button
                        type="button"
                        onClick={() => onToggleActive(m)}
                        title={isActive ? 'Nonaktifkan Menu' : 'Aktifkan Menu'}
                        className={clsx(
                          'w-8 h-8 rounded-full shadow-2xs border border-[#EBE6DC] flex items-center justify-center cursor-pointer transition-all active:scale-95',
                          isActive
                            ? 'bg-white/90 backdrop-blur-xs text-emerald-600 hover:bg-emerald-50'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        )}
                      >
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(m)}
                      title="Edit Menu"
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-amber-800 hover:bg-white shadow-2xs border border-[#EBE6DC] flex items-center justify-center cursor-pointer transition-all active:scale-95"
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

                {/* Konten Card: Di mobile sebelah kanan, di desktop di bawah */}
                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug line-clamp-1">
                            {m.nama}
                          </h3>
                          {!isActive && (
                            <span className="sm:hidden text-[9px] px-2 py-0.5 rounded-full bg-slate-700 text-white font-bold uppercase">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        {m.sku ? (
                          <p className="text-[10px] sm:text-[10.5px] text-slate-400 font-mono mt-0.5 truncate">SKU: {m.sku}</p>
                        ) : (
                          <p className="text-[10px] sm:text-[10.5px] text-slate-400 italic mt-0.5">Tanpa kode SKU</p>
                        )}
                      </div>
                      {/* Badge Kategori & Actions Mobile */}
                      <div className="sm:hidden flex items-center gap-1 flex-shrink-0">
                        {onToggleActive && (
                          <button
                            type="button"
                            onClick={() => onToggleActive(m)}
                            title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            className={clsx(
                              'w-7 h-7 rounded-full flex items-center justify-center',
                              isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'
                            )}
                          >
                            {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(m)}
                          title="Edit Menu"
                          className="w-7 h-7 rounded-full bg-[#FFF6D6] text-slate-700 flex items-center justify-center"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(m)}
                          title="Hapus Menu"
                          className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {/* Kategori label mobile */}
                    <span className="sm:hidden inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-[#FFF6D6] text-[#7A5A10] font-bold uppercase tracking-wider">
                      {m.kategori}
                    </span>
                  </div>

                  {/* Pricing Pods */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                    <div className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#FCFAF6] border border-[#F2ECE1]">
                      <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Est. HPP</p>
                      <p className="text-[11px] sm:text-xs font-black text-slate-800 mt-0.5 font-mono truncate">{formatRupiah(m.estimasiHPP)}</p>
                    </div>
                    <div className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#FCFAF6] border border-[#F2ECE1]">
                      <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Harga Jual</p>
                      <p className="text-[11px] sm:text-xs font-black text-slate-800 mt-0.5 font-mono truncate">{formatRupiah(m.hargaJual)}</p>
                    </div>
                    <div className="bg-[#FFF6EC] rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 border border-[#FFE2C2]">
                      <p className="text-[8.5px] sm:text-[9.5px] text-[#FF8F2B] font-bold uppercase tracking-wider">Margin</p>
                      <p className="text-[11px] sm:text-xs font-black text-[#C86400] mt-0.5 flex items-center justify-center gap-0.5 font-mono">
                        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" /> {m.profitPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Resep Items Komposisi */}
                  <div className="pt-2 border-t border-[#F2ECE1]">
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Resep ({m.resep.length} Bahan)
                    </p>
                    <div className="space-y-1 max-h-28 sm:max-h-36 overflow-y-auto pr-1">
                      {m.resep.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl bg-[#FAF8F2] border border-[#F0EBE1]"
                        >
                          <span className="font-semibold text-slate-700 truncate max-w-[110px] sm:max-w-[140px] text-[11px] sm:text-xs">{r.namaBahan}</span>
                          <span className="text-slate-500 font-mono font-bold text-[10px] sm:text-[11px]">
                            {r.qty} {r.satuan}
                          </span>
                        </div>
                      ))}
                      {m.resep.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">Belum ada bahan resep.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

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
