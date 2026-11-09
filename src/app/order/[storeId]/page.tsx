'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { formatRupiah } from '@/lib/mock-data'
import Pagination from '@/components/ui/Pagination'
import DapiMascot from '@/components/ui/DapiMascot'
import { useToast } from '@/context/ToastContext'
import {
  Store,
  QrCode,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  MessageSquare,
  Search,
  RotateCcw,
  ChefHat,
  Check,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Ban,
} from 'lucide-react'
import clsx from 'clsx'

interface MenuItem {
  id: string
  nama: string
  kategori: string
  emoji: string
  hargaJual: number
  estimasiHpp: number
  sisaPorsi?: number
  isHabis?: boolean
  resep?: Array<{
    bahanId: string
    namaBahan: string
    qty: number
    stok: number
  }>
}

interface StoreInfo {
  id: string
  name: string
  address: string
  businessType: string
}

interface CartItem {
  menu: MenuItem
  qty: number
}

export default function PublicOrderPage({
  params,
}: {
  params: Promise<{ storeId: string }>
}) {
  const resolvedParams = use(params)
  const storeId = resolvedParams.storeId
  const searchParams = useSearchParams()
  const tableParam = searchParams.get('meja') || 'Meja 1'

  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [store, setStore] = useState<StoreInfo | null>(null)
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('Semua')
  const [searchMenu, setSearchMenu] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const pageSize = 9

  // Alur Halaman (Step View): 'catalog' (katalog menu) -> 'payment' (langkah checkout pembayaran)
  const [currentStep, setCurrentStep] = useState<'catalog' | 'payment'>('catalog')

  // Keranjang Belanja & Drawer Mobile
  const [cart, setCart] = useState<CartItem[]>([])
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Form Pemesan (Nama, Email Opsional, Catatan)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [paymentChoice, setPaymentChoice] = useState<'qris' | 'kasir'>('kasir')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // QRIS Payment Flow
  const [qrisData, setQrisData] = useState<{
    orderId: string
    qrString: string | null
    qrUrl: string | null
    expiresAt: number
  } | null>(null)
  const [isQrisLoading, setIsQrisLoading] = useState(false)
  const [qrisError, setQrisError] = useState<string | null>(null)
  const [paymentDone, setPaymentDone] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{
    invoiceNumber: string
    totalPrice: number
    paymentStatus: string
    paymentMethod: string
  } | null>(null)

  useEffect(() => {
    async function loadStoreAndMenus() {
      try {
        setLoading(true)
        const res = await fetch(`/order/${storeId}/api`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Gagal memuat profil toko')
        }
        setStore(data.store)
        setMenus(data.menus || [])
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data menu')
      } finally {
        setLoading(false)
      }
    }
    loadStoreAndMenus()
  }, [storeId])

  // Polling QRIS Payment Status jika QRIS aktif dan belum selesai
  useEffect(() => {
    if (!qrisData || paymentDone) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payments/qris/status?order_id=${encodeURIComponent(
            qrisData.orderId
          )}`
        )
        const statusData = await res.json()
        if (statusData.paid) {
          clearInterval(interval)
          await finalizeOrder('QRIS Dinamis', 'Lunas', qrisData.orderId)
        }
      } catch (e) {
        console.error('Polling status QRIS error:', e)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [qrisData, paymentDone])

  const categories = ['Semua', ...Array.from(new Set(menus.map(m => m.kategori)))]

  const filteredMenus = menus.filter(menu => {
    const matchesCategory = activeCategory === 'Semua' || menu.kategori === activeCategory
    const matchesSearch =
      !searchMenu.trim() ||
      menu.nama.toLowerCase().includes(searchMenu.toLowerCase()) ||
      menu.kategori.toLowerCase().includes(searchMenu.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const paginatedMenus = filteredMenus.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const cartTotalQty = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.menu.hargaJual * item.qty,
    0
  )

  // Tambah item ke keranjang dengan pencegahan double click & validasi batas stok porsi
  const addToCart = (menu: MenuItem) => {
    // Cek apakah stok habis
    const sisa = menu.sisaPorsi ?? Infinity
    const currentInCart = cart.find(c => c.menu.id === menu.id)?.qty || 0

    if (menu.isHabis || sisa <= 0) {
      toast.warning('Habis', `Menu "${menu.nama}" sedang Habis.`)
      return
    }

    if (currentInCart >= sisa) {
      toast.warning('Habis', `Stok menu "${menu.nama}" tidak mencukupi (Habis).`)
      return
    }

    setJustAddedId(menu.id)
    setTimeout(() => setJustAddedId(null), 600)
    setCart(prev => {
      const idx = prev.findIndex(item => item.menu.id === menu.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 }
        return updated
      }
      return [...prev, { menu, qty: 1 }]
    })
    toast.success('Ditambahkan ke Pesanan', `${menu.nama} dimasukkan ke keranjang ${tableParam}.`)
  }

  // Update kuantitas item dengan validasi batas stok porsi
  const updateQty = (menuId: string, delta: number) => {
    const targetMenu = menus.find(m => m.id === menuId)
    const sisa = targetMenu?.sisaPorsi ?? Infinity

    setCart(prev => {
      return prev
        .map(item => {
          if (item.menu.id === menuId) {
            const newQty = item.qty + delta
            if (delta > 0 && newQty > sisa) {
              toast.warning('Habis', `Menu "${item.menu.nama}" tidak mencukupi (Habis).`)
              return item
            }
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  // Masuk ke langkah pembayaran (Step 2)
  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      toast.warning('Keranjang Kosong', 'Silakan pilih minimal 1 menu sebelum lanjut pembayaran.')
      return
    }
    setIsMobileDrawerOpen(false)
    setCurrentStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate / Muat QRIS
  const handleGenerateQris = async () => {
    setQrisError(null)
    setIsQrisLoading(true)
    try {
      const qrisRes = await fetch('/api/payments/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartSubtotal }),
      })
      const qrisJson = await qrisRes.json()
      if (!qrisRes.ok) {
        throw new Error(qrisJson.error || 'Server pembayaran QRIS menolak permintaan.')
      }
      setQrisData(qrisJson)
      toast.info('QRIS Dibuat', 'Silakan scan kode QRIS menggunakan m-Banking atau e-Wallet Anda.')
    } catch (err: any) {
      const msg = err.message || 'Pembayaran QRIS sedang gangguan atau ditolak.'
      setQrisError(msg)
      toast.error('QRIS Menolak', msg)
    } finally {
      setIsQrisLoading(false)
    }
  }

  // Eksekusi Submit Pesanan Meja
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      toast.warning('Keranjang Kosong', 'Pilih menu makanan terlebih dahulu.')
      return
    }
    if (!customerName.trim()) {
      toast.warning('Nama Pemesan Wajib Diisi', 'Mohon isi nama Anda agar pelayan dapat mengantar pesanan.')
      return
    }

    if (paymentChoice === 'qris') {
      if (!qrisData) {
        await handleGenerateQris()
        return
      }
      // Pelanggan mengonfirmasi sudah bayar QRIS
      await finalizeOrder('QRIS Dinamis', 'Lunas', qrisData.orderId)
    } else {
      // Bayar di Kasir
      await finalizeOrder('Bayar di Kasir', 'Belum Dibayar')
    }
  }

  const finalizeOrder = async (
    method: string,
    payStatus: string,
    midtransId?: string
  ) => {
    try {
      setIsSubmitting(true)
      const res = await fetch(`/order/${storeId}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableParam,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || null,
          notes: orderNotes.trim() || null,
          paymentMethod: method,
          paymentStatus: payStatus,
          midtransOrderId: midtransId || null,
          items: cart.map(c => ({
            menuId: c.menu.id,
            qty: c.qty,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan pesanan ke dapur.')
      }

      setPaymentDone(true)
      setCompletedOrder({
        invoiceNumber: data.invoiceNumber,
        totalPrice: data.totalPrice,
        paymentStatus: data.paymentStatus,
        paymentMethod: method,
      })
      setCart([])
      toast.success('Pesanan Diterima Dapur', `No. Nota ${data.invoiceNumber} berhasil dikirim ke antrean.`)
    } catch (err: any) {
      toast.error('Gagal Memproses Pesanan', err.message || 'Terjadi gangguan koneksi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6 text-kopi">
        <Loader2 className="w-9 h-9 text-[#FFB800] animate-spin mb-3" />
        <p className="text-xs font-extrabold">Menyiapkan katalog menu meja...</p>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto text-kopi">
        <div className="w-14 h-14 rounded-full bg-[#FDE8E4] text-[#D8431F] flex items-center justify-center mb-3">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-1">Gagal Membuka Menu Toko</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          {error || 'Outlet kuliner ini tidak ditemukan atau belum aktif.'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-kopi pb-28 lg:pb-16">
      {/* Top Header Outlet & Info Posisi Meja */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EBE6DC] px-4 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF6D6] text-[#D98B00] flex items-center justify-center font-black shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base leading-tight text-slate-900">
                {store.name}
              </h1>
              <p className="text-[11px] text-kopi-muted truncate max-w-[200px] sm:max-w-xs font-medium">
                {store.address || 'Pemesanan Mandiri dari Meja'}
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-full bg-[#FFF6D6] border border-[#FFE49A] text-kopi shadow-2xs flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#8A5A00]">
              Posisi Meja:
            </span>
            <span className="font-mono font-black text-xs text-[#2B1D00]">
              {tableParam}
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAMPILAN LANGKAH 1: KATALOG MENU (CATALOG STEP)                          */}
      {/* ========================================================================= */}
      {currentStep === 'catalog' && !completedOrder && (
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Hero Banner DapurTwin Persis Seperti /dashboard/penjualan */}
          <section className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[175px]">
            <div className="absolute right-44 top-5 w-14 h-14 rounded-full bg-[#FF7A59] hidden md:block" />
            <div className="absolute right-36 top-16 w-24 h-7 rounded-full bg-white/90 hidden md:block" />

            <div className="absolute right-4 sm:right-8 bottom-0 pointer-events-none">
              <DapiMascot
                width={145}
                mood={cartTotalQty > 0 ? 'senang' : 'khawatir'}
                className="translate-y-6"
              />
            </div>

            <div className="relative space-y-3 pr-28 sm:pr-48">
              <p className="text-xs sm:text-sm font-bold text-[#5C3D00]">
                Pesan Langsung dari {tableParam}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D00] tracking-tight">
                {cartTotalQty > 0
                  ? `${cartTotalQty} menu siap dikirim ke dapur`
                  : 'Pilih hidangan, pesanan langsung dimasak'}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#2B1D00]">
                  <span className="w-2 h-2 rounded-full bg-[#D8431F]" />
                  {menus.length} menu siap saji
                </span>
                <span className="inline-flex items-center rounded-full bg-white/75 px-4 py-1.5 text-xs font-bold text-[#2B1D00]">
                  Total {formatRupiah(cartSubtotal)}
                </span>
              </div>
            </div>
          </section>

          {/* Layout 12 Kolom Persis Seperti /dashboard/penjualan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Katalog & Pencarian Menu */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4 min-w-0">
              <div className="bg-white rounded-[28px] p-4 sm:p-5 space-y-3 shadow-[0_2px_16px_rgba(140,100,30,0.06)]">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchMenu}
                      onChange={e => {
                        setSearchMenu(e.target.value)
                        setCurrentPage(1)
                      }}
                      placeholder="Cari menu masakan, camilan, atau minuman..."
                      className="w-full pl-11 pr-4 py-3 rounded-full bg-[#FFF9EC] text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/60 transition"
                    />
                  </div>
                  {(searchMenu || activeCategory !== 'Semua') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchMenu('')
                        setActiveCategory('Semua')
                        setCurrentPage(1)
                      }}
                      title="Reset filter"
                      className="w-10 h-10 rounded-full bg-[#FDE8E4] hover:bg-[#FAD3CB] text-[#D8431F] transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1 min-w-0">
                    {categories.map(kat => (
                      <button
                        key={kat}
                        type="button"
                        onClick={() => {
                          setActiveCategory(kat)
                          setCurrentPage(1)
                        }}
                        className={clsx(
                          'px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex-shrink-0 active:scale-95',
                          activeCategory === kat
                            ? 'bg-[#FFB800] text-[#2B1D00] shadow-xs scale-105'
                            : 'bg-[#FFF6D6] text-[#7A5A10] hover:bg-[#FFEBB0]'
                        )}
                      >
                        {kat}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-2 flex-shrink-0">
                    {filteredMenus.length} menu
                  </span>
                </div>
              </div>

              {paginatedMenus.length === 0 ? (
                <div className="bg-white rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)] p-8 sm:p-10 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFF6D6] text-[#D98B00] flex items-center justify-center mx-auto">
                    <ChefHat className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900">
                      {menus.length === 0 ? 'Menu Toko Masih Kosong' : 'Tidak Ada Menu yang Cocok'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {menus.length === 0
                        ? 'Outlet kuliner belum memiliki menu aktif di database.'
                        : 'Kata kunci atau kategori yang dipilih tidak menghasilkan menu.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                  {paginatedMenus.map(menu => {
                    const inCart = cart.find(c => c.menu.id === menu.id)
                    const inCartCount = inCart?.qty || 0
                    const isJustAdded = justAddedId === menu.id
                    const sisa = menu.sisaPorsi ?? Infinity
                    const isHabis = menu.isHabis || sisa <= 0

                    return (
                      <div
                        key={menu.id}
                        className={clsx(
                          'relative rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)] p-4 text-left transition-all duration-200 group flex flex-col justify-between',
                          isHabis
                            ? 'bg-[#FFF5F3] opacity-80 cursor-not-allowed'
                            : isJustAdded
                            ? 'bg-[#FFFBEF] ring-2 ring-[#FFB800] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(140,100,30,0.14)]'
                            : 'bg-white hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(140,100,30,0.14)]'
                        )}
                      >
                        {/* Chip Status: Habis atau Jumlah di Keranjang */}
                        {(isHabis || inCartCount > 0) && (
                          <div className="mb-2 flex flex-wrap items-center gap-1.5">
                            {isHabis && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#D8431F] text-white">
                                <Ban className="w-3 h-3" />
                                Habis
                              </span>
                            )}
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
                              className={clsx(
                                'w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200',
                                isHabis
                                  ? 'bg-[#FEECE9] text-slate-400 grayscale'
                                  : 'bg-[#FFF6D6] group-hover:bg-[#FFB800] group-hover:scale-110'
                              )}
                            >
                              {menu.emoji || '🍽️'}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFF6D6] text-[#7A5A10] truncate max-w-[110px]">
                              {menu.kategori}
                            </span>
                          </div>

                          <h4
                            className={clsx(
                              'font-extrabold text-sm leading-snug line-clamp-2 break-words',
                              isHabis ? 'text-slate-400' : 'text-slate-900'
                            )}
                          >
                            {menu.nama}
                          </h4>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <p
                              className={clsx(
                                'text-base sm:text-lg font-extrabold leading-tight truncate',
                                isHabis ? 'text-slate-400' : 'text-slate-900'
                              )}
                            >
                              {formatRupiah(menu.hargaJual)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {isHabis ? 'Stok Tidak Tersedia' : 'Klik tombol tambah'}
                            </p>
                          </div>

                          {/* Tombol Tambah */}
                          <button
                            type="button"
                            disabled={isHabis}
                            onClick={() => addToCart(menu)}
                            className={clsx(
                              'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm',
                              isHabis
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : isJustAdded
                                ? 'bg-[#D8431F] text-white scale-105 cursor-pointer'
                                : 'bg-[#FFB800] text-[#2B1D00] hover:bg-[#D8431F] hover:text-white hover:scale-105 cursor-pointer'
                            )}
                          >
                            {isHabis ? (
                              <Ban className="w-4 h-4" />
                            ) : isJustAdded ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalItems={filteredMenus.length}
                pageSize={pageSize}
                onPageChange={p => setCurrentPage(p)}
                itemLabel="menu"
                className="pt-2"
              />
            </div>

            {/* Kolom Kanan: Panel Keranjang Pesanan Desktop (Gaya CartPOS) */}
            <div id="table-cart-section" className="lg:col-span-5 xl:col-span-4 space-y-4 min-w-0">
              <div className="bg-white rounded-[28px] p-5 shadow-[0_2px_16px_rgba(140,100,30,0.06)] space-y-4 sticky top-24">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#FFB800] text-[#2B1D00] flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Pesanan {tableParam}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {cartTotalQty} porsi dipilih
                      </p>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
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
                      Pilih menu dari katalog di sebelah kiri untuk mulai memesan dari {tableParam}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {cart.map(item => (
                        <div
                          key={item.menu.id}
                          className="flex items-center justify-between p-3 rounded-[20px] bg-[#FFF9EC] gap-2 transition-all hover:bg-[#FFF4D6]/70 duration-150"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base flex-shrink-0 shadow-2xs">
                              {item.menu.emoji || '🍽️'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {item.menu.nama}
                              </p>
                              <p className="text-xs font-extrabold text-[#D98B00]">
                                {formatRupiah(item.menu.hargaJual)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQty(item.menu.id, -1)}
                              className="w-7 h-7 rounded-full bg-white hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors active:scale-90 shadow-2xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-extrabold text-xs text-slate-900 font-mono">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.menu.id, 1)}
                              className="w-7 h-7 rounded-full bg-white hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors active:scale-90 shadow-2xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateQty(item.menu.id, -item.qty)}
                              className="w-7 h-7 rounded-full text-slate-400 hover:text-[#D8431F] hover:bg-[#FDE8E4] flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-[#FFF6D6] rounded-[24px] space-y-2 text-xs">
                      <div className="flex justify-between text-[#7A5A10]">
                        <span>Jumlah Menu</span>
                        <span className="font-extrabold text-slate-900">{cartTotalQty} porsi</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#FFE49A]">
                        <span className="font-bold text-[#8A5A00]">Total Tagihan</span>
                        <span className="font-mono font-black text-base text-slate-900">
                          {formatRupiah(cartSubtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Lanjut ke Step Pembayaran */}
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full py-3.5 rounded-full bg-[#D8431F] hover:bg-[#BF3818] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_4px_14px_rgba(216,67,31,0.25)] hover:shadow-[0_6px_20px_rgba(216,67,31,0.35)]"
                    >
                      <span>Lanjut ke Pembayaran ({formatRupiah(cartSubtotal)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM BAR MOBILE PERSIS SEPERTI DI /dashboard/penjualan                  */}
          {/* ========================================================================= */}
          {cart.length > 0 && (
            <>
              <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                  <div className="bg-white/95 backdrop-blur-md rounded-full p-2.5 pl-3.5 flex items-center justify-between gap-3 shadow-[0_12px_32px_rgba(140,100,30,0.25)] border border-[#FFE49A]/50 animate-in slide-in-from-bottom-5 duration-200">
                    <button
                      type="button"
                      onClick={() => setIsMobileDrawerOpen(prev => !prev)}
                      className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#FFB800] text-[#2B1D00] flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                        {cartTotalQty}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <span>{tableParam} • {cartTotalQty} menu</span>
                          {isMobileDrawerOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[#D98B00]" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 text-[#D98B00]" />
                          )}
                        </div>
                        <p className="text-base font-extrabold text-slate-900 leading-tight">
                          {formatRupiah(cartSubtotal)}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="px-6 py-3 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-sm font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all flex-shrink-0 shadow-[0_4px_12px_rgba(216,67,31,0.3)]"
                    >
                      <span>Lanjut Bayar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Sheet Ringkasan Menu Mobile Saat Diklik */}
              {isMobileDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[#2B1D00]/40 backdrop-blur-sm animate-in fade-in-0 duration-150">
                  <div className="absolute inset-0" onClick={() => setIsMobileDrawerOpen(false)} />

                  <div className="relative bg-white w-full max-w-xl mx-auto rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4 animate-in slide-in-from-bottom-8 duration-200 sm:mb-6">
                    <div className="w-12 h-1.5 bg-[#FFE49A] rounded-full mx-auto" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#FFB800] text-[#2B1D00] flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">Rincian Menu</h3>
                          <p className="text-[11px] text-slate-400">{cartTotalQty} item dalam pesanan {tableParam}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCart([])
                            setIsMobileDrawerOpen(false)
                          }}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#FDE8E4] text-[#D8431F] cursor-pointer"
                        >
                          Kosongkan
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className="w-8 h-8 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1 max-h-[45vh] pr-1">
                      {cart.map(item => (
                        <div
                          key={item.menu.id}
                          className="flex items-center justify-between p-3 rounded-[20px] bg-[#FFF9EC] gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base flex-shrink-0 shadow-2xs">
                              {item.menu.emoji || '🍽️'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {item.menu.nama}
                              </p>
                              <p className="text-xs font-extrabold text-[#D98B00]">
                                {formatRupiah(item.menu.hargaJual)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQty(item.menu.id, -1)}
                              className="w-7 h-7 rounded-full bg-white hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center shadow-2xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-extrabold text-xs text-slate-900 font-mono">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.menu.id, 1)}
                              className="w-7 h-7 rounded-full bg-white hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center shadow-2xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-[#FFF6D6] rounded-[24px] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#7A5A10]">
                        <span>Total Pesanan</span>
                        <span className="font-extrabold text-slate-900">{formatRupiah(cartSubtotal)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full py-3.5 rounded-full bg-[#D8431F] hover:bg-[#BF3818] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(216,67,31,0.25)]"
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAMPILAN LANGKAH 2: FORM & PEMBAYARAN (NEXT STEP VIEW INSTEAD OF MODAL)   */}
      {/* ========================================================================= */}
      {currentStep === 'payment' && !completedOrder && (
        <main className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
          {/* Tombol Kembali ke Katalog */}
          <button
            type="button"
            onClick={() => setCurrentStep('catalog')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-slate-700 hover:bg-[#FFF9EC] transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pilihan Menu</span>
          </button>

          {/* Kartu Formulir Pembayaran */}
          <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-[0_2px_16px_rgba(140,100,30,0.06)] space-y-6 border border-[#EBE6DC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Konfirmasi Pesanan ({tableParam})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pesanan langsung masuk ke antrean koki setelah dikonfirmasi
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FFEDB3] text-[#8A5A00] font-extrabold text-xs font-mono">
                Langkah 2 dari 2
              </span>
            </div>

            {/* Ringkasan Singkat Item Terpilih */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Menu Terpilih ({cartTotalQty} porsi)
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div
                    key={item.menu.id}
                    className="p-3 rounded-2xl bg-[#FFF9EC] flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-extrabold text-slate-900">{item.menu.nama}</h4>
                      <p className="font-mono text-slate-500">
                        {item.qty} x {formatRupiah(item.menu.hargaJual)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(item.menu.hargaJual * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Pemesan: Nama & Email (Bukan No WA) */}
            <div className="space-y-3 pt-2 border-t border-[#F4EFE6]">
              <div>
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF8F2B]" /> Nama Pemesan *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, Ibu Dewi..."
                  className="w-full px-4 py-3 rounded-full bg-[#FFF9EC] text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/60 border border-[#F2E5D0] transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="email@contoh.com (opsional untuk tanda terima e-receipt)"
                  className="w-full px-4 py-3 rounded-full bg-[#FFF9EC] text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/60 border border-[#F2E5D0] transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Catatan untuk Dapur (Opsional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Contoh: Sambal dipisah, tanpa es, pedas sedang..."
                  className="w-full px-4 py-3 rounded-full bg-[#FFF9EC] text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/60 border border-[#F2E5D0] transition"
                />
              </div>
            </div>

            {/* Pilihan Metode Pembayaran (Warna Kasir Penjualan) */}
            <div className="space-y-2.5 pt-2 border-t border-[#F4EFE6]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Pilih Metode Pembayaran
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentChoice('kasir')}
                  className={clsx(
                    'p-4 rounded-[24px] border text-left flex flex-col justify-between transition-all cursor-pointer',
                    paymentChoice === 'kasir'
                      ? 'border-[#FFB800] bg-[#FFF9EC] text-[#2B1D00] ring-2 ring-[#FFB800] shadow-2xs'
                      : 'border-[#EBE6DC] bg-white text-slate-700 hover:bg-[#FFF8EC]'
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-[#FFF0DB] text-[#D97706] flex items-center justify-center mb-2 font-bold shadow-2xs">
                    <Banknote className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">Bayar di Kasir</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Bayar tunai atau debit di kasir</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentChoice('qris')
                    if (!qrisData && !isQrisLoading) {
                      handleGenerateQris()
                    }
                  }}
                  className={clsx(
                    'p-4 rounded-[24px] border text-left flex flex-col justify-between transition-all cursor-pointer',
                    paymentChoice === 'qris'
                      ? 'border-[#FFB800] bg-[#FFF9EC] text-[#2B1D00] ring-2 ring-[#FFB800] shadow-2xs'
                      : 'border-[#EBE6DC] bg-white text-slate-700 hover:bg-[#FFF8EC]'
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-[#E2EBC0] text-[#5E7420] flex items-center justify-center mb-2 font-bold shadow-2xs">
                    <QrCode className="w-4 h-4 text-[#5E7420]" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">QRIS Dinamis</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">BCA, Gopay, OVO, Livin</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Box Tampilan QRIS & Penanganan Jika QR Code Menolak / Gagal */}
            {paymentChoice === 'qris' && (
              <div className="p-5 rounded-[24px] bg-[#FFFBF5] border border-[#F2E5D0] flex flex-col items-center justify-center space-y-3.5">
                {isQrisLoading ? (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
                    <p className="text-xs font-bold text-slate-600">Menghubungkan ke gateway QRIS...</p>
                  </div>
                ) : qrisError ? (
                  /* Penanganan Kasus QR Code Menolak */
                  <div className="py-4 text-center space-y-3 max-w-sm">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-rose-900">QR Code QRIS Menolak Permintaan</h4>
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        {qrisError}. Jangan khawatir, Anda dapat mencoba generate ulang atau beralih ke <strong>Bayar di Kasir</strong>.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleGenerateQris}
                        className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Coba Buat QRIS Lagi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentChoice('kasir')
                          setQrisError(null)
                        }}
                        className="px-4 py-2 rounded-full bg-[#FFF0DB] text-[#D97706] text-xs font-bold border border-[#FDE08A] cursor-pointer active:scale-95"
                      >
                        Pilih Bayar di Kasir
                      </button>
                    </div>
                  </div>
                ) : qrisData ? (
                  <>
                    <span className="text-xs font-extrabold text-[#2B1D00]">
                      Scan QRIS ini dengan m-Banking atau e-Wallet:
                    </span>
                    {qrisData.qrUrl ? (
                      <img
                        src={qrisData.qrUrl}
                        alt="QRIS Payment"
                        className="w-48 h-48 object-contain rounded-2xl shadow-xs border border-slate-200"
                      />
                    ) : qrisData.qrString ? (
                      <div className="p-3 bg-white rounded-2xl border-2 border-[#2B1D00] shadow-xs">
                        <QRCodeSVG
                          value={qrisData.qrString}
                          size={180}
                          level="M"
                          className="rounded-lg"
                        />
                      </div>
                    ) : null}
                    <p className="text-[11px] font-mono font-bold text-[#8A5A00]">
                      Menunggu konfirmasi pembayaran otomatis...
                    </p>
                  </>
                ) : null}
              </div>
            )}

            {/* Total Pembayaran & Tombol Final Transaksi */}
            <div className="pt-4 border-t border-[#F4EFE6] space-y-3">
              <div className="flex items-baseline justify-between text-xs font-bold">
                <span className="text-slate-500">Total Yang Harus Dibayar:</span>
                <span className="font-mono font-black text-xl text-slate-900">
                  {formatRupiah(cartSubtotal)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('catalog')}
                  className="w-full sm:w-auto h-12 px-6 rounded-full border border-[#E8DCC8] hover:bg-[#FFF9EC] text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Ubah Menu
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || isQrisLoading}
                  onClick={handleCheckoutSubmit}
                  className="w-full sm:flex-1 h-12 rounded-full bg-[#D8431F] hover:bg-[#BF3818] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_4px_14px_rgba(216,67,31,0.25)] hover:shadow-[0_6px_20px_rgba(216,67,31,0.35)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : paymentChoice === 'qris' && qrisData ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  <span>
                    {paymentChoice === 'qris'
                      ? qrisData
                        ? 'Saya Sudah Membayar QRIS'
                        : 'Generate QRIS Pembayaran'
                      : 'Kirim Pesanan (Bayar di Kasir)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* SCREEN SUKSES PESANAN MEJA (ORDER COMPLETED)                              */}
      {/* ========================================================================= */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-[#FBF9F5] flex flex-col items-center justify-center p-6 text-center text-kopi">
          <div className="w-16 h-16 rounded-full bg-[#E2EBC0] text-[#5E7420] flex items-center justify-center mb-4 shadow-xs">
            <CheckCircle className="w-9 h-9 stroke-[2.5]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Pesanan Berhasil Dikirim!
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            Dapur sedang menyiapkan hidangan untuk <strong className="text-slate-800">{tableParam}</strong>.
            {customerEmail && (
              <span className="block mt-1 text-[#7A5A10] font-medium">
                E-receipt struk pembayaran telah dikirim ke <strong>{customerEmail}</strong>.
              </span>
            )}
          </p>

          <div className="w-full max-w-sm p-4 rounded-2xl bg-white border border-[#EBE6DC] shadow-2xs space-y-2.5 text-xs text-left mb-6 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">No. Nota:</span>
              <span className="font-bold text-slate-800">{completedOrder.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Meja:</span>
              <span className="font-bold text-slate-900">{tableParam}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Tagihan:</span>
              <span className="font-bold text-slate-900">
                {formatRupiah(completedOrder.totalPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Metode:</span>
              <span className="font-bold text-slate-800">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status Bayar:</span>
              <span
                className={clsx(
                  'font-bold',
                  completedOrder.paymentStatus.toLowerCase().includes('lunas') &&
                    !completedOrder.paymentStatus.toLowerCase().includes('belum')
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                )}
              >
                {completedOrder.paymentStatus}
              </span>
            </div>
          </div>

          {completedOrder.paymentMethod === 'Bayar di Kasir' && (
            <div className="p-4 rounded-2xl bg-[#FFF6D6] border border-[#FDE08A] text-xs text-[#8A5A00] max-w-sm mb-6 text-left">
              <p className="font-extrabold">Langkah Selanjutnya (Bayar di Kasir):</p>
              <p className="text-[11px] mt-1 leading-relaxed">
                Silakan menuju meja kasir dan sebutkan <strong>{tableParam}</strong> atau tunjukkan nomor nota <strong>{completedOrder.invoiceNumber}</strong> untuk melunasi pesanan Anda.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setCompletedOrder(null)
              setQrisData(null)
              setCurrentStep('catalog')
            }}
            className="h-11 px-6 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white font-bold text-xs transition-all cursor-pointer shadow-[0_4px_14px_rgba(216,67,31,0.25)]"
          >
            Pesan Menu Tambahan
          </button>
        </div>
      )}
    </div>
  )
}
