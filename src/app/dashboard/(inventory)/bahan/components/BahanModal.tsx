'use client'

import { useState, useEffect } from 'react'
import { Bahan, BahanFormData, Supplier } from '../types'
import { DEFAULT_SATUAN_LIST } from '@/lib/satuan'
import { Loader2, PlusCircle } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'

interface BahanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string | null, form: BahanFormData) => Promise<void>
  editingBahan: Bahan | null
  suppliers: Supplier[]
}

const emptyForm: BahanFormData = {
  nama: '',
  satuan: 'kg',
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
  const [isCustomSatuan, setIsCustomSatuan] = useState(false)
  const [customSatuanText, setCustomSatuanText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (editingBahan) {
      const isPredefined = DEFAULT_SATUAN_LIST.includes(editingBahan.satuan as unknown as typeof DEFAULT_SATUAN_LIST[number])
      setForm({
        nama: editingBahan.nama,
        satuan: editingBahan.satuan,
        hargaPerSatuan: editingBahan.hargaPerSatuan,
        stok: editingBahan.stok,
        stokMinimum: editingBahan.stokMinimum,
        supplierId: editingBahan.supplierId || '',
      })
      if (!isPredefined && editingBahan.satuan) {
        setIsCustomSatuan(true)
        setCustomSatuanText(editingBahan.satuan)
      } else {
        setIsCustomSatuan(false)
        setCustomSatuanText('')
      }
    } else {
      setForm(emptyForm)
      setIsCustomSatuan(false)
      setCustomSatuanText('')
    }
    setErrorMsg(null)
  }, [editingBahan, isOpen])

  if (!isOpen) return null

  const handleSatuanSelect = (val: string) => {
    if (val === '__custom__') {
      setIsCustomSatuan(true)
      setForm(p => ({ ...p, satuan: customSatuanText || '' }))
    } else {
      setIsCustomSatuan(false)
      setForm(p => ({ ...p, satuan: val }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama.trim()) {
      setErrorMsg('Nama bahan wajib diisi')
      return
    }

    const finalSatuan = isCustomSatuan ? customSatuanText.trim() : form.satuan.trim()
    if (!finalSatuan) {
      setErrorMsg('Satuan bahan baku wajib diisi')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await onSave(editingBahan ? editingBahan.id : null, {
        ...form,
        satuan: finalSatuan,
      })
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
              placeholder="Contoh: Tepung Terigu Segitiga Biru"
              required
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
            />
          </div>

          {/* Pemilihan Satuan Bahan Baku */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-500">
                Satuan Dasar Bahan
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSatuan(!isCustomSatuan)
                  if (!isCustomSatuan) {
                    setCustomSatuanText(form.satuan)
                  }
                }}
                className="text-[11px] font-semibold text-[#FF8F2B] hover:text-[#E67215] flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                {isCustomSatuan ? 'Pilih Satuan Standar' : '+ Satuan Kustom'}
              </button>
            </div>

            {isCustomSatuan ? (
              <input
                type="text"
                required
                value={customSatuanText}
                onChange={e => {
                  setCustomSatuanText(e.target.value)
                  setForm(p => ({ ...p, satuan: e.target.value }))
                }}
                placeholder="Ketik satuan baru (contoh: ikat, karton, galon...)"
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              />
            ) : (
              <CustomSelect
                value={form.satuan}
                onChange={val => handleSatuanSelect(val)}
                options={[
                  ...DEFAULT_SATUAN_LIST.map(u => ({
                    value: u,
                    label: u,
                    sublabel:
                      u === 'kg'
                        ? 'Kilogram'
                        : u === 'gram'
                        ? 'Gram'
                        : u === 'liter'
                        ? 'Liter'
                        : u === 'ml'
                        ? 'Mililiter'
                        : undefined,
                  })),
                  { value: '__custom__', label: '+ Satuan Lainnya...' },
                ]}
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Harga per Satuan (Rp / {isCustomSatuan ? customSatuanText || 'satuan' : form.satuan})
            </label>
            <input
              type="number"
              min="0"
              value={form.hargaPerSatuan}
              onChange={e =>
                setForm(p => ({ ...p, hargaPerSatuan: Number(e.target.value) }))
              }
              className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Stok Saat Ini ({isCustomSatuan ? customSatuanText || 'satuan' : form.satuan})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.stok}
                onChange={e =>
                  setForm(p => ({ ...p, stok: Number(e.target.value) }))
                }
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Min. Stok Alarm ({isCustomSatuan ? customSatuanText || 'satuan' : form.satuan})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.stokMinimum}
                onChange={e =>
                  setForm(p => ({ ...p, stokMinimum: Number(e.target.value) }))
                }
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Supplier Terkait (Opsional)
            </label>
            <CustomSelect
              value={form.supplierId}
              onChange={val => setForm(p => ({ ...p, supplierId: val }))}
              placeholder="-- Pilih Supplier --"
              options={[
                { value: '', label: '-- Tanpa Supplier --' },
                ...suppliers.map(s => ({
                  value: s.id,
                  label: s.nama,
                  sublabel: s.kategori ? `(${s.kategori})` : undefined,
                })),
              ]}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600 disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
