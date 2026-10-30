'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { penjualanService } from '../services/penjualanService'
import { MenuItem } from '@/app/dashboard/(pos)/menu/types'
import { CartItem, CheckoutFormInput, OrderRecord } from '../types'

export type MenuSortOption =
  | 'default'
  | 'nama-asc'
  | 'nama-desc'
  | 'harga-asc'
  | 'harga-desc'
  | 'margin-desc'
  | 'margin-asc'

export function usePenjualan() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Filter & Sorting katalog
  const [selectedKategori, setSelectedKategori] = useState('Semua')
  const [searchMenu, setSearchMenu] = useState('')
  const [sortBy, setSortBy] = useState<MenuSortOption>('default')

  // Ambil data menu dan transaksi awal
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi login belum aktif. Silakan masuk akun terlebih dahulu.')
        setUserEmail(null)
        setMenus([])
        setRecentOrders([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      const [menuData, ordersData] = await Promise.all([
        penjualanService.getKatalogMenu(),
        penjualanService.getRecentOrders(8),
      ])

      setMenus(menuData || [])
      setRecentOrders(ordersData || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch penjualan data error:', e)
      setError(e.message || 'Gagal memuat katalog menu dari database.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter daftar menu
  const kategoriList = useMemo(() => {
    const setKat = new Set<string>()
    menus.forEach(m => {
      if (m.kategori) setKat.add(m.kategori)
    })
    return ['Semua', ...Array.from(setKat)]
  }, [menus])

  const filteredMenus = useMemo(() => {
    const list = menus.filter(m => {
      const matchKategori = selectedKategori === 'Semua' || m.kategori === selectedKategori
      const matchSearch =
        m.nama.toLowerCase().includes(searchMenu.toLowerCase()) ||
        (m.sku && m.sku.toLowerCase().includes(searchMenu.toLowerCase()))
      return matchKategori && matchSearch
    })

    const calculateMargin = (m: MenuItem) => {
      if (!m.hargaJual || m.hargaJual <= 0) return 0
      return ((m.hargaJual - (m.estimasiHPP || 0)) / m.hargaJual) * 100
    }

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'nama-asc':
          return a.nama.localeCompare(b.nama, 'id')
        case 'nama-desc':
          return b.nama.localeCompare(a.nama, 'id')
        case 'harga-asc':
          return a.hargaJual - b.hargaJual
        case 'harga-desc':
          return b.hargaJual - a.hargaJual
        case 'margin-desc':
          return calculateMargin(b) - calculateMargin(a)
        case 'margin-asc':
          return calculateMargin(a) - calculateMargin(b)
        default:
          return 0
      }
    })
  }, [menus, selectedKategori, searchMenu, sortBy])

  // Operasi Keranjang (Cart) dengan penyesuaian quantity awal
  const addToCart = (menu: MenuItem, qty: number = 1) => {
    const addQuantity = Math.max(1, qty)
    setCart(prev => {
      const existing = prev.find(c => c.menuId === menu.id)
      if (existing) {
        return prev.map(c =>
          c.menuId === menu.id ? { ...c, cartQty: c.cartQty + addQuantity } : c
        )
      }

      // Format komposisi resep menu agar siap dipotong stoknya
      const resepList = (menu.resep || []).map(r => ({
        bahanId: r.bahanId,
        namaBahan: r.namaBahan,
        qty: r.qty,
        satuan: r.satuanBase || r.satuan,
      }))

      return [
        ...prev,
        {
          menuId: menu.id,
          namaMenu: menu.nama,
          kategori: menu.kategori,
          emoji: menu.emoji || '🍽️',
          hargaJual: menu.hargaJual,
          hpp: menu.estimasiHPP,
          cartQty: addQuantity,
          resep: resepList,
        },
      ]
    })
  }

  const updateCartQty = (menuId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c =>
        c.menuId === menuId ? { ...c, cartQty: Math.max(0, c.cartQty + delta) } : c
      )
      return updated.filter(c => c.cartQty > 0)
    })
  }

  const removeFromCart = (menuId: string) => {
    setCart(prev => prev.filter(c => c.menuId !== menuId))
  }

  const clearCart = () => setCart([])

  // Kalkulasi Total Finansial Live
  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, c) => s + c.hargaJual * c.cartQty, 0)
    const totalHPP = cart.reduce((s, c) => s + c.hpp * c.cartQty, 0)
    const profit = subtotal - totalHPP
    const margin = subtotal > 0 ? (profit / subtotal) * 100 : 0
    const totalItems = cart.reduce((s, c) => s + c.cartQty, 0)

    return {
      subtotal,
      totalHPP,
      profit,
      margin,
      totalItems,
    }
  }, [cart])

  // Proses Checkout & Simpan Transaksi
  const processCheckout = async (form: CheckoutFormInput): Promise<OrderRecord> => {
    setIsSubmitting(true)
    setError(null)
    try {
      const createdOrder = await penjualanService.createPenjualan(cart, form)
      setRecentOrders(prev => [createdOrder, ...prev])
      clearCart()
      return createdOrder
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Gagal menyimpan transaksi.')
      throw e
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    menus: filteredMenus,
    rawMenuCount: menus.length,
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
    refresh: fetchData,
    processCheckout,
  }
}
