'use client'

import { useState, useEffect, useRef } from 'react'
import { Bahan, BahanFormData, Supplier } from '../types'
import { DEFAULT_SATUAN_LIST } from '@/lib/satuan'
import { Loader2, PlusCircle, Camera, X, Upload, PackagePlus, Edit3 } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import DapiHead from '@/components/ui/DapiHead'

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

const INPUT_STYLE =
  'w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/70 transition shadow-2xs'

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
      const isPredefined = DEFAULT_SATUAN_LIST.includes(
        editingBahan.satuan as unknown as (typeof DEFAULT_SATUAN_LIST)[number]
      )
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (JPG, PNG, WebP)')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D00]/45 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-7 w-full max-w-lg mx-auto space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 my-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF6D6] border border-[#FFE49A] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
              <DapiHead size={34} mood="senang" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {editingBahan ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {editingBahan ? 'Perbarui satuan, harga beli, atau stok bahan' : 'Daftarkan bahan baku ke sistem inventaris dapur'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-[#FDE8E4] border border-[#FAD3CB] text-[#B3361B] text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Upload Foto */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 px-1">
              Foto Bahan (Opsional)
            </label>

            {fotoPreview ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#FFE49A] bg-[#FFF9EC] shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoPreview}
                  alt="Preview foto bahan"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#D8431F] text-white hover:bg-[#BF3818] shadow-md transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-xs font-bold text-slate-700 hover:bg-white shadow-md transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#D8431F]" />
                  Ganti Foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#FFE49A] hover:border-[#FFB800] bg-[#FFFBF2] hover:bg-[#FFF6E5] transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#D8431F] cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-slate-400 group-hover:text-[#D8431F] transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-700 block">Klik untuk upload foto bahan</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, atau WebP</span>
                </div>
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

          {/* Nama Bahan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
              Nama Bahan Baku
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
              placeholder="Contoh: Tepung Terigu Segitiga Biru"
              required
              className={INPUT_STYLE}
            />
          </div>

          {/* Satuan Bahan */}
          <div>
            <div className="flex items-center justify-between mb-1 px-1">
              <label className="block text-[11px] font-bold text-slate-600">
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
                className="text-[11px] font-semibold text-[#D8431F] hover:text-[#BF3818] flex items-center gap-1 cursor-pointer"
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
                placeholder="Ketik satuan baru (contoh: ikat, karton, porsi, galon...)"
                className={INPUT_STYLE}
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
                  { value: '__custom__', label: '+ Satuan Kustom Lainnya...' },
                ]}
              />
            )}
          </div>

          {/* Harga Satuan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
              Harga per Satuan (Rp / {isCustomSatuan ? customSatuanText || 'satuan' : form.satuan})
            </label>
            <input
              type="number"
              min="0"
              value={form.hargaPerSatuan || ''}
              onChange={e =>
                setForm(p => ({ ...p, hargaPerSatuan: Number(e.target.value) }))
              }
              placeholder="0"
              className={`${INPUT_STYLE} font-mono font-bold text-slate-900`}
            />
          </div>

          {/* Stok Saat Ini & Min. Stok */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
                Stok Saat Ini ({isCustomSatuan ? customSatuanText || 'satuan' : form.satuan})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.stok ?? ''}
                onChange={e =>
                  setForm(p => ({ ...p, stok: Number(e.target.value) }))
                }
                placeholder="0"
                className={`${INPUT_STYLE} font-mono font-extrabold text-slate-900`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
                Batas Aman / Min ({isCustomSatuan ? customSatuanText || 'satuan' : form.satuan})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.stokMinimum ?? ''}
                onChange={e =>
                  setForm(p => ({ ...p, stokMinimum: Number(e.target.value) }))
                }
                placeholder="0"
                className={`${INPUT_STYLE} font-mono text-slate-800`}
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
              Supplier Rekanan (Opsional)
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

          {/* Tombol Aksi */}
          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-xs font-bold text-slate-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-3 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingBahan ? (
                <Edit3 className="w-4 h-4" />
              ) : (
                <PackagePlus className="w-4 h-4" />
              )}
              <span>{editingBahan ? 'Simpan Perubahan' : 'Daftarkan Bahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
