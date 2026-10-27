'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { bahanList as initialBahan, Bahan, suppliers } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Search, Plus, Edit2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'

function stockStatus(b: Bahan): 'habis' | 'rendah' | 'ok' {
  if (b.stok === 0) return 'habis'
  if (b.stok <= b.stokMinimum) return 'rendah'
  return 'ok'
}

const statusConfig = {
  ok: { label: 'Aman', icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-700' },
  rendah: { label: 'Rendah', icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700' },
  habis: { label: 'Habis', icon: XCircle, cls: 'bg-rose-50 text-rose-700' },
}

const emptyForm = { nama: '', satuan: '', hargaPerSatuan: 0, stok: 0, stokMinimum: 0, supplierId: '' }

export default function BahanPage() {
  const [list, setList] = useState<Bahan[]>(initialBahan)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ok' | 'rendah' | 'habis'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Bahan | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = list.filter(b => {
    const matchSearch = b.nama.toLowerCase().includes(search.toLowerCase()) || b.satuan.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || stockStatus(b) === filterStatus
    return matchSearch && matchStatus
  })

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(b: Bahan) {
    setEditing(b)
    setForm({ nama: b.nama, satuan: b.satuan, hargaPerSatuan: b.hargaPerSatuan, stok: b.stok, stokMinimum: b.stokMinimum, supplierId: b.supplierId })
    setShowModal(true)
  }
  function handleSave() {
    if (!form.nama.trim()) return
    if (editing) {
      setList(prev => prev.map(b => b.id === editing.id ? { ...editing, ...form } : b))
    } else {
      const newId = `BHN-${String(list.length + 1).padStart(3, '0')}`
      setList(prev => [...prev, { id: newId, ...form }])
    }
    setShowModal(false)
  }

  const counts = { all: list.length, ok: list.filter(b => stockStatus(b) === 'ok').length, rendah: list.filter(b => stockStatus(b) === 'rendah').length, habis: list.filter(b => stockStatus(b) === 'habis').length }

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Data Bahan Baku" subtitle="Kelola persediaan bahan, satuan, harga per satuan, dan batas aman stok" />

      <main className="p-8 space-y-6 max-w-6xl mx-auto">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(['all', 'ok', 'rendah', 'habis'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={clsx(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all',
                filterStatus === s 
                  ? 'clay-btn-primary shadow-sm' 
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              {s === 'all' ? `Semua (${counts.all})` : s === 'ok' ? `Aman (${counts.ok})` : s === 'rendah' ? `Rendah (${counts.rendah})` : `Habis (${counts.habis})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <div className="relative w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama bahan..." className="w-full pl-10 pr-3.5 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400" />
            </div>
            <button onClick={openAdd} className="clay-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold">
              <Plus className="w-4 h-4" /> Tambah Bahan
            </button>
          </div>
        </div>

        {/* Table Clay Card */}
        <div className="clay-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Nama Bahan</th>
                <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Satuan</th>
                <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Harga/Satuan</th>
                <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Stok Saat Ini</th>
                <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Min. Stok</th>
                <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Kondisi</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(b => {
                const st = stockStatus(b)
                const cfg = statusConfig[st]
                const Icon = cfg.icon
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{b.nama}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{b.id}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{b.satuan}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">{formatRupiah(b.hargaPerSatuan)}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">{b.stok}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">{b.stokMinimum}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold clay-pill', cfg.cls)}>
                        <Icon className="w-3.5 h-3.5" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(b)} className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm font-medium">Tidak ada bahan ditemukan.</div>}
        </div>
      </main>

      {/* Clay Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="clay-card p-6 w-full max-w-md mx-auto space-y-4">
            <h3 className="text-base font-extrabold text-slate-800">{editing ? 'Edit Data Bahan' : 'Tambah Bahan Baru'}</h3>
            <div className="space-y-3">
              {[
                { label: 'Nama Bahan', key: 'nama', type: 'text' },
                { label: 'Satuan (kg, gr, liter, butir, pcs…)', key: 'satuan', type: 'text' },
                { label: 'Harga per Satuan (Rp)', key: 'hargaPerSatuan', type: 'number' },
                { label: 'Stok Saat Ini', key: 'stok', type: 'number' },
                { label: 'Stok Minimum (Batas Alarm)', key: 'stokMinimum', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, string | number>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Supplier Terkait</label>
                <select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800">
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600">Batal</button>
              <button onClick={handleSave} className="flex-1 py-2.5 clay-btn-primary text-xs font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
