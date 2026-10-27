'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { menuList as initialMenu, bahanList, Menu, ResepItem } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Plus, ChefHat, TrendingUp, Edit2, X } from 'lucide-react'
import clsx from 'clsx'

const KATEGORI = ['Camilan', 'Kue', 'Kue & Manisan', 'Lauk Kering', 'Minuman']

function calcHPP(resep: ResepItem[]): number {
  return resep.reduce((sum, r) => {
    const bahan = bahanList.find(b => b.id === r.bahanId)
    if (!bahan) return sum
    return sum + bahan.hargaPerSatuan * r.qty
  }, 0)
}

const emptyForm = { nama: '', kategori: 'Camilan', hargaJual: 0, resep: [] as ResepItem[] }

export default function MenuPage() {
  const [list, setList] = useState<Menu[]>(initialMenu)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Menu | null>(null)
  const [form, setForm] = useState<{ nama: string; kategori: string; hargaJual: number; resep: ResepItem[] }>(emptyForm)
  const [newIngredient, setNewIngredient] = useState({ bahanId: '', qty: 0 })

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(m: Menu) {
    setEditing(m)
    setForm({ nama: m.nama, kategori: m.kategori, hargaJual: m.hargaJual, resep: [...m.resep] })
    setShowModal(true)
  }

  function addIngredient() {
    if (!newIngredient.bahanId || newIngredient.qty <= 0) return
    const bahan = bahanList.find(b => b.id === newIngredient.bahanId)
    if (!bahan) return
    setForm(prev => ({
      ...prev,
      resep: [...prev.resep, { bahanId: bahan.id, namaBahan: bahan.nama, qty: newIngredient.qty, satuan: bahan.satuan }]
    }))
    setNewIngredient({ bahanId: '', qty: 0 })
  }

  function removeIngredient(idx: number) {
    setForm(prev => ({ ...prev, resep: prev.resep.filter((_, i) => i !== idx) }))
  }

  function handleSave() {
    if (!form.nama.trim()) return
    const hpp = calcHPP(form.resep)
    const profit = form.hargaJual - hpp
    const profitPercent = form.hargaJual > 0 ? (profit / form.hargaJual) * 100 : 0
    if (editing) {
      setList(prev => prev.map(m => m.id === editing.id ? { ...editing, ...form, estimasiHPP: hpp, profit, profitPercent } : m))
    } else {
      const newId = `MNU-${String(list.length + 1).padStart(3, '0')}`
      setList(prev => [...prev, { id: newId, ...form, estimasiHPP: hpp, profit, profitPercent }])
    }
    setShowModal(false)
  }

  const liveHPP = calcHPP(form.resep)
  const liveProfit = form.hargaJual - liveHPP
  const liveProfitPct = form.hargaJual > 0 ? (liveProfit / form.hargaJual) * 100 : 0

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Menu & Resep" subtitle="Kelola menu, resep bahan, HPP, dan margin keuntungan" />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-end">
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#3E6B48] text-white text-xs font-semibold rounded-xl hover:bg-[#345a3d] transition-colors">
            <Plus className="w-4 h-4" /> Tambah Menu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-7 h-7 rounded-lg bg-[#EAF0EC] flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-[#3E6B48]" />
                    </span>
                    <h3 className="font-bold text-sm text-[#1F1D1A]">{m.nama}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-[#9C9589] font-medium">{m.kategori}</span>
                </div>
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-[#EAE5DF] text-[#9C9589] hover:text-[#1F1D1A] transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#FAF8F5] rounded-lg p-2.5">
                  <p className="text-[10px] text-[#9C9589] font-medium">HPP</p>
                  <p className="text-xs font-bold text-[#1F1D1A] mt-0.5 font-mono">{formatRupiah(m.estimasiHPP)}</p>
                </div>
                <div className="bg-[#FAF8F5] rounded-lg p-2.5">
                  <p className="text-[10px] text-[#9C9589] font-medium">Harga Jual</p>
                  <p className="text-xs font-bold text-[#1F1D1A] mt-0.5 font-mono">{formatRupiah(m.hargaJual)}</p>
                </div>
                <div className="bg-[#EAF0EC] rounded-lg p-2.5">
                  <p className="text-[10px] text-[#3E6B48] font-medium">Margin</p>
                  <p className="text-xs font-bold text-[#3E6B48] mt-0.5 flex items-center justify-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {m.profitPercent.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Resep */}
              <div>
                <p className="text-[10px] font-bold text-[#9C9589] uppercase tracking-wider mb-2">Resep</p>
                <div className="space-y-1.5">
                  {m.resep.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[#1F1D1A]">{r.namaBahan}</span>
                      <span className="text-[#9C9589] font-mono">{r.qty} {r.satuan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-sm font-bold text-[#1F1D1A]">{editing ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1">Nama Menu</label>
                <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1">Kategori</label>
                <select value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]">
                  {KATEGORI.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1">Harga Jual (Rp)</label>
                <input type="number" value={form.hargaJual} onChange={e => setForm(p => ({ ...p, hargaJual: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
              </div>
            </div>

            {/* Recipe Builder */}
            <div>
              <p className="text-[11px] font-bold text-[#9C9589] uppercase tracking-wider mb-2">Builder Resep</p>
              <div className="space-y-2 mb-3">
                {form.resep.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#FAF8F5] rounded-lg px-3 py-2">
                    <span className="text-xs text-[#1F1D1A]">{r.namaBahan}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#9C9589] font-mono">{r.qty} {r.satuan}</span>
                      <button onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <select value={newIngredient.bahanId} onChange={e => setNewIngredient(p => ({ ...p, bahanId: e.target.value }))} className="flex-1 px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]">
                  <option value="">-- Pilih Bahan --</option>
                  {bahanList.map(b => <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>)}
                </select>
                <input type="number" placeholder="Qty" value={newIngredient.qty || ''} onChange={e => setNewIngredient(p => ({ ...p, qty: Number(e.target.value) }))} className="w-20 px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
                <button onClick={addIngredient} className="px-3 py-2 bg-[#3E6B48] text-white rounded-lg text-xs font-semibold hover:bg-[#345a3d]"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Live Calc */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAF8F5] rounded-xl text-center">
              <div>
                <p className="text-[10px] text-[#9C9589]">Est. HPP</p>
                <p className="text-xs font-bold text-[#1F1D1A] font-mono">{formatRupiah(Math.round(liveHPP))}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#9C9589]">Profit</p>
                <p className={clsx('text-xs font-bold font-mono', liveProfit >= 0 ? 'text-[#3E6B48]' : 'text-red-500')}>{formatRupiah(Math.round(liveProfit))}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#9C9589]">Margin</p>
                <p className={clsx('text-xs font-bold', liveProfitPct >= 0 ? 'text-[#3E6B48]' : 'text-red-500')}>{liveProfitPct.toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#9C9589] hover:bg-[#FAF8F5]">Batal</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-[#3E6B48] text-white rounded-xl text-xs font-semibold hover:bg-[#345a3d]">Simpan Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
