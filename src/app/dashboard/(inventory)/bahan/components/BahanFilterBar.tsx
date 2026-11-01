'use client'

import { Plus, Search, X } from 'lucide-react'
import clsx from 'clsx'
import { FilterStatus } from '../types'

interface BahanFilterBarProps {
  filterStatus: FilterStatus
  onFilterChange: (status: FilterStatus) => void
  search: string
  onSearchChange: (search: string) => void
  counts: { all: number; ok: number; rendah: number; habis: number }
  onOpenAdd: () => void
}

const TABS: { key: FilterStatus; label: string; badgeColor: string }[] = [
  { key: 'all', label: 'Semua Bahan', badgeColor: 'bg-white/80 text-slate-700' },
  { key: 'ok', label: 'Stok Aman', badgeColor: 'bg-[#E8F5E4] text-[#2D7A1F]' },
  { key: 'rendah', label: 'Perlu Restock', badgeColor: 'bg-[#FFF6D6] text-[#8A5A00]' },
  { key: 'habis', label: 'Habis', badgeColor: 'bg-[#FDE8E4] text-[#D8431F]' },
]

export default function BahanFilterBar({
  filterStatus,
  onFilterChange,
  search,
  onSearchChange,
  counts,
  onOpenAdd,
}: BahanFilterBarProps) {
  const getCount = (k: FilterStatus) => {
    if (k === 'all') return counts.all
    if (k === 'ok') return counts.ok
    if (k === 'rendah') return counts.rendah
    return counts.habis
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
      {/* Tabs Filter Kondisi Stok */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {TABS.map(tab => {
          const active = filterStatus === tab.key
          const count = getCount(tab.key)

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={clsx(
                'px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer flex-shrink-0',
                active
                  ? 'bg-[#FFB800] text-[#2B1D00] shadow-xs'
                  : 'bg-white hover:bg-[#FFF9EC] text-slate-600 border border-[#EBE3D7]/80'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-[10px] font-black',
                  active ? 'bg-white/80 text-[#2B1D00]' : tab.badgeColor
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Pencarian dan Tambah Bahan */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari nama bahan / satuan..."
            className="w-full pl-9 pr-8 py-2.5 rounded-full bg-white border border-[#EBE3D7]/90 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/60 focus:border-transparent transition shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenAdd}
          className="px-5 py-2.5 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bahan</span>
        </button>
      </div>
    </div>
  )
}
