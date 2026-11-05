'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiHead from '@/components/ui/DapiHead'
import SupplierFilterBar from './components/SupplierFilterBar'
import SupplierTable from './components/SupplierTable'
import SupplierModal from './components/SupplierModal'
import { useSuppliers } from './hooks/useSuppliers'
import { Supplier } from './types'
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  LogIn,
  Truck,
  Building2,
  CheckCircle2,
  Tags,
  Plus,
} from 'lucide-react'
import clsx from 'clsx'
import { useToast } from '@/context/ToastContext'
import { TableSkeleton } from '@/components/ui/Skeleton'

const STATUS_CARDS = [
  {
    key: 'all' as const,
    label: 'Total Supplier',
    hint: 'Semua rekanan distributor',
    Icon: Building2,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'with_orders' as const,
    label: 'Aktif Memasok',
    hint: 'Ada riwayat pengiriman PO',
    Icon: CheckCircle2,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
  {
    key: 'categories' as const,
    label: 'Kategori Bahan',
    hint: 'Spesialisasi pengadaan',
    Icon: Tags,
    tint: 'bg-[#F2D9CC]',
    on: 'bg-[#C2502F] text-white',
  },
] as const

export default function SuppliersPage() {
  const {
    list,
    categories,
    totalCount,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    saveSupplier,
    deleteSupplier,
    refresh,
  } = useSuppliers()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const toast = useToast()

  function openAdd() {
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(s: Supplier) {
    setEditing(s)
    setShowModal(true)
  }

  const handleSaveSupplierWithToast = async (id: string | null, form: any) => {
    try {
      await saveSupplier(id, form)
      toast.success(
        id ? 'Supplier Berhasil Diperbarui' : 'Supplier Berhasil Ditambahkan',
        `Kemitraan supplier "${form.nama}" tersimpan.`
      )
    } catch (err: any) {
      toast.error('Gagal Menyimpan Supplier', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  async function handleDelete(id: string) {
    const target = list.find(s => s.id === id)
    const namaSupplier = target ? target.nama : 'Supplier'
    if (confirm(`Yakin ingin menghapus ${namaSupplier} dari database?`)) {
      try {
        await deleteSupplier(id)
        toast.success('Supplier Dihapus', `${namaSupplier} telah dihapus dari daftar.`)
      } catch (err: any) {
        toast.error('Gagal Menghapus Supplier', err.message || 'Terjadi kesalahan sistem')
      }
    }
  }

  // Summary Metrics
  const supplierWithOrders = list.filter(s => s.riwayat && s.riwayat.length > 0).length
  const totalCategories = categories.length

  // Filtered List based on Category Pill
  const filteredList = list.filter(item => {
    if (filterCategory === 'all') return true
    if (filterCategory === 'with_orders') return (item.riwayat?.length || 0) > 0
    return item.kategoriNama === filterCategory
  })

  // Hero Status
  const heroStatus = {
    mood: (totalCount > 0 ? 'senang' : 'khawatir') as 'senang' | 'khawatir',
    title:
      totalCount > 0
        ? `${totalCount} Toko Langganan & Supplier Terdaftar`
        : 'Belum Ada Supplier Terdaftar',
    subtitle:
      totalCount > 0
        ? `Daftar toko langganan belanja bahan baku dapur Anda, terbagi dalam ${totalCategories} kategori.`
        : 'Mulai daftarkan toko langganan atau pedagang pasar agar belanja bahan dapur lebih mudah dan cepat.',
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Daftar Supplier & Toko Pasar"
        subtitle="Simpan nomor kontak toko langganan, jadwal belanja, dan riwayat pesanan bahan"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk membaca dan menyimpan data supplier.
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

        {/* Notifikasi Error */}
        {error && userEmail && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refresh()}
              className="font-bold underline flex items-center gap-1 hover:text-rose-900 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Muat ulang
            </button>
          </div>
        )}

        {/* Banner utama: Dapi keluar dari kotak */}
        <section className="relative mt-10 sm:mt-12 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-6 sm:p-10 md:max-w-[58%]">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-kopi">
              {heroStatus.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              {heroStatus.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <button
                data-tour="supplier-add-btn"
                onClick={openAdd}
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 flex-shrink-0" /> Tambah Supplier Baru
              </button>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Mitra Terdaftar:</span>
                <span className="font-mono font-black text-kopi">{totalCount}</span>
              </div>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Aktif Pasok:</span>
                <span className="font-mono font-black text-[#7F9A2E]">{supplierWithOrders}</span>
              </div>
            </div>
          </div>

          {/* Kartu mitra miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">MITRA</span>
            <span className="h-2 rounded bg-krim-garis" />
            <span className="h-2 w-[70%] rounded bg-krim-garis" />
            <span className="h-2 w-[85%] rounded bg-krim-garis" />
          </div>

          {/* Dapi menyembul keluar dari atas kotak */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* Status Flow Stats Card Identik PO */}
        <div data-tour="supplier-status-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATUS_CARDS.map(st => {
            const active =
              st.key === 'all'
                ? filterCategory === 'all'
                : st.key === 'with_orders'
                ? filterCategory === 'with_orders'
                : false
            const val =
              st.key === 'all'
                ? totalCount
                : st.key === 'with_orders'
                ? supplierWithOrders
                : totalCategories

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => {
                  if (st.key === 'all') setFilterCategory('all')
                  else if (st.key === 'with_orders')
                    setFilterCategory(filterCategory === 'with_orders' ? 'all' : 'with_orders')
                }}
                className={clsx(
                  'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col gap-4 min-h-[140px] transition-all cursor-pointer hover:-translate-y-0.5',
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
                <div className="relative">
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none">
                    {val}
                  </p>
                  <p className={clsx('text-xs mt-1.5 truncate', active ? 'opacity-85' : 'text-kopi-muted')}>
                    {st.hint}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filter Bar & Aksi Tambah */}
        <div data-tour="supplier-filter-bar">
          <SupplierFilterBar
            search={search}
            onSearchChange={setSearch}
            totalCount={totalCount}
            onOpenAdd={openAdd}
            categories={categories}
            activeCategory={filterCategory}
            onSelectCategory={setFilterCategory}
          />
        </div>

        {/* Loading / Table Card Container */}
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <div data-tour="supplier-table">
            <SupplierTable
              list={filteredList}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      {/* Modal Tambah / Edit */}
      <SupplierModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSupplierWithToast}
        editingSupplier={editing}
        categories={categories}
      />
    </div>
  )
}
