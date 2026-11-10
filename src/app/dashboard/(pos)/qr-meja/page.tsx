'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'
import Pagination from '@/components/ui/Pagination'
import DapiHead, { DAPI_HEAD_SVG_MARKUP } from '@/components/ui/DapiHead'
import DapiMascot from '@/components/ui/DapiMascot'
import { useToast } from '@/context/ToastContext'
import {
  QrCode,
  Printer,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Store,
  Layers,
  Check,
  X,
  Search,
  RefreshCw,
  UtensilsCrossed,
  Download,
  AlertCircle,
  LogIn,
  SlidersHorizontal,
  MapPin,
  Users,
  ShoppingBag,
  ListOrdered,
} from 'lucide-react'
import clsx from 'clsx'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface TableInfo {
  id: string
  name: string
  zone: string
  capacity: number
  scanCount: number
  isDbSynced?: boolean
}

const DEFAULT_TABLES: TableInfo[] = [
  { id: 'default-1', name: 'Meja 1', zone: 'Area Utama', capacity: 4, scanCount: 0 },
  { id: 'default-2', name: 'Meja 2', zone: 'Area Utama', capacity: 4, scanCount: 0 },
]

export default function QrMejaPage() {
  const [storeId, setStoreId] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>('DapurTwin')
  const [storeAddress, setStoreAddress] = useState<string>('')
  const [origin, setOrigin] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [tables, setTables] = useState<TableInfo[]>(DEFAULT_TABLES)

  // Form tambah meja
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [newTableName, setNewTableName] = useState<string>('')
  const [newZone, setNewZone] = useState<string>('Area Utama')
  const [newCapacity, setNewCapacity] = useState<number>(4)
  const [isAdding, setIsAdding] = useState<boolean>(false)

  // Filter & Pagination
  const [activeZone, setActiveZone] = useState<string>('Semua')
  const [searchTable, setSearchTable] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 8

  // State Aksi
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [selectedTableForPrint, setSelectedTableForPrint] = useState<TableInfo | null>(null)
  const [isPrintAll, setIsPrintAll] = useState<boolean>(false)
  const [tableToDelete, setTableToDelete] = useState<TableInfo | null>(null)

  const toast = useToast()

  const loadStoreAndTables = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (!user) {
        setUserEmail(null)
        setLoading(false)
        return
      }

      setUserEmail(user.email || 'Pengguna')
      setStoreId(user.id)

      // Ambil profil toko
      const { data: prof } = await supabase
        .from('profiles')
        .select('store_name, store_address')
        .eq('id', user.id)
        .maybeSingle()

      if (prof?.store_name) setStoreName(prof.store_name)
      if (prof?.store_address) setStoreAddress(prof.store_address)

      // Coba ambil dari tabel store_tables di Supabase
      const { data: dbTables, error: dbErr } = await supabase
        .from('store_tables')
        .select('id, table_name, location_zone, capacity, scan_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (!dbErr && dbTables && dbTables.length > 0) {
        const mapped: TableInfo[] = dbTables.map(row => ({
          id: row.id,
          name: row.table_name,
          zone: row.location_zone || 'Area Utama',
          capacity: Number(row.capacity) || 4,
          scanCount: Number(row.scan_count) || 0,
          isDbSynced: true,
        }))
        setTables(mapped)
        localStorage.setItem('dapurtwin_table_list', JSON.stringify(mapped))
      } else if (!dbErr && dbTables && dbTables.length === 0) {
        // Jika tabel store_tables ada tapi kosong untuk user ini, seed 2 contoh meja ke DB
        const { data: inserted } = await supabase
          .from('store_tables')
          .insert([
            { user_id: user.id, table_name: 'Meja 1', table_code: 'TBL-01', location_zone: 'Area Utama', capacity: 4 },
            { user_id: user.id, table_name: 'Meja 2', table_code: 'TBL-02', location_zone: 'Area Utama', capacity: 4 },
          ])
          .select('id, table_name, location_zone, capacity, scan_count')

        if (inserted && inserted.length > 0) {
          const mapped: TableInfo[] = inserted.map(row => ({
            id: row.id,
            name: row.table_name,
            zone: row.location_zone || 'Area Utama',
            capacity: Number(row.capacity) || 4,
            scanCount: Number(row.scan_count) || 0,
            isDbSynced: true,
          }))
          setTables(mapped)
        }
      } else {
        // Fallback ke localStorage jika migrasi SQL store_tables belum dijalankan
        const saved = localStorage.getItem('dapurtwin_table_list')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTables(
              parsed.map((p: any) => ({
                id: p.id || String(Math.random()),
                name: p.name || 'Meja 1',
                zone: p.zone || 'Area Utama',
                capacity: Number(p.capacity) || 4,
                scanCount: Number(p.scanCount) || 0,
              }))
            )
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
    loadStoreAndTables()
  }, [loadStoreAndTables])

  const saveLocalFallback = (newTables: TableInfo[]) => {
    setTables(newTables)
    try {
      localStorage.setItem('dapurtwin_table_list', JSON.stringify(newTables))
    } catch {
      // ignore
    }
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newTableName.trim()
    if (!trimmed) return

    setIsAdding(true)
    try {
      const supabase = createClient()
      if (storeId) {
        const { data: created, error: insertErr } = await supabase
          .from('store_tables')
          .insert({
            user_id: storeId,
            table_name: trimmed,
            table_code: `TBL-${tables.length + 1}`,
            location_zone: newZone,
            capacity: newCapacity,
          })
          .select('id, table_name, location_zone, capacity, scan_count')
          .single()

        if (!insertErr && created) {
          const newItem: TableInfo = {
            id: created.id,
            name: created.table_name,
            zone: created.location_zone || 'Area Utama',
            capacity: Number(created.capacity) || 4,
            scanCount: 0,
            isDbSynced: true,
          }
          const updated = [...tables, newItem]
          saveLocalFallback(updated)
          setNewTableName('')
          setIsModalOpen(false)
          toast.success('Meja Ditambahkan', `${trimmed} berhasil dibuat dan siap dicetak QR Code-nya.`)
          return
        }
      }

      // Fallback local
      const newItem: TableInfo = {
        id: Date.now().toString(),
        name: trimmed,
        zone: newZone,
        capacity: newCapacity,
        scanCount: 0,
      }
      const updated = [...tables, newItem]
      saveLocalFallback(updated)
      setNewTableName('')
      setIsModalOpen(false)
      toast.success('Meja Ditambahkan', `${trimmed} berhasil ditambahkan ke daftar meja.`)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteTable = (table: TableInfo) => {
    setTableToDelete(table)
  }

  const executeDeleteTable = async () => {
    if (!tableToDelete) return
    const table = tableToDelete

    try {
      if (storeId && table.isDbSynced) {
        const supabase = createClient()
        await supabase.from('store_tables').delete().eq('id', table.id).eq('user_id', storeId)
      }
    } catch {
      // ignore
    }

    const updated = tables.filter(t => t.id !== table.id)
    saveLocalFallback(updated)
    toast.info('Meja Dihapus', `${table.name} telah dihapus dari daftar.`)
    setTableToDelete(null)

    if (paginatedTables.length === 1 && currentPage > 1) {
      setCurrentPage(p => p - 1)
    }
  }

  const getOrderUrl = (tableName: string) => {
    if (!storeId) return ''
    const base = origin || 'http://localhost:3000'
    return `${base}/order/${storeId}?meja=${encodeURIComponent(tableName)}`
  }

  const handleCopyLink = (tableName: string, id: string) => {
    const url = getOrderUrl(tableName)
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Tautan Tersalin', `Link pemesanan untuk ${tableName} berhasil disalin.`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Fungsi Download Poster Tent Card QR Code beresolusi tinggi (PNG) menggunakan HTML5 Canvas
  const handleDownloadPoster = async (table: TableInfo) => {
    const svgEl = document.getElementById(`qr-svg-${table.id}`) as SVGSVGElement | null
    if (!svgEl) {
      toast.error('Gagal Mengunduh', 'Elemen QR Code belum siap.')
      return
    }

    setDownloadingId(table.id)
    try {
      const serializer = new XMLSerializer()
      let svgString = serializer.serializeToString(svgEl)
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
      }

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = e => reject(e)
        img.src = url
      })

      // Buat Canvas Stand Meja (Tent Card) 1:1 persis seperti Desain Preview di Dashboard
      // Proporsi kartu: W = 720, H = 960 (Resolusi tajam, rasio 3:4 pas untuk display akrilik/stand meja)
      const canvas = document.createElement('canvas')
      const W = 720
      const H = 960
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context tidak didukung')

      // 1. Background keseluruhan kartu (Krem Halus DapurTwin: #FFFDF9)
      const cardRadius = 40
      ctx.fillStyle = '#FFFDF9'
      ctx.beginPath()
      ctx.roundRect(0, 0, W, H, cardRadius)
      ctx.fill()

      // 2. Banner Header Melengkung di atas (Gradasi Kuning DapurTwin: #FFC93C -> #FFB800 -> #FF9A1F)
      const headerH = 200
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(0, 0, W, headerH, [cardRadius, cardRadius, 0, 0])
      ctx.clip()

      const headerGrad = ctx.createLinearGradient(0, 0, W, 0)
      headerGrad.addColorStop(0, '#FFC93C')
      headerGrad.addColorStop(0.5, '#FFB800')
      headerGrad.addColorStop(1, '#FF9A1F')
      ctx.fillStyle = headerGrad
      ctx.fillRect(0, 0, W, headerH)

      // Coba render avatar maskot Dapi di pojok kiri bawah header persis seperti di Preview
      try {
        const dapiBlob = new Blob([DAPI_HEAD_SVG_MARKUP], { type: 'image/svg+xml;charset=utf-8' })
        const dapiUrl = URL.createObjectURL(dapiBlob)
        const dapiImg = new Image()
        await new Promise<void>(res => {
          dapiImg.onload = () => {
            // Letakkan di pojok kiri bawah header
            ctx.drawImage(dapiImg, 18, headerH - 120, 115, 138)
            URL.revokeObjectURL(dapiUrl)
            res()
          }
          dapiImg.onerror = () => {
            URL.revokeObjectURL(dapiUrl)
            res()
          }
          dapiImg.src = dapiUrl
        })
      } catch {
        // Fallback jika blob svg tidak dapat dirender
      }

      // Teks di Header Banner
      ctx.fillStyle = '#2B1D00'
      ctx.textAlign = 'center'
      ctx.font = '900 18px system-ui, -apple-system, sans-serif'
      ctx.letterSpacing = '3px'
      ctx.fillText('PESAN & BAYAR DARI MEJA', W / 2 + 20, 80)
      ctx.letterSpacing = '0px'

      ctx.font = '900 38px system-ui, -apple-system, sans-serif'
      ctx.fillText(storeName.slice(0, 26), W / 2 + 20, 140)
      ctx.restore()

      // 3. Pill Nomor Meja (Rounded Full Hitam Kopi Gelap dengan Teks Kuning Emas)
      const pillW = 320
      const pillH = 76
      const pillX = (W - pillW) / 2
      const pillY = headerH + 45
      ctx.fillStyle = '#2B1D00'
      ctx.beginPath()
      ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2)
      ctx.fill()

      ctx.fillStyle = '#FFB800'
      ctx.textAlign = 'center'
      ctx.font = '900 36px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.fillText(table.name, W / 2, pillY + 52)

      // 4. Bingkai Putih QR Code dengan Border Coklat Kopi Gelap (Persis Desain Preview)
      const qrBoxSize = 420
      const qrBoxX = (W - qrBoxSize) / 2
      const qrBoxY = pillY + pillH + 40

      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = '#2B1D00'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32)
      ctx.fill()
      ctx.stroke()

      // Gambar QR Code di tengah bingkai putih
      const pad = 36
      ctx.drawImage(img, qrBoxX + pad, qrBoxY + pad, qrBoxSize - pad * 2, qrBoxSize - pad * 2)
      URL.revokeObjectURL(url)

      // 5. Langkah Instruksi Pemesanan di Bawah QR
      ctx.fillStyle = '#2B1D00'
      ctx.font = '800 24px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('1. Scan QR  •  2. Pilih Menu  •  3. Bayar', W / 2, qrBoxY + qrBoxSize + 60)

      // 6. Border Luar Seluruh Kartu (#E8DCC8, 6px) persis seperti preview
      ctx.strokeStyle = '#E8DCC8'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.roundRect(3, 3, W - 6, H - 6, cardRadius)
      ctx.stroke()

      // Trigger Download PNG
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      const safeName = table.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      link.download = `qr-${safeName}-${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
      link.href = pngUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('QR Berhasil Diunduh', `Gambar poster ${table.name} siap dicetak atau dikirim.`)
    } catch (err: any) {
      toast.error('Gagal Mengunduh QR', err?.message || 'Terjadi kesalahan saat membuat gambar.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePrintSingle = (table: TableInfo) => {
    setSelectedTableForPrint(table)
    setIsPrintAll(false)
    setTimeout(() => {
      window.print()
    }, 250)
  }

  const handlePrintAll = () => {
    setIsPrintAll(true)
    setSelectedTableForPrint(null)
    setTimeout(() => {
      window.print()
    }, 250)
  }

  // Daftar Zona untuk Filter
  const zoneList = ['Semua', ...Array.from(new Set(tables.map(t => t.zone || 'Area Utama')))]

  // Filter berdasarkan Zona & Kata Kunci
  const filteredTables = tables.filter(t => {
    const matchZone = activeZone === 'Semua' || (t.zone || 'Area Utama') === activeZone
    const matchSearch =
      !searchTable.trim() ||
      t.name.toLowerCase().includes(searchTable.toLowerCase()) ||
      (t.zone || '').toLowerCase().includes(searchTable.toLowerCase())
    return matchZone && matchSearch
  })

  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalCapacity = tables.reduce((sum, t) => sum + (Number(t.capacity) || 4), 0)
  const totalScans = tables.reduce((sum, t) => sum + (Number(t.scanCount) || 0), 0)

  const STATUS_CARDS = [
    {
      key: 'Semua',
      label: 'Total Meja Aktif',
      count: tables.length,
      hint: 'Kode QR siap dipindai tamu',
      Icon: QrCode,
      tint: 'bg-[#FFEDB3]',
      on: 'bg-kuning text-kopi',
    },
    {
      key: 'Area Utama',
      label: 'Kapasitas Kursi',
      count: totalCapacity,
      hint: `Tersebar di ${zoneList.length - 1} zona meja`,
      Icon: Users,
      tint: 'bg-[#E3DCF3]',
      on: 'bg-[#6B5BB5] text-white',
    },
    {
      key: 'Indoor',
      label: 'Pesanan via QR',
      count: totalScans,
      hint: 'Akumulasi transaksi meja',
      Icon: ShoppingBag,
      tint: 'bg-[#F2D9CC]',
      on: 'bg-[#C2502F] text-white',
    },
  ]

  return (
    <div className="flex-1 pb-16">
      {/* Topbar identik dengan /dashboard/proses-pesanan */}
      <div className="print:hidden">
        <Topbar
          title="QR Meja Pelanggan"
          subtitle="Generate kode QR meja dinamis, unduh desain tent card siap cetak, dan terima pesanan mandiri"
          actions={
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={loadStoreAndTables}
                disabled={loading}
                title="Muat ulang daftar meja"
                className="flex h-9 sm:h-10 px-2.5 sm:px-3.5 items-center gap-1.5 rounded-full bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs border border-[#E8DCC8] cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
                <span className="hidden md:inline">Segarkan</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                data-tour="qr-add-btn"
                className="flex h-9 sm:h-10 px-3 sm:px-4 items-center gap-1.5 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] text-xs font-bold transition-all shadow-xs active:scale-95 whitespace-nowrap flex-shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span>Tambah Meja</span>
              </button>
            </div>
          }
        />
      </div>

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-7xl mx-auto print:hidden">
        {/* Banner Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Sesi akun belum terhubung. Silakan masuk ke akun DapurTwin Anda agar kartu meja terhubung dengan gerai Anda.
              </span>
            </div>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1.5 hover:bg-amber-700 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Akun
            </Link>
          </div>
        )}

        {/* Hero Banner DapurTwin persis seperti /dashboard/proses-pesanan */}
        <section className="relative mt-8 sm:mt-10 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-5 sm:p-8 md:p-10 md:max-w-[60%]">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/85 px-3.5 py-1 text-xs font-extrabold text-kopi shadow-2xs">
              <Store className="w-3.5 h-3.5 text-[#D8431F]" />
              <span>Outlet: {storeName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-kopi">
              Generator QR Code Meja
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              Unduh gambar PNG siap cetak atau print lembar A4 untuk dipasang di meja pelanggan. Pesanan masuk otomatis ke antrean dapur lengkap dengan nomor meja.
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard/proses-pesanan"
                className="h-11 px-5 rounded-full bg-white/85 hover:bg-white text-kopi text-sm font-bold flex items-center gap-2 active:scale-95 transition-all duration-150 whitespace-nowrap shadow-xs"
              >
                <ListOrdered className="w-4 h-4" /> Pantau Antrean Dapur
              </Link>
              <Link
                href="/dashboard/menu"
                className="h-11 px-5 rounded-full border-2 border-kopi text-kopi text-sm font-bold flex items-center gap-2 hover:bg-kopi/5 active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                <UtensilsCrossed className="w-4 h-4" /> Kelola Menu Aktif
              </Link>
            </div>
          </div>

          {/* Maskot Dapi menyembul keluar */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* 3 Kartu KPI pastel bulat */}
        <div data-tour="qr-status-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATUS_CARDS.map((st, idx) => (
            <div
              key={idx}
              className={clsx(
                'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col justify-between min-h-[140px] transition-all duration-200 group',
                st.tint,
                'text-kopi shadow-[0_6px_14px_rgba(120,80,30,0.08)]'
              )}
            >
              <span
                aria-hidden
                className="absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-white/55 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="relative flex items-center justify-between">
                <span className="text-sm sm:text-base font-extrabold">{st.label}</span>
                <span className="h-9 w-9 rounded-full bg-white/60 flex items-center justify-center">
                  <st.Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="relative">
                <p className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight leading-none font-mono">
                  {st.count}
                </p>
                <p className="text-[10px] xs:text-xs mt-1.5 text-kopi-muted break-words">{st.hint}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Zona Bar (Persis seperti /dashboard/proses-pesanan) */}
        <div data-tour="qr-filter-bar" className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-kopi-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={searchTable}
              onChange={e => {
                setSearchTable(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Cari nomor meja atau zona..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-white text-sm text-kopi placeholder:text-kopi-muted/70 shadow-[0_4px_14px_rgba(120,80,30,0.08)] outline-none focus:ring-2 focus:ring-kuning border border-transparent focus:border-kuning"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none flex-nowrap">
            <span className="text-[11px] font-bold text-kopi-muted uppercase tracking-wider flex items-center gap-1.5 mr-1 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Zona
            </span>
            {zoneList.map(zone => {
              const isActive = activeZone === zone
              const count =
                zone === 'Semua'
                  ? tables.length
                  : tables.filter(t => (t.zone || 'Area Utama') === zone).length
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => {
                    setActiveZone(zone)
                    setCurrentPage(1)
                  }}
                  className={clsx(
                    'h-10 pl-4 pr-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-2 active:scale-95 flex-shrink-0 whitespace-nowrap',
                    isActive
                      ? 'bg-kopi text-white shadow-[0_8px_16px_rgba(43,34,28,0.2)]'
                      : 'bg-white text-kopi shadow-[0_2px_8px_rgba(120,80,30,0.06)] hover:bg-[#FFF8EC]'
                  )}
                >
                  <span>{zone}</span>
                  <span
                    className={clsx(
                      'h-7 min-w-7 px-1.5 rounded-full font-mono text-[11px] font-extrabold flex items-center justify-center',
                      isActive ? 'bg-white/25 text-inherit' : 'bg-[#F2ECE1] text-kopi-muted'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Grid Kartu Stand QR Meja (Desain Tent Card Jelas, Siap Download & Print) */}
        {paginatedTables.length === 0 ? (
          <div className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_4px_20px_rgba(120,80,30,0.06)] py-16 text-center text-kopi-muted text-xs font-medium space-y-2">
            <QrCode className="w-10 h-10 text-kopi-muted/40 mx-auto" />
            <p className="text-sm font-bold text-kopi">Belum ada meja pada kategori ini</p>
            <p className="text-[11px]">Tambahkan meja baru melalui formulir di atas.</p>
          </div>
        ) : (
          <div data-tour="qr-table-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedTables.map(table => {
              const orderUrl = getOrderUrl(table.name)
              const isCopied = copiedId === table.id
              const isDownloading = downloadingId === table.id

              return (
                <div
                  key={table.id}
                  className="relative rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_4px_20px_rgba(120,80,30,0.06)] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(120,80,30,0.12)] flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar Kartu: Info Zona & Hapus */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF6D6] text-[#7A5A10] text-[11px] font-extrabold">
                        <MapPin className="w-3 h-3 text-[#D98B00]" />
                        {table.zone || 'Area Utama'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4EFE6] text-kopi text-[11px] font-bold">
                        <Users className="w-3 h-3" />
                        {table.capacity || 4} Kursi
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTable(table)}
                      className="h-8 w-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title={`Hapus ${table.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Pratinjau Desain Stand Meja (Tent Card) yang Jelas & Kontras Tinggi */}
                  <div className="relative rounded-[24px] bg-[#FFFDF9] border-2 border-[#E8DCC8] overflow-hidden shadow-xs">
                    {/* Banner Header Kuning Khas DapurTwin */}
                    <div className="relative bg-gradient-to-r from-[#FFC93C] via-[#FFB800] to-[#FF9A1F] px-4 py-3.5 text-center text-[#2B1D00] overflow-hidden">
                      {/* Maskot Dapi Head di pojok header */}
                      <div className="absolute -left-2 -bottom-2 pointer-events-none opacity-90 drop-shadow-xs">
                        <DapiHead size={46} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-85">
                        PESAN &amp; BAYAR DARI MEJA
                      </p>
                      <h4 className="text-base font-black tracking-tight truncate mt-0.5">
                        {storeName}
                      </h4>
                    </div>

                    {/* Isi Kartu QR */}
                    <div className="p-5 flex flex-col items-center text-center space-y-3.5">
                      {/* Pill Nomor Meja */}
                      <div className="px-5 py-1.5 rounded-full bg-[#2B1D00] text-[#FFB800] font-mono font-black text-base tracking-wide shadow-2xs">
                        {table.name}
                      </div>

                      {/* Bingkai QR Code dengan Maskot Dapi menyembul halus */}
                      <div className="relative">
                        <div className="p-3.5 rounded-2xl bg-white border-2 border-[#2B1D00] shadow-xs inline-flex items-center justify-center">
                          {orderUrl ? (
                            <QRCodeSVG
                              id={`qr-svg-${table.id}`}
                              value={orderUrl}
                              size={168}
                              level="H"
                              includeMargin={false}
                            />
                          ) : (
                            <div className="w-[168px] h-[168px] flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-xs p-3">
                              Menyiapkan QR...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Instruksi Scan */}
                      <div className="pt-1">
                        <p className="text-xs font-extrabold text-kopi">
                          1. Scan QR • 2. Pilih Menu • 3. Bayar
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* URL Tujuan & Tombol Aksi Lengkap (Unduh PNG, Cetak, Salin, Buka) */}
                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE6DC] text-[11px]">
                      <span className="font-mono text-slate-500 truncate">{orderUrl}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(table.name, table.id)}
                        className="text-kopi hover:text-[#D8431F] font-extrabold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span className="text-emerald-700">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Tombol Utama: Unduh PNG & Cetak */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!orderUrl || isDownloading}
                        onClick={() => handleDownloadPoster(table)}
                        className="h-10 px-3 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isDownloading ? 'Mengunduh...' : 'Unduh PNG'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={!orderUrl}
                        onClick={() => handlePrintSingle(table)}
                        className="h-10 px-3 rounded-full bg-kopi hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Meja</span>
                      </button>
                    </div>

                    {/* Tombol Buka Halaman Pemesanan Pelanggan */}
                    {orderUrl && (
                      <a
                        href={orderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-9 rounded-full border border-[#EDD9B0] bg-white hover:bg-[#FFF6E0] text-kopi text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                      >
                        <span>Simulasi Buka Menu {table.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#D98B00]" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredTables.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
          itemLabel="meja"
          className="pt-2"
        />
      </main>

      {/* ====================================================================== */}
      {/* LEMBAR CETAK STAND MEJA / TENT CARD A4 (KHUSUS SAAT PRINT)             */}
      {/* ====================================================================== */}
      <div className="hidden print:block bg-white text-[#2B1D00] font-sans">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              body {
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .tent-card-print {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          `,
          }}
        />

        <div className="grid grid-cols-2 gap-6">
          {(isPrintAll ? tables : selectedTableForPrint ? [selectedTableForPrint] : []).map(
            table => {
              const orderUrl = getOrderUrl(table.name)

              return (
                <div
                  key={table.id}
                  className="tent-card-print rounded-[28px] border-[3px] border-[#2B1D00] bg-[#FFFDF9] overflow-hidden flex flex-col justify-between"
                  style={{ minHeight: '128mm' }}
                >
                  {/* Header Tent Card */}
                  <div className="relative bg-[#FFB800] border-b-[3px] border-[#2B1D00] px-5 py-4 text-center overflow-hidden">
                    <div className="absolute left-3 -bottom-2 pointer-events-none opacity-90">
                      <DapiHead size={52} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2B1D00]">
                      PESAN &amp; BAYAR MANDIRI DARI MEJA
                    </p>
                    <h2 className="text-xl font-black text-[#2B1D00] tracking-tight mt-0.5">
                      {storeName}
                    </h2>
                    {storeAddress && (
                      <p className="text-[10px] font-bold text-[#5C3D00] mt-0.5 truncate">
                        {storeAddress}
                      </p>
                    )}
                  </div>

                  {/* Body Tent Card */}
                  <div className="p-5 flex-1 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="px-6 py-1.5 rounded-full bg-[#2B1D00] text-[#FFB800] font-mono font-black text-lg tracking-wide">
                      {table.name.toUpperCase()}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border-[3px] border-[#2B1D00]">
                      {orderUrl && (
                        <QRCodeSVG
                          value={orderUrl}
                          size={175}
                          level="H"
                          includeMargin={false}
                        />
                      )}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-black text-[#2B1D00]">
                        1. Scan QR Code  •  2. Pilih Menu  •  3. Bayar
                      </p>
                    </div>
                  </div>

                  {/* Footer Tent Card */}
                  <div className="bg-[#F4EFE6] border-t border-[#E8DCC8] px-4 py-2 text-center text-[9.5px] font-bold text-[#6B4A00]">
                    Zona: {table.zone || 'Area Utama'} ({table.capacity || 4} Kursi) • DapurTwin Self-Order
                  </div>
                </div>
              )
            }
          )}
        </div>
      </div>

      {/* Modal Tambah Meja Baru (Modal Bersih & Rapi, Tidak Membebani Tampilan Utama) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-[28px] border border-[#EBE6DC] shadow-[0_20px_50px_rgba(43,29,0,0.25)] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#FFF0DB] text-[#D8431F] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Tambah Meja Baru</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Buat nomor meja dan tentukan kapasitas kursi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-kopi-muted uppercase tracking-wider block mb-1 px-1">
                  Nama / Nomor Meja
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  placeholder="Contoh: Meja 3, Meja VIP 1..."
                  autoFocus
                  className="w-full h-11 px-4 rounded-2xl bg-[#FFF9EC] text-xs font-bold text-kopi placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/70 border border-[#F2E5D0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-kopi-muted uppercase tracking-wider block mb-1 px-1">
                    Area / Zona
                  </label>
                  <select
                    value={newZone}
                    onChange={e => setNewZone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#FFF9EC] text-xs font-bold text-kopi outline-none focus:ring-2 focus:ring-[#FFB800]/70 border border-[#F2E5D0] cursor-pointer"
                  >
                    <option value="Area Utama">Area Utama</option>
                    <option value="Indoor AC">Indoor AC</option>
                    <option value="Outdoor / Teras">Outdoor / Teras</option>
                    <option value="Lantai 2">Lantai 2</option>
                    <option value="VIP / Lesehan">VIP / Lesehan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-kopi-muted uppercase tracking-wider block mb-1 px-1">
                    Kapasitas Kursi
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newCapacity}
                    onChange={e => setNewCapacity(Math.max(1, Number(e.target.value) || 2))}
                    className="w-full h-11 px-4 rounded-2xl bg-[#FFF9EC] text-xs font-bold font-mono text-kopi outline-none focus:ring-2 focus:ring-[#FFB800]/70 border border-[#F2E5D0]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newTableName.trim() || isAdding}
                  className="h-10 px-5 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] font-extrabold text-xs flex items-center gap-1.5 shadow-[0_4px_14px_rgba(255,184,36,0.35)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Simpan Meja</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {tableToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Hapus Meja?"
          message={`Apakah Anda yakin ingin menghapus ${tableToDelete.name} dari daftar QR meja? Pelanggan tidak akan bisa lagi scan kode QR meja ini.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDestructive={true}
          onClose={() => setTableToDelete(null)}
          onConfirm={executeDeleteTable}
        />
      )}
    </div>
  )
}
