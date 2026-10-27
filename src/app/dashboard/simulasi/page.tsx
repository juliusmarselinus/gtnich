'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { menuList, bahanList, suppliers } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Sparkles, TrendingUp, Package, Truck } from 'lucide-react'
import clsx from 'clsx'

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
      <Topbar title="Simulasi" subtitle="Simulasikan skenario penjualan, harga supplier, dan kebutuhan supply" />

      <main className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#EAE5DF]">
          {[
            { key: 'penjualan', label: 'Simulasi Penjualan', icon: TrendingUp },
            { key: 'supplier', label: 'Simulasi Supplier', icon: Truck },
            { key: 'supply', label: 'Simulasi Supply', icon: Package },
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as SimTab)}
                className={clsx('flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px', tab === t.key ? 'border-[#3E6B48] text-[#3E6B48]' : 'border-transparent text-[#9C9589] hover:text-[#1F1D1A]')}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Simulasi Penjualan */}
        {tab === 'penjualan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#1F1D1A] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#3E6B48]" /> Parameter Simulasi</h3>
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1.5">Pilih Menu</label>
                <select value={selMenu} onChange={e => setSelMenu(e.target.value)} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]">
                  {menuList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1.5">Jumlah Porsi Dijual</label>
                <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#9C9589] mb-2">Bahan yang Dibutuhkan</p>
                <div className="space-y-1.5">
                  {stockNeeded.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs p-2 bg-[#FAF8F5] rounded-lg">
                      <span className="text-[#1F1D1A]">{s.namaBahan}</span>
                      <span className="text-[#9C9589] font-mono">{s.qty.toFixed(2)} {s.satuan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#1F1D1A]">Hasil Proyeksi</h3>
              <div className="space-y-3">
                {[
                  { label: 'Proyeksi Pendapatan', value: formatRupiah(projRevenue), cls: 'text-[#1F1D1A]' },
                  { label: 'Total HPP', value: formatRupiah(projHPP), cls: 'text-[#9C9589]' },
                  { label: 'Proyeksi Profit', value: formatRupiah(projProfit), cls: 'text-[#3E6B48] font-bold' },
                  { label: 'Margin', value: `${projRevenue > 0 ? ((projProfit / projRevenue) * 100).toFixed(1) : 0}%`, cls: 'text-[#3E6B48] font-bold' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center p-3 bg-[#FAF8F5] rounded-xl">
                    <span className="text-xs text-[#9C9589]">{r.label}</span>
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
            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#1F1D1A] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#3E6B48]" /> Parameter Simulasi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#9C9589] mb-1.5">Pilih Bahan</label>
                  <select value={selBahan} onChange={e => setSelBahan(e.target.value)} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]">
                    {bahanList.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#9C9589] mb-1.5">Perubahan Harga (%)</label>
                  <input type="number" value={pctChange} onChange={e => setPctChange(Number(e.target.value))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-[#FAF8F5] rounded-xl">
                  <p className="text-[10px] text-[#9C9589]">Harga Lama</p>
                  <p className="text-sm font-bold text-[#1F1D1A] font-mono">{formatRupiah(oldPrice)}</p>
                </div>
                <div className="p-3 bg-[#EAF0EC] rounded-xl">
                  <p className="text-[10px] text-[#3E6B48]">Harga Baru</p>
                  <p className="text-sm font-bold text-[#3E6B48] font-mono">{formatRupiah(newPrice)}</p>
                </div>
              </div>
            </div>
            {affectedMenus.length > 0 && (
              <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#1F1D1A]">Dampak pada Menu</h3>
                <div className="space-y-3">
                  {affectedMenus.map(m => (
                    <div key={m.id} className="p-4 bg-[#FAF8F5] rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-[#1F1D1A]">{m.nama}</p>
                        <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full', m.hppChange > 0 ? 'bg-red-50 text-red-600' : 'bg-[#EAF0EC] text-[#3E6B48]')}>
                          HPP {m.hppChange > 0 ? '+' : ''}{formatRupiah(m.hppChange)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div><p className="text-[#9C9589]">HPP Lama</p><p className="font-mono font-semibold text-[#1F1D1A]">{formatRupiah(m.oldHPP)}</p></div>
                        <div><p className="text-[#9C9589]">HPP Baru</p><p className="font-mono font-semibold text-[#1F1D1A]">{formatRupiah(Math.round(m.newHPP))}</p></div>
                        <div><p className="text-[#9C9589]">Margin Baru</p><p className={clsx('font-semibold', m.newMargin < 30 ? 'text-red-600' : 'text-[#3E6B48]')}>{m.newMargin.toFixed(1)}%</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {affectedMenus.length === 0 && <p className="text-center text-[#9C9589] text-sm py-8">Bahan ini tidak digunakan dalam resep manapun.</p>}
          </div>
        )}

        {/* Simulasi Supply */}
        {tab === 'supply' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#1F1D1A] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#3E6B48]" /> Parameter Simulasi</h3>
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1.5">Pilih Menu</label>
                <select value={selMenuSupply} onChange={e => setSelMenuSupply(e.target.value)} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]">
                  {menuList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1.5">Target Porsi Produksi</label>
                <input type="number" min={1} value={servings} onChange={e => setServings(Number(e.target.value))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#1F1D1A]">Kebutuhan Bahan</h3>
              <div className="space-y-2">
                {supplyNeeded.map((s, i) => (
                  <div key={i} className={clsx('p-3 rounded-xl border', s.cukup ? 'border-[#C5DBC9] bg-[#EAF0EC]/30' : 'border-red-200 bg-red-50/40')}>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-[#1F1D1A]">{s.namaBahan}</p>
                      <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full', s.cukup ? 'bg-[#EAF0EC] text-[#3E6B48]' : 'bg-red-100 text-red-600')}>{s.cukup ? '✓ Cukup' : '✗ Kurang'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[10px]">
                      <div><p className="text-[#9C9589]">Dibutuhkan</p><p className="font-mono font-semibold text-[#1F1D1A]">{s.needed.toFixed(2)} {s.satuan}</p></div>
                      <div><p className="text-[#9C9589]">Stok Tersedia</p><p className="font-mono font-semibold text-[#1F1D1A]">{s.stok} {s.satuan}</p></div>
                      <div><p className="text-[#9C9589]">Kekurangan</p><p className={clsx('font-mono font-semibold', s.cukup ? 'text-[#3E6B48]' : 'text-red-600')}>{s.cukup ? '-' : `${s.kekurangan.toFixed(2)} ${s.satuan}`}</p></div>
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
