'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { suppliers as initialSuppliers, Supplier } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Search, Plus, ChevronDown, ChevronUp, Edit2, Phone, MapPin, Tag } from 'lucide-react'

const emptySupplier: Omit<Supplier, 'id' | 'riwayat'> = {
  nama: '', telepon: '', alamat: '', kategori: '', hargaRataRata: 0, minimalOrder: 0,
}

export default function SuppliersPage() {
  const [list, setList] = useState<Supplier[]>(initialSuppliers)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState(emptySupplier)

  const filtered = list.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.kategori.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditing(null)
    setForm(emptySupplier)
    setShowModal(true)
  }

  function openEdit(s: Supplier) {
    setEditing(s)
    setForm({ nama: s.nama, telepon: s.telepon, alamat: s.alamat, kategori: s.kategori, hargaRataRata: s.hargaRataRata, minimalOrder: s.minimalOrder })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.nama.trim()) return
    if (editing) {
      setList(prev => prev.map(s => s.id === editing.id ? { ...editing, ...form } : s))
    } else {
      const newId = `SUP-${String(list.length + 1).padStart(3, '0')}`
      setList(prev => [...prev, { id: newId, ...form, riwayat: [] }])
    }
    setShowModal(false)
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Manajemen Supplier" subtitle="Kelola kemitraan distributor dan riwayat pasokan bahan baku" />

      <main className="p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama supplier atau kategori..."
              className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={openAdd}
            className="clay-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Tambah Supplier
          </button>
        </div>

        {/* Table Clay Card */}
        <div className="clay-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Nama Supplier</th>
                <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Kategori</th>
                <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Harga Rata-rata</th>
                <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Min. Order</th>
                <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Riwayat</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <>
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{s.nama}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-500" /> {s.telepon}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold clay-pill text-[11px]">
                        <Tag className="w-3 h-3" /> {s.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      {formatRupiah(s.hargaRataRata)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                      {formatRupiah(s.minimalOrder)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl clay-btn text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                      >
                        {s.riwayat.length} pesanan
                        {expandedId === s.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-expand`} className="bg-slate-50/80">
                      <td colSpan={6} className="px-8 py-5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {s.alamat}
                        </p>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">Riwayat Pengiriman</p>
                        <div className="space-y-2">
                          {s.riwayat.map((r, i) => (
                            <div key={i} className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 clay-pill">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{r.keterangan}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{r.tanggal}</p>
                              </div>
                              <span className="font-mono text-xs font-black text-emerald-600">{formatRupiah(r.jumlah)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">Tidak ada supplier ditemukan.</div>
          )}
        </div>
      </main>

      {/* Clay Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="clay-card p-6 w-full max-w-md mx-auto space-y-4">
            <h3 className="text-base font-extrabold text-slate-800">{editing ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}</h3>
            <div className="space-y-3">
              {[
                { label: 'Nama Supplier', key: 'nama', type: 'text' },
                { label: 'Telepon', key: 'telepon', type: 'text' },
                { label: 'Alamat', key: 'alamat', type: 'text' },
                { label: 'Kategori', key: 'kategori', type: 'text' },
                { label: 'Harga Rata-rata (Rp)', key: 'hargaRataRata', type: 'number' },
                { label: 'Minimal Order (Rp)', key: 'minimalOrder', type: 'number' },
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
            </div>
            <div className="flex gap-3 pt-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600">
                Batal
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 clay-btn-primary text-xs font-bold">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
