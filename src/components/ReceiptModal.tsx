'use client'

import { Order, formatRupiah } from '@/lib/mock-data'
import { X, Printer, CheckCircle2, AlertCircle, Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ReceiptModalProps {
  order: Order | null
  onClose: () => void
  onUpdateStatus?: (id: string, newStatus: any) => void
}

export default function ReceiptModal({ order, onClose, onUpdateStatus }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false)

  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const handleCopySummary = () => {
    const text = `*ORDERHUB - STRUK PESANAN*\nNo: ${order.invoiceNumber}\nPelanggan: ${order.customerName}\nStatus: ${order.status.toUpperCase()} (${order.paymentStatus})\nTotal: ${formatRupiah(order.totalPrice)}\n\nTerima kasih telah berbelanja!`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">Rincian Struk Transaksi</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-200/60 text-stone-500 flex items-center justify-center transition-colors border border-stone-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Paper Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-stone-50/40 to-white">
          <div className="bg-white border border-stone-200/70 rounded-2xl p-5 shadow-sm relative">
            {/* Top decorative receipt cutout line */}
            <div className="text-center pb-4 border-b border-dashed border-stone-300">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white font-black text-base shadow-sm mb-2">
                OH
              </div>
              <h4 className="font-extrabold text-stone-800 text-base tracking-tight">ORDERHUB STORE</h4>
              <p className="text-[11px] text-stone-400">Jl. Inovasi Digital No. 26, UMKM Hub</p>
              <p className="text-[11px] text-stone-400">WA: 0812-3456-7890 | Web: orderhub.id</p>
            </div>

            {/* Invoice Meta */}
            <div className="py-3.5 border-b border-stone-100 text-xs space-y-1 font-mono text-stone-600">
              <div className="flex justify-between">
                <span className="text-stone-400">No. Invoice</span>
                <span className="font-bold text-stone-800">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Waktu</span>
                <span>{order.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Kasir/Sistem</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Pelanggan</span>
                <span className="font-bold text-stone-800">{order.customerName} ({order.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Metode Bayar</span>
                <span className="font-medium text-stone-800">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-stone-400">Status Pembayaran</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  order.paymentStatus === 'Lunas' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="py-3 border-b border-dashed border-stone-300">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">Item Pembelian</p>
              <div className="space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-stone-800">{item.name}</p>
                      <p className="text-[11px] text-stone-400 font-mono">
                        {item.qty} x {formatRupiah(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold text-stone-800 font-mono">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="py-3 border-b border-stone-100 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal ({order.qtyTotal} item)</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Diskon Promo</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-stone-500">
                  <span>Ongkos Kirim</span>
                  <span>{formatRupiah(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200/80">
                <span>TOTAL AKHIR</span>
                <span className="text-emerald-600">{formatRupiah(order.totalPrice)}</span>
              </div>
            </div>

            {/* Notes if any */}
            {order.notes && (
              <div className="mt-3 p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-[11px] text-amber-900">
                <span className="font-bold">Catatan:</span> {order.notes}
              </div>
            )}

            {/* Receipt Footer Message */}
            <div className="mt-5 text-center text-[10px] text-stone-400">
              <p>*** SIMPAN STRUK INI SEBAGAI BUKTI ***</p>
              <p className="mt-0.5">Barang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-stone-50/90 border-t border-stone-100 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" /> Cetak Struk Kasir
            </button>
            <button
              onClick={handleCopySummary}
              className="py-2.5 px-4 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin' : 'Salin Teks WA'}
            </button>
          </div>

          {/* Quick status progress actions */}
          {onUpdateStatus && (
            <div className="flex items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-stone-400 font-medium">Ubah Status:</span>
              {(['menunggu', 'diproses', 'dikirim', 'selesai'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(order.id, st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    order.status === st
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
