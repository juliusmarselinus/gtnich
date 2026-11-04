'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MenuItem } from '@/app/dashboard/(pos)/menu/types'
import { formatRupiah } from '@/lib/mock-data'
import {
  Plus,
  Minus,
  ChefHat,
  Sparkles,
  Check,
  ShoppingCart,
  X,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Ban,
} from 'lucide-react'
import type { AddResult, StockInfoMap } from '../hooks/usePenjualan'

interface MenuKatalogGridProps {
  menus: MenuItem[]
  cartItemCounts: Record<string, number>
  stockInfo: StockInfoMap
  onAddToCart: (m: MenuItem, qty?: number) => AddResult
  rawMenuCount?: number
  hasActiveFilters?: boolean
  onResetFilters?: () => void
}

const CARD = 'bg-white rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)]'

// Tingkat peringatan stok: makin sedikit sisa porsi, makin merah.
// Urutan harus dari sisa terkecil ke terbesar.
const STOCK_LEVELS = [
  { max: 0, ring: 'ring-2 ring-[#D8431F]', chip: 'bg-[#D8431F] text-white', dot: 'bg-white' },
  { max: 3, ring: 'ring-2 ring-[#F0592B]', chip: 'bg-[#FDE8E4] text-[#D8431F]', dot: 'bg-[#D8431F] animate-pulse' },
  { max: 6, ring: 'ring-2 ring-[#FF9A1F]', chip: 'bg-[#FFE2C2] text-[#B35A00]', dot: 'bg-[#FF9A1F]' },
  { max: 10, ring: 'ring-2 ring-[#FFC933]', chip: 'bg-[#FFF3C4] text-[#8A5A00]', dot: 'bg-[#FFC933]' },
]

const getLevel = (sisa: number) => STOCK_LEVELS.find(l => sisa <= l.max)

export default function MenuKatalogGrid({
  menus,
  cartItemCounts,
  stockInfo,
  onAddToCart,
  rawMenuCount = 0,
  hasActiveFilters = false,
  onResetFilters,
}: MenuKatalogGridProps) {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null)
  const [orderQty, setOrderQty] = useState<number>(1)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<{ id: string; msg: string } | null>(null)

  const flashAdded = (id: string) => {
    setJustAddedId(id)
    setTimeout(() => setJustAddedId(null), 1800)
  }

  const showTooltip = (id: string, msg: string) => {
    setBlocked({ id, msg })
    setTimeout(() => setBlocked(b => (b?.id === id ? null : b)), 3000)
  }

  const handleCardClick = (menu: MenuItem) => {
    const info = stockInfo[menu.id]
    if (info?.isExpired) {
      showTooltip(menu.id, `Bahan ${info.expiredBahanNama || 'resep'} KADALUARSA! Menu tidak bisa diaktifkan.`)
      return
    }
    if (info && info.sisa <= 0) {
      showTooltip(menu.id, `Stok ${info.bahanPembatas ?? 'bahan'} habis`)
      return
    }
    setSelectedMenu(menu)
    setOrderQty(1)
  }

  const handleConfirmAdd = () => {
    if (!selectedMenu) return
    const res = onAddToCart(selectedMenu, orderQty)
    if (res.ok) flashAdded(selectedMenu.id)
    if (res.message) showTooltip(selectedMenu.id, res.message)
    setSelectedMenu(null)
  }

  const handleQuickAdd = (e: React.MouseEvent, menu: MenuItem) => {
    e.stopPropagation()
    const res = onAddToCart(menu, 1)
    if (res.ok) flashAdded(menu.id)
    if (res.message) showTooltip(menu.id, res.message)
  }

  if (menus.length === 0) {
    if (rawMenuCount === 0) {
      return (
        <div className={`${CARD} p-8 sm:p-12 text-center space-y-4`}>
          <div className="w-16 h-16 rounded-full bg-[#FFF6D6] text-[#D98B00] flex items-center justify-center mx-auto">
            <ChefHat className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-lg font-extrabold text-slate-900">Belum Ada Menu di Dapur</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Katalog kasir masih kosong. Buat menu baru beserta resep bahan baku agar siap dijual dan stok otomatis terpotong.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/menu?tambah=1"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu Pertama</span>
            </Link>
            <Link
              href="/dashboard/menu"
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-[#6B4A00] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buka Halaman Menu & Resep</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className={`${CARD} p-8 sm:p-10 text-center space-y-4`}>
        <div className="w-14 h-14 rounded-full bg-[#FFF6D6] text-[#D98B00] flex items-center justify-center mx-auto">
          <ChefHat className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h4 className="text-base font-extrabold text-slate-900">Tidak Ada Menu yang Cocok</h4>
          <p className="text-xs text-slate-500">
            Kata kunci atau kategori yang dipilih tidak menghasilkan menu aktif.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-5 py-2.5 rounded-full bg-[#FDE8E4] hover:bg-[#FAD3CB] text-[#D8431F] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter & Pencarian</span>
            </button>
          )}
          <Link
            href="/dashboard/menu?tambah=1"
            className="px-5 py-2.5 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Menu Baru</span>
          </Link>
        </div>
      </div>
    )
  }

  // Batas porsi untuk modal
  const sisaModal = selectedMenu ? stockInfo[selectedMenu.id]?.sisa ?? Infinity : Infinity
  const maxQty = Number.isFinite(sisaModal) ? sisaModal : 9999

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
        {menus.map(menu => {
          const inCartCount = cartItemCounts[menu.id] || 0
          const isJustAdded = justAddedId === menu.id
          const info = stockInfo[menu.id]
          const isExpired = !!info?.isExpired
          const sisa = info?.sisa ?? Infinity
          const level = getLevel(sisa)
          const habis = sisa <= 0 || isExpired
          const marginPct =
            menu.hargaJual > 0
              ? Math.round(((menu.hargaJual - menu.estimasiHPP) / menu.hargaJual) * 100)
              : 0

          const ringClass = isExpired
            ? 'ring-2 ring-rose-500'
            : isJustAdded
            ? 'ring-2 ring-[#FFB800]'
            : level?.ring ?? ''
          const bgClass = isExpired ? 'bg-rose-50/70' : habis ? 'bg-[#FFF5F3]' : isJustAdded ? 'bg-[#FFFBEF]' : 'bg-white'

          return (
            <div
              key={menu.id}
              onClick={() => handleCardClick(menu)}
              className={`relative rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)] ${bgClass} ${ringClass} p-4 text-left transition-all group flex flex-col justify-between ${
                habis
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(140,100,30,0.12)] active:scale-[0.98]'
              }`}
            >
              {/* Tooltip peringatan */}
              {blocked?.id === menu.id && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-max max-w-[92%] px-3 py-1.5 rounded-full bg-[#D8431F] text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in-95">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-left leading-tight">{blocked.msg}</span>
                </div>
              )}

              {/* Chip status: stok + jumlah di keranjang */}
              {(isExpired || level || inCartCount > 0) && (
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-rose-600 text-white">
                      <Ban className="w-3 h-3" />
                      Bahan Expire
                    </span>
                  ) : level ? (
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full ${level.chip}`}
                    >
                      {habis ? (
                        <Ban className="w-3 h-3" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${level.dot}`} />
                      )}
                      {habis ? 'Stok habis' : `Sisa ${sisa} porsi`}
                    </span>
                  ) : null}
                  {inCartCount > 0 && (
                    <span className="inline-flex items-center gap-1 bg-[#FFF6D6] text-[#8A5A00] text-[11px] font-extrabold px-3 py-1 rounded-full">
                      <ShoppingCart className="w-3 h-3" />
                      {inCartCount} porsi
                    </span>
                  )}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`w-11 h-11 rounded-2xl bg-[#FFF6D6] flex items-center justify-center text-xl flex-shrink-0 transition-colors ${
                      habis ? 'grayscale opacity-60' : 'group-hover:bg-[#FFB800]'
                    }`}
                  >
                    {menu.emoji || '🍽️'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFF6D6] text-[#7A5A10] truncate max-w-[110px]">
                    {menu.kategori}
                  </span>
                </div>

                <h4
                  className={`font-extrabold text-sm leading-snug line-clamp-2 break-words ${
                    habis ? 'text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {menu.nama}
                </h4>

                {menu.resep && menu.resep.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium truncate">
                    <Sparkles className="w-3 h-3 text-[#FFB800] flex-shrink-0" />
                    <span className="truncate">{menu.resep.length} bahan resep</span>
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-end justify-between gap-1.5">
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-base sm:text-lg font-extrabold leading-tight truncate ${
                      habis ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {formatRupiah(menu.hargaJual)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    HPP {formatRupiah(menu.estimasiHPP)} · margin {marginPct}%
                  </p>
                </div>

                <button
                  type="button"
                  disabled={habis}
                  onClick={e => handleQuickAdd(e, menu)}
                  title={isExpired ? `Bahan ${info?.expiredBahanNama || 'resep'} kadaluarsa` : habis ? 'Stok habis' : 'Tambah 1 porsi langsung'}
                  className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                    isExpired
                      ? 'bg-rose-100 text-rose-500 cursor-not-allowed'
                      : habis
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isJustAdded
                      ? 'bg-[#D8431F] text-white cursor-pointer'
                      : 'bg-[#FFB800] text-[#2B1D00] hover:bg-[#D8431F] hover:text-white cursor-pointer'
                  }`}
                >
                  {isExpired || habis ? (
                    <Ban className="w-4 h-4" />
                  ) : isJustAdded ? (
                    <Check className="w-4 h-4 animate-in zoom-in" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal pilih porsi */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1D00]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] shadow-2xl p-6 w-full max-w-sm space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="w-14 h-14 rounded-2xl bg-[#FFF6D6] flex items-center justify-center text-2xl">
                  {selectedMenu.emoji || '🍽️'}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedMenu.nama}</h3>
                  <p className="text-xs font-bold text-[#D98B00]">
                    {formatRupiah(selectedMenu.hargaJual)} / porsi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMenu(null)}
                className="w-9 h-9 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 text-center">
                Jumlah porsi dipesan
              </label>

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setOrderQty(prev => Math.max(1, prev - 1))}
                  className="w-12 h-12 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <input
                  type="number"
                  min="1"
                  max={maxQty}
                  value={orderQty}
                  onChange={e => setOrderQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-24 text-center py-2.5 rounded-full bg-[#FFF9EC] text-2xl font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#FFB800]/60"
                />

                <button
                  type="button"
                  disabled={orderQty >= maxQty}
                  onClick={() => setOrderQty(prev => Math.min(maxQty, prev + 1))}
                  className="w-12 h-12 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] flex items-center justify-center text-[#2B1D00] cursor-pointer transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 5, 10, 20]
                  .filter(val => val <= maxQty)
                  .map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOrderQty(val)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        orderQty === val
                          ? 'bg-[#FFB800] text-[#2B1D00]'
                          : 'bg-[#FFF6D6] text-[#7A5A10] hover:bg-[#FFEBB0]'
                      }`}
                    >
                      {val}x
                    </button>
                  ))}
              </div>

              {Number.isFinite(sisaModal) && (
                <p
                  className={`text-center text-[11px] font-bold ${
                    sisaModal <= 3 ? 'text-[#D8431F]' : 'text-[#B35A00]'
                  }`}
                >
                  Maksimal {sisaModal} porsi lagi (stok {stockInfo[selectedMenu.id]?.bahanPembatas})
                </p>
              )}
            </div>

            <div className="px-5 py-4 rounded-[20px] bg-[#FFF6D6] flex items-center justify-between">
              <span className="text-xs text-[#7A5A10] font-semibold">Total harga</span>
              <span className="text-xl font-extrabold text-slate-900">
                {formatRupiah(selectedMenu.hargaJual * orderQty)}
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMenu(null)}
                className="flex-1 py-3 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-[2] py-3 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan ({orderQty} porsi)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}