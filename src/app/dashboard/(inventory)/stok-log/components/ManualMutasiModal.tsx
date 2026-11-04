'use client'

import { useState } from 'react'
import { BahanSimple, ManualMutasiInput } from '../types'
import { Loader2, ArrowDownCircle, ArrowUpCircle, Database, X } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'

interface ManualMutasiModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (input: ManualMutasiInput) => Promise<void>
  bahanList: BahanSimple[]
}

export default function ManualMutasiModal({
  isOpen,
  onClose,
  onSave,
  bahanList,
}: ManualMutasiModalProps) {
  const [bahanId, setBahanId] = useState('')
  const [tipe, setTipe] = useState<'masuk' | 'keluar'>('masuk')
  const [jumlah, setJumlah] = useState<number>(1)
  const [catatan, setCatatan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedBahan = bahanList.find(b => b.id === bahanId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bahanId) {
      setErrorMsg('Pilih bahan baku terlebih dahulu')
      return
    }
    if (jumlah <= 0) {
      setErrorMsg('Jumlah mutasi harus lebih besar dari 0')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await onSave({
        bahanId,
        tipe,
        jumlah,
        catatan,
      })
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan mutasi')
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
              <Database className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-[#2B261F]">
                Catat Mutasi Stok Manual
              </h3>
              <p className="text-[11px] text-[#8C8275]">
                Koreksi masuk/keluar di luar transaksi kasir & PO
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

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe Mutasi: Masuk vs Keluar */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
              Jenis Mutasi Stok
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTipe('masuk')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  tipe === 'masuk'
                    ? 'bg-[#E8F5E4] text-[#2D7A1F] border border-[#C5E8BD] ring-2 ring-[#228B5B]'
                    : 'bg-[#FCFAF6] text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-[#2D7A1F]" /> Masuk (+)
              </button>
              <button
                type="button"
                onClick={() => setTipe('keluar')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  tipe === 'keluar'
                    ? 'bg-[#FDE8E4] text-[#D8431F] border border-[#F9C2B8] ring-2 ring-[#D8431F]'
                    : 'bg-[#FCFAF6] text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-[#D8431F]" /> Keluar (-)
              </button>
            </div>
          </div>

          {/* Bahan Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
              Pilih Bahan Baku
            </label>
            <CustomSelect
              value={bahanId}
              onChange={setBahanId}
              placeholder="-- Pilih Bahan --"
              options={bahanList.map(b => ({
                value: b.id,
                label: `${b.nama} (Stok: ${b.stok} ${b.satuan})`,
              }))}
            />
          </div>

          {/* Jumlah Mutasi */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
              Jumlah Perubahan ({selectedBahan?.satuan || 'Satuan'})
            </label>
            <input
              type="number"
              step="any"
              min="0.001"
              required
              value={jumlah}
              onChange={e => setJumlah(parseFloat(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all font-mono font-bold"
            />
          </div>

          {/* Catatan / Alasan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
              Catatan / Alasan Mutasi
            </label>
            <input
              type="text"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Contoh: Rusak saat pemindahan, bonus distributor, sampel menu"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
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
              <span>Simpan Mutasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
