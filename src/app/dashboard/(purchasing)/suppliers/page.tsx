'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
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
} from 'lucide-react'
import { useToast } from '@/context/ToastContext'

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
        ? `${totalCount} Mitra Distributor Terhubung`
        : 'Belum Ada Mitra Distributor',
    subtitle:
      totalCount > 0
        ? `Jaringan rantai pasok dapur terpusat. Tersebar dalam ${totalCategories} kategori pengadaan bahan baku.`
        : 'Mulai daftarkan rekanan supplier dan pedagang pasar agar pencatatan Purchase Order lebih tertib.',
  }

  const STAT_CARDS = [
    {
      key: 'all' as const,
      label: 'Total Supplier',
      value: totalCount,
      unit: 'mitra',
      hint: 'Semua rekanan distributor',
      icon: Building2,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FFB800] bg-[#FFFBF2]',
    },
    {
      key: 'with_orders' as const,
      label: 'Aktif Memasok',
      value: supplierWithOrders,
      unit: 'mitra',
      hint: 'Ada riwayat pengiriman PO',
      icon: CheckCircle2,
      iconBg: 'bg-[#E8F5E4] text-[#2D7A1F]',
      activeRing: 'ring-2 ring-[#228B5B] bg-[#F4FAF2]',
    },
    {
      key: 'categories' as const,
      label: 'Kategori Bahan',
      value: totalCategories,
      unit: 'kategori',
      hint: 'Spesialisasi pengadaan',
      icon: Tags,
      iconBg: 'bg-[#FFF0E6] text-[#FF6B00]',
      activeRing: 'ring-2 ring-[#FF6B00] bg-[#FFF9F5]',
    },
  ]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Manajemen Supplier"
        subtitle="Kelola kemitraan distributor, kategori pasokan terpusat, dan riwayat pasokan bahan baku secara langsung di PostgreSQL Supabase"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
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
                <Truck className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Rantai Pasok & Distributor
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
                {totalCount} mitra terdaftar
              </span>

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                {supplierWithOrders} mitra aktif PO
              </span>

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                {totalCategories} ragam kategori pasokan
              </span>
            </div>
          </div>
        </section>

        {/* Stat Cards Ringkasan Interaktif */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            const isSelected =
              card.key === 'all'
                ? filterCategory === 'all'
                : card.key === 'with_orders'
                ? filterCategory === 'with_orders'
                : false

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  if (card.key === 'all') setFilterCategory('all')
                  else if (card.key === 'with_orders')
                    setFilterCategory(filterCategory === 'with_orders' ? 'all' : 'with_orders')
                }}
                className={`text-left p-4 sm:p-5 rounded-[22px] bg-white border border-[#EBE6DC] shadow-xs transition-all hover:shadow-md cursor-pointer ${
                  isSelected ? card.activeRing : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A7062]">
                    {card.label}
                  </span>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-[#8C8275]">{card.unit}</span>
                </div>
                <p className="text-[11px] text-[#A69C8E] mt-1.5 font-medium">{card.hint}</p>
              </button>
            )
          })}
        </div>

        {/* Filter Bar & Aksi Tambah */}
        <SupplierFilterBar
          search={search}
          onSearchChange={setSearch}
          totalCount={totalCount}
          onOpenAdd={openAdd}
          categories={categories}
          activeCategory={filterCategory}
          onSelectCategory={setFilterCategory}
        />

        {/* Loading / Table Card Container */}
        {loading ? (
          <div className="rounded-[32px] bg-white border border-[#EBE6DC] p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#FF6B00]" />
            <p className="text-xs font-semibold text-[#7A7062]">
              Mengambil data mitra supplier dari database...
            </p>
          </div>
        ) : (
          <SupplierTable
            list={filteredList}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
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
