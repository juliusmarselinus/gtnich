'use client'

import { SimulasiMenuItem } from '../types'
import CustomSelect from '@/components/ui/CustomSelect'
import { Package, AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
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
      <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs p-12 text-center text-[#8C8275]">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#2B261F]">Belum ada menu di database</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Parameter Target Produksi */}
      <div className="relative overflow-hidden rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_8px_24px_rgba(120,80,30,0.06)] p-6 space-y-5">
        <span aria-hidden className="pointer-events-none absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-[#FFF9EC]/80" />
        <div className="relative flex items-center gap-2.5 pb-3 border-b border-[#F0EBE1]">
          <span className="w-9 h-9 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center font-bold shadow-2xs">
            <Package className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-black text-[#2B261F] uppercase tracking-wider">
              Rencana Target Batch Produksi
            </h3>
            <p className="text-[11px] text-[#8C8275] font-medium">Kalkulasi kesiapan bahan berdasarkan porsi</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
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
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
            Target Porsi Dibuat (Batch)
          </label>
          <input
            type="number"
            min={1}
            value={servings || ''}
            onChange={e => onChangeServings(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
          />
        </div>

        {hasShortage ? (
          <div className="p-4 rounded-2xl bg-[#FEF4F2] border border-[#F9C2B8] text-[11px] text-[#D8431F] space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 font-extrabold text-[#8F220B]">
              <AlertCircle className="w-4 h-4 text-[#D8431F] flex-shrink-0" />
              Peringatan: Stok bahan di gudang tidak mencukupi target batch ini!
            </div>
            <p className="text-[#A6351B] leading-relaxed">
              Disarankan membuat Purchase Order (PO) ke supplier sebelum memulai proses produksi dapur.
            </p>
            <Link
              href="/dashboard/purchase-order"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white font-bold text-[10px] shadow-xs hover:shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer"
            >
              <span>Buat Purchase Order (PO) Sekarang</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#E8F5E4] border border-[#C5E8BD] text-[11px] text-[#2D7A1F] flex items-center gap-2.5 shadow-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#2D7A1F] flex-shrink-0" />
            <span>Semua bahan baku tersedia cukup di gudang untuk membuat {servings} porsi.</span>
          </div>
        )}
      </div>

      {/* Status Ketersediaan Bahan */}
      <div className="relative overflow-hidden rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_8px_24px_rgba(120,80,30,0.06)] p-6 space-y-4">
        <span aria-hidden className="pointer-events-none absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-[#E2EBC0]/35" />
        <div className="relative flex items-center gap-2.5 pb-3 border-b border-[#F0EBE1]">
          <span className="w-9 h-9 rounded-2xl bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center font-bold shadow-2xs">
            <Package className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-black text-[#2B261F] uppercase tracking-wider">
              Status Ketersediaan Bahan di Dapur
            </h3>
            <p className="text-[11px] text-[#8C8275] font-medium">Pemeriksaan stok riil resep</p>
          </div>
        </div>

        {supplyNeeded.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8C8275] bg-[#FCFAF6] rounded-2xl border border-dashed border-[#EBE6DC]">
            Menu ini belum memiliki daftar resep bahan baku.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {supplyNeeded.map((s, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F0EBE1] space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-[#2B261F]">{s.namaBahan}</p>
                  <span
                    className={clsx(
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs',
                      s.cukup
                        ? 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]'
                        : 'bg-[#FEF4F2] text-[#D8431F] border-[#F9C2B8]'
                    )}
                  >
                    {s.cukup ? '✓ Stok Cukup' : '✗ Kurang'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1 border-t border-[#EBE6DC]">
                  <div>
                    <p className="text-[#8C8275] font-medium">Dibutuhkan</p>
                    <p className="font-mono font-bold text-[#2B261F]">
                      {Math.round(s.needed * 100) / 100} {s.satuan}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8C8275] font-medium">Stok Ada</p>
                    <p className="font-mono font-bold text-[#2B261F]">
                      {s.stok} {s.satuan}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8C8275] font-medium">Kekurangan</p>
                    <p
                      className={clsx(
                        'font-mono font-bold',
                        s.cukup ? 'text-[#2D7A1F]' : 'text-[#D8431F]'
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
