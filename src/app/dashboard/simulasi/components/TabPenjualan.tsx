'use client'

import { SimulasiMenuItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import CustomSelect from '@/components/ui/CustomSelect'
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'
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
      <div className="clay-card p-12 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
        <p className="text-xs font-bold text-slate-700">Belum ada menu yang terdaftar di database</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Tambahkan menu & resep terlebih dahulu di menu dashboard untuk menjalankan simulasi penjualan.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Parameter Input */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-500" /> Parameter Simulasi Penjualan
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
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
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Target Jumlah Porsi Terjual
          </label>
          <input
            type="number"
            min={1}
            value={qty || ''}
            onChange={e => onChangeQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono font-bold"
          />
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Estimasi Kebutuhan Bahan Resep
          </p>
          {stockNeeded.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">Menu ini belum memiliki komposisi resep.</p>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {stockNeeded.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs p-2.5 clay-inset rounded-xl"
                >
                  <span className="font-semibold text-slate-700">{s.namaBahan}</span>
                  <div className="text-right">
                    <span className="text-emerald-700 font-mono font-bold">
                      {Math.round(s.qty * 100) / 100} {s.satuan}
                    </span>
                    <span
                      className={clsx(
                        'block text-[9px] font-bold',
                        s.isSufficient ? 'text-emerald-600' : 'text-rose-500'
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
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Hasil Proyeksi Finansial
        </h3>

        <div className="space-y-3">
          {[
            {
              label: 'Proyeksi Omzet Kotor',
              value: formatRupiah(projRevenue),
              cls: 'text-slate-800 font-bold',
            },
            {
              label: 'Akumulasi Beban HPP Resep',
              value: formatRupiah(projHPP),
              cls: 'text-slate-500 font-medium',
            },
            {
              label: 'Estimasi Profit Bersih',
              value: formatRupiah(projProfit),
              cls: 'text-emerald-600 font-black text-lg',
            },
            {
              label: 'Margin Keuntungan',
              value: `${marginPct.toFixed(1)}%`,
              cls: 'text-emerald-600 font-bold',
            },
          ].map(r => (
            <div
              key={r.label}
              className="flex justify-between items-center p-3.5 clay-inset rounded-2xl"
            >
              <span className="text-xs font-bold text-slate-500">{r.label}</span>
              <span className={clsx('text-sm font-mono', r.cls)}>{r.value}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
          <p className="font-bold">Analisis Keuntungan:</p>
          <p>
            Setiap 1 porsi menu <strong className="text-slate-900">{menuItem?.nama}</strong> menghasilkan
            margin sebesar{' '}
            <strong className="text-emerald-700">
              {formatRupiah((menuItem?.hargaJual ?? 0) - (menuItem?.estimasiHPP ?? 0))}
            </strong>{' '}
            (Harga jual {formatRupiah(menuItem?.hargaJual ?? 0)} vs HPP {formatRupiah(menuItem?.estimasiHPP ?? 0)}).
          </p>
        </div>
      </div>
    </div>
  )
}
