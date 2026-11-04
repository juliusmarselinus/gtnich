'use client'

import { SimulasiMenuItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import CustomSelect from '@/components/ui/CustomSelect'
import { TrendingUp, AlertTriangle, Calculator, DollarSign, Utensils } from 'lucide-react'
import clsx from 'clsx'

interface TabPenjualanProps {
  menus: SimulasiMenuItem[]
  selMenu: string
  onSelectMenu: (id: string) => void
  qty: number
  onChangeQty: (qty: number) => void
}

export default function TabPenjualan({
  menus,
  selMenu,
  onSelectMenu,
  qty,
  onChangeQty,
}: TabPenjualanProps) {
  const menuItem = menus.find(m => m.id === selMenu) || menus[0]
  const projRevenue = (menuItem?.hargaJual ?? 0) * qty
  const projHPP = (menuItem?.estimasiHPP ?? 0) * qty
  const projProfit = projRevenue - projHPP
  const marginPct = projRevenue > 0 ? (projProfit / projRevenue) * 100 : 0
  const stockNeeded =
    menuItem?.resep.map(r => ({
      namaBahan: r.namaBahan,
      satuan: r.satuan,
      qty: r.qty * qty,
      stokTersedia: r.stokTersedia,
      isSufficient: r.stokTersedia >= r.qty * qty,
    })) ?? []

  if (menus.length === 0) {
    return (
      <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs p-12 text-center text-[#8C8275]">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#2B261F]">Belum ada menu yang terdaftar di database</p>
        <p className="text-xs text-[#8C8275] mt-1 max-w-sm mx-auto">
          Tambahkan menu & resep terlebih dahulu di menu dashboard untuk menjalankan simulasi penjualan.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Parameter Input */}
      <div className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F0EBE1]">
          <span className="w-8 h-8 rounded-xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-extrabold text-[#2B261F] uppercase tracking-wider">
            Parameter Simulasi Penjualan
          </h3>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
            Pilih Target Menu
          </label>
          <CustomSelect
            value={menuItem?.nama || ''}
            onChange={selectedNama => {
              const match = menus.find(m => m.nama === selectedNama)
              if (match) onSelectMenu(match.id)
            }}
            options={menus.map(m => m.nama)}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
            Target Jumlah Porsi Terjual
          </label>
          <input
            type="number"
            min={1}
            value={qty || ''}
            onChange={e => onChangeQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
          />
        </div>

        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-2 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#FF8F2B]" />
            Estimasi Kebutuhan Bahan Resep
          </p>
          {stockNeeded.length === 0 ? (
            <p className="text-[11px] text-[#8C8275] italic">Menu ini belum memiliki komposisi resep.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {stockNeeded.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs p-3 rounded-2xl bg-[#FCFAF6] border border-[#F0EBE1]"
                >
                  <span className="font-bold text-[#2B261F]">{s.namaBahan}</span>
                  <div className="text-right">
                    <span className="text-[#D8431F] font-mono font-bold">
                      {Math.round(s.qty * 100) / 100} {s.satuan}
                    </span>
                    <span
                      className={clsx(
                        'block text-[10px] font-bold mt-0.5',
                        s.isSufficient ? 'text-[#2D7A1F]' : 'text-[#D8431F]'
                      )}
                    >
                      {s.isSufficient
                        ? `(Stok aman: ${s.stokTersedia})`
                        : `(Stok kurang: sisa ${s.stokTersedia})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Proyeksi Finansial */}
      <div className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F0EBE1]">
          <span className="w-8 h-8 rounded-xl bg-[#E8F5E4] text-[#2D7A1F] flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-extrabold text-[#2B261F] uppercase tracking-wider">
            Hasil Proyeksi Finansial
          </h3>
        </div>

        <div className="space-y-2.5">
          {[
            {
              label: 'Proyeksi Omzet Kotor',
              value: formatRupiah(projRevenue),
              cls: 'text-[#2B261F] font-bold',
            },
            {
              label: 'Akumulasi Beban HPP Resep',
              value: formatRupiah(projHPP),
              cls: 'text-[#8C8275] font-medium',
            },
            {
              label: 'Estimasi Profit Bersih',
              value: formatRupiah(projProfit),
              cls: 'text-[#FF6B00] font-black text-lg',
            },
            {
              label: 'Margin Keuntungan',
              value: `${marginPct.toFixed(1)}%`,
              cls: 'text-[#2D7A1F] font-extrabold',
            },
          ].map(r => (
            <div
              key={r.label}
              className="flex justify-between items-center p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F0EBE1]"
            >
              <span className="text-xs font-bold text-[#7A7062]">{r.label}</span>
              <span className={clsx('text-sm font-mono', r.cls)}>{r.value}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/80 text-[11px] text-[#5C3D00] space-y-1 shadow-xs">
          <p className="font-extrabold text-[#2B1D00]">Analisis Keuntungan:</p>
          <p className="leading-relaxed">
            Setiap 1 porsi menu <strong className="text-[#2B1D00]">{menuItem?.nama}</strong> menghasilkan margin sebesar{' '}
            <strong className="text-[#FF6B00] font-mono">
              {formatRupiah((menuItem?.hargaJual ?? 0) - (menuItem?.estimasiHPP ?? 0))}
            </strong>{' '}
            (Harga jual {formatRupiah(menuItem?.hargaJual ?? 0)} vs HPP {formatRupiah(menuItem?.estimasiHPP ?? 0)}).
          </p>
        </div>
      </div>
    </div>
  )
}
