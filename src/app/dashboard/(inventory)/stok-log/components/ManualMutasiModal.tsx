'use client'

import { useState } from 'react'
import { BahanSimple, ManualMutasiInput } from '../types'
import { Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="clay-card p-6 w-full max-w-md mx-auto space-y-4">
        <h3 className="text-base font-extrabold text-slate-800">
          Catat Mutasi Stok Manual
        </h3>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Tipe Mutasi: Masuk vs Keluar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Jenis Mutasi
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTipe('masuk')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  tipe === 'masuk'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" /> Masuk (+)
              </button>
              <button
                type="button"
                onClick={() => setTipe('keluar')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  tipe === 'keluar'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" /> Keluar (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Bahan Baku
            </label>
            <CustomSelect
              value={bahanId}
              onChange={val => setBahanId(val)}
              placeholder="-- Pilih Bahan Baku --"
              searchable={true}
              searchPlaceholder="Cari bahan..."
              options={bahanList.map(b => ({
                value: b.id,
                label: b.nama,
                sublabel: `Stok: ${b.stok} ${b.satuan}`,
              }))}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Jumlah {selectedBahan ? `(${selectedBahan.satuan})` : ''}
            </label>
            <input
              type="number"
              step="any"
              min="0.001"
              required
              value={jumlah}
              onChange={e => setJumlah(Number(e.target.value))}
              placeholder="Contoh: 5"
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Alasan / Keterangan Mutasi
            </label>
            <input
              type="text"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Contoh: Bahan tumpah / retur barang / bonus supplier"
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
              <span>Catat & Update Stok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
