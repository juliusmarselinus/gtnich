'use client'

import { useState, useEffect } from 'react'
import { PurchaseOrder, VerifyPenerimaanInput, VerifyItemPenerimaan } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { CheckCircle2, AlertTriangle, X, Loader2, PackageCheck, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

interface VerifyPenerimaanModalProps {
  isOpen: boolean
  onClose: () => void
  po: PurchaseOrder | null
  onConfirm: (input: VerifyPenerimaanInput) => Promise<void>
}

export default function VerifyPenerimaanModal({
  isOpen,
  onClose,
  po,
  onConfirm,
}: VerifyPenerimaanModalProps) {
  const [items, setItems] = useState<VerifyItemPenerimaan[]>([])
  const [catatanPenerimaan, setCatatanPenerimaan] = useState('')
  const [autoUpdateMasterPrice, setAutoUpdateMasterPrice] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Inisialisasi item saat modal dibuka
  useEffect(() => {
    if (po && isOpen) {
      setItems(
        po.items.map(item => ({
          itemId: item.id || '',
          bahanId: item.bahanId,
          namaBahan: item.namaBahan,
          satuan: item.satuan,
          qtyPesan: item.qty,
          qtyDiterima: item.qty, // default kuantitas yang dipesan
          hargaEstimasi: item.hargaEstimasi,
          hargaAktual: item.hargaEstimasi, // default harga estimasi
          isSesuai: true,
          catatanItem: '',
        }))
      )
      setCatatanPenerimaan('')
      setErrorMsg(null)
    }
  }, [po, isOpen])

  if (!isOpen || !po) return null

  const updateItemQty = (idx: number, qty: number) => {
    setItems(prev => {
      const next = [...prev]
      const cur = next[idx]
      const isSesuai = qty === cur.qtyPesan
      next[idx] = { ...cur, qtyDiterima: qty, isSesuai }
      return next
    })
  }

  const updateItemHarga = (idx: number, harga: number) => {
    setItems(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], hargaAktual: harga }
      return next
    })
  }

  const toggleSesuai = (idx: number) => {
    setItems(prev => {
      const next = [...prev]
      const cur = next[idx]
      next[idx] = { ...cur, isSesuai: !cur.isSesuai }
      return next
    })
  }

  const updateItemCatatan = (idx: number, catatan: string) => {
    setItems(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], catatanItem: catatan }
      return next
    })
  }

  const totalAktual = items.reduce(
    (sum, item) => sum + (item.qtyDiterima || 0) * (item.hargaAktual || 0),
    0
  )

  const hasDiscrepancy = items.some(
    item => item.qtyDiterima !== item.qtyPesan || !item.isSesuai
  )

  const hasPriceChange = items.some(
    item => item.hargaAktual > 0 && item.hargaAktual !== item.hargaEstimasi
  )

  const handleSubmit = async () => {
    // Validasi
    for (const item of items) {
      if (item.qtyDiterima <= 0) {
        setErrorMsg(`Kuantitas barang "${item.namaBahan}" harus lebih dari 0.`)
        return
      }
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await onConfirm({
        poId: po.id,
        items,
        totalAktual,
        catatanPenerimaan: catatanPenerimaan.trim() || undefined,
        autoUpdateHargaMaster: autoUpdateMasterPrice,
      })
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan verifikasi penerimaan barang.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="clay-card p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto space-y-5 animate-in fade-in-0 zoom-in-95">
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FFF6EC] text-[#FF8F2B] flex items-center justify-center font-bold">
                <PackageCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Verifikasi Penerimaan Barang
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {po.noPO} • Supplier: <span className="font-semibold text-slate-700">{po.namaSupplier}</span>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl clay-btn text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning / Petunjuk */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
          <p className="font-bold text-slate-700">
            Periksa fisik barang yang diantar supplier sebelum dimasukkan ke gudang/dapur:
          </p>
          <p className="text-[11px] text-slate-500">
            Kuantitas yang Anda masukkan di bawah akan **langsung ditambahkan ke stok fisik bahan baku** dan dicatat pada audit log mutasi.
          </p>
        </div>

        {/* Banner Deteksi Perubahan Harga Baru dari PO */}
        {hasPriceChange && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs space-y-2 animate-in fade-in-50">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Terdeteksi Perubahan Harga Beli Aktual dari PO</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              Beberapa bahan memiliki harga beli aktual berbeda dari harga master/estimasi. Anda dapat langsung mengupdate harga master bahan (HPP) sekarang atau memutuskannya nanti melalui notifikasi.
            </p>
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-800 font-bold text-[11px] select-none">
              <input
                type="checkbox"
                checked={autoUpdateMasterPrice}
                onChange={e => setAutoUpdateMasterPrice(e.target.checked)}
                className="rounded text-[#FF8F2B] focus:ring-[#FF8F2B] w-4 h-4 cursor-pointer"
              />
              <span>Langsung perbarui harga master bahan baku & estimasi HPP resep</span>
            </label>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Item List Verification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Daftar Item ({items.length} Bahan)</span>
            {hasDiscrepancy ? (
              <span className="text-amber-600 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Terdeteksi Selisih Kuantitas / Catatan
              </span>
            ) : (
              <span className="text-[#FF8F2B] flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Semua Item Sesuai Pesanan
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const selisih = item.qtyDiterima - item.qtyPesan
              const isMatch = selisih === 0

              return (
                <div
                  key={item.itemId || idx}
                  className={clsx(
                    'p-4 rounded-2xl border transition-all space-y-2.5',
                    !isMatch || !item.isSesuai
                      ? 'bg-amber-50/50 border-amber-200 shadow-[inset_1px_1px_2px_#ffffff]'
                      : 'bg-white border-slate-100 shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-slate-800">{item.namaBahan}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Dipesan: {item.qtyPesan} {item.satuan} • Est: {formatRupiah(item.hargaEstimasi)}/{item.satuan}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSesuai(idx)}
                      className={clsx(
                        'px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors',
                        item.isSesuai
                          ? 'bg-[#FFF6EC] text-[#C86400] border border-[#FFE2C2]'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      )}
                    >
                      {item.isSesuai ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#FF8F2B]" /> Kondisi Bagus
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Ada Cacat/Kurang
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">
                        Qty Fisik Diterima ({item.satuan})
                      </label>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={item.qtyDiterima}
                        onChange={e => updateItemQty(idx, Number(e.target.value))}
                        className={clsx(
                          'w-full px-3 py-1.5 clay-inset text-xs font-mono font-bold text-slate-800',
                          !isMatch ? 'border-amber-400 bg-amber-50/70' : ''
                        )}
                      />
                      {!isMatch && (
                        <p className={clsx('text-[10px] font-bold mt-0.5 font-mono', selisih > 0 ? 'text-blue-600' : 'text-rose-600')}>
                          {selisih > 0 ? `+${selisih}` : selisih} {item.satuan} dari PO
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-500 font-bold block">
                          Harga Aktual/Satuan (Rp)
                        </label>
                        {item.hargaAktual !== item.hargaEstimasi && (
                          <span
                            className={clsx(
                              'text-[9px] font-black font-mono',
                              item.hargaAktual > item.hargaEstimasi ? 'text-amber-600' : 'text-emerald-600'
                            )}
                          >
                            {item.hargaAktual > item.hargaEstimasi ? '+' : ''}
                            {formatRupiah(item.hargaAktual - item.hargaEstimasi)}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={item.hargaAktual}
                        onChange={e => updateItemHarga(idx, Number(e.target.value))}
                        className={clsx(
                          'w-full px-3 py-1.5 clay-inset text-xs font-mono font-bold text-slate-800',
                          item.hargaAktual !== item.hargaEstimasi ? 'border-amber-400 bg-amber-50/50' : ''
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">
                        Subtotal Nota Aktual
                      </label>
                      <div className="px-3 py-1.5 bg-slate-100 rounded-xl font-mono font-black text-slate-800 text-xs flex items-center h-[34px]">
                        {formatRupiah(Math.round(item.qtyDiterima * item.hargaAktual))}
                      </div>
                    </div>
                  </div>

                  {(!isMatch || !item.isSesuai) && (
                    <div>
                      <input
                        type="text"
                        placeholder="Catatan selisih (misal: 2 kg rusak saat pengiriman, supplier potong nota)"
                        value={item.catatanItem || ''}
                        onChange={e => updateItemCatatan(idx, e.target.value)}
                        className="w-full px-3 py-1.5 clay-inset text-[11px] text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Ringkasan Finansial Verifikasi */}
        <div className="p-4 clay-inset rounded-2xl space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Estimasi Nilai PO Awal:</span>
            <span className="font-mono font-bold text-slate-700">{formatRupiah(po.totalEstimasi)}</span>
          </div>
          <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
            <span className="font-bold text-slate-800">Total Tagihan Aktual yang Diverifikasi:</span>
            <span className="font-mono font-black text-[#C86400] text-sm">
              {formatRupiah(Math.round(totalAktual))}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Catatan Tambahan Penerimaan (Opsional)
          </label>
          <input
            type="text"
            value={catatanPenerimaan}
            onChange={e => setCatatanPenerimaan(e.target.value)}
            placeholder="Contoh: Diterima oleh staf dapur sore, nota fisik terlampir"
            className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
          />
        </div>

        {/* Tombol Aksi */}
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
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PackageCheck className="w-4 h-4" />
            )}
            <span>Konfirmasi Barang & Tambah Stok</span>
          </button>
        </div>
      </div>
    </div>
  )
}
