'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { suppliers as initialSuppliers, Supplier } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Search, Plus, ChevronDown, ChevronUp, Edit2, Phone, MapPin, Tag } from 'lucide-react'
import clsx from 'clsx'

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
      <Topbar title="Manajemen Supplier" subtitle="Kelola data supplier dan riwayat pembelian bahan baku" />

      <main className="p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari supplier atau kategori..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE5DF] rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E6B48] transition-all"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#3E6B48] text-white text-xs font-semibold rounded-xl hover:bg-[#345a3d] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Supplier
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Nama Supplier</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Kategori</th>
                <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Harga Rata-rata</th>
                <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Min. Order</th>
                <th className="text-center px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Riwayat</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <>
                  <tr key={s.id} className="border-b border-[#F4F0EB] hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1F1D1A]">{s.nama}</p>
                      <p className="text-[10px] text-[#9C9589] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {s.telepon}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#EAF0EC] text-[#3E6B48] font-medium">
                        <Tag className="w-3 h-3" /> {s.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-medium text-[#1F1D1A]">
                      {formatRupiah(s.hargaRataRata)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-[#9C9589]">
                      {formatRupiah(s.minimalOrder)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="inline-flex items-center gap-1 text-[#3E6B48] hover:underline font-medium"
                      >
                        {s.riwayat.length} transaksi
                        {expandedId === s.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-[#EAE5DF] transition-colors text-[#9C9589] hover:text-[#1F1D1A]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-expand`} className="bg-[#FAF8F5]">
                      <td colSpan={6} className="px-8 py-4">
                        <p className="text-[10px] font-bold text-[#9C9589] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {s.alamat}
                        </p>
                        <p className="text-[10px] font-bold text-[#9C9589] uppercase tracking-wider mb-3">Riwayat Pembelian</p>
                        <div className="space-y-2">
                          {s.riwayat.map((r, i) => (
                            <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-[#EAE5DF]">
                              <div>
                                <p className="text-xs font-medium text-[#1F1D1A]">{r.keterangan}</p>
                                <p className="text-[10px] text-[#9C9589]">{r.tanggal}</p>
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#3E6B48]">{formatRupiah(r.jumlah)}</span>
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
            <div className="text-center py-12 text-[#9C9589] text-sm">Tidak ada supplier ditemukan.</div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-sm font-bold text-[#1F1D1A]">{editing ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h3>
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
                  <label className="block text-[11px] font-semibold text-[#9C9589] mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, string | number>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs text-[#1F1D1A] focus:outline-none focus:border-[#3E6B48]"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#9C9589] hover:bg-[#FAF8F5] transition-colors">
                Batal
              </button>
              <button onClick={handleSave} className="flex-1 py-2 bg-[#3E6B48] text-white rounded-xl text-xs font-semibold hover:bg-[#345a3d] transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
