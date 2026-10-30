'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import MenuKatalogGrid from './components/MenuKatalogGrid'
import CartPOS from './components/CartPOS'
import RecentOrdersTable from './components/RecentOrdersTable'
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect'
import { usePenjualan, MenuSortOption } from './hooks/usePenjualan'
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
  ArrowUpDown,
  RotateCcw,
  UtensilsCrossed,
} from 'lucide-react'
import clsx from 'clsx'

export default function PenjualanPage() {
  const {
    menus,
    rawMenuCount,
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
  } = usePenjualan()

  const [activeTab, setActiveTab] = useState<'katalog' | 'riwayat'>('katalog')
  const [successNotif, setSuccessNotif] = useState<string | null>(null)

  // Map kuantitas keranjang per menuId untuk badge di kartu menu
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

  const handleCheckout = async (form: any) => {
    const res = await processCheckout(form)
    setSuccessNotif(`Transaksi ${res.invoiceNumber} berhasil disimpan! Bahan baku telah dipotong dari stok.`)
    setTimeout(() => {
      setSuccessNotif(null)
    }, 4500)
  }

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Input Penjualan (Kasir Dapur)"
        subtitle="Pilih menu pesanan pembeli dari database, hitung keuntungan instan, dan potong stok bahan baku secara otomatis"
      />

      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum masuk ke Supabase Auth. Silakan login terlebih dahulu untuk mencatat penjualan.
              </span>
            </div>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1.5 hover:bg-amber-700 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Akun
            </Link>
          </div>
        )}

        {/* Notifikasi Sukses */}
        {successNotif && (
          <div className="p-4 rounded-2xl bg-[#FFF6EC] border border-[#FFE2C2] flex items-center gap-3 text-[#C86400] text-xs shadow-sm animate-in fade-in-0 slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-[#FF8F2B] flex-shrink-0" />`r`n            <span className="font-semibold">{successNotif}</span>
          </div>
        )}

        {/* Notifikasi Error */}
        {error && userEmail && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => refresh()}
              className="font-bold underline flex items-center gap-1 hover:text-rose-900 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Muat ulang
            </button>
          </div>
        )}

        {/* Tab Switcher: Kasir Penjualan vs Transaksi Terkini */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('katalog')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'katalog'
                  ? 'clay-btn-primary text-white shadow-sm'
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Kasir & Katalog Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'riwayat'
                  ? 'clay-btn-primary text-white shadow-sm'
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Transaksi Terkini ({recentOrders.length})</span>
            </button>
          </div>

          {/* Quick Lead Button ke Manajemen Menu */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/menu"
              className="clay-btn px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-all"
              title="Buka daftar katalog menu lengkap dan resep"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Kelola Menu ({rawMenuCount})</span>
            </Link>
            <Link
              href="/dashboard/menu?tambah=1"
              className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Buka formulir tambah menu baru"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu</span>
            </Link>
          </div>
        </div>

        {/* Tab 1: Kasir POS */}
        {activeTab === 'katalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Bagian Kiri: Pencarian, Kategori, & Grid Menu Database */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4 min-w-0">
              {/* Filter Bar & Sorting */}
              <div className="clay-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchMenu}
                      onChange={e => setSearchMenu(e.target.value)}
                      placeholder="Cari menu masakan, kue, minuman, SKU..."
                      className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Custom Dropdown Sorting */}
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

                    {(searchMenu || selectedKategori !== 'Semua' || sortBy !== 'default') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMenu('')
                          setSelectedKategori('Semua')
                          setSortBy('default')
                        }}
                        title="Reset semua filter dan sortir"
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Kategori Pills & Total Counter */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1 min-w-0">
                    {kategoriList.map(kat => (
                      <button
                        key={kat}
                        type="button"
                        onClick={() => setSelectedKategori(kat)}
                        className={clsx(
                          'px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0',
                          selectedKategori === kat
                            ? 'clay-btn-primary text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

              {/* Grid Menu Terkini */}
              {loading ? (
                <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF8F2B]" />
                  <p className="text-xs font-semibold">Memuat katalog menu dari database Supabase...</p>
                </div>
              ) : (
                <MenuKatalogGrid
                  menus={menus}
                  cartItemCounts={cartItemCounts}
                  onAddToCart={addToCart}
                  rawMenuCount={rawMenuCount}
                  hasActiveFilters={Boolean(searchMenu || selectedKategori !== 'Semua' || sortBy !== 'default')}
                  onResetFilters={() => {
                    setSearchMenu('')
                    setSelectedKategori('Semua')
                    setSortBy('default')
                  }}
                />
              )}
            </div>

            {/* Bagian Kanan: Keranjang Kasir & POS Summary */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4 min-w-0">
              <CartPOS
                cart={cart}
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

        {/* Tab 2: Riwayat Penjualan Terkini */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Daftar Transaksi Kasir yang Tersimpan di Database
            </h3>
            <RecentOrdersTable orders={recentOrders} />
          </div>
        )}
      </main>
    </div>
  )
}
