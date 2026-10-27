'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { menuList, Penjualan, PenjualanItem } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'

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
      <Topbar title="Input Penjualan (Kasir Dapur)" subtitle="Pilih menu pesanan pembeli, kalkulasi otomatis keuntungan dan pengurangan bahan" />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Menu Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Katalog Menu Tersedia</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {menuList.map(m => (
                <button
                  key={m.id}
                  onClick={() => addToCart(m.id)}
                  className="clay-card p-5 text-left transition-all group"
                >
                  <p className="text-sm font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors">{m.nama}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{m.kategori}</p>
                  <p className="text-base font-black text-emerald-600 mt-3 font-mono">{formatRupiah(m.hargaJual)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Est. HPP: {formatRupiah(m.estimasiHPP)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart / POS Summary */}
          <div className="space-y-4">
            <div className="clay-card p-6 space-y-5 sticky top-24">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center clay-pill">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Keranjang Pesanan</h3>
                <span className="ml-auto text-xs text-white bg-emerald-500 rounded-full w-6 h-6 flex items-center justify-center font-black clay-pill">{cart.length}</span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-10 clay-inset rounded-2xl">
                  <p className="text-slate-400 text-xs font-medium">Belum ada menu yang dipilih</p>
                  <p className="text-slate-300 text-[10px] mt-1">Klik kartu menu di samping</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {cart.map(c => (
                    <div key={c.menuId} className="flex items-center justify-between gap-2 clay-inset p-3 rounded-2xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{c.namaMenu}</p>
                        <p className="text-[11px] text-emerald-600 font-mono font-bold">{formatRupiah(c.hargaJual)} × {c.cartQty}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => updateQty(c.menuId, -1)} className="w-7 h-7 rounded-xl clay-btn flex items-center justify-center text-slate-600"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-6 text-center text-xs font-black text-slate-800">{c.cartQty}</span>
                        <button onClick={() => updateQty(c.menuId, 1)} className="w-7 h-7 rounded-xl clay-btn flex items-center justify-center text-slate-600"><Plus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(c.menuId)} className="w-7 h-7 rounded-xl clay-btn flex items-center justify-center text-rose-500 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Akumulasi HPP</span>
                  <span className="font-mono text-slate-500 font-bold">{formatRupiah(totalHPP)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Estimasi Laba Bersih</span>
                  <span className="font-mono text-emerald-600 font-black">{formatRupiah(totalProfit)}</span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 border-t border-slate-100">
                  <span className="text-slate-800">Total Tagihan</span>
                  <span className="font-mono text-emerald-600 text-lg">{formatRupiah(totalJual)}</span>
                </div>
              </div>

              {success && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl text-xs font-bold text-emerald-700 clay-pill">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" /> Transaksi berhasil disimpan & stok dipotong!
                </div>
              )}

              <button
                onClick={confirmSale}
                disabled={cart.length === 0}
                className="w-full py-3.5 clay-btn-primary text-sm font-bold disabled:opacity-40"
              >
                Simpan & Cetak Pesanan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
