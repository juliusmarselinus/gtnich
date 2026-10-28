'use client'

import { MenuItem } from '../../menu/types'
import { formatRupiah } from '@/lib/mock-data'
import { Plus, ChefHat, Sparkles } from 'lucide-react'

interface MenuKatalogGridProps {
  menus: MenuItem[]
  onAddToCart: (m: MenuItem) => void
}

export default function MenuKatalogGrid({
  menus,
  onAddToCart,
}: MenuKatalogGridProps) {
  if (menus.length === 0) {
    return (
      <div className="clay-card py-16 text-center text-slate-400 space-y-2">
        <ChefHat className="w-8 h-8 mx-auto text-slate-300" />
        <p className="text-xs font-semibold">Tidak ada menu yang sesuai dengan filter.</p>
        <p className="text-[10px] text-slate-400">Pastikan menu sudah dibuat dan aktif di menu "Menu & Resep".</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
      {menus.map(menu => {
        const marginPct =
          menu.hargaJual > 0
            ? Math.round(((menu.hargaJual - menu.estimasiHPP) / menu.hargaJual) * 100)
            : 0

        return (
          <button
            key={menu.id}
            type="button"
            onClick={() => onAddToCart(menu)}
            className="clay-card p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl clay-pill flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  {menu.emoji || '🍽️'}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider truncate max-w-[90px]">
                  {menu.kategori}
                </span>
              </div>

              <h4 className="font-extrabold text-xs text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                {menu.nama}
              </h4>

              {menu.resep && menu.resep.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{menu.resep.length} bahan resep</span>
                </p>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
              <div>
                <p className="text-sm font-black font-mono text-emerald-700 leading-tight">
                  {formatRupiah(menu.hargaJual)}
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                  HPP: {formatRupiah(menu.estimasiHPP)} ({marginPct}%)
                </p>
              </div>

              <span className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-emerald-500 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4" />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
