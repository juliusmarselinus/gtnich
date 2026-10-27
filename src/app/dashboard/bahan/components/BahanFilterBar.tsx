'use client'

import { Plus, Search } from 'lucide-react'
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

export default function BahanFilterBar({
  filterStatus,
  onFilterChange,
  search,
  onSearchChange,
  counts,
  onOpenAdd,
}: BahanFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {(['all', 'ok', 'rendah', 'habis'] as const).map(s => (
        <button
          key={s}
          onClick={() => onFilterChange(s)}
          className={clsx(
            'px-4 py-2 rounded-2xl text-xs font-bold transition-all',
            filterStatus === s
              ? 'clay-btn-primary shadow-sm'
              : 'clay-btn text-slate-600 hover:text-slate-900'
          )}
        >
          {s === 'all'
            ? `Semua (${counts.all})`
            : s === 'ok'
            ? `Aman (${counts.ok})`
            : s === 'rendah'
            ? `Rendah (${counts.rendah})`
            : `Habis (${counts.habis})`}
        </button>
      ))}

      <div className="ml-auto flex items-center gap-3">
        <div className="relative w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari nama bahan..."
            className="w-full pl-10 pr-3.5 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={onOpenAdd}
          className="clay-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
        >
          <Plus className="w-4 h-4" /> Tambah Bahan
        </button>
      </div>
    </div>
  )
}
