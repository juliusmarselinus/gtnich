'use client'

import { SimulasiBahanItem, SimulasiMenuItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import CustomSelect from '@/components/ui/CustomSelect'
import { Truck, AlertTriangle, TrendingDown, TrendingUp, Layers } from 'lucide-react'
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
      <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs p-12 text-center text-[#8C8275]">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#2B261F]">Belum ada bahan baku di database</p>
        <p className="text-xs text-[#8C8275] mt-1 max-w-sm mx-auto">
          Tambahkan data bahan baku di menu bahan terlebih dahulu.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Parameter Skenario */}
      <div className="relative overflow-hidden rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_8px_24px_rgba(120,80,30,0.06)] p-6 space-y-5">
        <span aria-hidden className="pointer-events-none absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-[#FFF9EC]/80" />
        <div className="relative flex items-center gap-2.5 pb-3 border-b border-[#F0EBE1]">
          <span className="w-9 h-9 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center font-bold shadow-2xs">
            <Truck className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-black text-[#2B261F] uppercase tracking-wider">
              Skenario Fluktuasi Harga Bahan Distributor
            </h3>
            <p className="text-[11px] text-[#8C8275] font-medium">Uji dampak harga beli ke HPP dan margin menu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
              Persentase Kenaikan / Penurunan (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pctChange || ''}
                onChange={e => onChangePct(Number(e.target.value) || 0)}
                placeholder="+10 atau -5"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
              />
              <span className="text-xs font-bold text-[#8C8275]">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center pt-1">
          <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F0EBE1]">
            <p className="text-[10px] text-[#8C8275] font-bold uppercase tracking-wider">
              Harga Satuan Saat Ini
            </p>
            <p className="text-base font-extrabold text-[#2B261F] font-mono mt-1">
              {formatRupiah(oldPrice)}{' '}
              <span className="text-[10px] font-normal text-[#8C8275]">/{bahanItem?.satuan}</span>
            </p>
          </div>

          <div
            className={clsx(
              'p-4 rounded-2xl border shadow-xs',
              priceChange > 0
                ? 'bg-[#FEF4F2] border-[#F9C2B8] text-[#D8431F]'
                : 'bg-[#FFF9EC] border-[#FFE49A]/80 text-[#8A5A00]'
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider">Harga Prediksi Baru</p>
            <p className="text-base font-extrabold font-mono mt-1">
              {formatRupiah(newPrice)}{' '}
              <span className="text-[10px] font-normal">/{bahanItem?.satuan}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F0EBE1]">
            <p className="text-[10px] text-[#8C8275] font-bold uppercase tracking-wider">
              Selisih Per Satuan
            </p>
            <p
              className={clsx(
                'text-base font-extrabold font-mono mt-1',
                priceChange > 0 ? 'text-[#D8431F]' : 'text-[#2D7A1F]'
              )}
            >
              {priceChange > 0 ? '+' : ''}
              {formatRupiah(priceChange)}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Terdampak */}
      <div className="relative overflow-hidden rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_8px_24px_rgba(120,80,30,0.06)] p-6 space-y-4">
        <span aria-hidden className="pointer-events-none absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-[#F2D9CC]/35" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#F0EBE1]">
          <h3 className="text-xs font-black text-[#2B261F] uppercase tracking-wider flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-4 h-4 text-[#FF8F2B]" />
            </span>
            Dampak Perubahan Pada Menu ({affectedMenus.length} Menu Terkait)
          </h3>
          <span className="text-[11px] text-[#8C8275] font-medium">
            Dihitung otomatis berdasarkan formula resep dapur
          </span>
        </div>

        {affectedMenus.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8C8275] bg-[#FCFAF6] rounded-2xl border border-dashed border-[#EBE6DC]">
            Tidak ada menu yang menggunakan bahan <strong>{bahanItem?.nama}</strong> dalam resepnya.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affectedMenus.map(m => (
              <div key={m.id} className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F0EBE1] space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-[#2B261F]">{m.nama}</p>
                    <p className="text-[10px] text-[#8C8275] mt-0.5">
                      Pemakaian resep: {m.qtyBahan} {m.satuanBahan} / porsi
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs whitespace-nowrap',
                      m.hppChange > 0
                        ? 'bg-[#FEF4F2] text-[#D8431F] border-[#F9C2B8]'
                        : 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]'
                    )}
                  >
                    HPP {m.hppChange > 0 ? '+' : ''}
                    {formatRupiah(Math.round(m.hppChange))}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-[#EBE6DC]">
                  <div>
                    <p className="text-[#8C8275] font-semibold">HPP Awal</p>
                    <p className="font-mono font-bold text-[#2B261F]">{formatRupiah(m.oldHPP)}</p>
                  </div>
                  <div>
                    <p className="text-[#8C8275] font-semibold">HPP Baru</p>
                    <p className="font-mono font-extrabold text-[#2B261F]">
                      {formatRupiah(Math.round(m.newHPP))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8C8275] font-semibold">Margin Baru</p>
                    <p
                      className={clsx(
                        'font-bold font-mono',
                        m.newMargin < 30 ? 'text-[#D8431F]' : 'text-[#2D7A1F]'
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
