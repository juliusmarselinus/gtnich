'use client'

import { useState, useEffect } from 'react'
import { MenuItem, MenuFormData, BahanOption } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { getUnitConversionFactor, getCompatibleRecipeUnits, DEFAULT_SATUAN_LIST } from '@/lib/satuan'
import { menuService, searchResepAI, resolveAIIngredients } from '../services/menuService'
import { Plus, X, Loader2, Bot, CheckCircle2, Trash2, Sparkles, ChefHat } from 'lucide-react'
import clsx from 'clsx'
import CustomSelect from '@/components/ui/CustomSelect'
import DapiHead from '@/components/ui/DapiHead'

const KATEGORI_OPTIONS = [
  'Makanan Berat',
  'Camilan',
  'Kue & Manisan',
  'Minuman',
  'Lauk Kering',
  'Bumbu & Saus',
  'Paket Hemat',
]

interface MenuModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string | null, form: MenuFormData) => Promise<void>
  editingMenu: MenuItem | null
  bahanList: BahanOption[]
  onRefreshBahan?: () => Promise<void>
}

const emptyForm: MenuFormData = {
  nama: '',
  kategori: 'Makanan Berat',
  sku: '',
  emoji: '🍲',
  hargaJual: 0,
  resep: [],
}

const INPUT_STYLE =
  'w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/70 transition shadow-2xs'

export default function MenuModal({
  isOpen,
  onClose,
  onSave,
  editingMenu,
  bahanList,
  onRefreshBahan,
}: MenuModalProps) {
  const [form, setForm] = useState<MenuFormData>(emptyForm)
  const [currentBahanList, setCurrentBahanList] = useState<BahanOption[]>(bahanList)
  const [newIngredient, setNewIngredient] = useState<{
    bahanId: string
    qty: number
    satuan: string
  }>({ bahanId: '', qty: 0, satuan: 'gram' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingAI, setIsSearchingAI] = useState(false)
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setCurrentBahanList(bahanList)
  }, [bahanList])

  useEffect(() => {
    if (editingMenu) {
      setForm({
        nama: editingMenu.nama,
        kategori: editingMenu.kategori,
        sku: editingMenu.sku || '',
        emoji: editingMenu.emoji || '🍲',
        hargaJual: editingMenu.hargaJual,
        resep: editingMenu.resep.map(r => ({
          bahanId: r.bahanId,
          namaBahan: r.namaBahan,
          satuan: r.satuan,
          hargaPerSatuan: r.hargaPerSatuan,
          qty: r.qty,
        })),
      })
    } else {
      setForm(emptyForm)
    }
    setNewIngredient({ bahanId: '', qty: 0, satuan: 'gram' })
    setErrorMsg(null)
    setAiSuccessMsg(null)
  }, [editingMenu, isOpen])

  if (!isOpen) return null

  // Bahan yang sedang dipilih di dropdown tambah bahan
  const selectedBahanForNew = currentBahanList.find(b => b.id === newIngredient.bahanId)
  const availableUnitsForNew = selectedBahanForNew
    ? getCompatibleRecipeUnits(selectedBahanForNew.satuan)
    : DEFAULT_SATUAN_LIST

  // Hitung live HPP berdasarkan konversi unit
  const liveHPP = form.resep.reduce((sum, r) => {
    const bhn = currentBahanList.find(b => b.id === r.bahanId)
    const baseUnit = bhn?.satuan || r.satuan || 'item'
    const recipeUnit = r.satuan || baseUnit
    const factor = getUnitConversionFactor(recipeUnit, baseUnit)
    const price = bhn ? bhn.hargaPerSatuan : (r.hargaPerSatuan || 0)
    return sum + (price * (r.qty * factor))
  }, 0)

  const liveProfit = form.hargaJual - liveHPP
  const liveProfitPct = form.hargaJual > 0 ? (liveProfit / form.hargaJual) * 100 : 0

  const handleBahanChange = (bahanId: string) => {
    const bhn = currentBahanList.find(b => b.id === bahanId)
    let defaultUnit = 'gram'
    if (bhn) {
      const bSat = bhn.satuan.toLowerCase()
      if (['kg', 'gram', 'gr', 'g'].includes(bSat)) {
        defaultUnit = 'gram'
      } else if (['liter', 'l', 'ml'].includes(bSat)) {
        defaultUnit = 'ml'
      } else {
        defaultUnit = bhn.satuan
      }
    }
    setNewIngredient(p => ({ ...p, bahanId, satuan: defaultUnit }))
    setErrorMsg(null)
  }

  const addIngredient = (targetIngredient = newIngredient): boolean => {
    if (!targetIngredient.bahanId) {
      setErrorMsg('Pilih bahan terlebih dahulu')
      return false
    }
    if (targetIngredient.qty <= 0) {
      setErrorMsg('Kuantitas takaran resep harus lebih dari 0')
      return false
    }

    const bahan = currentBahanList.find(b => b.id === targetIngredient.bahanId)
    if (!bahan) return false

    setForm(prev => {
      const existingIdx = prev.resep.findIndex(
        r => r.bahanId === bahan.id && r.satuan === (targetIngredient.satuan || bahan.satuan)
      )

      if (existingIdx >= 0) {
        return {
          ...prev,
          resep: prev.resep.map((r, i) =>
            i === existingIdx ? { ...r, qty: r.qty + targetIngredient.qty } : r
          ),
        }
      }

      return {
        ...prev,
        resep: [
          ...prev.resep,
          {
            bahanId: bahan.id,
            namaBahan: bahan.nama,
            satuan: targetIngredient.satuan || bahan.satuan,
            hargaPerSatuan: bahan.hargaPerSatuan,
            qty: targetIngredient.qty,
          },
        ],
      }
    })

    setNewIngredient({ bahanId: '', qty: 0, satuan: 'gram' })
    setErrorMsg(null)
    return true
  }

  // Handle pencarian komposisi resep via Asisten AI Dapur
  const handleSearchKomposisiAI = async () => {
    if (!form.nama.trim()) {
      setErrorMsg('Isi nama menu terlebih dahulu untuk mencari takaran komposisi via AI.')
      return
    }

    setIsSearchingAI(true)
    setErrorMsg(null)
    setAiSuccessMsg(null)

    try {
      const fetchSearch = searchResepAI || menuService.searchResepAI
      const aiData = await fetchSearch(form.nama.trim(), currentBahanList)

      if (!aiData.items || aiData.items.length === 0) {
        setErrorMsg('Asisten AI belum menemukan takaran bahan yang pas untuk hidangan ini.')
        return
      }

      const fetchResolve = resolveAIIngredients || menuService.resolveAIIngredients
      const { resolvedResep, newlyCreatedBahan } = await fetchResolve(
        aiData.items,
        currentBahanList
      )

      if (newlyCreatedBahan.length > 0) {
        setCurrentBahanList(prev => [...prev, ...newlyCreatedBahan])
        if (onRefreshBahan) {
          onRefreshBahan()
        }
      }

      if (resolvedResep.length === 0) {
        setErrorMsg('Tidak ada bahan baku yang dapat dimasukkan ke resep.')
        return
      }

      setForm(prev => ({
        ...prev,
        kategori: prev.kategori === 'Makanan Berat' && aiData.kategori ? aiData.kategori : prev.kategori,
        emoji: (prev.emoji === '🍲' || !prev.emoji) && aiData.emoji ? aiData.emoji : prev.emoji,
        resep: resolvedResep,
      }))

      const createdNote = newlyCreatedBahan.length > 0
        ? ` (${newlyCreatedBahan.length} bahan otomatis ditambahkan ke inventaris dapur)`
        : ''
      setAiSuccessMsg(`Berhasil menyiapkan ${resolvedResep.length} bahan komposisi untuk "${form.nama.trim()}"${createdNote}.`)
    } catch (err: unknown) {
      const e = err as Error
      console.error('Error searching AI recipe:', e)
      setErrorMsg(e.message || 'Gagal mencari komposisi bahan via Asisten AI.')
    } finally {
      setIsSearchingAI(false)
    }
  }

  const updateResepUnit = (index: number, newUnit: string) => {
    setForm(prev => ({
      ...prev,
      resep: prev.resep.map((r, i) => (i === index ? { ...r, satuan: newUnit } : r)),
    }))
  }

  const updateResepQty = (index: number, newQty: number) => {
    setForm(prev => ({
      ...prev,
      resep: prev.resep.map((r, i) => (i === index ? { ...r, qty: newQty } : r)),
    }))
  }

  const removeIngredient = (idx: number) => {
    setForm(prev => ({
      ...prev,
      resep: prev.resep.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // UX Protection: Jika user sudah memilih bahan & mengisi takaran tapi belum klik tombol "Tambah",
    // otomatis masukkan bahan tersebut ke dalam daftar resep
    let currentResep = [...form.resep]
    if (newIngredient.bahanId && newIngredient.qty > 0) {
      const bahan = currentBahanList.find(b => b.id === newIngredient.bahanId)
      if (bahan) {
        const targetSatuan = newIngredient.satuan || bahan.satuan
        const existingIdx = currentResep.findIndex(
          r => r.bahanId === bahan.id && r.satuan === targetSatuan
        )
        if (existingIdx >= 0) {
          currentResep = currentResep.map((r, i) =>
            i === existingIdx ? { ...r, qty: r.qty + newIngredient.qty } : r
          )
        } else {
          currentResep.push({
            bahanId: bahan.id,
            namaBahan: bahan.nama,
            satuan: targetSatuan,
            hargaPerSatuan: bahan.hargaPerSatuan,
            qty: newIngredient.qty,
          })
        }
        setNewIngredient({ bahanId: '', qty: 0, satuan: 'gram' })
      }
    }

    if (!form.nama.trim()) {
      setErrorMsg('Nama menu hidangan wajib diisi')
      return
    }
    if (form.hargaJual <= 0) {
      setErrorMsg('Harga jual harus lebih dari 0')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await onSave(editingMenu ? editingMenu.id : null, {
        ...form,
        resep: currentResep,
      })
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan menu masakan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D00]/45 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-7 w-full max-w-xl mx-auto space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 my-auto border border-[#FFE49A]/30">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF6D6] border border-[#FFE49A] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
              <DapiHead size={34} mood="senang" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2B1D00] leading-tight">
                {editingMenu ? 'Edit Resep & Menu Masakan' : 'Tambah Menu Baru'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {editingMenu
                  ? 'Perbarui takaran resep, harga jual, atau bahan baku'
                  : 'Daftarkan hidangan dan hitung estimasi HPP otomatis'}
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

        {aiSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-[#E8F5E4] border border-[#C3E6BD] text-[#2D7A1F] text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#228B5B] flex-shrink-0" />
              <span className="font-medium">{aiSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiSuccessMsg(null)}
              className="text-[#2D7A1F] hover:text-[#1A5C14] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Baris 1: Nama Menu & Emoji */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
                Nama Hidangan / Menu
              </label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={e => {
                  setForm(p => ({ ...p, nama: e.target.value }))
                  if (aiSuccessMsg) setAiSuccessMsg(null)
                }}
                placeholder="Contoh: Nasi Goreng Spesial Dapur"
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
                Emoji Icon
              </label>
              <input
                type="text"
                value={form.emoji}
                onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                placeholder="🍲"
                className={clsx(INPUT_STYLE, 'text-center text-lg')}
              />
            </div>
          </div>

          {/* Banner Bantuan AI Asisten Dapur */}
          {form.nama.trim().length > 1 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFFBF2] to-[#FFF4E0] border border-[#FFE49A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#FFB800] text-[#2B1D00] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#2B1D00] truncate">
                    Asisten AI Resep Dapur
                  </p>
                  <p className="text-[10px] text-slate-600 truncate">
                    Otomatis racik takaran bahan untuk &ldquo;{form.nama.trim()}&rdquo;
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSearchKomposisiAI}
                disabled={isSearchingAI || isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#2B1D00] hover:bg-[#422D00] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm flex-shrink-0 active:scale-95"
              >
                {isSearchingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFB800]" />
                    <span>Mencari takaran resep...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>Cari Komposisi AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Baris 2: Kategori, SKU, Harga Jual */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
                Kategori
              </label>
              <CustomSelect
                value={form.kategori}
                onChange={val => setForm(p => ({ ...p, kategori: val }))}
                options={KATEGORI_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
                SKU (Opsional)
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                placeholder="MNU-001"
                className={clsx(INPUT_STYLE, 'font-mono uppercase')}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 px-1">
                Harga Jual (Rp)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.hargaJual || ''}
                onChange={e => setForm(p => ({ ...p, hargaJual: Number(e.target.value) }))}
                placeholder="25000"
                className={clsx(INPUT_STYLE, 'font-mono font-bold')}
              />
            </div>
          </div>

          {/* Bagian Resep Builder */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-xs font-black text-[#2B1D00] uppercase tracking-wider flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>Komposisi Resep ({form.resep.length} Bahan)</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Subtotal HPP dihitung otomatis sesuai satuan master bahan dapur
                </p>
              </div>
            </div>

            {/* List Bahan Resep yang sudah ditambahkan */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {form.resep.map((r, i) => {
                const masterBahan = currentBahanList.find(b => b.id === r.bahanId)
                const baseUnit = masterBahan?.satuan || 'item'
                const compUnits = masterBahan ? getCompatibleRecipeUnits(baseUnit) : DEFAULT_SATUAN_LIST
                const factor = getUnitConversionFactor(r.satuan || baseUnit, baseUnit)
                const cost = (masterBahan?.hargaPerSatuan || 0) * (r.qty * factor)

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFBF2] border border-[#FFE49A]/50 gap-2 shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2B1D00] truncate">{r.namaBahan}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Master: {formatRupiah(masterBahan?.hargaPerSatuan || 0)}/{baseUnit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={r.qty}
                        onChange={e => updateResepQty(i, Number(e.target.value))}
                        className="w-20 px-2.5 py-1.5 rounded-xl bg-white border border-[#FFE49A] text-xs text-slate-800 font-mono font-bold text-right outline-none focus:ring-1 focus:ring-[#FFB800]"
                      />
                      <div className="w-24">
                        <CustomSelect
                          value={r.satuan || baseUnit}
                          onChange={val => updateResepUnit(i, val)}
                          options={[...compUnits]}
                          size="sm"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#2B1D00] min-w-[75px] text-right">
                        {formatRupiah(Math.round(cost))}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(i)}
                        title="Hapus Bahan"
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {form.resep.length === 0 && (
                <div className="p-4 rounded-2xl bg-[#FFFBF2] border border-dashed border-[#FFE49A] text-center text-xs text-slate-500">
                  Belum ada bahan di resep menu ini. Pilih bahan di bawah untuk meracik.
                </div>
              )}
            </div>

            {/* Input Tambah Bahan Baru ke Resep */}
            <div className="p-3 rounded-2xl bg-[#F7F5F0] border border-[#EBE6DC] space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[160px]">
                  <CustomSelect
                    value={newIngredient.bahanId}
                    onChange={val => handleBahanChange(val)}
                    placeholder="-- Pilih Bahan Baku --"
                    searchable={true}
                    searchPlaceholder="Cari bahan..."
                    options={currentBahanList.map(b => ({
                      value: b.id,
                      label: b.nama,
                      sublabel: `Master: ${b.satuan}`,
                    }))}
                  />
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    placeholder="Takaran"
                    value={newIngredient.qty || ''}
                    onChange={e => {
                      const val = Number(e.target.value)
                      setNewIngredient(p => ({ ...p, qty: val }))
                      if (errorMsg) setErrorMsg(null)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newIngredient.bahanId && newIngredient.qty > 0) {
                          addIngredient()
                        }
                      }
                    }}
                    className="w-24 px-3 py-2 rounded-xl bg-white border border-[#EBE6DC] text-xs text-slate-800 font-mono font-bold outline-none focus:ring-1 focus:ring-[#FFB800]"
                  />
                </div>

                <div className="w-24">
                  <CustomSelect
                    value={newIngredient.satuan}
                    onChange={val => setNewIngredient(p => ({ ...p, satuan: val }))}
                    options={[...availableUnitsForNew]}
                    size="sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => addIngredient()}
                  className={clsx(
                    'px-4 py-2 text-xs font-black flex items-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-xs',
                    newIngredient.bahanId && newIngredient.qty > 0
                      ? 'bg-[#D8431F] hover:bg-[#c03917] text-white active:scale-95'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-[#EBE6DC]'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Status Bahan Terpilih */}
              {newIngredient.bahanId && newIngredient.qty > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#2D7A1F] bg-[#E8F5E4] px-3 py-1.5 rounded-xl border border-[#C3E6BD]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#228B5B]" />
                    <span>
                      Siap dimasukkan: <strong>{selectedBahanForNew?.nama}</strong> ({newIngredient.qty} {newIngredient.satuan})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => addIngredient()}
                    className="font-bold underline cursor-pointer"
                  >
                    + Masukkan sekarang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Financial Pods */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FFFBF2] border border-[#FFE49A]/60 text-center">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Est. HPP Resep</p>
              <p className="text-xs font-black text-[#2B1D00] font-mono mt-0.5">
                {formatRupiah(Math.round(liveHPP))}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Laba</p>
              <p
                className={clsx(
                  'text-xs font-black font-mono mt-0.5',
                  liveProfit >= 0 ? 'text-[#228B5B]' : 'text-rose-600'
                )}
              >
                {formatRupiah(Math.round(liveProfit))}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Margin Laba</p>
              <p
                className={clsx(
                  'text-xs font-black mt-0.5',
                  liveProfitPct >= 40
                    ? 'text-[#228B5B]'
                    : liveProfitPct >= 20
                    ? 'text-[#8A5A00]'
                    : 'text-rose-600'
                )}
              >
                {liveProfitPct.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[#F7F5F0] hover:bg-[#EFECE6] text-slate-700 text-xs font-black transition cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-[#D8431F] hover:bg-[#c03917] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Menu & Resep</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
