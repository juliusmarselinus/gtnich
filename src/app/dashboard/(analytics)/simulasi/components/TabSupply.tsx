'use client'

import { SimulasiMenuItem } from '../types'
import CustomSelect from '@/components/ui/CustomSelect'
import { Sparkles, Package, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

interface TabSupplyProps {
  menus: SimulasiMenuItem[]
  selMenuSupply: string
  onSelectMenuSupply: (id: string) => void
  servings: number
  onChangeServings: (servings: number) => void
}

export default function TabSupply({
  menus,
  selMenuSupply,
  onSelectMenuSupply,
  servings,
  onChangeServings,
}: TabSupplyProps) {
  const menuSupply = menus.find(m => m.id === selMenuSupply) || menus[0]

  const supplyNeeded =
    menuSupply?.resep.map(r => {
      const needed = r.qty * servings
      const stok = r.stokTersedia
      const cukup = stok >= needed
      const kekurangan = cukup ? 0 : needed - stok
      return {
        namaBahan: r.namaBahan,
        satuan: r.satuan,
        needed,
        stok,
        cukup,
        kekurangan,
      }
    }) ?? []

  const hasShortage = supplyNeeded.some(s => !s.cukup)

  if (menus.length === 0) {
    return (
      <div className="clay-card p-12 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
        <p className="text-xs font-bold text-slate-700">Belum ada menu di database</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Parameter Target Produksi */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#FF8F2B]" /> Rencana Target Batch Produksi
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Pilih Menu yang Ingin Diproduksi
          </label>
          <CustomSelect
            value={menuSupply?.nama || ''}
            onChange={selectedNama => {
              const match = menus.find(m => m.nama === selectedNama)
              if (match) onSelectMenuSupply(match.id)
            }}
            options={menus.map(m => m.nama)}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Target Porsi Dibuat (Batch)
          </label>
          <input
            type="number"
            min={1}
            value={servings || ''}
            onChange={e => onChangeServings(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono font-bold"
          />
        </div>

        {hasShortage ? (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Peringatan: Stok bahan di gudang tidak mencukupi target batch ini!
            </div>
            <p className="text-rose-700">
              Disarankan membuat Purchase Order (PO) ke supplier sebelum memulai proses produksi dapur.
            </p>
            <Link
              href="/dashboard/purchase-order"
              className="inline-block px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 cursor-pointer"
            >
              Buat Purchase Order (PO) Sekarang →
            </Link>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#FFF6EC] border border-[#FFE2C2] text-[11px] text-[#C86400] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FF8F2B] flex-shrink-0" />
            <span>Semua bahan baku tersedia cukup di gudang untuk membuat {servings} porsi.</span>
          </div>
        )}
      </div>

      {/* Status Ketersediaan Bahan */}
      <div className="clay-card p-6 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-[#FF8F2B]" /> Status Ketersediaan Bahan di Dapur
        </h3>

        {supplyNeeded.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Menu ini belum memiliki daftar resep bahan baku.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
            {supplyNeeded.map((s, i) => (
              <div key={i} className="p-3.5 clay-inset rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-bold text-slate-800">{s.namaBahan}</p>
                  <span
                    className={clsx(
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full clay-pill',
                      s.cukup ? 'bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]' : 'bg-rose-50 text-rose-700'
                    )}
                  >
                    {s.cukup ? '✓ Stok Cukup' : '✗ Kurang'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[10px]">
                  <div>
                    <p className="text-slate-400 font-medium">Dibutuhkan</p>
                    <p className="font-mono font-bold text-slate-800">
                      {Math.round(s.needed * 100) / 100} {s.satuan}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Stok Ada</p>
                    <p className="font-mono font-bold text-slate-800">
                      {s.stok} {s.satuan}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Kekurangan</p>
                    <p
                      className={clsx(
                        'font-mono font-bold',
                        s.cukup ? 'text-[#FF8F2B]' : 'text-rose-600'
                      )}
                    >
                      {s.cukup ? '0' : `-${Math.round(s.kekurangan * 100) / 100} ${s.satuan}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
