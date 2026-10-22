'use client'

import { Order, formatRupiah } from '@/lib/mock-data'
import {
  X,
  Printer,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  Truck,
  Package,
} from 'lucide-react'
import { useState } from 'react'

interface ReceiptDrawerProps {
  order: Order | null
  onClose: () => void
}

export default function ReceiptDrawer({
  order,
  onClose,
}: ReceiptDrawerProps) {
  const [copied, setCopied] = useState(false)

  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const handleCopyNote = () => {
    const text = `ORDERHUB - STRUK PESANAN\nNo: ${order.invoiceNumber}\nPelanggan: ${order.customerName}\nStatus: ${order.status.toUpperCase()} (${order.paymentStatus})\nTotal: ${formatRupiah(order.totalPrice)}\n\nTerima kasih telah berbelanja di OrderHub.`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Visual alur status novel-style
  const statusSteps = [
    { key: 'menunggu', label: 'Menunggu', icon: Clock },
    { key: 'diproses', label: 'Diproses', icon: Package },
    { key: 'dikirim', label: 'Dikirim', icon: Truck },
    { key: 'selesai', label: 'Selesai', icon: CheckCircle2 },
  ]

  const activeIndex = statusSteps.findIndex((s) => s.key === order.status)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Body bernuansa ruang baca novel */}
      <aside className="w-full max-w-[480px] bg-[#f4efe4] h-full shadow-2xl border-l border-[#dfd6c5] flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#dfd6c5] bg-[#ebe4d3] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-[#736855] font-bold">
                {order.invoiceNumber}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                  order.paymentStatus === 'Lunas'
                    ? 'bg-[#EFF5EE] text-[#2D5A34] border-[#D5E6D4]'
                    : 'bg-[#FDF6ED] text-[#B45309] border-[#F6E3CE]'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#241e17] mt-0.5">
              Rincian Struk & Pesanan
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#dfd6c5] text-[#736855] flex items-center justify-center transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tracker Status Otomatis */}
          <div className="p-4 bg-[#ebe4d3] rounded-2xl border border-[#d8cdb8] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5c5240]">Status Alur Pesanan:</span>
              <span className="text-xs font-extrabold text-[#241e17] capitalize bg-[#f7f3e8] px-2.5 py-0.5 rounded border border-[#d8cdb8] font-mono">
                ● {order.status}
              </span>
            </div>

            {/* Step indicator otomatis */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {statusSteps.map((step, idx) => {
                const isCurrent = step.key === order.status
                const isPassed = idx <= activeIndex

                return (
                  <div
                    key={step.key}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      isCurrent
                        ? 'bg-[#241e17] text-[#f7f3e8] border-[#241e17] font-bold shadow-xs'
                        : isPassed
                        ? 'bg-[#EFF5EE] text-[#2D5A34] border-[#D5E6D4] font-semibold'
                        : 'bg-[#f7f3e8] text-[#a19682] border-[#d8cdb8]'
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-semibold">
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* KERTAS NOVEL / BOOKPAPER STRUK (Dengan Tekstur Serat Nyata & Gradasi Cahaya Halaman) */}
          <div
            id="printable-receipt"
            className="bookpaper-texture bookpaper-shadow bookpaper-edge rounded-2xl p-7 font-mono text-xs text-[#262019] relative overflow-hidden border border-[#ded4be]"
          >
            {/* Header Toko */}
            <div className="text-center pb-4 border-b border-dashed border-[#b8ab94] space-y-1">
              <p className="font-extrabold text-sm tracking-widest text-[#241e17]">ORDERHUB STORE</p>
              <p className="text-[10px] text-[#6e634e]">Pusat Oleh-Oleh & Pangan Nusantara</p>
              <p className="text-[10px] text-[#91856e]">Komp. Bisnis UMKM No. 24 • 0812-3456-7890</p>
            </div>

            {/* Info Transaksi */}
            <div className="py-3 border-b border-dashed border-[#b8ab94] space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#6e634e]">Invoice</span>
                <span className="font-bold text-[#241e17]">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e634e]">Waktu</span>
                <span className="text-[#241e17]">{order.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e634e]">Kasir</span>
                <span className="text-[#241e17]">{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e634e]">Pelanggan</span>
                <span className="font-bold text-[#241e17]">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e634e]">Saluran</span>
                <span className="text-[#241e17]">{order.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e634e]">Metode Bayar</span>
                <span className="text-[#241e17]">{order.paymentMethod}</span>
              </div>
            </div>

            {/* List Barang */}
            <div className="py-3 border-b border-dashed border-[#b8ab94]">
              <div className="space-y-2.5">
                {order.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-[#241e17]">
                      <span>{it.name}</span>
                      <span>{formatRupiah(it.subtotal)}</span>
                    </div>
                    <p className="text-[10px] text-[#6e634e]">
                      {it.qty} pcs x {formatRupiah(it.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rincian Angka */}
            <div className="py-3 border-b border-dashed border-[#b8ab94] space-y-1 text-[11px]">
              <div className="flex justify-between text-[#6e634e]">
                <span>Subtotal ({order.qtyTotal} pcs)</span>
                <span className="text-[#241e17]">{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#2D5A34] font-bold">
                  <span>Potongan Promo</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-[#6e634e]">
                  <span>Biaya Pengiriman</span>
                  <span className="text-[#241e17]">{formatRupiah(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-2 border-t border-[#b8ab94] text-[#241e17]">
                <span>TOTAL AKHIR</span>
                <span className="text-[#2D5A34] font-black">{formatRupiah(order.totalPrice)}</span>
              </div>
            </div>

            {/* Catatan jika ada */}
            {order.notes && (
              <div className="mt-3 p-2 bg-[#ebe4d3]/70 rounded border border-[#d8cdb8] text-[10px] text-[#5c5240]">
                <span className="font-bold text-[#241e17]">Catatan:</span> {order.notes}
              </div>
            )}

            {/* Footer Barcode */}
            <div className="mt-4 text-center space-y-1.5 text-[10px] text-[#85775f]">
              <div className="h-6 w-32 mx-auto flex items-stretch justify-center gap-[2px] opacity-85">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 2].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w}px` }}
                    className="bg-[#241e17] inline-block h-full"
                  />
                ))}
              </div>
              <p className="tracking-widest font-mono text-[9px]">{order.id}</p>
              <p>Simpan tanda terima ini sebagai bukti sah transaksi.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[#dfd6c5] bg-[#ebe4d3] flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-[#241e17] hover:bg-[#382f25] text-[#f7f3e8] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleCopyNote}
            className="py-2.5 px-4 bg-[#f7f3e8] hover:bg-[#ebe4d3] text-[#241e17] border border-[#b8ab94] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2D5A34]" /> : <Copy className="w-3.5 h-3.5 text-[#6e634e]" />}
            <span>{copied ? 'Tersalin' : 'Salin Ringkasan'}</span>
          </button>
        </div>
      </aside>
    </div>
  )
}
