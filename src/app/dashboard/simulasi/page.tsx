'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { menuList, bahanList } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Sparkles, TrendingUp, Package, Truck } from 'lucide-react'
import clsx from 'clsx'
import CustomSelect from '@/components/ui/CustomSelect'

type SimTab = 'penjualan' | 'supplier' | 'supply'

export default function SimulasiPage() {
  const [tab, setTab] = useState<SimTab>('penjualan')

  // Simulasi Penjualan
  const [selMenu, setSelMenu] = useState(menuList[0]?.id ?? '')
  const [qty, setQty] = useState(10)

  // Simulasi Supplier
  const [selBahan, setSelBahan] = useState(bahanList[0]?.id ?? '')
  const [pctChange, setPctChange] = useState(10)

  // Simulasi Supply
  const [selMenuSupply, setSelMenuSupply] = useState(menuList[0]?.id ?? '')
  const [servings, setServings] = useState(20)

  // --- Penjualan Simulation ---
  const menuItem = menuList.find(m => m.id === selMenu)
  const projRevenue = (menuItem?.hargaJual ?? 0) * qty
  const projHPP = (menuItem?.estimasiHPP ?? 0) * qty
  const projProfit = projRevenue - projHPP
  const stockNeeded = menuItem?.resep.map(r => ({ namaBahan: r.namaBahan, satuan: r.satuan, qty: r.qty * qty })) ?? []

  // --- Supplier Simulation ---
  const bahanItem = bahanList.find(b => b.id === selBahan)
  const oldPrice = bahanItem?.hargaPerSatuan ?? 0
  const newPrice = Math.round(oldPrice * (1 + pctChange / 100))
  const priceChange = newPrice - oldPrice
  const affectedMenus = menuList.filter(m => m.resep.some(r => r.bahanId === selBahan)).map(m => {
    const r = m.resep.find(x => x.bahanId === selBahan)!
    const hppChange = r.qty * priceChange
    const newHPP = m.estimasiHPP + hppChange
    const newMargin = m.hargaJual > 0 ? ((m.hargaJual - newHPP) / m.hargaJual) * 100 : 0
    return { id: m.id, nama: m.nama, oldHPP: m.estimasiHPP, newHPP, hppChange, newMargin, profitPercent: m.profitPercent }
  })

  // --- Supply Simulation ---
  const menuSupply = menuList.find(m => m.id === selMenuSupply)
  const supplyNeeded = menuSupply?.resep.map(r => {
    const bahan = bahanList.find(b => b.id === r.bahanId)
    const needed = r.qty * servings
    const stok = bahan?.stok ?? 0
    const cukup = stok >= needed
    return { namaBahan: r.namaBahan, satuan: r.satuan, needed, stok, cukup, kekurangan: cukup ? 0 : needed - stok }
  }) ?? []

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Simulasi Dapur & Bisnis" subtitle="Eksplorasi proyeksi keuntungan penjualan, perubahan harga bahan baku supplier, dan kecukupan supply" />

      <main className="p-8 space-y-7 max-w-5xl mx-auto">
        {/* Clay Tabs */}
        <div className="flex gap-3">
          {[
            { key: 'penjualan', label: 'Simulasi Penjualan', icon: TrendingUp },
            { key: 'supplier', label: 'Simulasi Harga Supplier', icon: Truck },
            { key: 'supply', label: 'Simulasi Kecukupan Supply', icon: Package },
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as SimTab)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                  tab === t.key ? 'clay-btn-primary' : 'clay-btn text-slate-600 hover:text-slate-900'
                )}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Simulasi Penjualan */}
        {tab === 'penjualan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="clay-card p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Parameter Simulasi Penjualan
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Pilih Target Menu</label>
                <CustomSelect
                  value={selMenu}
                  onChange={val => setSelMenu(val)}
                  options={menuList.map(m => ({ value: m.id, label: m.nama }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Target Jumlah Porsi</label>
                <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bahan Baku yang Akan Terpakai</p>
                <div className="space-y-1.5">
                  {stockNeeded.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs p-2.5 clay-inset rounded-xl">
                      <span className="font-semibold text-slate-700">{s.namaBahan}</span>
                      <span className="text-emerald-700 font-mono font-bold">{s.qty.toFixed(2)} {s.satuan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="clay-card p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Hasil Proyeksi Finansial</h3>
              <div className="space-y-3">
                {[
                  { label: 'Proyeksi Omzet Kotor', value: formatRupiah(projRevenue), cls: 'text-slate-800' },
                  { label: 'Akumulasi Beban HPP', value: formatRupiah(projHPP), cls: 'text-slate-500' },
                  { label: 'Estimasi Profit Bersih', value: formatRupiah(projProfit), cls: 'text-emerald-600 font-black text-lg' },
                  { label: 'Margin Keuntungan', value: `${projRevenue > 0 ? ((projProfit / projRevenue) * 100).toFixed(1) : 0}%`, cls: 'text-emerald-600 font-bold' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center p-3.5 clay-inset rounded-2xl">
                    <span className="text-xs font-bold text-slate-500">{r.label}</span>
                    <span className={clsx('text-sm font-mono', r.cls)}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Simulasi Supplier */}
        {tab === 'supplier' && (
          <div className="space-y-6">
            <div className="clay-card p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Skenario Fluktuasi Harga Bahan
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Pilih Bahan Baku</label>
                  <CustomSelect
                    value={selBahan}
                    onChange={val => setSelBahan(val)}
                    searchable={true}
                    options={bahanList.map(b => ({ value: b.id, label: b.nama }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Kenaikan/Penurunan (%)</label>
                  <input type="number" value={pctChange} onChange={e => setPctChange(Number(e.target.value))} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3.5 clay-inset rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harga Sebelum</p>
                  <p className="text-base font-black text-slate-700 font-mono mt-0.5">{formatRupiah(oldPrice)}</p>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Harga Prediksi Baru</p>
                  <p className="text-base font-black text-emerald-700 font-mono mt-0.5">{formatRupiah(newPrice)}</p>
                </div>
              </div>
            </div>

            {affectedMenus.length > 0 && (
              <div className="clay-card p-6 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Dampak Perubahan Pada Menu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {affectedMenus.map(m => (
                    <div key={m.id} className="p-4 clay-inset rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-extrabold text-slate-800">{m.nama}</p>
                        <span className={clsx('text-[11px] font-bold px-2.5 py-0.5 rounded-full clay-pill', m.hppChange > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')}>
                          HPP {m.hppChange > 0 ? '+' : ''}{formatRupiah(m.hppChange)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                        <div><p className="text-slate-400">HPP Awal</p><p className="font-mono font-bold text-slate-700">{formatRupiah(m.oldHPP)}</p></div>
                        <div><p className="text-slate-400">HPP Baru</p><p className="font-mono font-bold text-slate-900">{formatRupiah(Math.round(m.newHPP))}</p></div>
                        <div><p className="text-slate-400">Margin Baru</p><p className={clsx('font-bold', m.newMargin < 30 ? 'text-rose-600' : 'text-emerald-600')}>{m.newMargin.toFixed(1)}%</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simulasi Supply */}
        {tab === 'supply' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="clay-card p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Target Produksi
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Pilih Menu</label>
                <CustomSelect
                  value={selMenuSupply}
                  onChange={val => setSelMenuSupply(val)}
                  options={menuList.map(m => ({ value: m.id, label: m.nama }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Target Porsi Dibuat</label>
                <input type="number" min={1} value={servings} onChange={e => setServings(Number(e.target.value))} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono" />
              </div>
            </div>

            <div className="clay-card p-6 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Status Ketersediaan Bahan di Dapur</h3>
              <div className="space-y-2.5">
                {supplyNeeded.map((s, i) => (
                  <div key={i} className="p-3.5 clay-inset rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-slate-800">{s.namaBahan}</p>
                      <span className={clsx('text-[11px] font-bold px-2.5 py-0.5 rounded-full clay-pill', s.cukup ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
                        {s.cukup ? '✓ Stok Cukup' : '✗ Kurang'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[10px]">
                      <div><p className="text-slate-400">Dibutuhkan</p><p className="font-mono font-bold text-slate-800">{s.needed.toFixed(2)} {s.satuan}</p></div>
                      <div><p className="text-slate-400">Stok Ada</p><p className="font-mono font-bold text-slate-800">{s.stok} {s.satuan}</p></div>
                      <div><p className="text-slate-400">Kekurangan</p><p className={clsx('font-mono font-bold', s.cukup ? 'text-emerald-600' : 'text-rose-600')}>{s.cukup ? '0' : `${s.kekurangan.toFixed(2)} ${s.satuan}`}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
