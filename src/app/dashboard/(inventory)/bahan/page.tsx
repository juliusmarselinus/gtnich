'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
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
} from 'lucide-react'
import clsx from 'clsx'

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
      // 1. Cek keterkaitan resep menu masakan TERLEBIH DAHULU sebelum modal dibuka
      const usage = await checkBahanUsage(b.id)
      setUsedInMenus(usage.menuNames)
      // 2. Buka modal SETELAH data keterkaitan sudah pasti terisi
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

  // Headline dinamis berdasarkan stok
  const heroStatus = useMemo(() => {
    if (allCount.habis > 0) {
      return {
        title: `${allCount.habis} bahan habis perlu belanja`,
        subtitle: 'Segera lakukan restock agar menu masakan tidak terhambat.',
        mood: 'khawatir' as const,
      }
    }
    if (allCount.rendah > 0) {
      return {
        title: `${allCount.rendah} bahan menipis mendekati batas aman`,
        subtitle: 'Periksa daftar bahan bertanda peringatan di bawah.',
        mood: 'khawatir' as const,
      }
    }
    return {
      title: 'Semua persediaan bahan dapur aman',
      subtitle: 'Stok bahan baku terpantau mencukupi untuk operasional masak.',
      mood: 'senang' as const,
    }
  }, [allCount])

  const STAT_CARDS = [
    {
      key: 'all' as FilterStatus,
      label: 'Total Bahan',
      count: allCount.all,
      unit: 'item',
      icon: Package,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FFB800] bg-[#FFFBF2]',
    },
    {
      key: 'ok' as FilterStatus,
      label: 'Stok Aman',
      count: allCount.ok,
      unit: 'bahan',
      icon: CheckCircle2,
      iconBg: 'bg-[#E8F5E4] text-[#2D7A1F]',
      activeRing: 'ring-2 ring-[#228B5B] bg-[#F4FAF2]',
    },
    {
      key: 'rendah' as FilterStatus,
      label: 'Perlu Restock',
      count: allCount.rendah,
      unit: 'bahan',
      icon: AlertTriangle,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FF9A1F] bg-[#FFF9EC]',
    },
    {
      key: 'habis' as FilterStatus,
      label: 'Stok Habis',
      count: allCount.habis,
      unit: 'bahan',
      icon: XCircle,
      iconBg: 'bg-[#FDE8E4] text-[#D8431F]',
      activeRing: 'ring-2 ring-[#D8431F] bg-[#FEF4F2]',
    },
  ]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Data Bahan Baku"
        subtitle="Kelola persediaan bahan, satuan, harga beli, dan batas aman stok dapur secara real-time"
      />

      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Hero Section dengan Maskot Dapi */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[180px] shadow-xs">
          <div className="absolute right-48 top-5 w-16 h-16 rounded-full bg-[#FF7A59] hidden md:block opacity-80" />
          <div className="absolute right-36 top-16 w-28 h-8 rounded-full bg-white/90 hidden md:block" />

          {/* Maskot Dapi */}
          <div className="absolute right-4 sm:right-8 bottom-0 pointer-events-none">
            <DapiMascot
              width={150}
              mood={heroStatus.mood}
              className="translate-y-6 drop-shadow-xs"
            />
          </div>

          <div className="relative space-y-3 pr-28 sm:pr-48">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#2B1D00]/10 flex items-center justify-center text-[#2B1D00]">
                <Boxes className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Gudang & Persediaan
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D00] tracking-tight leading-tight">
              {heroStatus.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#4D3300] font-medium max-w-xl">
              {heroStatus.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#2B1D00] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#228B5B]" />
                {allCount.all} bahan aktif
              </span>

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                Nilai stok {formatRupiah(totalNilaiInventaris)}
              </span>

              {allCount.rendah + allCount.habis > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D8431F] text-white px-3 py-1.5 text-xs font-bold shadow-xs">
                  <AlertTriangle className="w-3 h-3" />
                  {allCount.rendah + allCount.habis} perlu tindakan
                </span>
              )}
            </div>
          </div>
        </section>

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

        {/* 4 Kartu Metrik Persediaan (Bisa Diklik Sebagai Filter) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            const isSelected = filterStatus === card.key

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setFilterStatus(card.key)}
                className={clsx(
                  'p-4 rounded-[24px] bg-white border border-[#EBE3D7]/80 text-left transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(140,100,30,0.05)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(140,100,30,0.09)] flex items-center justify-between gap-3',
                  isSelected && card.activeRing
                )}
              >
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                    {card.count}{' '}
                    <span className="text-xs font-semibold text-slate-400 font-normal">
                      {card.unit}
                    </span>
                  </p>
                </div>
                <div
                  className={clsx(
                    'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0',
                    card.iconBg
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Filter Bar (Tabs, Search, dan Tombol Tambah Bahan) */}
        <BahanFilterBar
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          search={search}
          onSearchChange={setSearch}
          counts={allCount}
          onOpenAdd={openAdd}
        />

        {/* Loading State or Card Grid */}
        {loading ? (
          <div className="bg-white rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)] border border-[#EBE3D7]/80 py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-7 h-7 animate-spin text-[#FFB800]" />
            <p className="text-xs font-semibold text-slate-600">
              Memuat data bahan dari database...
            </p>
          </div>
        ) : (
          <BahanCard
            list={list}
            getStockCondition={getStockCondition}
            onEdit={openEdit}
            onDelete={openDeleteConfirm}
            onOpenAdd={openAdd}
            onUpdateHarga={handleUpdateHarga}
            checkingId={checkingId}
          />
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
