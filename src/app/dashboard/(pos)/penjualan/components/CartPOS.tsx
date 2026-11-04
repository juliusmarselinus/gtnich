'use client'

import { useState, useEffect, useRef } from 'react'
import { CartItem, CheckoutFormInput } from '../types'
import type { StockInfoMap } from '../hooks/usePenjualan'
import { Receipt, type ReceiptData, printReceiptElement } from './Receipt'
import { formatRupiah } from '@/lib/mock-data'
import DapiHead from '@/components/ui/DapiHead'
import { QRCodeSVG } from 'qrcode.react'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  TrendingUp,
  CreditCard,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
  Banknote,
  QrCode,
  AlertCircle,
  RefreshCw,
  ReceiptText,
} from 'lucide-react'

// Lokasi API route
const QRIS_API = '/dashboard/menu/api/payments/qris'

interface CartPOSProps {
  cart: CartItem[]
  stockInfo: StockInfoMap
  onUpdateQty: (menuId: string, delta: number) => void
  onRemove: (menuId: string) => void
  onClear: () => void
  totals: {
    subtotal: number
    totalHPP: number
    profit: number
    margin: number
    totalItems: number
  }
  isSubmitting: boolean
  onCheckout: (form: CheckoutFormInput) => Promise<unknown>
}

type PayMethod = 'tunai' | 'qris'

interface QrState {
  status: 'idle' | 'loading' | 'pending' | 'paid' | 'expired' | 'error'
  orderId?: string
  qrUrl?: string | null
  qrString?: string | null
  expiresAt?: number
  error?: string
}

const INPUT =
  'w-full px-4 py-3 rounded-full bg-[#FFF9EC] text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/60 transition'
const STEP_BTN =
  'rounded-full bg-white hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white'

export default function CartPOS({
  cart,
  stockInfo,
  onUpdateQty,
  onRemove,
  onClear,
  totals,
  isSubmitting,
  onCheckout,
}: CartPOSProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [method, setMethod] = useState<PayMethod>('tunai')
  const [cashInput, setCashInput] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [isPreOrder, setIsPreOrder] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [qr, setQr] = useState<QrState>({ status: 'idle' })
  const [now, setNow] = useState(Date.now())
  const previewReceiptRef = useRef<HTMLDivElement>(null)

  const total = totals.subtotal
  const cashReceived = Number(cashInput) || 0
  const change = cashReceived - total
  const qrisPaid = qr.status === 'paid'
  const canSubmit = method === 'tunai' ? cashReceived >= total && total > 0 : qrisPaid

  const openCheckout = () => {
    setSubmitError(null)
    setCashInput('')
    setCustomerEmail('')
    setCustomerName('')
    setNotes('')
    setIsPreOrder(false)
    setQr({ status: 'idle' })
    setMethod('tunai')
    setShowCheckoutModal(true)
  }

  const createQr = async () => {
    setQr({ status: 'loading' })
    try {
      const res = await fetch(QRIS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Gagal membuat QRIS.')
      setNow(Date.now())
      setQr({
        status: 'pending',
        orderId: d.orderId,
        qrUrl: d.qrUrl,
        qrString: d.qrString ?? null,
        expiresAt: d.expiresAt,
      })
    } catch (e) {
      setQr({ status: 'error', error: (e as Error).message })
    }
  }

  // Auto-generate QR begitu user pilih metode QRIS
  useEffect(() => {
    if (method === 'qris' && qr.status === 'idle' && showCheckoutModal) {
      createQr()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, showCheckoutModal])

  // Cek status QRIS tiap 3 detik + hitung mundur
  useEffect(() => {
    if (!showCheckoutModal || method !== 'qris' || qr.status !== 'pending' || !qr.orderId) return
    let stop = false

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${QRIS_API}/status?order_id=${qr.orderId}`, { cache: 'no-store' })
        const d = await res.json()
        if (stop) return
        if (d.paid) setQr(p => ({ ...p, status: 'paid' }))
        else if (d.expired) setQr(p => ({ ...p, status: 'expired' }))
      } catch {
        /* coba lagi di putaran berikutnya */
      }
    }, 3000)

    const clock = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (qr.expiresAt && t >= qr.expiresAt) {
        setQr(p => (p.status === 'pending' ? { ...p, status: 'expired' } : p))
      }
    }, 1000)

    return () => {
      stop = true
      clearInterval(poll)
      clearInterval(clock)
    }
  }, [showCheckoutModal, method, qr.status, qr.orderId, qr.expiresAt])

  const handleFinishSale = async () => {
    setSubmitError(null)
    try {
      await onCheckout({
        channel: 'Toko Langsung',
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod: method === 'tunai' ? 'Tunai / Cash' : 'QRIS',
        cashReceived: method === 'tunai' ? cashReceived : undefined,
        changeAmount: method === 'tunai' ? change : undefined,
        midtransOrderId: method === 'qris' ? qr.orderId : undefined,
        notes: notes.trim() || undefined,
        isPreOrder,
      })
      setShowCheckoutModal(false)
    } catch (err) {
      setSubmitError((err as Error).message || 'Gagal menyimpan transaksi.')
    }
  }

  const previewData: ReceiptData = {
    createdAt: new Date().toISOString(),
    cashierName: 'Kasir Dapur',
    customerName: customerName.trim() || undefined,
    customerEmail: customerEmail.trim() || undefined,
    items: cart.map(c => ({
      namaMenu: c.namaMenu,
      qty: c.cartQty,
      hargaJual: c.hargaJual,
      subtotal: c.hargaJual * c.cartQty,
    })),
    total,
    paymentMethod: method === 'tunai' ? 'Tunai' : 'QRIS',
    cashReceived: method === 'tunai' && cashReceived > 0 ? cashReceived : null,
    changeAmount: method === 'tunai' && cashReceived >= total ? change : null,
    notes: notes.trim() || null,
    isPreview: true,
  }

  const remainingSec = qr.expiresAt ? Math.max(0, Math.floor((qr.expiresAt - now) / 1000)) : 0
  const mmss = `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(remainingSec % 60).padStart(2, '0')}`

  const renderItemRow = (item: CartItem, size: 'sm' | 'md') => {
    const btn = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
    const ic = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
    const noMoreStock = (stockInfo[item.menuId]?.sisa ?? Infinity) <= 0
    return (
      <div
        key={item.menuId}
        className="anim-cart-row flex items-center justify-between p-3 rounded-[20px] bg-[#FFF9EC] gap-2 transition-all hover:bg-[#FFF4D6]/70 duration-150"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {size === 'md' && (
            <span className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-lg flex-shrink-0 shadow-2xs">
              {item.emoji || '🍽️'}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{item.namaMenu}</p>
            <p className="text-xs font-extrabold text-[#D98B00]">{formatRupiah(item.hargaJual)}</p>
            {noMoreStock && <p className="text-[10px] font-bold text-[#D8431F]">Stok maksimal tercapai</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => onUpdateQty(item.menuId, -1)}
            className={`${btn} ${STEP_BTN} active:scale-90 transition-transform`}
          >
            <Minus className={ic} />
          </button>
          <span className="w-6 text-center font-extrabold text-xs text-slate-900 font-mono transition-all">
            {item.cartQty}
          </span>
          <button
            type="button"
            disabled={noMoreStock}
            onClick={() => onUpdateQty(item.menuId, 1)}
            className={`${btn} ${STEP_BTN} active:scale-90 transition-transform`}
          >
            <Plus className={ic} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.menuId)}
            className={`${btn} rounded-full text-slate-400 hover:text-[#D8431F] hover:bg-[#FDE8E4] flex items-center justify-center cursor-pointer transition-colors active:scale-90`}
          >
            <Trash2 className={ic} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 1. Panel keranjang desktop */}
      <div className="hidden lg:block bg-white rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)] p-5 space-y-4 sticky top-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#FFB800] text-[#2B1D00] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Keranjang Kasir</h3>
              <p className="text-[11px] text-slate-400 font-medium">{totals.totalItems} porsi dipesan</p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#FDE8E4] text-[#D8431F] hover:bg-[#FAD3CB] cursor-pointer transition-colors"
            >
              Kosongkan
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center bg-[#FFF9EC] rounded-[24px] px-4 space-y-1">
            <p className="text-sm font-bold text-slate-500">Keranjang masih kosong</p>
            <p className="text-[11px] text-slate-400">
              Pilih menu dari katalog di sebelah kiri untuk mulai transaksi
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {cart.map(item => renderItemRow(item, 'sm'))}
          </div>
        )}

        <div className="p-4 bg-[#FFF6D6] rounded-[24px] space-y-2 text-xs">
          <div className="flex justify-between text-[#7A5A10]">
            <span>Subtotal omzet</span>
            <span className="font-extrabold text-slate-900">{formatRupiah(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#9A7B3A] text-[11px]">
            <span>Estimasi beban HPP</span>
            <span className="font-semibold">{formatRupiah(totals.totalHPP)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#FFE49A]">
            <span className="font-bold text-[#8A5A00] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Laba
            </span>
            <span className="font-extrabold text-[#8A5A00]">
              {formatRupiah(totals.profit)} ({totals.margin.toFixed(1)}%)
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={cart.length === 0 || isSubmitting}
          onClick={openCheckout}
          className="w-full py-3.5 rounded-full bg-[#D8431F] hover:bg-[#BF3818] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-[0_4px_14px_rgba(216,67,31,0.25)] hover:shadow-[0_6px_20px_rgba(216,67,31,0.35)]"
        >
          <CreditCard className="w-4 h-4" />
          <span>Proses Penjualan ({formatRupiah(totals.subtotal)})</span>
        </button>
      </div>

      {/* 2. Bottom bar mobile */}
      {cart.length > 0 && (
        <>
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
            <div className="max-w-2xl mx-auto pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-md rounded-full p-2.5 pl-3 flex items-center justify-between gap-3 shadow-[0_12px_32px_rgba(140,100,30,0.25)] animate-in slide-in-from-bottom-5 duration-200">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(prev => !prev)}
                  className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-11 h-11 rounded-full bg-[#FFB800] text-[#2B1D00] flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    {totals.totalItems}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <span>Total {totals.totalItems} menu</span>
                      {isDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-base font-extrabold text-slate-900 leading-tight">
                      {formatRupiah(totals.subtotal)}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsDrawerOpen(false)
                    openCheckout()
                  }}
                  className="px-6 py-3 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-sm font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all flex-shrink-0"
                >
                  <span>Bayar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isDrawerOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[#2B1D00]/40 backdrop-blur-sm animate-in fade-in-0 duration-150">
              <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />

              <div className="relative bg-white w-full max-w-xl mx-auto rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4 animate-in slide-in-from-bottom-8 duration-200 sm:mb-6">
                <div className="w-12 h-1.5 bg-[#FFE49A] rounded-full mx-auto" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#FFB800] text-[#2B1D00] flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Rincian Pesanan</h3>
                      <p className="text-[11px] text-slate-400">{totals.totalItems} item dalam keranjang</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClear()
                        setIsDrawerOpen(false)
                      }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#FDE8E4] text-[#D8431F] cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="w-8 h-8 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[45vh] pr-1">
                  {cart.map(item => renderItemRow(item, 'md'))}
                </div>

                <div className="p-4 rounded-[24px] bg-[#FFF6D6] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#7A5A10]">
                    <span>Subtotal</span>
                    <span className="font-extrabold text-slate-900">{formatRupiah(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#9A7B3A] text-[11px]">
                    <span>Estimasi beban HPP</span>
                    <span>{formatRupiah(totals.totalHPP)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-[#FFE49A]">
                    <span className="font-bold text-[#8A5A00] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Estimasi profit
                    </span>
                    <span className="font-extrabold text-[#8A5A00]">
                      {formatRupiah(totals.profit)} ({totals.margin.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false)
                    openCheckout()
                  }}
                  className="w-full py-3.5 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Lanjut Pembayaran ({formatRupiah(totals.subtotal)})</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal checkout: 2 Kolom (Kiri: Pembayaran, Kanan: Struk Live) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D00]/45 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-7 w-full max-w-4xl max-h-[92vh] overflow-y-auto space-y-5 animate-in fade-in-0 zoom-in-95 my-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF6D6] border border-[#FFE49A] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                  <DapiHead size={34} mood="senang" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Konfirmasi Penjualan
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Periksa struk rincian pesanan dan selesaikan transaksi kasir
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="w-9 h-9 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid 2 Kolom: Kiri Pembayaran, Kanan Struk Live */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Kolom Kiri: Formulir Pembayaran */}
              <div className="space-y-4">
                {/* Total Tagihan */}
                <div className="px-5 py-4 rounded-[22px] bg-[#FFB800] text-[#2B1D00] flex items-end justify-between shadow-xs">
                  <div>
                    <span className="text-[11px] font-bold text-[#664600] uppercase tracking-wider block">
                      Total Tagihan
                    </span>
                    <span className="font-extrabold text-2xl leading-none">{formatRupiah(total)}</span>
                  </div>
                  <span className="text-xs font-bold text-[#664600]">{totals.totalItems} Porsi</span>
                </div>

                {/* Metode Pembayaran */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 px-1">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'tunai' as const, label: 'Tunai', icon: Banknote },
                      { key: 'qris' as const, label: 'QRIS', icon: QrCode },
                    ].map(m => {
                      const Icon = m.icon
                      const active = method === m.key
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => {
                            setMethod(m.key)
                            if (m.key === 'tunai') {
                              setQr({ status: 'idle' })
                            }
                          }}
                          className={`py-3.5 rounded-[20px] flex flex-col items-center gap-1 text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                            active
                              ? 'bg-[#FFB800] text-[#2B1D00] ring-2 ring-[#2B1D00]/10 shadow-xs scale-[1.02]'
                              : 'bg-[#FFF9EC] text-slate-600 hover:bg-[#FFF1D0]'
                          }`}
                        >
                          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          {m.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Form Tunai */}
                {method === 'tunai' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 px-1">
                        Uang Diterima (Rp)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cashReceived ? cashReceived.toLocaleString('id-ID') : ''}
                        onChange={e => setCashInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="0"
                        className={`${INPUT} text-sm font-extrabold`}
                      />
                    </div>

                    <div
                      className={`px-4 py-3 rounded-[18px] flex items-center justify-between text-xs font-bold ${
                        cashReceived === 0
                          ? 'bg-[#FFF6D6] text-[#7A5A10]'
                          : change >= 0
                          ? 'bg-[#E8F5E4] text-[#2D7A1F]'
                          : 'bg-[#FDE8E4] text-[#D8431F]'
                      }`}
                    >
                      <span>{cashReceived > 0 && change < 0 ? 'Uang kurang' : 'Kembalian'}</span>
                      <span className="text-sm font-extrabold">
                        {formatRupiah(cashReceived === 0 ? 0 : Math.abs(change))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Form QRIS */}
                {method === 'qris' && (
                  <div className="rounded-[22px] bg-[#FFF9EC] p-4 flex flex-col items-center gap-3 text-center border border-[#FFE49A]/60">
                    {(qr.status === 'idle' || qr.status === 'loading') && (
                      <div className="py-8 flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin text-[#FFB800]" />
                        <p className="text-xs font-semibold">Menyiapkan QR pembayaran...</p>
                      </div>
                    )}

                    {qr.status === 'pending' && (
                      <>
                        <div className="bg-white rounded-[20px] p-3.5 shadow-xs border border-slate-100 flex items-center justify-center">
                          {qr.qrString ? (
                            <QRCodeSVG value={qr.qrString} size={180} level="M" includeMargin={false} />
                          ) : qr.qrUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={qr.qrUrl} alt="QRIS" className="w-44 h-44 object-contain" />
                          ) : (
                            <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                              QR tidak tersedia
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Scan QRIS untuk membayar {formatRupiah(total)}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 mt-0.5">
                            <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                            <span>Menunggu pembayaran &middot; berlaku {mmss}</span>
                          </p>
                        </div>

                        {/* Tombol Simulasi Pembayaran Bersih (Tanpa Emoji) */}
                        <button
                          type="button"
                          onClick={() => setQr(p => ({ ...p, status: 'paid' }))}
                          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-xs"
                        >
                          Simulasi Pembayaran Berhasil
                        </button>
                      </>
                    )}

                    {qr.status === 'paid' && (
                      <div className="py-6 flex flex-col items-center gap-2 text-[#2D7A1F]">
                        <CheckCircle2 className="w-10 h-10" />
                        <p className="text-sm font-extrabold">Pembayaran Diterima</p>
                      </div>
                    )}

                    {qr.status === 'expired' && (
                      <div className="py-3 space-y-2">
                        <p className="text-xs font-bold text-[#D8431F]">QR sudah kedaluwarsa</p>
                        <button
                          type="button"
                          onClick={createQr}
                          className="px-5 py-2 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] text-xs font-bold flex items-center gap-1.5 mx-auto cursor-pointer transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Buat Ulang QR
                        </button>
                      </div>
                    )}

                    {qr.status === 'error' && (
                      <div className="py-3 space-y-2">
                        <p className="text-xs font-bold text-[#D8431F]">{qr.error}</p>
                        <button
                          type="button"
                          onClick={createQr}
                          className="px-5 py-2 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] text-xs font-bold flex items-center gap-1.5 mx-auto cursor-pointer transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Informasi Pelanggan & Kirim Struk Email */}
                <div className="space-y-2.5 p-3.5 rounded-[22px] bg-[#FFFBF0] border border-[#FFE8A3]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Kirim Struk ke Email Pelanggan</span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Opsional
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="Masukkan email penerima struk (misal: pembeli@gmail.com)"
                      className={`${INPUT} bg-white border border-[#F2E3D0]`}
                    />
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Nama pelanggan (opsional, default: Pelanggan Umum)"
                      className={`${INPUT} bg-white border border-[#F2E3D0]`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                    Jika diisi, e-receipt otomatis dikirimkan ke email pelanggan. Salinan transaksi juga otomatis dikirimkan ke email pemilik dapur.
                  </p>
                </div>

                {/* Jenis Pesanan */}
                <div className="flex gap-2">
                  {[
                    { v: false, label: 'Pesanan biasa' },
                    { v: true, label: 'Pre-order' },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setIsPreOrder(opt.v)}
                      className={`flex-1 h-10 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        isPreOrder === opt.v ? 'bg-[#2B221C] text-white' : 'bg-[#FFF9EC] text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Catatan Transaksi */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 px-1">
                    Catatan Transaksi (opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Contoh: Sambal dipisah, bungkus rapi"
                    className={INPUT}
                  />
                </div>

                {submitError && (
                  <div className="px-4 py-3 rounded-[18px] bg-[#FDE8E4] text-[11px] font-semibold text-[#B3361B] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Tombol Aksi */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 py-3 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-xs font-bold text-slate-700 cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-50"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !canSubmit}
                    onClick={handleFinishSale}
                    className="flex-[2] py-3 rounded-full bg-[#D8431F] hover:bg-[#BF3818] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 shadow-[0_4px_14px_rgba(216,67,31,0.25)] hover:shadow-[0_6px_18px_rgba(216,67,31,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Selesaikan Transaksi</span>
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Struk Penjualan Live */}
              <div className="flex flex-col h-full space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ReceiptText className="w-4 h-4 text-[#D98B00]" />
                    Struk Pembayaran
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">Pratinjau Otomatis</span>
                    <button
                      type="button"
                      onClick={() => {
                        printReceiptElement(previewReceiptRef.current, previewData)
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-[10px] font-bold text-[#8A5A00] flex items-center gap-1 transition-colors border border-[#FFE49A]"
                      title="Cetak / Simpan PDF Struk Pratinjau Ini (Persis Tampilan)"
                    >
                      <ReceiptText className="w-3 h-3" />
                      <span>Cetak Struk</span>
                    </button>
                  </div>
                </div>
                <div className="rounded-[24px] bg-[#FFF9EC] p-3.5 border border-[#FFE49A]/50 flex justify-center items-start overflow-y-auto max-h-[580px]">
                  <div ref={previewReceiptRef} className="rounded-[18px] overflow-hidden shadow-xs border border-slate-200/60 bg-white w-full max-w-[320px]">
                    <Receipt data={previewData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

