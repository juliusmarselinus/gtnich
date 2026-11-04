'use client'

import { useState, useRef, useEffect } from 'react'
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
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'

interface TagihanDetailModalProps {
  isOpen: boolean
  onClose: () => void
  po: PurchaseOrder | null
  initialMode?: 'detail' | 'bayar'
  onBayarSuccess?: (input: PelunasanInput) => Promise<void>
}

export default function TagihanDetailModal({
  isOpen,
  onClose,
  po,
  initialMode = 'detail',
  onBayarSuccess,
}: TagihanDetailModalProps) {
  const [metode, setMetode] = useState('Transfer Bank BCA')
  const [catatanBayar, setCatatanBayar] = useState('')
  const [buktiFoto, setBuktiFoto] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inisialisasi state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null)
      setCatatanBayar('')
      setBuktiFoto(null)
    }
  }, [isOpen, po])

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

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File bukti bayar harus berupa gambar (JPG, PNG, WebP).')
      return
    }

    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setBuktiFoto(dataUrl)
      setErrorMsg(null)
    }
    reader.readAsDataURL(file)
  }

  const handleProsesBayar = async (e: React.FormEvent) => {
    e.preventDefault()
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
        buktiFoto: buktiFoto || undefined,
      })
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan pelunasan tagihan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D00]/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-[28px] bg-[#FFFBF2] border border-[#E8DCC8] shadow-[0_24px_60px_rgba(43,29,0,0.28)] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DCC8] bg-[#FFF4DC]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#FFB800] text-[#2B1D00] flex items-center justify-center font-bold shadow-xs">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-[#2B1D00] flex items-center gap-2">
                {isLunas ? 'Rincian Tagihan Selesai' : 'Pembayaran Tagihan Supplier'}
                {isLunas ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]">
                    Lunas
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Menunggu Pembayaran
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#8A6A40] font-mono mt-0.5">
                No. PO: <span className="text-[#2B1D00] font-bold">{po.noPO}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A6A40] hover:text-[#2B1D00] hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Info Supplier & Total */}
          <div className="p-4 rounded-2xl bg-white border border-[#EDE0C4] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A6A40] flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#FF8F2B]" />
                Distributor / Supplier:
              </span>
              <span className="font-extrabold text-[#2B1D00]">{po.namaSupplier}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A6A40] flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#FF8F2B]" />
                Tanggal Terima:
              </span>
              <span className="font-mono font-bold text-slate-800">{tglTerimaStr}</span>
            </div>

            <div className="pt-2 border-t border-[#F2E5D0] flex items-center justify-between">
              <span className="text-xs font-bold text-[#8A6A40]">Total Kewajiban Pembayaran:</span>
              <span className="text-lg font-black font-mono text-[#D8431F]">
                {formatRupiah(totalTagihan)}
              </span>
            </div>
          </div>

          {/* Item Barang yang Dipesan */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#5A3A00] flex items-center gap-1.5 px-1">
              <Package className="w-3.5 h-3.5 text-[#FF8F2B]" />
              Daftar Barang Masuk ({po.items.length} item)
            </p>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {po.items.map((item, idx) => {
                const itemPrice = item.hargaAktual > 0 ? item.hargaAktual : item.hargaEstimasi
                const subtotal = item.qty * itemPrice

                return (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EDE0C4] text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#2B1D00]">{item.namaBahan}</p>
                      <p className="text-[10px] text-[#8A6A40] font-mono">
                        {item.qty} {item.satuan} × {formatRupiah(itemPrice)}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-[#2B1D00]">{formatRupiah(subtotal)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Pembayaran Langsung (Jika Belum Lunas) */}
          {!isLunas && (
            <form id="form-bayar-tagihan" onSubmit={handleProsesBayar} className="p-4 rounded-2xl bg-[#FFF6E0] border border-[#EDD9B0] space-y-3.5 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-[#EDD9B0]">
                <CreditCard className="w-4 h-4 text-[#D8431F]" />
                <span className="text-xs font-black text-[#2B1D00]">
                  Form Pembayaran &amp; Bukti Transfer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#5A3A00] block mb-1">
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
                      'Tunai / Cash',
                      'Giro / Cek',
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A3A00] block mb-1">
                    Nominal Dibayarkan
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formatRupiah(totalTagihan)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDD9B0] bg-white text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Upload Foto Bukti Pembayaran Langsung */}
              <div>
                <label className="text-[11px] font-bold text-[#5A3A00] block mb-1">
                  Bukti Pembayaran / Resi Struk (Opsional)
                </label>

                {buktiFoto ? (
                  <div className="relative aspect-video max-h-36 rounded-xl overflow-hidden border border-[#EDD9B0] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buktiFoto}
                      alt="Bukti Transfer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBuktiFoto(null)}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-slate-900"
                    >
                      <X className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-3 rounded-xl border-2 border-dashed border-[#EDD9B0] hover:border-[#FFB800] bg-white flex items-center justify-center gap-2 text-xs font-bold text-[#8A6A40] hover:text-[#2B1D00] transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#FF8F2B]" />
                    <span>Lampirkan Foto Bukti Transfer / Resi Struk</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoUpload}
                />
              </div>

              {/* Catatan / Keterangan Pembayaran */}
              <div>
                <label className="text-[11px] font-bold text-[#5A3A00] block mb-1">
                  Keterangan / Nomor Referensi Transfer
                </label>
                <input
                  type="text"
                  placeholder="Contoh: No. Ref BCA 991283838 a/n Toko"
                  value={catatanBayar}
                  onChange={e => setCatatanBayar(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDD9B0] bg-white text-xs text-[#2B1D00] focus:outline-none focus:ring-2 focus:ring-[#FFB800]/50"
                />
              </div>
            </form>
          )}

          {/* Riwayat Catatan Jika Sudah Lunas */}
          {isLunas && po.catatan && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Catatan Pelunasan:
              </span>
              <p className="text-[11px] text-emerald-700 font-mono break-words">{po.catatan}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#E8DCC8] bg-[#FFFBF2]">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-[#EDD9B0] bg-white hover:bg-[#FFF6E0] text-[#5A3A00] text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {!isLunas && (
            <button
              type="submit"
              form="form-bayar-tagihan"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-[#D8431F] hover:bg-[#BF3818] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Pelunasan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Konfirmasi Pembayaran Lunas</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
