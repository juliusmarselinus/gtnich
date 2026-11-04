'use client'

import { useState } from 'react'
import { AIPORekomendasiItem, CreatePOInput } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import {
  X,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Square,
  ShoppingCart,
  Store,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react'
import clsx from 'clsx'
import DapiHead from '@/components/ui/DapiHead'
import DapiMascot from '@/components/ui/DapiMascot'

interface AIRekomendasiModalProps {
  isOpen: boolean
  onClose: () => void
  loading: boolean
  summary: string
  items: AIPORekomendasiItem[]
  onApplyRecommendation: (selectedItems: CreatePOInput['items'], notes: string) => void
  onRefreshRecommendation: () => void
}

export default function AIRekomendasiModal({
  isOpen,
  onClose,
  loading,
  summary,
  items,
  onApplyRecommendation,
  onRefreshRecommendation,
}: AIRekomendasiModalProps) {
  // State pilihan item yang dicentang
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  // State penyesuaian qty lokal
  const [customQtys, setCustomQtys] = useState<Record<string, number>>({})

  if (!isOpen) return null

  // Inisialisasi awal centang semua saat data masuk
  const effectiveSelected = (bahanId: string) => {
    return selectedIds[bahanId] !== undefined ? selectedIds[bahanId] : true
  }

  const effectiveQty = (item: AIPORekomendasiItem) => {
    return customQtys[item.bahanId] !== undefined ? customQtys[item.bahanId] : item.rekomendasiQty
  }

  const toggleSelect = (bahanId: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [bahanId]: !effectiveSelected(bahanId),
    }))
  }

  const toggleAll = () => {
    const allChecked = items.every(i => effectiveSelected(i.bahanId))
    const next: Record<string, boolean> = {}
    items.forEach(i => {
      next[i.bahanId] = !allChecked
    })
    setSelectedIds(next)
  }

  const handleQtyChange = (bahanId: string, val: number) => {
    setCustomQtys(prev => ({
      ...prev,
      [bahanId]: Math.max(1, isNaN(val) ? 1 : val),
    }))
  }

  const selectedCount = items.filter(i => effectiveSelected(i.bahanId)).length
  const totalEstimasiBiaya = items
    .filter(i => effectiveSelected(i.bahanId))
    .reduce((sum, it) => sum + effectiveQty(it) * (it.estimasiHarga || 0), 0)

  const handleConfirm = () => {
    const chosenItems: CreatePOInput['items'] = items
      .filter(i => effectiveSelected(i.bahanId))
      .map(it => ({
        bahanId: it.bahanId,
        namaBahan: it.namaBahan,
        satuan: it.satuan,
        qty: effectiveQty(it),
        hargaEstimasi: it.estimasiHarga || 0,
        stokSebelum: it.stokSekarang,
      }))

    if (chosenItems.length === 0) return

    const notes = `Rekomendasi Cerdas Dapi AI: ${chosenItems.length} bahan disesuaikan berdasarkan kemasan pasar & perputaran operasional riil.`
    onApplyRecommendation(chosenItems, notes)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FFFDF9] rounded-[32px] border border-[#EDE0C4] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal dengan Maskot Dapi */}
        <div className="relative p-5 sm:p-6 border-b border-[#EDE0C4] bg-gradient-to-r from-[#FFC93C]/20 via-[#FFFDF9] to-[#FF9A1F]/20 flex items-center justify-between overflow-hidden">
          {/* Latar visual lingkaran */}
          <div aria-hidden className="pointer-events-none absolute -right-6 -bottom-10 w-44 h-44 rounded-full bg-amber-200/30 blur-xl" />

          <div className="flex items-center gap-3.5 relative z-10">
            {/* Maskot Kepala Dapi */}
            <div className="relative flex-shrink-0">
              <div className="w-13 h-13 rounded-2xl bg-[#FFE4BF] border border-[#FFB565] flex items-center justify-center shadow-[0_6px_14px_rgba(220,130,0,0.2)] overflow-hidden">
                <DapiHead size={52} mood={loading ? 'khawatir' : 'senang'} />
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-[#2B1D00]">Rekomendasi Belanja dari Dapi</h3>
              <p className="text-xs text-[#8A6A40] mt-0.5">
                Dihitung dari kecepatan habis riil di dapur, tren penjualan kasir, & rata-rata kemasan pasaran Indonesia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-black/5 text-[#8A6A40] hover:text-[#2B1D00] transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-100/80 border border-amber-300 flex items-center justify-center">
                  <DapiHead size={56} mood="khawatir" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center animate-spin">
                  <Loader2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="font-extrabold text-sm text-[#2B1D00]">Dapi Sedang Menghitung Kebutuhan Pasar...</p>
                <p className="text-xs text-[#8A6A40] mt-1 max-w-sm">
                  Mengecek riwayat transaksi, memastikan kuantitas pembelian wajar per paket pasar (bukan satuan mikro), dan mencocokkan harga rata-rata pasaran.
                </p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <DapiHead size={56} mood="senang" />
              </div>
              <div>
                <p className="font-extrabold text-base text-[#2B1D00]">Stok Dapur Dalam Kondisi Prima!</p>
                <p className="text-xs text-[#8A6A40] mt-1.5 max-w-sm">
                  Tidak ditemukan bahan yang berisiko habis dalam waktu dekat berdasarkan laju pemakaian dapur saat ini.
                </p>
              </div>
              <button
                type="button"
                onClick={onRefreshRecommendation}
                className="mt-2 px-4 py-2 rounded-xl bg-white border border-[#EDE0C4] text-xs font-bold text-[#5A3A00] hover:bg-amber-50 cursor-pointer shadow-sm"
              >
                Analisis Ulang
              </button>
            </div>
          ) : (
            <>
              {/* Box Rangkuman Rekomendasi Dapi */}
              <div className="p-4 rounded-2xl bg-[#FFF9ED] border border-[#F0D9A8] text-xs text-[#5A3A00] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#3D2500]">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Saran Pengadaan dari Dapi:</span>
                </div>
                <p className="leading-relaxed text-[#6E4907]">{summary}</p>
              </div>

              {/* Bar Pilihan Item */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center gap-2 font-bold text-[#5A3A00] hover:text-[#2B1D00] cursor-pointer"
                >
                  {items.every(i => effectiveSelected(i.bahanId)) ? (
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Pilih Semua ({items.length} bahan)</span>
                </button>
                <span className="text-[#8A6A40]">
                  Dipilih: <strong className="text-[#2B1D00] font-bold">{selectedCount}</strong> bahan
                </span>
              </div>

              {/* List Item Rekomendasi */}
              <div className="space-y-3">
                {items.map(item => {
                  const isChecked = effectiveSelected(item.bahanId)
                  const currentQty = effectiveQty(item)
                  const subtotal = currentQty * (item.estimasiHarga || 0)

                  return (
                    <div
                      key={item.bahanId}
                      className={clsx(
                        'p-4 rounded-2xl border transition-all text-xs flex flex-col gap-3',
                        isChecked
                          ? 'bg-white border-amber-300 shadow-[0_4px_16px_rgba(220,130,0,0.06)] ring-1 ring-amber-300/40'
                          : 'bg-[#F9F7F2] border-[#E8DFC8] opacity-60'
                      )}
                    >
                      {/* Baris Atas: Info Bahan, Kecepatan Habis, Alasan */}
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelect(item.bahanId)}
                          className="mt-0.5 text-amber-600 hover:text-amber-700 cursor-pointer flex-shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-sm text-[#2B1D00]">{item.namaBahan}</span>
                            <span
                              className={clsx(
                                'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                                item.kecepatanHabis === 'Tinggi'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : item.kecepatanHabis === 'Sedang'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              )}
                            >
                              Habis {item.kecepatanHabis}
                            </span>
                            {item.namaSupplier && (
                              <span className="text-[10px] font-semibold text-[#8A6A40] bg-[#EFE9DC] px-2 py-0.5 rounded-md">
                                {item.namaSupplier}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-[#5A3A00] leading-snug">{item.alasan}</p>

                          {/* Kartu Informasi Pasaran & Paket Pembelian */}
                          {item.kemasanPasar && (
                            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-1.5 text-[#5A3A00]">
                                <Store className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                <span>
                                  Standar Pasar: <strong className="text-[#2B1D00]">{item.kemasanPasar}</strong>
                                </span>
                              </div>
                              {item.rentangHargaPasar && (
                                <div className="text-[10px] text-[#8A6A40]">
                                  Rentang Harga: <span className="font-mono font-bold text-[#5A3A00]">{item.rentangHargaPasar}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-[#8A6A40] pt-1">
                            <span>
                              Sisa Stok: <strong className="text-[#3D2500] font-mono">{item.stokSekarang} {item.satuan}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Batas Aman: <span className="font-mono">{item.stokMinimum} {item.satuan}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Baris Bawah: Kontrol Kuantitas & Subtotal */}
                      <div className="flex items-center justify-between border-t border-dashed border-[#EDE0C4] pt-2.5 pl-7">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#8A6A40]">Kuantitas Pesan:</span>
                          <input
                            type="number"
                            min="1"
                            disabled={!isChecked}
                            value={currentQty}
                            onChange={e => handleQtyChange(item.bahanId, parseInt(e.target.value))}
                            className="w-20 px-2 py-1 text-center font-black text-xs bg-amber-50/60 border border-[#EDE0C4] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 font-mono"
                          />
                          <span className="text-xs font-bold text-[#5A3A00]">{item.satuan}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#8A6A40] block">Estimasi Biaya:</span>
                          <span className="text-xs font-black text-[#2B1D00] font-mono">
                            {formatRupiah(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-[#EDE0C4] bg-[#FFF9ED] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-[11px] text-[#8A6A40]">Total Estimasi Pembelian</p>
            <p className="text-lg font-black text-[#2B1D00] font-mono">
              {formatRupiah(totalEstimasiBiaya)}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border border-[#EDE0C4] text-xs font-bold text-[#5A3A00] hover:bg-black/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={loading || selectedCount === 0}
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-[#FF8F2B]/25 disabled:opacity-50 cursor-pointer transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buka Form Pembelian ({selectedCount} Bahan)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
