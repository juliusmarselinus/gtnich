'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiHead from '@/components/ui/DapiHead'
import BahanFilterBar from './components/BahanFilterBar'
import BahanCard from './components/BahanCard'
import BahanModal from './components/BahanModal'
import DeleteBahanModal from './components/DeleteBahanModal'
import { useBahan } from './hooks/useBahan'
import { useToast } from '@/context/ToastContext'
import { Bahan, FilterStatus } from './types'
import { formatRupiah } from '@/lib/mock-data'
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  LogIn,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Boxes,
  Plus,
  ShoppingCart,
  ScanLine,
} from 'lucide-react'
import clsx from 'clsx'
import { CardGridSkeleton } from '@/components/ui/Skeleton'

const STATUS_CARDS = [
  {
    key: 'all' as FilterStatus,
    label: 'Total Bahan',
    hint: 'Semua jenis bahan aktif',
    Icon: Package,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'ok' as FilterStatus,
    label: 'Stok Aman',
    hint: 'Persediaan mencukupi',
    Icon: CheckCircle2,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
  {
    key: 'rendah' as FilterStatus,
    label: 'Perlu Restock',
    hint: 'Mendekati batas minimum',
    Icon: AlertTriangle,
    tint: 'bg-[#F2D9CC]',
    on: 'bg-[#C2502F] text-white',
  },
  {
    key: 'habis' as FilterStatus,
    label: 'Stok Habis',
    hint: 'Kritis segera belanja',
    Icon: XCircle,
    tint: 'bg-[#FDE8E4]',
    on: 'bg-[#D8431F] text-white',
  },
] as const

export default function BahanPage() {
  const {
    list,
    allCount,
    suppliers,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    getStockCondition,
    checkBahanUsage,
    saveBahan,
    deleteBahan,
    refresh,
  } = useBahan()

  const toast = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Bahan | null>(null)

  // State untuk Custom Modal Konfirmasi Hapus Bahan
  const [deleteTarget, setDeleteTarget] = useState<Bahan | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [usedInMenus, setUsedInMenus] = useState<string[]>([])

  function openAdd() {
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(b: Bahan) {
    setEditing(b)
    setShowModal(true)
  }

  async function openDeleteConfirm(b: Bahan) {
    setCheckingId(b.id)
    try {
      const usage = await checkBahanUsage(b.id)
      setUsedInMenus(usage.menuNames)
      setDeleteTarget(b)
    } catch {
      setUsedInMenus([])
      setDeleteTarget(b)
    } finally {
      setCheckingId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const targetName = deleteTarget.nama
    try {
      await deleteBahan(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Bahan Berhasil Dihapus', `Data bahan "${targetName}" telah dihapus dari inventaris dapur.`)
    } catch (err: any) {
      toast.error('Gagal Menghapus Bahan', err?.message || 'Terjadi kesalahan saat menghapus bahan.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleSaveBahan(id: string | null, form: any) {
    try {
      await saveBahan(id, form)
      setShowModal(false)
      if (id) {
        toast.success('Bahan Berhasil Diperbarui', `Informasi stok dan harga "${form.nama}" tersimpan.`)
      } else {
        toast.success('Bahan Baru Ditambahkan', `"${form.nama}" berhasil didaftarkan ke gudang dapur.`)
      }
    } catch (err: any) {
      toast.error('Gagal Menyimpan Bahan', err?.message || 'Terjadi kesalahan saat menyimpan data bahan.')
    }
  }

  async function handleUpdateHarga(b: Bahan, hargaBaru: number) {
    try {
      await saveBahan(b.id, {
        nama: b.nama,
        satuan: b.satuan,
        hargaPerSatuan: hargaBaru,
        stok: b.stok,
        stokMinimum: b.stokMinimum,
        supplierId: b.supplierId || '',
        foto: b.foto || null,
      })
    } catch (err: any) {
      console.warn('Gagal sinkron harga baru:', err)
    }
  }

  // Hitung total nilai valuasi stok bahan di gudang
  const totalNilaiInventaris = useMemo(() => {
    return list.reduce((sum, b) => sum + (b.stok || 0) * (b.hargaPerSatuan || 0), 0)
  }, [list])

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Daftar Bahan Baku"
        subtitle="Kelola sisa stok bahan, satuan takaran, harga beli, dan batas aman belanja"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
        {/* Notifikasi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-[24px] bg-[#FFF6D6] flex flex-wrap items-center justify-between gap-3 text-[#6B4A00] text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D98B00]" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk membaca dan menyimpan data bahan ke database.
              </span>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-[#D8431F] text-white font-bold flex items-center gap-1.5 hover:bg-[#BF3818] transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Akun
            </Link>
          </div>
        )}

        {/* Notifikasi Error */}
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

        {/* Hero Banner DapurTwin identik Purchase Order & Tagihan */}
        <section className="relative mt-10 sm:mt-12 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-6 sm:p-10 md:max-w-[58%]">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-kopi">
              Inventaris Bahan
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              Kelola stok bahan baku, batas aman pemesanan, pergerakan gudang, dan sinkronisasi harga pasar.
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                data-tour="add-ingredient-btn"
                onClick={openAdd}
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 flex-shrink-0" /> Tambah Bahan Baru
              </button>
              <Link
                href="/dashboard/purchase-order"
                className="h-11 px-5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4 flex-shrink-0" /> Buat Pembelian PO
              </Link>
              <Link
                href="/dashboard/ocr-nota"
                className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 hover:bg-white/80 transition-colors whitespace-nowrap"
              >
                <ScanLine className="w-4 h-4" /> Scan Nota Belanja
              </Link>
              <span className="h-11 px-5 rounded-full bg-white/80 text-kopi text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-xs">
                <Boxes className="w-4 h-4 text-[#8A5A00]" />
                Nilai Stok: {formatRupiah(totalNilaiInventaris)}
              </span>
            </div>
          </div>

          {/* Kartu bahan miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">GUDANG</span>
            <span className="h-2 rounded bg-krim-garis" />
            <span className="h-2 w-[70%] rounded bg-krim-garis" />
            <span className="h-2 w-[85%] rounded bg-krim-garis" />
          </div>

          {/* Dapi menyembul keluar */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* 4 Status Flow Stats Card (Identik Desain Card PO & Tagihan) */}
        <div data-tour="bahan-status-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_CARDS.map(st => {
            const active = filterStatus === st.key
            const count = allCount[st.key]

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setFilterStatus(st.key)}
                className={clsx(
                  'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col justify-between min-h-[145px] transition-all cursor-pointer hover:-translate-y-0.5',
                  active
                    ? clsx(st.on, 'shadow-[0_18px_30px_rgba(43,34,28,0.22)]')
                    : clsx(st.tint, 'text-kopi shadow-[0_6px_14px_rgba(120,80,30,0.08)]')
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'absolute -right-10 -bottom-12 h-36 w-36 rounded-full',
                    active ? 'bg-white/20' : 'bg-white/55'
                  )}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm sm:text-base font-extrabold">{st.label}</span>
                  <span
                    className={clsx(
                      'h-9 w-9 rounded-full flex items-center justify-center',
                      active ? 'bg-white/30' : 'bg-white/60'
                    )}
                  >
                    <st.Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="relative pt-1 min-w-0">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight leading-none font-mono">
                    {count}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-current/10">
                    <p className={clsx('text-xs font-bold whitespace-nowrap', active ? 'opacity-90' : 'text-kopi-muted')}>
                      Bahan Masak
                    </p>
                    <span className={clsx('text-[11px] truncate', active ? 'opacity-75' : 'text-kopi-muted/80')}>
                      {st.hint}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filter Bar (Tabs, Search, dan Tombol Tambah Bahan) */}
        <div data-tour="bahan-filter-bar">
          <BahanFilterBar
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            search={search}
            onSearchChange={setSearch}
            counts={allCount}
            onOpenAdd={openAdd}
          />
        </div>

        {/* Loading State or Card Grid */}
        {loading ? (
          <CardGridSkeleton count={6} cardHeight="h-72" />
        ) : (
          <div data-tour="bahan-card-grid">
            <BahanCard
              list={list}
              getStockCondition={getStockCondition}
              onEdit={openEdit}
              onDelete={openDeleteConfirm}
              onOpenAdd={openAdd}
              onUpdateHarga={handleUpdateHarga}
              checkingId={checkingId}
            />
          </div>
        )}
      </main>

      {/* Modal Tambah / Edit Bahan */}
      <BahanModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveBahan}
        editingBahan={editing}
        suppliers={suppliers}
      />

      {/* Custom Modal Konfirmasi Hapus Bahan */}
      <DeleteBahanModal
        isOpen={Boolean(deleteTarget)}
        bahan={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        usedInMenus={usedInMenus}
      />
    </div>
  )
}
