'use client'

import { useState, useEffect } from 'react'
import { Bahan, BahanFormData, Supplier } from '../types'
import { Loader2 } from 'lucide-react'

interface BahanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string | null, form: BahanFormData) => Promise<void>
  editingBahan: Bahan | null
  suppliers: Supplier[]
}

const emptyForm: BahanFormData = {
  nama: '',
  satuan: '',
  hargaPerSatuan: 0,
  stok: 0,
  stokMinimum: 0,
  supplierId: '',
}

export default function BahanModal({
  isOpen,
  onClose,
  onSave,
  editingBahan,
  suppliers,
}: BahanModalProps) {
  const [form, setForm] = useState<BahanFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (editingBahan) {
      setForm({
        nama: editingBahan.nama,
        satuan: editingBahan.satuan,
        hargaPerSatuan: editingBahan.hargaPerSatuan,
        stok: editingBahan.stok,
        stokMinimum: editingBahan.stokMinimum,
        supplierId: editingBahan.supplierId || '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrorMsg(null)
  }, [editingBahan, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama.trim()) {
      setErrorMsg('Nama bahan wajib diisi')
      return
    }
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await onSave(editingBahan ? editingBahan.id : null, form)
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan data bahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="clay-card p-6 w-full max-w-md mx-auto space-y-4">
        <h3 className="text-base font-extrabold text-slate-800">
          {editingBahan ? 'Edit Data Bahan' : 'Tambah Bahan Baru'}
        </h3>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Nama Bahan
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
              placeholder="Contoh: Tepung Terigu"
              required
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Satuan
            </label>
            <input
              type="text"
              value={form.satuan}
              onChange={e => setForm(p => ({ ...p, satuan: e.target.value }))}
              placeholder="kg, liter, gr, butir, sachet..."
              required
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Harga per Satuan (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={form.hargaPerSatuan}
              onChange={e =>
                setForm(p => ({ ...p, hargaPerSatuan: Number(e.target.value) }))
              }
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Stok Saat Ini
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.stok}
                onChange={e =>
                  setForm(p => ({ ...p, stok: Number(e.target.value) }))
                }
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Min. Stok (Alarm)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.stokMinimum}
                onChange={e =>
                  setForm(p => ({ ...p, stokMinimum: Number(e.target.value) }))
                }
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Supplier Terkait
            </label>
            <select
              value={form.supplierId}
              onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama} {s.kategori ? `(${s.kategori})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
