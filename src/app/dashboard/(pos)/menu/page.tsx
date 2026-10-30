'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import MenuCardGrid from './components/MenuCardGrid'
import MenuModal from './components/MenuModal'
import { useMenu } from './hooks/useMenu'
import { MenuItem } from './types'
import { Plus, Search, Loader2, AlertCircle, RefreshCw, LogIn } from 'lucide-react'
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
    saveMenu,
    deleteMenu,
    refresh,
  } = useMenu()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
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

  function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus menu ini beserta seluruh resepnya dari database?')) {
      deleteMenu(id)
    }
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Menu & Resep Masakan"
        subtitle="Kelola menu masakan, takaran komposisi bahan baku resep, estimasi HPP riil, dan margin laba langsung di PostgreSQL Supabase"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
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

        {/* Action Header: Search, Category Filter & Tambah Menu */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                categoryFilter === 'all'
                  ? 'clay-btn-primary shadow-sm'
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              Semua ({rawCount})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  categoryFilter === cat
                    ? 'clay-btn-primary shadow-sm'
                    : 'clay-btn text-slate-600 hover:text-slate-900'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama menu / kategori..."
                className="w-full pl-10 pr-4 py-2 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={openAdd}
              className="clay-btn-primary flex items-center gap-2 px-5 py-2 text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Menu Baru
            </button>
          </div>
        </div>

        {/* Loading Spinner or Grid Cards */}
        {loading ? (
          <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF8F2B]" />
            <p className="text-xs font-semibold">Mengambil daftar menu dan komposisi resep dari database Supabase...</p>
          </div>
        ) : (
          <MenuCardGrid
            list={list}
            onEdit={openEdit}
            onDelete={handleDelete}
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
    </div>
  )
}
