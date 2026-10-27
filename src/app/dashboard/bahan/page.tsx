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
  ok: { label: 'OK', icon: CheckCircle, cls: 'bg-[#EAF0EC] text-[#3E6B48] border-[#C5DBC9]' },
  rendah: { label: 'Rendah', icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  habis: { label: 'Habis', icon: XCircle, cls: 'bg-red-50 text-red-600 border-red-200' },
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
      <Topbar title="Data Bahan Baku" subtitle="Kelola daftar bahan, satuan, harga, dan stok saat ini" />

      <main className="p-8 space-y-6 max-w-6xl mx-auto">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {(['all', 'ok', 'rendah', 'habis'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', filterStatus === s ? 'bg-[#3E6B48] text-white' : 'bg-white border border-[#EAE5DF] text-[#9C9589] hover:bg-[#FAF8F5]')}
            >
              {s === 'all' ? `Semua (${counts.all})` : s === 'ok' ? `OK (${counts.ok})` : s === 'rendah' ? `Rendah (${counts.rendah})` : `Habis (${counts.habis})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <div className="relative w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari bahan..." className="w-full pl-9 pr-3 py-2 bg-white border border-[#EAE5DF] rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E6B48]" />
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#3E6B48] text-white text-xs font-semibold rounded-xl hover:bg-[#345a3d] transition-colors">
              <Plus className="w-4 h-4" /> Tambah Bahan
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Nama Bahan</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Satuan</th>
                <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Harga/Satuan</th>
                <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Stok</th>
                <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Min. Stok</th>
                <th className="text-center px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F0EB]">
              {filtered.map(b => {
                const st = stockStatus(b)
                const cfg = statusConfig[st]
                const Icon = cfg.icon
                return (
                  <tr key={b.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1F1D1A]">{b.nama}</p>
                      <p className="text-[10px] text-[#9C9589]">{b.id}</p>
                    </td>
                    <td className="px-5 py-4 text-[#9C9589]">{b.satuan}</td>
                    <td className="px-5 py-4 text-right font-mono font-medium text-[#1F1D1A]">{formatRupiah(b.hargaPerSatuan)}</td>
                    <td className="px-5 py-4 text-right font-mono font-semibold text-[#1F1D1A]">{b.stok}</td>
                    <td className="px-5 py-4 text-right font-mono text-[#9C9589]">{b.stokMinimum}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold', cfg.cls)}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-[#EAE5DF] text-[#9C9589] hover:text-[#1F1D1A] transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-[#9C9589] text-sm">Tidak ada bahan ditemukan.</div>}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-sm font-bold text-[#1F1D1A]">{editing ? 'Edit Bahan' : 'Tambah Bahan Baru'}</h3>
            <div className="space-y-3">
              {[
                { label: 'Nama Bahan', key: 'nama', type: 'text' },
                { label: 'Satuan (kg, gr, liter, butir…)', key: 'satuan', type: 'text' },
                { label: 'Harga per Satuan (Rp)', key: 'hargaPerSatuan', type: 'number' },
                { label: 'Stok Saat Ini', key: 'stok', type: 'number' },
                { label: 'Stok Minimum', key: 'stokMinimum', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-semibold text-[#9C9589] mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, string | number>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9589] mb-1">Supplier</label>
                <select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]">
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#9C9589] hover:bg-[#FAF8F5]">Batal</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-[#3E6B48] text-white rounded-xl text-xs font-semibold hover:bg-[#345a3d]">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
