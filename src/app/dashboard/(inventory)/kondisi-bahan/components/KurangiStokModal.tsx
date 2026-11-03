'use client'

import { useState } from 'react'
import { BahanKondisi, BatchMasukItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Trash2, AlertOctagon, Loader2, X, AlertTriangle, ArrowRight } from 'lucide-react'

interface KurangiStokModalProps {
  isOpen: boolean
  bahan: BahanKondisi
  batch?: BatchMasukItem | null
  onClose: () => void
  onSuccess: () => void
  onProcess: (params: {
    bahanId: string
    jumlah: number
    alasan: string
    nomorBatch?: number
  }) => Promise<void>
}

export default function KurangiStokModal({
  isOpen,
  bahan,
  batch,
  onClose,
  onSuccess,
  onProcess,
}: KurangiStokModalProps) {
  // Hitung jumlah yang kadaluarsa untuk langsung dimusnahkan/dibuang seluruhnya
  const jumlahBuang = batch
    ? Math.min(batch.batchQty, bahan.totalStok)
    : Math.min(
        bahan.batches.filter(b => b.isExpired).reduce((acc, curr) => acc + curr.batchQty, 0) || bahan.totalStok,
        bahan.totalStok
      )

  const sisaStokSesudah = Math.max(0, Number((bahan.totalStok - jumlahBuang).toFixed(3)))
  const nilaiKerugian = jumlahBuang * bahan.hargaPerSatuan

  const defaultAlasan = batch
    ? `Pemusnahan seluruh stok batch #${batch.batchNo} yang telah melewati masa kadaluarsa`
    : `Pemusnahan seluruh batch kadaluarsa (${bahan.expiredBatchesCount || 1} batch) agar menjaga keamanan pangan dapur`

  const [alasan, setAlasan] = useState<string>(defaultAlasan)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (jumlahBuang <= 0) {
      setError('Stok bahan saat ini kosong atau tidak ada jumlah yang dapat dibuang.')
      return
    }

    try {
      setSubmitting(true)
      await onProcess({
        bahanId: bahan.id,
        jumlah: jumlahBuang,
        alasan,
        nomorBatch: batch?.batchNo,
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Terjadi kesalahan saat memproses pengurangan stok.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-kurangi-stok-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#2B1D00]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <div className="relative w-full max-w-lg rounded-[28px] bg-[#FFFBF2] border border-[#E8DCC8] shadow-[0_24px_60px_rgba(43,29,0,0.28)] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Modal DapurTwin */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E8DCC8] bg-[#FFF4DC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-kurangi-stok-title" className="text-base font-black text-[#2B1D00] tracking-tight">
                Pemusnahan Bahan Kadaluarsa
              </h3>
              <p className="text-xs text-[#8A6A40] font-medium">
                Buang seluruh stok yang rusak demi standar kualitas &amp; higienitas dapur
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A6A40] hover:text-[#2B1D00] hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Kotak Ringkasan Bahan & Otomatis Buang Semua */}
          <div className="p-4 rounded-2xl bg-white border border-[#EDE0C4] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8A6A40] font-medium">Nama Bahan:</span>
              <span className="text-sm font-black text-[#2B1D00]">{bahan.nama}</span>
            </div>

            {batch ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A6A40] font-medium">Target Mutasi:</span>
                <span className="font-mono text-xs font-bold text-[#2B1D00] bg-[#FFF6E0] px-2 py-0.5 rounded-lg border border-[#EDD9B0]">
                  Batch #{batch.batchNo} ({batch.sumberMasuk})
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A6A40] font-medium">Batch Kadaluarsa:</span>
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                  {bahan.expiredBatchesCount} Batch Ditemukan
                </span>
              </div>
            )}

            {/* Perbandingan Stok Sebelum & Sesudah Pemusnahan */}
            <div className="pt-2.5 border-t border-[#F2E5D0] grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/70">
                <p className="text-[10.5px] font-bold text-rose-700 uppercase tracking-wide">
                  Dibuang Seluruhnya
                </p>
                <p className="text-lg font-black text-rose-900 font-mono mt-0.5">
                  -{jumlahBuang} <span className="text-xs font-bold font-sans">{bahan.satuan}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DCC8]">
                <p className="text-[10.5px] font-bold text-[#8A6A40] uppercase tracking-wide">
                  Sisa Stok Aman
                </p>
                <p className="text-lg font-black text-[#2B1D00] font-mono mt-0.5">
                  {sisaStokSesudah} <span className="text-xs font-bold font-sans">{bahan.satuan}</span>
                </p>
              </div>
            </div>

            {/* Catatan Operasional */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#8A6A40]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>
                Jumlah diset otomatis membuang <strong>100% stok kadaluarsa</strong> untuk mencegah kontaminasi sajian.
              </span>
            </div>
          </div>

          {/* Nilai Kerugian Finansial */}
          <div className="p-3.5 rounded-2xl bg-[#FFF6E0] border border-[#EDD9B0] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#5A3A00] block">Taksiran Kerugian Bahan:</span>
              <span className="text-[10.5px] text-[#8A6A40] block font-mono">
                {formatRupiah(bahan.hargaPerSatuan)} / {bahan.satuan} × {jumlahBuang} {bahan.satuan}
              </span>
            </div>
            <span className="font-mono font-black text-[#2B1D00] text-base">
              {formatRupiah(nilaiKerugian)}
            </span>
          </div>

          {/* Alasan Pemusnahan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2B1D00]">
              Catatan / Alasan Pemusnahan
            </label>
            <input
              type="text"
              value={alasan}
              onChange={e => setAlasan(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EDD9B0] focus:outline-none focus:ring-2 focus:ring-[#FFB800]/40 focus:border-[#FFB800] text-xs text-[#2B1D00]"
              placeholder="Contoh: Sudah melewati masa kadaluarsa & bau menyengat"
            />
          </div>

          {/* Footer Aksi */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8DCC8]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 px-4 rounded-xl border border-[#EDD9B0] bg-white hover:bg-[#FFF6E0] text-[#5A3A00] text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || jumlahBuang <= 0}
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses Pemusnahan...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Buang Semua ({jumlahBuang} {bahan.satuan})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
