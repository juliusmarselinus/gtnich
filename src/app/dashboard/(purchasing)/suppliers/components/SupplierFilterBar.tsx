'use client'

import { Plus, Search, Filter } from 'lucide-react'
import { SupplierCategory } from '../types'

interface SupplierFilterBarProps {
  search: string
  onSearchChange: (val: string) => void
  totalCount: number
  onOpenAdd: () => void
  categories?: SupplierCategory[]
  activeCategory?: string
  onSelectCategory?: (cat: string) => void
}

export default function SupplierFilterBar({
  search,
  onSearchChange,
  totalCount,
  onOpenAdd,
  categories = [],
  activeCategory = 'all',
  onSelectCategory,
}: SupplierFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari nama supplier, telepon, atau kategori..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] focus:border-transparent transition-all shadow-xs"
          />
        </div>

        {/* Action Button & Meta */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-semibold text-[#8C8275] hidden sm:inline">
            Total: <strong className="text-[#2B261F]">{totalCount}</strong> Mitra
          </span>
          <button
            onClick={onOpenAdd}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white font-bold text-xs shadow-xs hover:shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Supplier
          </button>
        </div>
      </div>

      {/* Category Filter Pills (if categories exist) */}
      {categories.length > 0 && onSelectCategory && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-[#8C8275] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#FF8F2B]" /> Kategori:
          </span>
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#2B261F] text-white shadow-xs'
                : 'bg-white text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
            }`}
          >
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.nama)}
              className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.nama
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'bg-white text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
              }`}
            >
              {cat.nama}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
