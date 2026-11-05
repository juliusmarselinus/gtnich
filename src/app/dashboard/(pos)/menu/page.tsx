'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiHead from '@/components/ui/DapiHead'
import MenuCardGrid from './components/MenuCardGrid'
import MenuModal from './components/MenuModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import { useMenu } from './hooks/useMenu'
import { MenuItem, MenuFilterStatus } from './types'
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
  UtensilsCrossed,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'
import clsx from 'clsx'
import { useToast } from '@/context/ToastContext'
import { CardGridSkeleton } from '@/components/ui/Skeleton'

const STATUS_CARDS = [
  {
    key: 'all' as MenuFilterStatus,
    label: 'Total Menu',
    hint: 'Semua hidangan terdaftar',
    Icon: UtensilsCrossed,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'healthy' as MenuFilterStatus,
    label: 'Margin Sehat',
    hint: 'Margin laba ≥ 40%',
    Icon: TrendingUp,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
  {
    key: 'has_recipe' as MenuFilterStatus,
    label: 'Resep Lengkap',
    hint: 'Komposisi bahan terdata',
    Icon: CheckCircle2,
    tint: 'bg-[#F2D9CC]',
    on: 'bg-[#C2502F] text-white',
  },
  {
    key: 'need_recipe' as MenuFilterStatus,
    label: 'Perlu Resep',
    hint: 'Belum ada HPP / racikan',
    Icon: AlertTriangle,
    tint: 'bg-[#FDE8E4]',
    on: 'bg-[#D8431F] text-white',
  },
] as const

export default function MenuPage() {
  const {
    list,
    rawCount,
    bahanList,
    categories,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    stats,
    saveMenu,
    deleteMenu,
    refresh,
  } = useMenu()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [deletingMenu, setDeletingMenu] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const searchParams = useSearchParams()

  // Buka modal otomatis jika datang dari navigasi ?tambah=1
  useEffect(() => {
    if (searchParams.get('tambah') === '1') {
      setEditing(null)
      setShowModal(true)
    }
  }, [searchParams])

  function openAdd() {
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(m: MenuItem) {
    setEditing(m)
    setShowModal(true)
  }

  function openDelete(m: MenuItem) {
    setDeletingMenu(m)
  }

  const toast = useToast()

  const handleSaveMenuWithToast = async (id: string | null, form: any) => {
    try {
      await saveMenu(id, form)
      toast.success(
        id ? 'Menu Berhasil Diperbarui' : 'Menu Berhasil Ditambahkan',
        `Hidangan "${form.nama}" siap disajikan dan dipantau HPP-nya.`
      )
    } catch (err: any) {
      toast.error('Gagal Menyimpan Menu', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  async function handleConfirmDelete() {
    if (!deletingMenu) return
    const namaMenu = deletingMenu.nama
    setIsDeleting(true)
    try {
      await deleteMenu(deletingMenu.id)
      setDeletingMenu(null)
      toast.success('Menu Dihapus', `Menu "${namaMenu}" telah dihapus dari daftar.`)
    } catch (err: any) {
      console.error('Delete menu error:', err)
      toast.error('Gagal Menghapus Menu', err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsDeleting(false)
    }
  }

  // Headline hero dinamis berdasarkan kelengkapan resep dan margin laba
  const heroStatus = useMemo(() => {
    if (stats.needRecipe > 0) {
      return {
        title: `${stats.needRecipe} menu belum memiliki resep HPP`,
        subtitle: 'Lengkapi takaran bahan agar HPP riil dan margin laba akurat terpantau otomatis.',
        mood: 'khawatir' as const,
      }
    }
    if (stats.total > 0 && stats.healthy < stats.total) {
      return {
        title: 'Komposisi resep menu terdata lengkap',
        subtitle: `Margin laba rata-rata dapur Anda mencapai ${stats.avgMargin.toFixed(0)}%. Siap produksi!`,
        mood: 'senang' as const,
      }
    }
    return {
      title: 'Semua resep masakan terpantau prima',
      subtitle: 'Seluruh menu memiliki takaran resep dan margin laba yang sehat untuk bisnis kuliner Anda.',
      mood: 'senang' as const,
    }
  }, [stats])

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Menu & Resep Dapur"
        subtitle="Atur takaran resep, hitung modal per porsi (HPP), dan tentukan harga jual menu"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk mengelola menu dan resep.
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
          <div className="p-4 rounded-2xl bg-[#FDE8E4] border border-[#FAD3CB] flex items-center justify-between text-[#B3361B] text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refresh()}
              className="font-bold underline flex items-center gap-1 hover:text-[#8D2811] cursor-pointer"
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
              {stats.needRecipe > 0 ? `${stats.needRecipe} Menu Belum Ada Resep` : 'Menu & Resep Masakan'}
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              {heroStatus.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <button
                onClick={openAdd}
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 flex-shrink-0" /> Tambah Menu Baru
              </button>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Rata-rata Margin:</span>
                <span className="font-mono font-black text-[#7F9A2E]">{stats.avgMargin.toFixed(0)}%</span>
              </div>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Resep Terisi:</span>
                <span className="font-mono font-black text-kopi">{stats.hasRecipe}/{stats.total}</span>
              </div>
            </div>
          </div>

          {/* Kartu resep miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">RESEP</span>
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
        <div data-tour="menu-status-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_CARDS.map(st => {
            const active = statusFilter === st.key
            const count =
              st.key === 'all'
                ? stats.total
                : st.key === 'healthy'
                ? stats.healthy
                : st.key === 'has_recipe'
                ? stats.hasRecipe
                : stats.needRecipe

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setStatusFilter(statusFilter === st.key ? 'all' : st.key)}
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
                    {count}
                  </p>
                  <p className={clsx('text-xs mt-1.5 truncate', active ? 'opacity-85' : 'text-kopi-muted')}>
                    {st.hint}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Action Header: Search, Category Filter Pill Bar & Tambah Menu */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE6DC] shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama hidangan, kategori, SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FFB800]/70 transition shadow-2xs"
              />
            </div>

            {/* Tambah Menu Button */}
            <button
              data-tour="menu-add-btn"
              onClick={openAdd}
              className="px-5 py-2.5 rounded-full bg-[#D8431F] hover:bg-[#c03917] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu Baru</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => setCategoryFilter('all')}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap',
                categoryFilter === 'all'
                  ? 'bg-[#2B1D00] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
              )}
            >
              Semua Kategori ({rawCount})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap',
                  categoryFilter === cat
                    ? 'bg-[#2B1D00] text-white shadow-xs'
                    : 'bg-[#F7F5F0] text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Loading Skeleton or Grid Cards */}
        {loading ? (
          <CardGridSkeleton count={6} cardHeight="h-80" />
        ) : (
          <div data-tour="menu-grid">
            <MenuCardGrid
              list={list}
              bahanList={bahanList}
              onEdit={openEdit}
              onDelete={openDelete}
              onOpenAdd={openAdd}
            />
          </div>
        )}
      </main>

      {/* Modal Tambah / Edit */}
      <MenuModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveMenuWithToast}
        editingMenu={editing}
        bahanList={bahanList}
        onRefreshBahan={refresh}
      />

      {/* Modal Konfirmasi Hapus Menu */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingMenu)}
        menu={deletingMenu}
        onClose={() => setDeletingMenu(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
