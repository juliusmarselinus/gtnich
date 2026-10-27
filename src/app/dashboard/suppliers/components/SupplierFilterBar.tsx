'use client'

import { Plus, Search } from 'lucide-react'

interface SupplierFilterBarProps {
  search: string
  onSearchChange: (val: string) => void
  totalCount: number
  onOpenAdd: () => void
}

export default function SupplierFilterBar({
  search,
  onSearchChange,
  totalCount,
  onOpenAdd,
}: SupplierFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Cari nama supplier atau kategori..."
          className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500">
          Total: {totalCount} Supplier
        </span>
        <button
          onClick={onOpenAdd}
          className="clay-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          Tambah Supplier
        </button>
      </div>
    </div>
  )
}
