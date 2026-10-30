'use client'

import { useState, useEffect } from 'react'
import { MenuItem, MenuFormData, BahanOption } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { getUnitConversionFactor, getCompatibleRecipeUnits, DEFAULT_SATUAN_LIST } from '@/lib/satuan'
import { menuService, searchResepAI, resolveAIIngredients } from '../services/menuService'
import { Plus, X, Loader2, CornerDownLeft, Bot, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import CustomSelect from '@/components/ui/CustomSelect'

const KATEGORI_OPTIONS = ['Camilan', 'Kue & Manisan', 'Lauk Kering', 'Minuman', 'Makanan Berat', 'Bumbu & Saus']

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
  kategori: 'Camilan',
  sku: '',
  emoji: '🍲',
  hargaJual: 0,
  resep: [],
}

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
      setErrorMsg('Kuantitas takaran harus lebih dari 0')
      return false
    }

    const bahan = currentBahanList.find(b => b.id === targetIngredient.bahanId)
    if (!bahan) return false

    setForm(prev => {
      // Cek apakah bahan dengan satuan yang sama sudah ada di list resep, jika ya jumlahkan kuantitasnya
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

  // Handle pencarian komposisi resep via 9Router AI
  const handleSearchKomposisiAI = async () => {
    if (!form.nama.trim()) {
      setErrorMsg('Isi nama menu terlebih dahulu untuk mencari komposisi via AI.')
      return
    }

    setIsSearchingAI(true)
    setErrorMsg(null)
    setAiSuccessMsg(null)

    try {
      // 1. Panggil 9Router AI endpoint
      const fetchSearch = searchResepAI || menuService.searchResepAI
      const aiData = await fetchSearch(form.nama.trim(), currentBahanList)

      if (!aiData.items || aiData.items.length === 0) {
        setErrorMsg('AI tidak menemukan komposisi bahan yang sesuai untuk menu ini.')
        return
      }

      // 2. Cocokkan dengan master bahan dapur (dan daftarkan otomatis bahan baru jika diperlukan)
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

      // 3. Masukkan ke dalam list bahan yang dibutuhkan (resep)
      setForm(prev => ({
        ...prev,
        kategori: prev.kategori === 'Camilan' && aiData.kategori ? aiData.kategori : prev.kategori,
        emoji: (prev.emoji === '🍲' || !prev.emoji) && aiData.emoji ? aiData.emoji : prev.emoji,
        resep: resolvedResep,
      }))

      const createdNote = newlyCreatedBahan.length > 0
        ? ` (${newlyCreatedBahan.length} bahan baru didaftarkan ke master dapur)`
        : ''
      setAiSuccessMsg(`Berhasil menemukan ${resolvedResep.length} bahan komposisi via 9Router untuk "${form.nama.trim()}"${createdNote}.`)
    } catch (err: unknown) {
      const e = err as Error
      console.error('Error searching AI recipe:', e)
      setErrorMsg(e.message || 'Gagal mencari komposisi bahan via 9Router AI.')
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
        // Bersihkan input draft setelah dimasukkan
        setNewIngredient({ bahanId: '', qty: 0, satuan: 'gram' })
      }
    }

    if (!form.nama.trim()) {
      setErrorMsg('Nama menu wajib diisi')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="clay-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <h3 className="text-base font-extrabold text-slate-800">
          {editingMenu ? 'Edit Resep & Menu Masakan' : 'Tambah Menu Baru'}
        </h3>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {aiSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{aiSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Menu</label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={e => {
                  setForm(p => ({ ...p, nama: e.target.value }))
                  if (aiSuccessMsg) setAiSuccessMsg(null)
                }}
                placeholder="Contoh: Brownies Kukus Cokelat"
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Icon / Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                placeholder="Contoh: 🎂"
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-center text-slate-800"
              />
            </div>
          </div>

          {/* Opsi Bantuan AI 9Router: Muncul HANYA ketika pengguna sudah mengisi judul/nama menu */}
          {form.nama.trim().length > 0 && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-950 truncate">
                    Cari Komposisi via AI (9Router)
                  </p>
                  <p className="text-[11px] text-emerald-700 truncate">
                    Otomatis cari takaran & masukkan bahan baku untuk &ldquo;{form.nama.trim()}&rdquo;
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSearchKomposisiAI}
                disabled={isSearchingAI || isSubmitting}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm flex-shrink-0"
              >
                {isSearchingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mencari via 9Router...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>Cari Komposisi AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Kategori</label>
              <CustomSelect
                value={form.kategori}
                onChange={val => setForm(p => ({ ...p, kategori: val }))}
                options={KATEGORI_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">SKU (Opsional)</label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                placeholder="KUE-BRWN-01"
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                min="0"
                required
                value={form.hargaJual || ''}
                onChange={e => setForm(p => ({ ...p, hargaJual: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-mono font-bold"
              />
            </div>
          </div>

          {/* Resep Builder */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Komposisi Takaran Resep ({form.resep.length} Bahan)
              </p>
              <span className="text-[10px] text-slate-400">
                *Satuan otomatis mengonversi ke HPP bahan master
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {form.resep.map((r, i) => {
                const masterBahan = currentBahanList.find(b => b.id === r.bahanId)
                const baseUnit = masterBahan?.satuan || 'item'
                const compUnits = masterBahan ? getCompatibleRecipeUnits(baseUnit) : DEFAULT_SATUAN_LIST
                const factor = getUnitConversionFactor(r.satuan || baseUnit, baseUnit)
                const cost = (masterBahan?.hargaPerSatuan || 0) * (r.qty * factor)

                return (
                  <div key={i} className="flex items-center justify-between clay-inset px-3.5 py-2 rounded-xl gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{r.namaBahan}</p>
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
                        className="w-20 px-2 py-1 clay-card text-xs text-slate-800 font-mono font-bold text-right"
                      />
                      <div className="w-24">
                        <CustomSelect
                          value={r.satuan || baseUnit}
                          onChange={val => updateResepUnit(i, val)}
                          options={[...compUnits]}
                          size="sm"
                          variant="card"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700 min-w-[70px] text-right">
                        {formatRupiah(Math.round(cost))}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(i)}
                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
              {form.resep.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  Belum ada bahan di resep. Masukkan bahan di bawah ini.
                </p>
              )}
            </div>

            {/* Input Tambah Bahan ke Resep dengan Satuan yang dapat dipilih */}
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-2">
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
                    className="w-24 px-3 py-2 clay-inset text-xs text-slate-800 font-mono font-bold"
                  />
                </div>

                <div className="w-28">
                  <CustomSelect
                    value={newIngredient.satuan}
                    onChange={val => setNewIngredient(p => ({ ...p, satuan: val }))}
                    options={[...availableUnitsForNew]}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => addIngredient()}
                  className={clsx(
                    'px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 rounded-xl transition-all cursor-pointer',
                    newIngredient.bahanId && newIngredient.qty > 0
                      ? 'clay-btn-primary shadow-sm text-white animate-pulse'
                      : 'clay-btn text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                  <CornerDownLeft className="w-3 h-3 opacity-60 hidden sm:inline" />
                </button>
              </div>

              {/* UX Hint: Notifikasi interaktif jika bahan sudah terisi */}
              {newIngredient.bahanId && newIngredient.qty > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#FF8F2B] bg-[#FFF6EC] px-3 py-1.5 rounded-xl border border-[#FFE2C2] animate-in fade-in-50">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF8F2B]" />
                    <span>
                      Siap dimasukkan: <strong>{selectedBahanForNew?.nama}</strong> ({newIngredient.qty} {newIngredient.satuan})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => addIngredient()}
                    className="underline font-bold hover:text-[#E07A1E] cursor-pointer"
                  >
                    + Masukkan sekarang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Calculation Pod */}
          <div className="grid grid-cols-3 gap-2 p-3 clay-inset rounded-2xl text-center">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. HPP Resep</p>
              <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{formatRupiah(Math.round(liveHPP))}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimasi Profit</p>
              <p className={clsx('text-xs font-black font-mono mt-0.5', liveProfit >= 0 ? 'text-[#FF8F2B]' : 'text-rose-600')}>
                {formatRupiah(Math.round(liveProfit))}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Margin Laba</p>
              <p className={clsx('text-xs font-black mt-0.5', liveProfitPct >= 0 ? 'text-[#FF8F2B]' : 'text-rose-600')}>
                {liveProfitPct.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
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
              <span>Simpan Menu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
