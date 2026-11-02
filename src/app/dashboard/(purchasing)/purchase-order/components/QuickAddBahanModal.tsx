'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Package } from 'lucide-react'
import { BahanOption } from '../types'
import { DEFAULT_SATUAN_LIST } from '@/lib/satuan'
import CustomSelect from '@/components/ui/CustomSelect'
import { bahanService } from '@/app/dashboard/(inventory)/bahan/services/bahanService'

interface QuickAddBahanModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (newBahan: BahanOption) => void
  defaultSupplierId?: string
}

export default function QuickAddBahanModal({
  isOpen,
  onClose,
  onCreated,
  defaultSupplierId,
}: QuickAddBahanModalProps) {
  const [nama, setNama] = useState('')
  const [satuan, setSatuan] = useState('kg')
  const [hargaPerSatuan, setHargaPerSatuan] = useState<number>(0)
  const [stokAwal, setStokAwal] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanNama = nama.trim()
    if (!cleanNama) {
      setErrorMsg('Nama bahan baku wajib diisi.')
      return
    }

    if (hargaPerSatuan < 0) {
      setErrorMsg('Harga per satuan tidak boleh negatif.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      // Simpan langsung ke database Supabase via bahanService
      const savedBahan = await bahanService.create({
        nama: cleanNama,
        satuan: satuan || 'kg',
        hargaPerSatuan: Number(hargaPerSatuan) || 0,
        stok: Number(stokAwal) || 0,
        stokMinimum: 0,
        supplierId: defaultSupplierId || '',
        foto: null,
      })

      const newOption: BahanOption = {
        id: savedBahan.id,
        nama: savedBahan.nama,
        satuan: savedBahan.satuan,
        hargaPerSatuan: savedBahan.hargaPerSatuan || 0,
        stok: savedBahan.stok || 0,
      }

      onCreated(newOption)
      // Reset input form
      setNama('')
      setSatuan('kg')
      setHargaPerSatuan(0)
      setStokAwal(0)
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menambahkan bahan baku ke database.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-[24px] bg-white p-5 sm:p-6 shadow-2xl border border-[#F2E3D0] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F2E3D0]">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FF8F28]" />
            <span>Tambah Bahan Baru (Form Modal)</span>
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
              Nama Bahan Baku <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Daging Sapi Giling / Saus Tomat"
              className="w-full px-3 py-2 bg-[#FFFBF5] border border-[#F2E3D0] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF8F28]"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Satuan Ukuran <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                value={satuan}
                onChange={(val) => setSatuan(val)}
                variant="card"
                size="sm"
                options={DEFAULT_SATUAN_LIST.map((u) => ({ value: u, label: u }))}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Perkiraan Harga (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={hargaPerSatuan || ''}
                onChange={(e) => setHargaPerSatuan(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-[#FFFBF5] border border-[#F2E3D0] rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-[#FF8F28]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Stok Saat Ini (Opsional)
            </label>
            <input
              type="number"
              min="0"
              value={stokAwal || ''}
              onChange={(e) => setStokAwal(Number(e.target.value))}
              placeholder="0"
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
              <span>Gunakan Bahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
