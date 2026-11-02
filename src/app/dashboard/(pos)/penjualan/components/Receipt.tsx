'use client'

import { useRef } from 'react'
import { X, Printer } from 'lucide-react'
import { formatRupiah } from '@/lib/mock-data'
import type { OrderRecord } from '../types'
import DapiHead from '@/components/ui/DapiHead'
import DapiMascot from '@/components/ui/DapiMascot'

export interface ReceiptData {
  invoiceNumber?: string
  createdAt: string
  cashierName: string
  customerName?: string | null
  customerEmail?: string | null
  items: { namaMenu: string; qty: number; hargaJual: number; subtotal: number }[]
  total: number
  paymentMethod: string
  cashReceived?: number | null
  changeAmount?: number | null
  notes?: string | null
  isPreview?: boolean
}

export function orderToReceipt(o: OrderRecord): ReceiptData {
  return {
    invoiceNumber: o.invoiceNumber,
    createdAt: o.createdAt,
    cashierName: o.cashierName || '-',
    customerName: o.customerName || null,
    customerEmail: o.customerEmail || null,
    items: (o.items || []).map(i => ({
      namaMenu: i.namaMenu,
      qty: i.qty,
      hargaJual: i.hargaJual,
      subtotal: i.subtotal || i.hargaJual * i.qty,
    })),
    total: o.totalPrice,
    paymentMethod: o.paymentMethod,
    cashReceived: o.cashReceived,
    changeAmount: o.changeAmount,
    notes: o.notes,
  }
}

const Dash = () => <div className="border-t border-dashed border-slate-300 my-2.5" />

export function Receipt({ data }: { data: ReceiptData }) {
  const tgl = new Date(data.createdAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const showCash = data.cashReceived != null && data.cashReceived > 0

  return (
    <div className="bg-white text-slate-800 font-mono text-[12px] leading-snug p-5 w-full max-w-[340px] mx-auto relative overflow-hidden shadow-xs">
      {/* Watermark Maskot Dapi di background kertas struk */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
      >
        <DapiMascot
          width={240}
          mood="senang"
          className="opacity-[0.06] transform -rotate-12 translate-y-6"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF6D6] border border-[#FFE49A]/80 flex items-center justify-center mb-1.5 shadow-xs">
            <DapiHead size={30} mood="senang" />
          </div>
          <p className="text-base font-extrabold tracking-tight text-slate-900">DapurTwin</p>
          <p className="text-[11px] text-slate-500">Struk Pembayaran</p>
          {data.isPreview && (
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF6D6] text-[#8A5A00] text-[10px] font-bold">
              PREVIEW
            </span>
          )}
        </div>

        <Dash />
      <div className="space-y-0.5 text-[11px]">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">No. Nota</span>
          <span className="font-bold text-right">{data.invoiceNumber || 'dibuat saat bayar'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Waktu</span>
          <span className="text-right">{tgl}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Kasir</span>
          <span className="text-right">{data.cashierName}</span>
        </div>
        {data.customerName && (
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Pelanggan</span>
            <span className="text-right font-medium">{data.customerName}</span>
          </div>
        )}
        {data.customerEmail && (
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">E-Receipt</span>
            <span className="text-right font-mono text-[10px] text-amber-800">{data.customerEmail}</span>
          </div>
        )}
      </div>

      <Dash />
      <div className="space-y-2">
        {data.items.map((it, i) => (
          <div key={i}>
            <p className="font-bold">{it.namaMenu}</p>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">
                {it.qty} x {formatRupiah(it.hargaJual)}
              </span>
              <span className="font-bold">{formatRupiah(it.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <Dash />
      <div className="flex justify-between text-sm font-extrabold">
        <span>TOTAL</span>
        <span>{formatRupiah(data.total)}</span>
      </div>

      <div className="mt-2 space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Metode</span>
          <span>{data.paymentMethod}</span>
        </div>
        {showCash && (
          <div className="flex justify-between">
            <span className="text-slate-500">Uang diterima</span>
            <span>{formatRupiah(data.cashReceived as number)}</span>
          </div>
        )}
        {showCash && data.changeAmount != null && (
          <div className="flex justify-between font-bold">
            <span className="text-slate-500 font-normal">Kembalian</span>
            <span>{formatRupiah(data.changeAmount)}</span>
          </div>
        )}
      </div>

      {data.notes && (
        <>
          <Dash />
          <p className="text-[11px]">
            <span className="text-slate-500">Catatan: </span>
            {data.notes}
          </p>
        </>
      )}

        <Dash />
        <p className="text-center text-[11px] text-slate-500">Terima kasih, selamat menikmati!</p>
      </div>
    </div>
  )
}

export function ReceiptModal({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  // Cetak / simpan PDF lewat dialog cetak browser
  const handlePrint = () => {
    const node = ref.current
    if (!node) return
    const w = window.open('', '_blank', 'width=420,height=720')
    if (!w) return
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(n => n.outerHTML)
      .join('')
    w.document.write(
      `<html><head><title>${data.invoiceNumber || 'Struk'}</title>${styles}` +
        `<style>body{margin:0;padding:12px;background:#fff}@page{margin:8mm}</style></head>` +
        `<body>${node.outerHTML}</body></html>`
    )
    w.document.close()
    setTimeout(() => {
      w.focus()
      w.print()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2B1D00]/40 backdrop-blur-sm p-4">
      <div className="bg-[#FFF9EC] rounded-[32px] shadow-2xl p-5 w-full max-w-sm max-h-[92vh] flex flex-col gap-4 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Struk Transaksi</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto rounded-[24px] bg-white">
          <div ref={ref}>
            <Receipt data={data} />
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-xs font-bold text-slate-700 cursor-pointer transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-[2] py-3 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}

