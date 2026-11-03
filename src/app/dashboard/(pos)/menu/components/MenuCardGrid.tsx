'use client'

import { MenuItem, BahanOption, ResepItemDetail } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { getUnitConversionFactor } from '@/lib/satuan'
import {
  ChefHat,
  TrendingUp,
  Trash2,
  AlertTriangle,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import DapiHead from '@/components/ui/DapiHead'
import clsx from 'clsx'

// Hitung estimasi porsi yang bisa dibuat dari stok bahan saat ini
function calculateAvailablePortions(
  resep: ResepItemDetail[],
  bahanList: BahanOption[]
): number | null {
  if (!resep || resep.length === 0) return null

  let minPortions = Infinity
  for (const item of resep) {
    const bahan = bahanList.find(b => b.id === item.bahanId)
    if (!bahan) {
      minPortions = 0
      break
    }
    const factor = getUnitConversionFactor(item.satuan, bahan.satuan)
    const neededInBase = item.qty * factor
    if (neededInBase <= 0) continue

    const possible = Math.floor(bahan.stok / neededInBase)
    if (possible < minPortions) {
      minPortions = possible
    }
  }

  return minPortions === Infinity ? 0 : Math.max(0, minPortions)
}

interface MenuCardGridProps {
  list: MenuItem[]
  bahanList: BahanOption[]
  onEdit: (m: MenuItem) => void
  onDelete: (m: MenuItem) => void
  onOpenAdd?: () => void
}

export default function MenuCardGrid({
  list,
  bahanList,
  onEdit,
  onDelete,
  onOpenAdd,
}: MenuCardGridProps) {
  if (list.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_2px_16px_rgba(140,100,30,0.06)] border border-[#EBE3D7] py-12 px-6 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#FFF6D6] border border-[#FFE49A] flex items-center justify-center shadow-xs">
          <DapiHead size={42} mood="khawatir" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-base font-black text-[#2B1D00]">Belum Ada Menu Masakan</h3>
          <p className="text-xs text-slate-500 font-medium">
            Mulai daftarkan hidangan, tentukan harga jual, dan racik takaran bahan resep untuk menghitung HPP otomatis.
          </p>
        </div>
        {onOpenAdd && (
          <button
            onClick={onOpenAdd}
            className="px-5 py-2 rounded-full bg-[#D8431F] hover:bg-[#c03917] text-white text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" /> Tambah Menu Pertama
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map(m => {
        const availablePortions = calculateAvailablePortions(m.resep, bahanList)
        const hasRecipe = m.resep && m.resep.length > 0

        // Margin status badge styling
        let marginBadge = {
          bg: 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C3E6BD]',
          text: 'Tinggi',
        }
        if (!hasRecipe || m.profitPercent <= 0) {
          marginBadge = {
            bg: 'bg-slate-100 text-slate-600 border-slate-200',
            text: 'Belum Ada HPP',
          }
        } else if (m.profitPercent < 30) {
          marginBadge = {
            bg: 'bg-[#FDE8E4] text-[#D8431F] border-[#FAD3CB]',
            text: 'Rendah',
          }
        } else if (m.profitPercent < 50) {
          marginBadge = {
            bg: 'bg-[#FFF6D6] text-[#8A5A00] border-[#FFE49A]',
            text: 'Standar',
          }
        }

        return (
          <div
            key={m.id}
            className="group relative flex flex-col justify-between rounded-2xl bg-white border border-[#EBE3D7] hover:border-[#FFB800] shadow-[0_2px_12px_rgba(140,100,30,0.05)] hover:shadow-[0_8px_20px_rgba(140,100,30,0.1)] transition-all duration-200 overflow-hidden"
          >
            {/* Top Compact Decorative Header */}
            <div className="relative bg-gradient-to-br from-[#FFF5DB] via-[#FFF9EC] to-[#FFE6BC] px-4 pt-3 pb-3.5 border-b border-[#FFE49A]/50">
              {/* Row 1: Kategori Badge & Delete Button (Pencil Removed) */}
              <div className="relative z-10 flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#2B1D00] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {m.kategori}
                </span>

                <button
                  type="button"
                  onClick={() => onDelete(m)}
                  title="Hapus Menu"
                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Row 2: Emoji Avatar & Menu Identity */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#FFE49A] shadow-xs flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {m.emoji || '🍽️'}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-sm text-[#2B1D00] leading-snug group-hover:text-[#D8431F] transition-colors truncate">
                    {m.nama}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {m.sku ? (
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/70 px-1.5 py-0.2 rounded border border-[#FFE49A]/60">
                        SKU: {m.sku}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {hasRecipe ? `${m.resep.length} Bahan Komposisi` : 'Resep Kosong'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                {/* Portion Availability Pill */}
                <div>
                  {hasRecipe ? (
                    availablePortions !== null && availablePortions > 0 ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E4] text-[#2D7A1F] text-[11px] font-bold border border-[#C3E6BD]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#228B5B] animate-pulse" />
                        <span>Bisa dibuat {availablePortions} porsi dari stok</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDE8E4] text-[#D8431F] text-[11px] font-bold border border-[#FAD3CB]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D8431F]" />
                        <span>Bahan baku habis di gudang</span>
                      </div>
                    )
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF6D6] text-[#8A5A00] text-[11px] font-bold border border-[#FFE49A]">
                      <AlertTriangle className="w-3 h-3 text-[#FF9A1F]" />
                      <span>Belum ada takaran resep</span>
                    </div>
                  )}
                </div>

                {/* Compact Financial Pod */}
                <div className="rounded-xl bg-[#FFFBF2] border border-[#FFE49A] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Harga Jual
                      </p>
                      <p className="text-base font-black text-[#2B1D00] font-mono leading-none mt-0.5">
                        {formatRupiah(m.hargaJual)}
                      </p>
                    </div>

                    <div className={clsx('px-2.5 py-0.5 rounded-lg font-black text-[11px] border flex items-center gap-1', marginBadge.bg)}>
                      <TrendingUp className="w-3 h-3 flex-shrink-0" />
                      <span>Margin {hasRecipe ? `${m.profitPercent.toFixed(0)}%` : '-'}</span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#FFE49A] to-transparent" />

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Est. HPP Modal:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.2 rounded border border-[#FFE49A]/60">
                      {formatRupiah(m.estimasiHPP)}
                    </span>
                  </div>
                </div>

                {/* Resep Ingredient Scrollable List */}
                <div className="space-y-1.5 pt-1 border-t border-[#F2ECE1]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#FFB800]" />
                      <span>Resep ({m.resep.length} Bahan)</span>
                    </span>
                    {hasRecipe && (
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        HPP {formatRupiah(m.estimasiHPP)}
                      </span>
                    )}
                  </div>

                  {hasRecipe ? (
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {m.resep.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-[#F7F5F0] border border-[#EBE6DC] text-slate-700 hover:bg-[#FFFBF2] transition-colors"
                        >
                          <span className="font-semibold truncate max-w-[170px] text-slate-800">
                            {r.namaBahan}
                          </span>
                          <span className="font-mono font-bold text-slate-600 text-[10px] flex-shrink-0 bg-white px-1.5 py-0.2 rounded border border-[#EBE6DC]">
                            {r.qty} {r.satuan}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => onEdit(m)}
                      className="p-2.5 rounded-xl bg-[#FFF9EC] border border-dashed border-[#FFE49A] text-center cursor-pointer hover:bg-[#FFF4DC] transition-colors"
                    >
                      <p className="text-[11px] font-bold text-[#8A5A00] flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#FFB800]" />
                        <span>Racik Takaran Bahan</span>
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Klik untuk hitung HPP otomatis dari bahan dapur
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Button (Tema Terracotta #D8431F) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onEdit(m)}
                  className="w-full py-2.5 rounded-xl bg-[#D8431F] hover:bg-[#c03917] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <ChefHat className="w-4 h-4 text-white" />
                  <span>Kelola Resep & Harga</span>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
