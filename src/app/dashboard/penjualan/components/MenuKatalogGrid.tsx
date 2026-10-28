'use client'

import { useState } from 'react'
import { MenuItem } from '../../menu/types'
import { formatRupiah } from '@/lib/mock-data'
import { Plus, Minus, ChefHat, Sparkles, Check, ShoppingCart, X } from 'lucide-react'

interface MenuKatalogGridProps {
  menus: MenuItem[]
  cartItemCounts: Record<string, number>
  onAddToCart: (m: MenuItem, qty?: number) => void
}

export default function MenuKatalogGrid({
  menus,
  cartItemCounts,
  onAddToCart,
}: MenuKatalogGridProps) {
  // Modal State untuk memilih porsi / kuantitas sebelum add
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null)
  const [orderQty, setOrderQty] = useState<number>(1)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)

  const handleOpenModal = (menu: MenuItem) => {
    setSelectedMenu(menu)
    setOrderQty(1)
  }

  const handleConfirmAdd = () => {
    if (!selectedMenu) return
    onAddToCart(selectedMenu, orderQty)

    // Trigger visual feedback
    setJustAddedId(selectedMenu.id)
    setTimeout(() => setJustAddedId(null), 1800)

    setSelectedMenu(null)
  }

  // Quick 1-click add
  const handleQuickAdd = (e: React.MouseEvent, menu: MenuItem) => {
    e.stopPropagation()
    onAddToCart(menu, 1)

    setJustAddedId(menu.id)
    setTimeout(() => setJustAddedId(null), 1800)
  }

  if (menus.length === 0) {
    return (
      <div className="clay-card py-16 text-center text-slate-400 space-y-2">
        <ChefHat className="w-8 h-8 mx-auto text-slate-300" />
        <p className="text-xs font-semibold">Tidak ada menu yang sesuai dengan filter.</p>
        <p className="text-[10px] text-slate-400">
          Pastikan menu sudah dibuat dan aktif di tab "Menu & Resep".
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        {menus.map(menu => {
          const inCartCount = cartItemCounts[menu.id] || 0
          const isJustAdded = justAddedId === menu.id
          const marginPct =
            menu.hargaJual > 0
              ? Math.round(((menu.hargaJual - menu.estimasiHPP) / menu.hargaJual) * 100)
              : 0

          return (
            <div
              key={menu.id}
              onClick={() => handleOpenModal(menu)}
              className={`clay-card p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer flex flex-col justify-between relative ${
                isJustAdded
                  ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20 bg-emerald-50/30'
                  : ''
              }`}
            >
              {/* Badge Jumlah di Keranjang - Berada rapi di dalam kartu, tidak keluar box */}
              {inCartCount > 0 && (
                <div className="mb-2 inline-flex items-center gap-1.5 self-start bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-xs animate-in zoom-in-75">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{inCartCount} Porsi Terpilih</span>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl clay-pill flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    {menu.emoji || '🍽️'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    {menu.kategori}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {menu.nama}
                </h4>

                {menu.resep && menu.resep.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{menu.resep.length} bahan resep</span>
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-black font-mono text-emerald-700 leading-tight">
                    {formatRupiah(menu.hargaJual)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    HPP: {formatRupiah(menu.estimasiHPP)} ({marginPct}%)
                  </p>
                </div>

                {/* Tombol Tambah Cepat / Porsi */}
                <button
                  type="button"
                  onClick={e => handleQuickAdd(e, menu)}
                  title="Tambah 1 porsi langsung"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white clay-pill'
                  }`}
                >
                  {isJustAdded ? <Check className="w-4 h-4 animate-in zoom-in" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Dialog: Pilih Jumlah Porsi Menu */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="clay-card p-6 w-full max-w-sm space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl clay-pill">
                  {selectedMenu.emoji || '🍽️'}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">{selectedMenu.nama}</h3>
                  <p className="text-xs font-mono font-bold text-emerald-700">
                    {formatRupiah(selectedMenu.hargaJual)} / porsi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMenu(null)}
                className="p-1.5 rounded-xl clay-btn text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Jumlah Porsi */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 text-center uppercase tracking-wider">
                Tentukan Jumlah Porsi Dipesan
              </label>

              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setOrderQty(prev => Math.max(1, prev - 1))}
                  className="w-11 h-11 rounded-2xl clay-btn flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={e => setOrderQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 text-center py-2.5 clay-inset text-2xl font-black font-mono text-slate-800"
                />

                <button
                  type="button"
                  onClick={() => setOrderQty(prev => prev + 1)}
                  className="w-11 h-11 rounded-2xl clay-btn-primary flex items-center justify-center text-white font-bold cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Pick Pills */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {[1, 2, 5, 10, 20].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setOrderQty(val)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                      orderQty === val
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </div>

            {/* Rincian Finansial Modal */}
            <div className="p-3.5 rounded-2xl clay-inset flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total Harga:</span>
              <span className="text-base font-black font-mono text-emerald-700">
                {formatRupiah(selectedMenu.hargaJual * orderQty)}
              </span>
            </div>

            {/* Tombol Konfirmasi */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedMenu(null)}
                className="flex-1 py-2.5 rounded-xl clay-btn text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-2 py-2.5 rounded-xl clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan ke Keranjang ({orderQty} porsi)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
