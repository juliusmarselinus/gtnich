'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
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
} from 'lucide-react'
import clsx from 'clsx'

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

  async function handleConfirmDelete() {
    if (!deletingMenu) return
    setIsDeleting(true)
    try {
      await deleteMenu(deletingMenu.id)
      setDeletingMenu(null)
    } catch (err) {
      console.error('Delete menu error:', err)
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

  const STAT_CARDS = [
    {
      key: 'all' as MenuFilterStatus,
      label: 'Total Menu',
      count: stats.total,
      unit: 'menu',
      icon: UtensilsCrossed,
      iconBg: 'bg-[#FFF6D6] text-[#8A5A00]',
      activeRing: 'ring-2 ring-[#FFB800] bg-[#FFFBF2]',
    },
    {
      key: 'healthy' as MenuFilterStatus,
      label: 'Margin Sehat (≥40%)',
      count: stats.healthy,
      unit: 'menu',
      icon: TrendingUp,
      iconBg: 'bg-[#E8F5E4] text-[#2D7A1F]',
      activeRing: 'ring-2 ring-[#228B5B] bg-[#F4FAF2]',
    },
    {
      key: 'has_recipe' as MenuFilterStatus,
      label: 'Resep Lengkap',
      count: stats.hasRecipe,
      unit: 'menu',
      icon: CheckCircle2,
      iconBg: 'bg-[#E0F2FE] text-[#0369A1]',
      activeRing: 'ring-2 ring-[#0284C7] bg-[#F0F9FF]',
    },
    {
      key: 'need_recipe' as MenuFilterStatus,
      label: 'Perlu Resep / HPP',
      count: stats.needRecipe,
      unit: 'menu',
      icon: AlertTriangle,
      iconBg: 'bg-[#FDE8E4] text-[#D8431F]',
      activeRing: 'ring-2 ring-[#D8431F] bg-[#FEF4F2]',
    },
  ]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Menu & Resep Masakan"
        subtitle="Kelola hidangan, komposisi takaran bahan baku resep, estimasi HPP riil, dan margin laba real-time"
      />

      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
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

        {/* Hero Section dengan Maskot Dapi */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[180px] shadow-xs">
          <div className="absolute right-48 top-5 w-16 h-16 rounded-full bg-[#FF7A59] hidden md:block opacity-80" />
          <div className="absolute right-80 bottom-2 w-10 h-10 rounded-full bg-[#FFE17D] hidden md:block" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[#2B1D00] text-xs font-bold mb-3">
              <span>{heroStatus.mood === 'senang' ? 'Dapur Terkendali' : 'Perhatian Resep'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2B1D00] tracking-tight leading-tight">
              {heroStatus.title}
            </h2>
            <p className="text-sm font-medium text-[#2B1D00]/85 mt-2 max-w-md">
              {heroStatus.subtitle}
            </p>

            {/* Quick Hero Metrics */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-[#2B1D00]">
              <div className="px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-xs">
                <span>Total: </span>
                <span className="font-black">{stats.total} Menu</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-xs">
                <span>Rata-rata Margin: </span>
                <span className="font-black">{stats.avgMargin.toFixed(0)}%</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-xs">
                <span>Resep Lengkap: </span>
                <span className="font-black">{stats.hasRecipe} Hidangan</span>
              </div>
            </div>
          </div>

          {/* Maskot Dapi peeking */}
          <div className="absolute -bottom-2 -right-4 sm:right-2 md:right-8 w-40 sm:w-48 md:w-56 pointer-events-none select-none">
            <DapiMascot mood={heroStatus.mood} className="w-full h-auto drop-shadow-md" />
          </div>
        </section>

        {/* 4 Interactive Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            const isActive = statusFilter === card.key
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setStatusFilter(card.key)}
                className={clsx(
                  'flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left cursor-pointer hover:shadow-sm',
                  isActive
                    ? card.activeRing
                    : 'bg-white border-[#EBE6DC] hover:border-[#FFB800]/50'
                )}
              >
                <div
                  className={clsx(
                    'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs',
                    card.iconBg
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {card.label}
                  </p>
                  <p className="text-xl font-black text-[#2B1D00] mt-0.5">
                    {card.count}{' '}
                    <span className="text-xs font-semibold text-slate-400 font-sans">
                      {card.unit}
                    </span>
                  </p>
                </div>
              </button>
            )
          })}
        </section>

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

        {/* Loading Spinner or Grid Cards */}
        {loading ? (
          <div className="rounded-[28px] bg-white border border-[#EBE6DC] py-20 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#FFB800]" />
            <p className="text-xs font-bold text-slate-600">
              Mengambil daftar menu dan komposisi resep dari database Supabase...
            </p>
          </div>
        ) : (
          <MenuCardGrid
            list={list}
            bahanList={bahanList}
            onEdit={openEdit}
            onDelete={openDelete}
            onOpenAdd={openAdd}
          />
        )}
      </main>

      {/* Modal Tambah / Edit */}
      <MenuModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveMenu}
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
