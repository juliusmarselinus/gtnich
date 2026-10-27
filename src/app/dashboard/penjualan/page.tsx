'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { menuList, Penjualan, PenjualanItem } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

interface CartItem extends PenjualanItem { cartQty: number }

export default function PenjualanPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [saved, setSaved] = useState<Penjualan[]>([])
  const [success, setSuccess] = useState(false)

  function addToCart(menuId: string) {
    const menu = menuList.find(m => m.id === menuId)
    if (!menu) return
    setCart(prev => {
      const existing = prev.find(c => c.menuId === menuId)
      if (existing) return prev.map(c => c.menuId === menuId ? { ...c, cartQty: c.cartQty + 1 } : c)
      return [...prev, { menuId: menu.id, namaMenu: menu.nama, qty: 1, hargaJual: menu.hargaJual, hpp: menu.estimasiHPP, cartQty: 1 }]
    })
  }

  function updateQty(menuId: string, delta: number) {
    setCart(prev => {
      const updated = prev.map(c => c.menuId === menuId ? { ...c, cartQty: Math.max(0, c.cartQty + delta) } : c)
      return updated.filter(c => c.cartQty > 0)
    })
  }

  function remove(menuId: string) { setCart(prev => prev.filter(c => c.menuId !== menuId)) }

  const totalJual = cart.reduce((s, c) => s + c.hargaJual * c.cartQty, 0)
  const totalHPP = cart.reduce((s, c) => s + c.hpp * c.cartQty, 0)
  const totalProfit = totalJual - totalHPP

  function confirmSale() {
    if (cart.length === 0) return
    const items = cart.map(c => ({ menuId: c.menuId, namaMenu: c.namaMenu, qty: c.cartQty, hargaJual: c.hargaJual, hpp: c.hpp }))
    const newTrx: Penjualan = {
      id: `TRX-NEW-${Date.now()}`,
      noTransaksi: `TRX/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${String(saved.length + 1).padStart(3, '0')}`,
      items,
      totalHPP,
      totalJual,
      profit: totalProfit,
      tanggal: new Date().toLocaleString('id-ID'),
    }
    setSaved(prev => [newTrx, ...prev])
    setCart([])
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Input Penjualan" subtitle="Catat transaksi penjualan menu secara langsung" />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-[#9C9589] uppercase tracking-wider">Pilih Menu</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {menuList.map(m => (
                <button
                  key={m.id}
                  onClick={() => addToCart(m.id)}
                  className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-4 text-left hover:border-[#3E6B48] hover:shadow-md transition-all group"
                >
                  <p className="text-xs font-bold text-[#1F1D1A] group-hover:text-[#3E6B48] transition-colors">{m.nama}</p>
                  <p className="text-[10px] text-[#9C9589] mt-0.5">{m.kategori}</p>
                  <p className="text-sm font-bold text-[#3E6B48] mt-2 font-mono">{formatRupiah(m.hargaJual)}</p>
                  <p className="text-[10px] text-[#9C9589] mt-0.5">HPP: {formatRupiah(m.estimasiHPP)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart / Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-4 sticky top-24">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#3E6B48]" />
                <h3 className="text-xs font-bold text-[#1F1D1A] uppercase tracking-wider">Keranjang</h3>
                <span className="ml-auto text-[11px] text-white bg-[#3E6B48] rounded-full w-5 h-5 flex items-center justify-center font-bold">{cart.length}</span>
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-[#9C9589] text-xs py-8">Belum ada item dipilih</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map(c => (
                    <div key={c.menuId} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1F1D1A] truncate">{c.namaMenu}</p>
                        <p className="text-[10px] text-[#9C9589] font-mono">{formatRupiah(c.hargaJual)} × {c.cartQty}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => updateQty(c.menuId, -1)} className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-center hover:bg-[#EAE5DF] transition-colors"><Minus className="w-3 h-3 text-[#9C9589]" /></button>
                        <span className="w-6 text-center text-xs font-bold text-[#1F1D1A]">{c.cartQty}</span>
                        <button onClick={() => updateQty(c.menuId, 1)} className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-center hover:bg-[#EAE5DF] transition-colors"><Plus className="w-3 h-3 text-[#9C9589]" /></button>
                        <button onClick={() => remove(c.menuId)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-[#EAE5DF] pt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9C9589]">Total HPP</span>
                  <span className="font-mono text-[#9C9589]">{formatRupiah(totalHPP)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9C9589]">Profit</span>
                  <span className="font-mono text-[#3E6B48] font-semibold">{formatRupiah(totalProfit)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-2">
                  <span className="text-[#1F1D1A]">Total</span>
                  <span className="font-mono text-[#1F1D1A]">{formatRupiah(totalJual)}</span>
                </div>
              </div>

              {success && (
                <div className="flex items-center gap-2 p-3 bg-[#EAF0EC] rounded-xl text-xs font-semibold text-[#3E6B48]">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> Transaksi berhasil disimpan!
                </div>
              )}

              <button
                onClick={confirmSale}
                disabled={cart.length === 0}
                className="w-full py-3 bg-[#3E6B48] text-white rounded-xl text-sm font-bold hover:bg-[#345a3d] transition-colors disabled:opacity-40"
              >
                Konfirmasi Penjualan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
