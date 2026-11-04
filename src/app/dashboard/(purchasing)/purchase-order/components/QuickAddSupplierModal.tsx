'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Building2 } from 'lucide-react'
import { SupplierOption } from '../types'
import { supplierService } from '@/app/dashboard/(purchasing)/suppliers/services/supplierService'

interface QuickAddSupplierModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (newSupplier: SupplierOption) => void
}

export default function QuickAddSupplierModal({
  isOpen,
  onClose,
  onCreated,
}: QuickAddSupplierModalProps) {
  const [nama, setNama] = useState('')
  const [telepon, setTelepon] = useState('')
  const [alamat, setAlamat] = useState('')
  const [minimalOrder, setMinimalOrder] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanNama = nama.trim()
    if (!cleanNama) {
      setErrorMsg('Nama supplier / toko wajib diisi.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      // Simpan langsung ke database Supabase via supplierService
      const savedSupplier = await supplierService.create({
        nama: cleanNama,
        telepon: telepon.trim() || '-',
        alamat: alamat.trim() || '-',
        minimalOrder: minimalOrder || 0,
      })

      const newOption: SupplierOption = {
        id: savedSupplier.id,
        nama: savedSupplier.nama,
        kategori: savedSupplier.kategoriNama || alamat.trim() || undefined,
        minimalOrder: savedSupplier.minimalOrder || 0,
      }

      onCreated(newOption)
      // Reset input form
      setNama('')
      setTelepon('')
      setAlamat('')
      setMinimalOrder(0)
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menambahkan supplier ke database.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-sm my-auto max-h-[92vh] overflow-y-auto rounded-[24px] bg-white p-5 sm:p-6 shadow-2xl border border-[#F2E3D0] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F2E3D0]">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#FF8F28]" />
            <span>Tambah Supplier Baru (Form Modal)</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Nama Supplier / Toko <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Toko Berkah Jaya / Sumber Bahan"
              className="w-full px-3 py-2 bg-[#FFFBF5] border border-[#F2E3D0] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF8F28]"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              No. Kontak / WhatsApp (Opsional)
            </label>
            <input
              type="tel"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full px-3 py-2 bg-[#FFFBF5] border border-[#F2E3D0] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF8F28]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Alamat / Pasar (Opsional)
            </label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Contoh: Pasar Baru Blok B No. 4"
              className="w-full px-3 py-2 bg-[#FFFBF5] border border-[#F2E3D0] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF8F28]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Minimal Order Rp (Opsional)
            </label>
            <input
              type="number"
              min="0"
              value={minimalOrder || ''}
              onChange={(e) => setMinimalOrder(Number(e.target.value))}
              placeholder="Contoh: 100000"
              className="w-full px-3 py-2 bg-[#FFFBF5] border border-[#F2E3D0] rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-[#FF8F28]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-[#FF8F28] hover:bg-[#FF9F3F] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Gunakan Supplier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
