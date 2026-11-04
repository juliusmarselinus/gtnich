'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot' // sesuaikan path
import MenuKatalogGrid from './components/MenuKatalogGrid'
import CartPOS from './components/CartPOS'
import RecentOrdersTable from './components/RecentOrdersTable'
import { ReceiptModal, orderToReceipt } from './components/Receipt'
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect'
import { usePenjualan, MenuSortOption } from './hooks/usePenjualan'
import type { CheckoutFormInput, OrderRecord } from './types'
import { formatRupiah } from '@/lib/mock-data'
import {
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
  ShoppingBag,
  History,
  CheckCircle,
  Plus,
  RotateCcw,
  UtensilsCrossed,
} from 'lucide-react'
import clsx from 'clsx'
import { useToast } from '@/context/ToastContext'
import { PenjualanKatalogSkeleton } from '@/components/ui/Skeleton'

export default function PenjualanPage() {
  const {
    menus,
    rawMenuCount,
    stockInfo,
    expiredBahanCount,
    kategoriList,
    selectedKategori,
    setSelectedKategori,
    searchMenu,
    setSearchMenu,
    sortBy,
    setSortBy,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    totals,
    recentOrders,
    loading,
    isSubmitting,
    error,
    userEmail,
    refresh,
    processCheckout,
    updateOrderStatus,
  } = usePenjualan()

  const [activeTab, setActiveTab] = useState<'katalog' | 'riwayat'>('katalog')
  const [successNotif, setSuccessNotif] = useState<string | null>(null)
  const [receiptOrder, setReceiptOrder] = useState<OrderRecord | null>(null)
  const toast = useToast()

  const cartItemCounts = cart.reduce((acc, item) => {
    acc[item.menuId] = item.cartQty
    return acc
  }, {} as Record<string, number>)

  const sortOptions: SelectOption[] = [
    { value: 'default', label: 'Standar' },
    { value: 'nama-asc', label: 'Nama: A - Z' },
    { value: 'nama-desc', label: 'Nama: Z - A' },
    { value: 'harga-asc', label: 'Harga: Termurah' },
    { value: 'harga-desc', label: 'Harga: Tertinggi' },
    { value: 'margin-desc', label: 'Margin: Tertinggi' },
    { value: 'margin-asc', label: 'Margin: Terendah' },
  ]

  const hasActiveFilters = Boolean(searchMenu || selectedKategori !== 'Semua' || sortBy !== 'default')
  const resetFilters = () => {
    setSearchMenu('')
    setSelectedKategori('Semua')
    setSortBy('default')
  }

  const handleCheckout = async (form: CheckoutFormInput) => {
    try {
      const res = await processCheckout(form)
      setReceiptOrder(res)
      setSuccessNotif(`Transaksi ${res.invoiceNumber} berhasil disimpan!`)
      toast.success(
        'Transaksi Berhasil Disimpan',
        `No. Struk ${res.invoiceNumber} senilai ${formatRupiah(res.totalPrice)} dicatat. Stok dapur otomatis terpotong.`
      )
      setTimeout(() => setSuccessNotif(null), 4500)
      return res
    } catch (err: any) {
      toast.error('Gagal Proses Transaksi', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Input Penjualan (Kasir Dapur)"
        subtitle="Pilih menu pesanan pembeli, hitung keuntungan instan, dan potong stok bahan baku otomatis"
      />

      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[180px]">
          <div className="absolute right-44 top-5 w-14 h-14 rounded-full bg-[#FF7A59] hidden md:block" />
          <div className="absolute right-36 top-16 w-24 h-7 rounded-full bg-white/90 hidden md:block" />

          <div className="absolute right-4 sm:right-8 bottom-0 pointer-events-none">
            <DapiMascot
              width={150}
              mood={totals.totalItems > 0 ? 'senang' : 'khawatir'}
              className="translate-y-6"
            />
          </div>

          <div className="relative space-y-3 pr-28 sm:pr-48">
            <p className="text-sm font-medium text-[#5C3D00]">Dari Kasir</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D00] tracking-tight">
              {totals.totalItems > 0
                ? `${totals.totalItems} porsi siap diproses`
                : 'Siap catat penjualan hari ini'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#2B1D00]">
                <span className="w-2 h-2 rounded-full bg-[#D8431F]" />
                {rawMenuCount} menu aktif
              </span>
              <span className="inline-flex items-center rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold text-[#2B1D00]">
                Keranjang {formatRupiah(totals.subtotal)}
              </span>
            </div>
          </div>
        </section>

        {!userEmail && !loading && (
          <div className="p-4 rounded-[24px] bg-[#FFF6D6] flex flex-wrap items-center justify-between gap-3 text-[#6B4A00] text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D98B00]" />
              <span>Anda belum masuk ke Supabase Auth. Silakan login dulu untuk mencatat penjualan.</span>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-[#D8431F] text-white font-bold flex items-center gap-1.5 hover:bg-[#BF3818] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Akun
            </Link>
          </div>
        )}

        {/* Peringatan Bahan Kadaluarsa Aktif di Dapur */}
        {expiredBahanCount > 0 && !loading && (
          <div className="p-4 rounded-[24px] bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-rose-800 text-xs animate-in fade-in-0">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-extrabold text-rose-900 leading-tight">
                  Operasional Kasir Dicegat: Ada {expiredBahanCount} Bahan Baku Kadaluarsa!
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5 font-medium leading-normal">
                  Menu yang menggunakan bahan kadaluarsa otomatis dinonaktifkan dari kasir dan tidak bisa diproses demi keamanan mutu pangan.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/kondisi-bahan"
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              Musnahkan Bahan Kadaluarsa →
            </Link>
          </div>
        )}

        {successNotif && (
          <div className="p-4 rounded-[24px] bg-[#FFF6D6] flex items-center gap-3 text-[#6B4A00] text-xs animate-in fade-in-0 slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-[#D98B00] flex-shrink-0" />
            <span className="font-semibold">{successNotif}</span>
          </div>
        )}

        {error && userEmail && (
          <div className="p-4 rounded-[24px] bg-[#FDE8E4] flex items-center justify-between gap-3 text-[#B3361B] text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => refresh()}
              className="font-bold underline flex items-center gap-1 hover:text-[#8A2812] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Muat ulang
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'katalog', label: 'Kasir & Katalog Menu', icon: ShoppingBag },
              { key: 'riwayat', label: `Riwayat Transaksi (${recentOrders.length})`, icon: History },
            ].map(t => {
              const Icon = t.icon
              const active = activeTab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key as 'katalog' | 'riwayat')}
                  className={clsx(
                    'px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95',
                    active
                      ? 'bg-[#FFB800] text-[#2B1D00] shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-[#FFF6D6] hover:text-slate-900'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/menu"
              className="px-4 py-2.5 rounded-full bg-white text-xs font-semibold text-slate-700 hover:bg-[#FFF6D6] flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-2xs"
              title="Buka daftar katalog menu lengkap dan resep"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Kelola Menu ({rawMenuCount})</span>
            </Link>
            <Link
              href="/dashboard/menu?tambah=1"
              className="px-5 py-2.5 rounded-full bg-[#D8431F] hover:bg-[#BF3818] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all duration-150 shadow-sm hover:shadow-md"
              title="Buka formulir tambah menu baru"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu</span>
            </Link>
          </div>
        </div>

        {/* Tab 1: Kasir */}
        {activeTab === 'katalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-4 min-w-0">
              <div className="bg-white rounded-[28px] p-4 sm:p-5 space-y-3 shadow-[0_2px_16px_rgba(140,100,30,0.06)]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchMenu}
                      onChange={e => setSearchMenu(e.target.value)}
                      placeholder="Cari menu masakan, kue, minuman, SKU..."
                      className="w-full pl-11 pr-4 py-3 rounded-full bg-[#FFF9EC] text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/60 transition"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-44 sm:w-48 flex-shrink-0">
                      <CustomSelect
                        value={sortBy}
                        onChange={val => setSortBy(val as MenuSortOption)}
                        options={sortOptions}
                        placeholder="Urutkan..."
                        size="md"
                        variant="inset"
                      />
                    </div>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        title="Reset semua filter dan sortir"
                        className="w-10 h-10 rounded-full bg-[#FDE8E4] hover:bg-[#FAD3CB] text-[#D8431F] transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1 min-w-0">
                    {kategoriList.map(kat => (
                      <button
                        key={kat}
                        type="button"
                        onClick={() => setSelectedKategori(kat)}
                        className={clsx(
                          'px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex-shrink-0 active:scale-95',
                          selectedKategori === kat
                            ? 'bg-[#FFB800] text-[#2B1D00] shadow-xs scale-105'
                            : 'bg-[#FFF6D6] text-[#7A5A10] hover:bg-[#FFEBB0]'
                        )}
                      >
                        {kat}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-2 flex-shrink-0">
                    {menus.length} dari {rawMenuCount} menu
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-[28px] p-5 border border-[#EBE6DC] shadow-xs">
                  <PenjualanKatalogSkeleton count={8} />
                </div>
              ) : (
                <MenuKatalogGrid
                  menus={menus}
                  cartItemCounts={cartItemCounts}
                  stockInfo={stockInfo}
                  onAddToCart={addToCart}
                  rawMenuCount={rawMenuCount}
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={resetFilters}
                />
              )}
            </div>

            <div className="lg:col-span-5 xl:col-span-4 space-y-4 min-w-0">
              <CartPOS
                cart={cart}
                stockInfo={stockInfo}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
                onClear={clearCart}
                totals={totals}
                isSubmitting={isSubmitting}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Riwayat */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Daftar Transaksi Kasir yang Tersimpan
            </h3>
            <RecentOrdersTable orders={recentOrders} onUpdateStatus={updateOrderStatus} />
          </div>
        )}
      </main>

      {receiptOrder && (
        <ReceiptModal data={orderToReceipt(receiptOrder)} onClose={() => setReceiptOrder(null)} />
      )}
    </div>
  )
}