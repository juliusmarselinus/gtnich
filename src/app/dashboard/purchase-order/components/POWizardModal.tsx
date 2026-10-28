'use client'

import { useState } from 'react'
import { SupplierOption, BahanOption, CreatePOInput } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Plus, X, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import CustomSelect from '@/components/ui/CustomSelect'

interface POWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (input: CreatePOInput) => Promise<void>
  suppliers: SupplierOption[]
  bahanList: BahanOption[]
}

export default function POWizardModal({
  isOpen,
  onClose,
  onSave,
  suppliers,
  bahanList,
}: POWizardModalProps) {
  const [step, setStep] = useState(1)
  const [supplierId, setSupplierId] = useState('')
  const [catatan, setCatatan] = useState('')
  const [items, setItems] = useState<CreatePOInput['items']>([])
  const [newItem, setNewItem] = useState({ bahanId: '', qty: 0, hargaEstimasi: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedSupplier = suppliers.find(s => s.id === supplierId)

  const addItem = () => {
    if (!newItem.bahanId) {
      setErrorMsg('Pilih bahan terlebih dahulu')
      return
    }
    if (newItem.qty <= 0) {
      setErrorMsg('Kuantitas order harus lebih besar dari 0')
      return
    }

    const bahan = bahanList.find(b => b.id === newItem.bahanId)
    if (!bahan) return

    const price = newItem.hargaEstimasi || bahan.hargaPerSatuan
    setItems(prev => [
      ...prev,
      {
        bahanId: bahan.id,
        namaBahan: bahan.nama,
        satuan: bahan.satuan,
        qty: newItem.qty,
        hargaEstimasi: price,
        stokSebelum: bahan.stok,
      },
    ])
    setNewItem({ bahanId: '', qty: 0, hargaEstimasi: 0 })
    setErrorMsg(null)
  }

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const handleFinish = async () => {
    if (!selectedSupplier) {
      setErrorMsg('Pilih supplier terlebih dahulu')
      return
    }
    if (items.length === 0) {
      setErrorMsg('Masukkan minimal 1 item bahan ke daftar PO')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await onSave({
        supplierId,
        namaSupplier: selectedSupplier.nama,
        catatan,
        items,
      })
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan Purchase Order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="clay-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5">
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {['Pilih Supplier', 'Tambah Item', 'Konfirmasi'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold clay-pill',
                  step >= i + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                )}
              >
                {i + 1}
              </div>
              <span className={clsx('text-xs font-bold', step === i + 1 ? 'text-slate-800' : 'text-slate-400')}>
                {s}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Pilih Supplier */}
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800">1. Pilih Supplier Tujuan</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {suppliers.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSupplierId(s.id)
                    setErrorMsg(null)
                  }}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-2xl transition-all cursor-pointer',
                    supplierId === s.id ? 'clay-btn-primary' : 'clay-btn text-slate-700'
                  )}
                >
                  <p className="text-xs font-bold">{s.nama}</p>
                  <p className={clsx('text-[10px] mt-0.5', supplierId === s.id ? 'text-emerald-100' : 'text-slate-400')}>
                    {s.kategori ? `${s.kategori} • ` : ''}Min. Order {formatRupiah(s.minimalOrder || 0)}
                  </p>
                </button>
              ))}
              {suppliers.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada supplier di database. Tambahkan supplier terlebih dahulu di menu Supplier.</p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
                placeholder="Contoh: Tolong kirim sebelum jam 10 pagi"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Tambah Item Bahan */}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800">2. Tentukan Bahan & Kuantitas</h3>

            {/* List Item yang sudah dimasukkan */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between clay-inset px-4 py-2.5 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.namaBahan}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {item.qty} {item.satuan} × {formatRupiah(item.hargaEstimasi)} = {formatRupiah(item.qty * item.hargaEstimasi)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">Belum ada bahan di daftar.</p>
              )}
            </div>

            {/* Form Input Item */}
            <div className="space-y-3 p-4 clay-inset rounded-2xl">
              <p className="text-[11px] font-bold text-slate-600">Pilih Bahan Masuk</p>
              <CustomSelect
                value={newItem.bahanId}
                onChange={val => {
                  const b = bahanList.find(x => x.id === val)
                  setNewItem(p => ({
                    ...p,
                    bahanId: val,
                    hargaEstimasi: b?.hargaPerSatuan ?? 0,
                  }))
                }}
                variant="card"
                placeholder="-- Pilih Bahan Baku --"
                searchable={true}
                searchPlaceholder="Cari nama bahan..."
                options={bahanList.map(b => ({
                  value: b.id,
                  label: b.nama,
                  sublabel: `Stok: ${b.stok} ${b.satuan}`,
                }))}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Qty Diorder</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={newItem.qty || ''}
                    onChange={e => setNewItem(p => ({ ...p, qty: Number(e.target.value) }))}
                    className="w-full px-3 py-2 clay-card text-xs text-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Estimasi Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.hargaEstimasi || ''}
                    onChange={e => setNewItem(p => ({ ...p, hargaEstimasi: Number(e.target.value) }))}
                    className="w-full px-3 py-2 clay-card text-xs text-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="w-full py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Masukkan ke Daftar PO
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verifikasi & Finalisasi */}
        {step === 3 && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800">3. Verifikasi & Finalisasi PO</h3>
            <div className="p-4 clay-inset rounded-2xl space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Supplier Tujuan</span>
                <span className="font-bold text-slate-800">{selectedSupplier?.nama}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Jumlah Macam Bahan</span>
                <span className="font-bold text-slate-800">{items.length} item bahan</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Total Estimasi Nilai PO</span>
                <span className="font-black text-emerald-600 font-mono text-sm">
                  {formatRupiah(items.reduce((s, i) => s + i.qty * i.hargaEstimasi, 0))}
                </span>
              </div>
              {catatan && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Catatan</span>
                  <span className="text-slate-700 text-right max-w-[60%]">{catatan}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tombol Navigasi Step */}
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              if (step === 1) onClose()
              else setStep(s => s - 1)
            }}
            className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600 disabled:opacity-50 cursor-pointer"
          >
            {step === 1 ? 'Batal' : 'Kembali'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !supplierId) {
                  setErrorMsg('Pilih salah satu supplier terlebih dahulu')
                  return
                }
                if (step === 2 && items.length === 0) {
                  setErrorMsg('Tambahkan minimal 1 item bahan ke daftar')
                  return
                }
                setErrorMsg(null)
                setStep(s => s + 1)
              }}
              className="flex-1 py-2.5 clay-btn-primary text-xs font-bold cursor-pointer"
            >
              Lanjut
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="flex-1 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan & Terbitkan PO</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
