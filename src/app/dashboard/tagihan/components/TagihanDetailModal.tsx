'use client'

import { useState } from 'react'
import { PurchaseOrder, PelunasanInput } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import {
  FileText,
  Building2,
  Calendar,
  X,
  CreditCard,
  CheckCircle2,
  Package,
  Receipt,
  Loader2,
} from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'

interface TagihanDetailModalProps {
  isOpen: boolean
  onClose: () => void
  po: PurchaseOrder | null
  onBayarSuccess?: (input: PelunasanInput) => Promise<void>
}

export default function TagihanDetailModal({
  isOpen,
  onClose,
  po,
  onBayarSuccess,
}: TagihanDetailModalProps) {
  const [showBayarForm, setShowBayarForm] = useState(false)
  const [metode, setMetode] = useState('Transfer Bank BCA')
  const [catatanBayar, setCatatanBayar] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen || !po) return null

  const isLunas = po.catatan?.includes('[LUNAS') || false
  const totalTagihan = po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi
  const tglTerimaStr = po.tanggalTerima
    ? new Date(po.tanggalTerima).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-'

  const handleProsesBayar = async () => {
    if (!onBayarSuccess) return
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await onBayarSuccess({
        poId: po.id,
        noPO: po.noPO,
        nominalBayar: totalTagihan,
        metodePembayaran: metode,
        catatan: catatanBayar.trim() || undefined,
      })
      setShowBayarForm(false)
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan pelunasan tagihan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="clay-card p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto space-y-5 animate-in fade-in-0 zoom-in-95">
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                Detail Tagihan Faktur
                {isLunas ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Lunas
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Belum Lunas
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                No. PO: <span className="text-slate-700 font-bold">{po.noPO}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl clay-btn text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informasi Pemasok & Penerimaan */}
        <div className="grid grid-cols-2 gap-3 p-4 clay-inset rounded-2xl text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Supplier / Pemasok
            </span>
            <p className="font-extrabold text-slate-800 flex items-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4 text-emerald-600" />
              {po.namaSupplier}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tanggal Penerimaan Barang
            </span>
            <p className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {tglTerimaStr}
            </p>
          </div>
        </div>

        {/* Catatan / Log */}
        {po.catatan && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Catatan Order & Pembayaran:
            </span>
            <p className="text-slate-700 font-medium leading-relaxed">{po.catatan}</p>
          </div>
        )}

        {/* Rincian Item Bahan Tagihan */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Rincian Item Bahan Baku Yang Diterima ({po.items.length} Macam)
          </p>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {po.items.map((item, idx) => {
              const itemPrice = item.hargaAktual > 0 ? item.hargaAktual : item.hargaEstimasi
              const subtotal = item.qty * itemPrice

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.namaBahan}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.qty} {item.satuan} × {formatRupiah(itemPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-mono font-black text-slate-800">
                      {formatRupiah(subtotal)}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Diterima</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ringkasan Total Tagihan */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-800 font-medium">Nilai Total Tagihan Aktual:</span>
            <span className="text-lg font-black font-mono text-emerald-900">
              {formatRupiah(totalTagihan)}
            </span>
          </div>
        </div>

        {/* Form Pelunasan Tagihan (Expandable) */}
        {!isLunas && showBayarForm && (
          <div className="p-4 clay-inset rounded-2xl space-y-3 pt-3 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Konfirmasi Pelunasan Tagihan
            </p>

            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl">{errorMsg}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Metode Pembayaran
                </label>
                <CustomSelect
                  value={metode}
                  onChange={val => setMetode(val)}
                  options={[
                    'Transfer Bank BCA',
                    'Transfer Bank Mandiri',
                    'Transfer Bank BRI',
                    'Transfer Bank BNI',
                    'QRIS',
                    'Tunai / Kasir',
                    'Giro / Cek',
                  ]}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Nominal Bayar (Rp)
                </label>
                <input
                  type="text"
                  disabled
                  value={formatRupiah(totalTagihan)}
                  className="w-full px-3.5 py-2.5 clay-inset text-xs font-mono font-bold text-slate-700 bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                Catatan / Bukti Transfer (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: No. Ref BCA 991283838 a/n Toko"
                value={catatanBayar}
                onChange={e => setCatatanBayar(e.target.value)}
                className="w-full px-3.5 py-2 clay-inset text-xs text-slate-800"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowBayarForm(false)}
                className="px-4 py-2 clay-btn text-xs font-bold text-slate-600 cursor-pointer"
              >
                Batal Bayar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProsesBayar}
                className="flex-1 py-2 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Simpan Bukti & Tandai Lunas</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600 cursor-pointer"
          >
            Tutup
          </button>

          {!isLunas && !showBayarForm && (
            <button
              type="button"
              onClick={() => setShowBayarForm(true)}
              className="flex-1 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Bayar Tagihan Sekarang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
