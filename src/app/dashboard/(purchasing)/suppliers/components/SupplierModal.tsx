'use client'

import { useState, useEffect } from 'react'
import { Supplier, SupplierFormData, SupplierCategory } from '../types'
import { Loader2, PlusCircle, Building2, Phone, MapPin, Tag, Banknote, X } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50 duration-200">
      <div className="w-full max-w-md mx-auto bg-white rounded-[28px] border border-[#EBE6DC] shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-[#2B261F]">
                {editingSupplier ? 'Edit Data Supplier' : 'Tambah Mitra Supplier'}
              </h3>
              <p className="text-[11px] text-[#8C8275]">
                {editingSupplier ? 'Perbarui informasi kontak & ketentuan' : 'Daftarkan rekanan distributor baru'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C8275] hover:bg-[#F5F2EB] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {modalError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
              Nama Supplier / Toko
            </label>
            <input
              type="text"
              required
              value={form.nama}
              onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
              placeholder="Contoh: CV Nusantara Rempah, Toko Beras Jaya"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5 flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#FF8F2B]" /> Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={form.telepon}
              onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))}
              placeholder="Contoh: 0812-1111-2222"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF8F2B]" /> Alamat Gudang / Kios Pasar
            </label>
            <input
              type="text"
              value={form.alamat}
              onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))}
              placeholder="Contoh: Pasar Baru Blok B No. 12, Bandung"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
            />
          </div>

          {/* Kategori Pasokan Dinormalisasi */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#FF8F2B]" /> Kategori Pasokan
              </label>
              <button
                type="button"
                onClick={() => setIsNewCategory(!isNewCategory)}
                className="text-[11px] font-bold text-[#FF6B00] hover:text-[#D8431F] flex items-center gap-1 cursor-pointer transition-colors"
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
                placeholder="Ketik kategori baru (contoh: Daging & Ayam, Sayuran, Bumbu)"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
              />
            ) : (
              <CustomSelect
                value={form.categoryId || ''}
                onChange={val => setForm(p => ({ ...p, categoryId: val }))}
                placeholder={categories.length === 0 ? 'Belum ada kategori' : '-- Pilih Kategori --'}
                options={categories.map(c => ({
                  value: c.id,
                  label: c.nama,
                }))}
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5 flex items-center gap-1">
              <Banknote className="w-3 h-3 text-[#FF8F2B]" /> Minimal Order (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={form.minimalOrder}
              onChange={e => setForm(p => ({ ...p, minimalOrder: Number(e.target.value) }))}
              placeholder="0 jika tidak ada batas minimal pembelian"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all font-mono"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#EBE6DC] text-xs font-bold text-[#7A7062] hover:bg-[#F5F2EB] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Rekanan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
