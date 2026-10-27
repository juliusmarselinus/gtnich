'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import BahanFilterBar from './components/BahanFilterBar'
import BahanTable from './components/BahanTable'
import BahanModal from './components/BahanModal'
import { useBahan } from './hooks/useBahan'
import { Bahan } from './types'
import { Loader2, RefreshCw, AlertCircle, LogIn, Database } from 'lucide-react'

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
    saveBahan,
    deleteBahan,
    refresh,
  } = useBahan()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Bahan | null>(null)

  function openAdd() {
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(b: Bahan) {
    setEditing(b)
    setShowModal(true)
  }

  function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus bahan ini dari database?')) {
      deleteBahan(id)
    }
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Data Bahan Baku"
        subtitle="Kelola persediaan bahan, satuan, harga per satuan, dan batas aman stok secara langsung di PostgreSQL Supabase"
      />

      <main className="p-8 space-y-6 max-w-6xl mx-auto">
        {/* Banner Status Akun / Sesi */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk membaca dan menyimpan data ke database.
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
              className="font-bold underline flex items-center gap-1 hover:text-rose-900"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Muat ulang
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <BahanFilterBar
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          search={search}
          onSearchChange={setSearch}
          counts={allCount}
          onOpenAdd={openAdd}
        />

        {/* Loading State or Table */}
        {loading ? (
          <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Mengambil data bahan dari database Supabase...</p>
          </div>
        ) : (
          <BahanTable
            list={list}
            getStockCondition={getStockCondition}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Modal Tambah / Edit */}
      <BahanModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveBahan}
        editingBahan={editing}
        suppliers={suppliers}
      />
    </div>
  )
}
