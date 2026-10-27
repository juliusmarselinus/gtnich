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
      <Topbar title="Menu & Resep Masakan" subtitle="Kelola menu, komposisi bahan resep, estimasi HPP, dan simulasi margin keuntungan" />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-end">
          <button onClick={openAdd} className="clay-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <Plus className="w-4 h-4" /> Tambah Menu Baru
          </button>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {list.map(m => (
            <div key={m.id} className="clay-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center clay-pill">
                      <ChefHat className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-base text-slate-800">{m.nama}</h3>
                  </div>
                  <span className="text-[10px] px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">{m.kategori}</span>
                </div>
                <button onClick={() => openEdit(m)} className="p-2 rounded-xl clay-btn text-slate-400 hover:text-slate-800">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pricing Clay Pods */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="clay-inset p-2.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HPP</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5 font-mono">{formatRupiah(m.estimasiHPP)}</p>
                </div>
                <div className="clay-inset p-2.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harga Jual</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5 font-mono">{formatRupiah(m.hargaJual)}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-2.5 border border-emerald-100 shadow-[inset_1px_1px_2px_#ffffff]">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Margin</p>
                  <p className="text-xs font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {m.profitPercent.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Resep List */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Komposisi Resep</p>
                <div className="space-y-1.5">
                  {m.resep.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="font-semibold text-slate-700">{r.namaBahan}</span>
                      <span className="text-slate-500 font-mono font-bold">{r.qty} {r.satuan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Clay Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="clay-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-extrabold text-slate-800">{editing ? 'Edit Resep Menu' : 'Tambah Menu Baru'}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Menu</label>
                <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Kategori</label>
                <select value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800">
                  {KATEGORI.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Harga Jual (Rp)</label>
                <input type="number" value={form.hargaJual} onChange={e => setForm(p => ({ ...p, hargaJual: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono" />
              </div>
            </div>

            {/* Recipe Builder */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tambah Bahan Baku ke Resep</p>
              <div className="space-y-2 mb-3">
                {form.resep.map((r, i) => (
                  <div key={i} className="flex items-center justify-between clay-inset px-3.5 py-2">
                    <span className="text-xs font-semibold text-slate-800">{r.namaBahan}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono font-bold">{r.qty} {r.satuan}</span>
                      <button onClick={() => removeIngredient(i)} className="text-rose-400 hover:text-rose-600 p-1"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <select value={newIngredient.bahanId} onChange={e => setNewIngredient(p => ({ ...p, bahanId: e.target.value }))} className="flex-1 px-3 py-2.5 clay-inset text-xs text-slate-800">
                  <option value="">-- Pilih Bahan --</option>
                  {bahanList.map(b => <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>)}
                </select>
                <input type="number" placeholder="Qty" value={newIngredient.qty || ''} onChange={e => setNewIngredient(p => ({ ...p, qty: Number(e.target.value) }))} className="w-24 px-3 py-2.5 clay-inset text-xs text-slate-800 font-mono" />
                <button onClick={addIngredient} className="clay-btn-primary px-4 py-2.5 text-xs font-bold"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Live Calculation Pod */}
            <div className="grid grid-cols-3 gap-2 p-3 clay-inset rounded-2xl text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. HPP</p>
                <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{formatRupiah(Math.round(liveHPP))}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimasi Profit</p>
                <p className={clsx('text-xs font-black font-mono mt-0.5', liveProfit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{formatRupiah(Math.round(liveProfit))}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Margin Laba</p>
                <p className={clsx('text-xs font-black mt-0.5', liveProfitPct >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{liveProfitPct.toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600">Batal</button>
              <button onClick={handleSave} className="flex-1 py-2.5 clay-btn-primary text-xs font-bold">Simpan Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
