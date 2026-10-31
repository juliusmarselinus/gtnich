'use client'

import { useState, useEffect, useRef } from 'react'
import { Bahan, BahanFormData, Supplier } from '../types'
import { DEFAULT_SATUAN_LIST } from '@/lib/satuan'
import { Loader2, PlusCircle, Camera, X, Upload } from 'lucide-react'
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
  foto: null,
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
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        foto: editingBahan.foto || null,
      })
      setFotoPreview(editingBahan.foto || null)
      if (!isPredefined && editingBahan.satuan) {
        setIsCustomSatuan(true)
        setCustomSatuanText(editingBahan.satuan)
      } else {
        setIsCustomSatuan(false)
        setCustomSatuanText('')
      }
    } else {
      setForm(emptyForm)
      setFotoPreview(null)
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

  /** Baca file foto → data URL → simpan ke form & preview */
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (JPG, PNG, WebP, dll.)')
      return
    }

    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setFotoPreview(dataUrl)
      setForm(p => ({ ...p, foto: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFoto = () => {
    setFotoPreview(null)
    setForm(p => ({ ...p, foto: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
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
      <div className="clay-card p-6 w-full max-w-lg mx-auto space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-extrabold text-slate-800">
          {editingBahan ? 'Edit Data Bahan' : 'Tambah Bahan Baru'}
        </h3>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* ── Upload Foto ── */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Foto Bahan (Opsional)
            </label>

            {fotoPreview ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#EBE3D7] bg-[#F7F5F0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoPreview}
                  alt="Preview foto bahan"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-xs font-bold text-slate-700 hover:bg-white shadow-md transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Ganti Foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#D9CDBF] hover:border-[#FF8F2B] bg-[#F7F5F0] hover:bg-[#FFF6EC] transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#FF8F2B]"
              >
                <Upload className="w-7 h-7" />
                <span className="text-[11px] font-semibold">Klik untuk upload foto bahan</span>
                <span className="text-[10px]">JPG, PNG, WebP — maks. 5MB</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>

          {/* ── Nama Bahan ── */}
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

          {/* ── Satuan ── */}
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

          {/* ── Harga ── */}
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

          {/* ── Stok ── */}
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

          {/* ── Supplier ── */}
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

          {/* ── Actions ── */}
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
