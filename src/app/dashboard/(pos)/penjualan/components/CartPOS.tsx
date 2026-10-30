'use client'

import { useState } from 'react'
import { CartItem, CheckoutFormInput } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  TrendingUp,
  CreditCard,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import clsx from 'clsx'

interface CartPOSProps {
  cart: CartItem[]
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
  onCheckout: (form: CheckoutFormInput) => Promise<void>
}

export default function CartPOS({
  cart,
  onUpdateQty,
  onRemove,
  onClear,
  totals,
  isSubmitting,
  onCheckout,
}: CartPOSProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [channel, setChannel] = useState('Toko Langsung')
  const [paymentMethod, setPaymentMethod] = useState('Tunai / Cash')
  const [notes, setNotes] = useState('')
  const [discount, setDiscount] = useState<number>(0)

  const handleFinishSale = async () => {
    await onCheckout({
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      channel,
      paymentMethod,
      notes: notes.trim() || undefined,
      discount: discount || 0,
    })
    setShowCheckoutModal(false)
    setCustomerName('')
    setCustomerPhone('')
    setNotes('')
    setDiscount(0)
  }

  const finalPrice = Math.max(0, totals.subtotal - (discount || 0))
  const finalProfit = finalPrice - totals.totalHPP

  return (
    <>
      {/* 1. Panel Keranjang Desktop (Tampil pada layar lg ke atas) */}
      <div className="hidden lg:block clay-card p-5 space-y-4 sticky top-24">
        {/* Header Keranjang */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#FFF6EC] text-[#FF8F2B] flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Keranjang Kasir
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {totals.totalItems} porsi dipesan
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* List Menu di Cart */}
        {cart.length === 0 ? (
          <div className="py-12 text-center clay-inset rounded-2xl px-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400">Keranjang masih kosong</p>
            <p className="text-[10px] text-slate-400">
              Pilih menu dari katalog di sebelah kiri untuk mulai transaksi
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {cart.map(item => (
              <div
                key={item.menuId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.namaMenu}</p>
                  <p className="text-[10px] font-mono text-[#FF8F2B] font-bold">
                    {formatRupiah(item.hargaJual)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.menuId, -1)}
                    className="w-6 h-6 rounded-lg clay-btn flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-800">
                    {item.cartQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.menuId, 1)}
                    className="w-6 h-6 rounded-lg clay-btn flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.menuId)}
                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-500 ml-1 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Calculation Finansial */}
        <div className="p-3.5 clay-inset rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal Omzet:</span>
            <span className="font-mono font-bold text-slate-800">{formatRupiah(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Estimasi Beban HPP:</span>
            <span className="font-mono">{formatRupiah(totals.totalHPP)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="font-bold text-[#FF8F2B] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Margin Laba:
            </span>
            <span className="font-mono font-black text-[#FF8F2B]">
              {formatRupiah(totals.profit)} ({totals.margin.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Tombol Lanjut Bayar */}
        <button
          type="button"
          disabled={cart.length === 0 || isSubmitting}
          onClick={() => setShowCheckoutModal(true)}
          className="w-full py-3 clay-btn-primary text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
        >
          <CreditCard className="w-4 h-4" />
          <span>Proses Penjualan ({formatRupiah(totals.subtotal)})</span>
        </button>
      </div>

      {/* 2. Sticky Floating Bottom Bar Ala Gojek / GrabFood (Hanya tampil di Mobile/Tablet: lg:hidden) */}
      {cart.length > 0 && (
        <>
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
            <div className="max-w-2xl mx-auto pointer-events-auto">
              <div className="clay-card bg-white/95 backdrop-blur-md p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-[0_12px_32px_rgba(160,140,120,0.22)] border border-[#E6DCD0] animate-in slide-in-from-bottom-5 duration-200">
                {/* Info Simpel ala Gojek: Badge Qty + Subtotal + Tombol buka rincian */}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(prev => !prev)}
                  className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2] flex items-center justify-center font-black text-xs font-mono flex-shrink-0 shadow-xs">
                    {totals.totalItems}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                        Total {totals.totalItems} Menu
                      </span>
                      <span className="inline-flex items-center text-[10px] text-[#FF8F2B] font-bold">
                        {isDrawerOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-black font-mono text-slate-800 leading-tight">
                      {formatRupiah(totals.subtotal)}
                    </p>
                  </div>
                </button>

                {/* Tombol Aksi Langsung Proses Bayar */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsDrawerOpen(false)
                    setShowCheckoutModal(true)
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl clay-btn-primary text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all flex-shrink-0"
                >
                  <CreditCard className="w-4 h-4 hidden sm:inline" />
                  <span>Bayar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Drawer / Modal Rincian Pesanan Ala Gojek */}
          {isDrawerOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in-0 duration-150">
              <div
                className="absolute inset-0"
                onClick={() => setIsDrawerOpen(false)}
              />

              <div className="relative bg-white w-full max-w-xl mx-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4 animate-in slide-in-from-bottom-8 duration-200 mb-0 sm:mb-6">
                {/* Drag Handle Bar */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

                {/* Header Drawer */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#FFF6EC] text-[#FF8F2B] flex items-center justify-center font-bold">
                      <ShoppingCart className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">
                        Rincian Pesanan
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {totals.totalItems} item dalam keranjang
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClear()
                        setIsDrawerOpen(false)
                      }}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Daftar Item Rincian */}
                <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[45vh] pr-1">
                  {cart.map(item => (
                    <div
                      key={item.menuId}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">
                          {item.emoji || '🍽️'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.namaMenu}</p>
                          <p className="text-xs font-mono font-extrabold text-[#FF8F2B]">
                            {formatRupiah(item.hargaJual)}
                          </p>
                        </div>
                      </div>

                      {/* Stepper Qty */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.menuId, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs text-slate-800">
                          {item.cartQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.menuId, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(item.menuId)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Ringkasan */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">{formatRupiah(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Estimasi Beban HPP:</span>
                    <span className="font-mono">{formatRupiah(totals.totalHPP)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                    <span className="font-bold text-[#FF8F2B] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Estimasi Profit:
                    </span>
                    <span className="font-mono font-extrabold text-[#FF8F2B]">
                      {formatRupiah(totals.profit)} ({totals.margin.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Tombol Lanjut Bayar */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false)
                    setShowCheckoutModal(true)
                  }}
                  className="w-full py-3 rounded-2xl bg-[#FF8F2B] hover:bg-[#E07A1E] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF8F2B]/30"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Lanjut Pembayaran ({formatRupiah(totals.subtotal)})</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Checkout Kasir */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="clay-card p-6 w-full max-w-md max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF8F2B]" />
                Konfirmasi Penjualan Kasir
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-xl clay-btn text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Nama Pelanggan (Opsional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Contoh: Bu Siti (Catering) / Meja 04"
                  className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Saluran Penjualan
                  </label>
                  <CustomSelect
                    value={channel}
                    onChange={val => setChannel(val)}
                    options={['Toko Langsung', 'WhatsApp', 'Katalog Online']}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Metode Pembayaran
                  </label>
                  <CustomSelect
                    value={paymentMethod}
                    onChange={val => setPaymentMethod(val)}
                    options={['Tunai / Cash', 'QRIS', 'Transfer BCA', 'Transfer Mandiri', 'Kartu Debit']}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Diskon / Potongan Harga (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={e => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 clay-inset text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Catatan Transaksi
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Contoh: Sambal dipisah, bungkus rapi"
                  className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Total Ringkasan Bayar */}
            <div className="p-4 rounded-2xl bg-[#FFF6EC] border border-[#FFE2C2] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-800 font-medium">
                <span>Subtotal ({totals.totalItems} item):</span>
                <span className="font-mono">{formatRupiah(totals.subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Diskon:</span>
                  <span className="font-mono">-{formatRupiah(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-[#FFE2C2]">
                <span className="font-bold text-slate-900 text-sm">Total Bayar:</span>
                <span className="font-black font-mono text-[#FF8F2B] text-lg">
                  {formatRupiah(finalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#C86400] pt-1">
                <span>Estimasi Laba Bersih:</span>
                <span className="font-mono font-bold">{formatRupiah(finalProfit)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              *Setelah disimpan, **stok bahan baku dapur otomatis berkurang** sesuai porsi dan resep, serta dicatat pada log mutasi.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishSale}
                className="flex-1 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Selesaikan Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
