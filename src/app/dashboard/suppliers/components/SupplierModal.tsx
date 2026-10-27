'use client'

import { useState, useEffect } from 'react'
import { Supplier, SupplierFormData, SupplierCategory } from '../types'
import { Loader2, PlusCircle } from 'lucide-react'

interface SupplierModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string | null, form: SupplierFormData) => Promise<void>
  editingSupplier: Supplier | null
  categories: SupplierCategory[]
}

const emptySupplier: SupplierFormData = {
  nama: '',
  telepon: '',
  alamat: '',
  categoryId: '',
  kategoriBaru: '',
  minimalOrder: 0,
}

export default function SupplierModal({
  isOpen,
  onClose,
  onSave,
  editingSupplier,
  categories,
}: SupplierModalProps) {
  const [form, setForm] = useState<SupplierFormData>(emptySupplier)
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    if (editingSupplier) {
      setForm({
        nama: editingSupplier.nama,
        telepon: editingSupplier.telepon,
        alamat: editingSupplier.alamat,
        categoryId: editingSupplier.categoryId || '',
        kategoriBaru: '',
        minimalOrder: editingSupplier.minimalOrder,
      })
      setIsNewCategory(false)
    } else {
      setForm({
        ...emptySupplier,
        categoryId: categories.length > 0 ? categories[0].id : '',
      })
      setIsNewCategory(categories.length === 0)
    }
    setModalError(null)
  }, [editingSupplier, isOpen, categories])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama.trim()) {
      setModalError('Nama supplier wajib diisi')
      return
    }

    if (isNewCategory && !form.kategoriBaru?.trim()) {
      setModalError('Nama kategori baru wajib diisi')
      return
    }

    setIsSubmitting(true)
    setModalError(null)
    try {
      await onSave(editingSupplier ? editingSupplier.id : null, {
        ...form,
        categoryId: isNewCategory ? null : form.categoryId || null,
        kategoriBaru: isNewCategory ? form.kategoriBaru?.trim() : '',
      })
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

          {/* Kategori Pasokan Dinormalisasi */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-500">
                Kategori Pasokan
              </label>
              <button
                type="button"
                onClick={() => setIsNewCategory(!isNewCategory)}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                {isNewCategory ? 'Pilih Kategori Ada' : '+ Kategori Baru'}
              </button>
            </div>

            {isNewCategory ? (
              <input
                type="text"
                required
                value={form.kategoriBaru}
                onChange={e => setForm(p => ({ ...p, kategoriBaru: e.target.value }))}
                placeholder="Ketik kategori baru (contoh: Kemasan, Bumbu...)"
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              />
            ) : (
              <select
                value={form.categoryId || ''}
                onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              >
                {categories.length === 0 ? (
                  <option value="">Belum ada kategori (klik + Kategori Baru)</option>
                ) : (
                  categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nama}
                    </option>
                  ))
                )}
              </select>
            )}
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
