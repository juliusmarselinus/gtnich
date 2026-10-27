'use client'

import { useState, useEffect } from 'react'
import { Supplier, SupplierFormData } from '../types'
import { Loader2 } from 'lucide-react'

interface SupplierModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string | null, form: SupplierFormData) => Promise<void>
  editingSupplier: Supplier | null
}

const emptySupplier: SupplierFormData = {
  nama: '',
  telepon: '',
  alamat: '',
  kategori: '',
  hargaRataRata: 0,
  minimalOrder: 0,
}

export default function SupplierModal({
  isOpen,
  onClose,
  onSave,
  editingSupplier,
}: SupplierModalProps) {
  const [form, setForm] = useState<SupplierFormData>(emptySupplier)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    if (editingSupplier) {
      setForm({
        nama: editingSupplier.nama,
        telepon: editingSupplier.telepon,
        alamat: editingSupplier.alamat,
        kategori: editingSupplier.kategori,
        hargaRataRata: editingSupplier.hargaRataRata,
        minimalOrder: editingSupplier.minimalOrder,
      })
    } else {
      setForm(emptySupplier)
    }
    setModalError(null)
  }, [editingSupplier, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama.trim()) {
      setModalError('Nama supplier wajib diisi')
      return
    }

    setIsSubmitting(true)
    setModalError(null)
    try {
      await onSave(editingSupplier ? editingSupplier.id : null, form)
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setModalError(e.message || 'Gagal menyimpan supplier')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="clay-card p-6 w-full max-w-md mx-auto space-y-4">
        <h3 className="text-base font-extrabold text-slate-800">
          {editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
        </h3>

        {modalError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Nama Supplier
            </label>
            <input
              type="text"
              required
              value={form.nama}
              onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
              placeholder="Contoh: CV Nusantara Rempah"
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={form.telepon}
              onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))}
              placeholder="Contoh: 0812-1111-2222"
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Alamat Gudang / Kantor
            </label>
            <input
              type="text"
              value={form.alamat}
              onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))}
              placeholder="Contoh: Jl. Industri No. 12, Bandung"
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Kategori Pasokan
            </label>
            <input
              type="text"
              value={form.kategori}
              onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))}
              placeholder="Contoh: Bahan Pokok, Bumbu, Sayur..."
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Harga Rata-rata (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={form.hargaRataRata}
                onChange={e => setForm(p => ({ ...p, hargaRataRata: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Minimal Order (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={form.minimalOrder}
                onChange={e => setForm(p => ({ ...p, minimalOrder: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              />
            </div>
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
