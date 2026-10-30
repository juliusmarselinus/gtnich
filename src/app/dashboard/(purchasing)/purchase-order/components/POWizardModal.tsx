'use client'

import { useState } from 'react'
import { SupplierOption, BahanOption, CreatePOInput } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Plus, X, Loader2, CheckCircle2, AlertCircle, Building2 } from 'lucide-react'
import clsx from 'clsx'
import CustomSelect from '@/components/ui/CustomSelect'
import { getCompatibleOrderUnits, getUnitConversionFactor, DEFAULT_SATUAN_LIST } from '@/lib/satuan'

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
  const [newItem, setNewItem] = useState({
    bahanId: '',
    qty: 0,
    satuan: '',
    hargaEstimasi: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedSupplier = suppliers.find(s => s.id === supplierId)
  const currentBahan = bahanList.find(b => b.id === newItem.bahanId)
  const availableUnits = currentBahan
    ? getCompatibleOrderUnits(currentBahan.satuan)
    : [...DEFAULT_SATUAN_LIST]

  const handleBahanSelect = (id: string) => {
    const b = bahanList.find(x => x.id === id)
    if (b) {
      const units = getCompatibleOrderUnits(b.satuan)
      const defaultUnit = units[0] || b.satuan || 'kg'
      const factor = getUnitConversionFactor(defaultUnit, b.satuan)
      setNewItem({
        bahanId: id,
        qty: 1,
        satuan: defaultUnit,
        hargaEstimasi: Math.round(b.hargaPerSatuan * factor),
      })
    } else {
      setNewItem({ bahanId: '', qty: 0, satuan: '', hargaEstimasi: 0 })
    }
  }

  const handleUnitChange = (newUnit: string) => {
    if (!currentBahan) return
    const factor = getUnitConversionFactor(newUnit, currentBahan.satuan)
    // Otomatis sesuaikan estimasi harga per satuan yang dipilih
    setNewItem(p => ({
      ...p,
      satuan: newUnit,
      hargaEstimasi: Math.round(currentBahan.hargaPerSatuan * factor),
    }))
  }

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

    const unit = newItem.satuan || bahan.satuan
    const price = newItem.hargaEstimasi || bahan.hargaPerSatuan

    setItems(prev => [
      ...prev,
      {
        bahanId: bahan.id,
        namaBahan: bahan.nama,
        satuan: unit,
        qty: newItem.qty,
        hargaEstimasi: price,
        stokSebelum: bahan.stok,
      },
    ])
    setNewItem({ bahanId: '', qty: 0, satuan: '', hargaEstimasi: 0 })
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
                  step >= i + 1 ? 'bg-[#FF8F2B] text-white' : 'bg-slate-100 text-slate-400'
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
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-[#FF8F2B]" />
                1. Pilih Supplier Tujuan
              </h3>
              <p className="text-xs text-slate-500">
                Tentukan distributor atau pemasok bahan baku untuk penerbitan PO ini.
              </p>
            </div>

            {/* Status Indikator Pilihan Supplier */}
            {selectedSupplier ? (
              <div className="p-3.5 rounded-2xl bg-[#FFF6EC] border border-[#FFE2C2] flex items-center justify-between shadow-[inset_1px_1px_2px_#ffffff]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF8F2B] text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-tight">
                      {selectedSupplier.nama}
                    </p>
                    <p className="text-[10px] text-[#FF8F2B] font-medium">
                      {selectedSupplier.kategori ? `${selectedSupplier.kategori} • ` : ''}Min. Order: {formatRupiah(selectedSupplier.minimalOrder || 0)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#FF8F2B] bg-[#FFF6EC] border border-[#FFE2C2] px-2.5 py-1 rounded-full">
                  Terpilih ✓
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Silakan klik salah satu kartu supplier di bawah untuk memilih:</span>
              </div>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {suppliers.map(s => {
                const isSelected = supplierId === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSupplierId(s.id)
                      setErrorMsg(null)
                    }}
                    className={clsx(
                      'w-full text-left px-4 py-3 rounded-2xl transition-all cursor-pointer relative',
                      isSelected
                        ? 'clay-btn-primary ring-2 ring-[#FF8F2B] ring-offset-2'
                        : 'clay-btn text-slate-700 hover:border-[#FF8F2B]/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold leading-tight">{s.nama}</p>
                        <p
                          className={clsx(
                            'text-[10px] mt-1',
                            isSelected ? 'text-white/90 font-medium' : 'text-slate-400'
                          )}
                        >
                          {s.kategori ? `${s.kategori} • ` : ''}Min. Order {formatRupiah(s.minimalOrder || 0)}
                        </p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
              {suppliers.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Belum ada supplier di database. Tambahkan supplier terlebih dahulu di menu Supplier.
                </p>
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
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-600">Pilih Bahan Masuk</p>
                {currentBahan && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Master: {formatRupiah(currentBahan.hargaPerSatuan)}/{currentBahan.satuan}
                  </span>
                )}
              </div>
              <CustomSelect
                value={newItem.bahanId}
                onChange={val => handleBahanSelect(val)}
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Qty Diorder</label>
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
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Satuan Order</label>
                  <CustomSelect
                    value={newItem.satuan || currentBahan?.satuan || 'item'}
                    onChange={val => handleUnitChange(val)}
                    disabled={!currentBahan}
                    variant="card"
                    size="sm"
                    options={availableUnits.map(u => ({ value: u, label: u }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">
                    Harga / Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.hargaEstimasi || ''}
                    onChange={e => setNewItem(p => ({ ...p, hargaEstimasi: Number(e.target.value) }))}
                    className="w-full px-3 py-2 clay-card text-xs text-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              {newItem.bahanId && newItem.qty > 0 && newItem.hargaEstimasi > 0 && (
                <div className="flex justify-between items-center px-3 py-1.5 rounded-xl bg-[#FFF6EC]/80 border border-[#FFE2C2] text-[11px]">
                  <span className="text-[#FF8F2B] font-medium">Subtotal Estimasi:</span>
                  <span className="font-mono font-black text-slate-900">
                    {formatRupiah(newItem.qty * newItem.hargaEstimasi)}
                  </span>
                </div>
              )}

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
                <span className="font-black text-[#FF8F2B] font-mono text-sm">
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
              disabled={step === 1 && !supplierId}
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
              className={clsx(
                'flex-1 py-2.5 clay-btn-primary text-xs font-bold cursor-pointer transition-all',
                step === 1 && !supplierId ? 'opacity-40 cursor-not-allowed grayscale' : ''
              )}
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
