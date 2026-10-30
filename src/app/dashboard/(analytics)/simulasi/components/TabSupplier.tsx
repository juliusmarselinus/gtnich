'use client'

import { SimulasiBahanItem, SimulasiMenuItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import CustomSelect from '@/components/ui/CustomSelect'
import { Sparkles, Truck, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

interface TabSupplierProps {
  bahanList: SimulasiBahanItem[]
  menus: SimulasiMenuItem[]
  selBahan: string
  onSelectBahan: (id: string) => void
  pctChange: number
  onChangePct: (pct: number) => void
}

export default function TabSupplier({
  bahanList,
  menus,
  selBahan,
  onSelectBahan,
  pctChange,
  onChangePct,
}: TabSupplierProps) {
  const bahanItem = bahanList.find(b => b.id === selBahan) || bahanList[0]
  const oldPrice = bahanItem?.hargaPerSatuan ?? 0
  const newPrice = Math.round(oldPrice * (1 + pctChange / 100))
  const priceChange = newPrice - oldPrice

  // Filter menu yang memakai bahan ini
  const affectedMenus = menus
    .filter(m => m.resep.some(r => r.bahanId === (bahanItem?.id ?? '')))
    .map(m => {
      const r = m.resep.find(x => x.bahanId === bahanItem?.id)!
      const hppChange = r.qty * priceChange
      const newHPP = m.estimasiHPP + hppChange
      const newMargin = m.hargaJual > 0 ? ((m.hargaJual - newHPP) / m.hargaJual) * 100 : 0
      return {
        id: m.id,
        nama: m.nama,
        oldHPP: m.estimasiHPP,
        newHPP,
        hppChange,
        newMargin,
        profitPercent: m.profitPercent,
        hargaJual: m.hargaJual,
        qtyBahan: r.qty,
        satuanBahan: r.satuan,
      }
    })

  if (bahanList.length === 0) {
    return (
      <div className="clay-card p-12 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
        <p className="text-xs font-bold text-slate-700">Belum ada bahan baku di database</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Tambahkan data bahan baku di menu bahan terlebih dahulu.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Parameter Skenario */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
          <Truck className="w-4 h-4 text-[#FF8F2B]" /> Skenario Fluktuasi Harga Bahan Distributor
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Pilih Bahan Baku
            </label>
            <CustomSelect
              value={bahanItem?.nama || ''}
              onChange={selectedNama => {
                const match = bahanList.find(b => b.nama === selectedNama)
                if (match) onSelectBahan(match.id)
              }}
              options={bahanList.map(b => b.nama)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Persentase Kenaikan / Penurunan (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pctChange || ''}
                onChange={e => onChangePct(Number(e.target.value) || 0)}
                placeholder="+10 atau -5"
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono font-bold"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3.5 clay-inset rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Harga Satuan Saat Ini
            </p>
            <p className="text-base font-black text-slate-700 font-mono mt-0.5">
              {formatRupiah(oldPrice)}{' '}
              <span className="text-[10px] font-normal text-slate-400">/{bahanItem?.satuan}</span>
            </p>
          </div>

          <div
            className={clsx(
              'p-3.5 rounded-2xl border',
              priceChange > 0
                ? 'bg-rose-50/70 border-rose-100 text-rose-700'
                : 'bg-[#FFF6EC]/70 border-[#FFE2C2] text-[#FF8F2B]'
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider">Harga Prediksi Baru</p>
            <p className="text-base font-black font-mono mt-0.5">
              {formatRupiah(newPrice)}{' '}
              <span className="text-[10px] font-normal">/{bahanItem?.satuan}</span>
            </p>
          </div>

          <div className="p-3.5 clay-inset rounded-2xl col-span-2 sm:col-span-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Selisih Per Satuan
            </p>
            <p
              className={clsx(
                'text-base font-black font-mono mt-0.5',
                priceChange > 0 ? 'text-rose-600' : 'text-[#FF8F2B]'
              )}
            >
              {priceChange > 0 ? '+' : ''}
              {formatRupiah(priceChange)}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Terdampak */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Dampak Perubahan Pada Menu ({affectedMenus.length} Menu Terkait)
          </h3>
          <span className="text-[11px] text-slate-400">
            Dihitung otomatis berdasarkan formula resep dapur
          </span>
        </div>

        {affectedMenus.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Tidak ada menu yang menggunakan bahan <strong>{bahanItem?.nama}</strong> dalam resepnya.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affectedMenus.map(m => (
              <div key={m.id} className="p-4 clay-inset rounded-2xl space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">{m.nama}</p>
                    <p className="text-[10px] text-slate-400">
                      Pemakaian resep: {m.qtyBahan} {m.satuanBahan} / porsi
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'text-[11px] font-bold px-2.5 py-0.5 rounded-full clay-pill',
                      m.hppChange > 0 ? 'bg-rose-50 text-rose-600' : 'bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]'
                    )}
                  >
                    HPP {m.hppChange > 0 ? '+' : ''}
                    {formatRupiah(Math.round(m.hppChange))}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1 border-t border-slate-100">
                  <div>
                    <p className="text-slate-400 font-semibold">HPP Awal</p>
                    <p className="font-mono font-bold text-slate-700">{formatRupiah(m.oldHPP)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">HPP Baru</p>
                    <p className="font-mono font-bold text-slate-900">
                      {formatRupiah(Math.round(m.newHPP))}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Margin Baru</p>
                    <p
                      className={clsx(
                        'font-bold font-mono',
                        m.newMargin < 30 ? 'text-rose-600' : 'text-[#FF8F2B]'
                      )}
                    >
                      {m.newMargin.toFixed(1)}%
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
