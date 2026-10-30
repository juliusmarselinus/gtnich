'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import POTable from './components/POTable'
import POWizardModal from './components/POWizardModal'
import VerifyPenerimaanModal from './components/VerifyPenerimaanModal'
import { usePurchaseOrder } from './hooks/usePurchaseOrder'
import { PurchaseOrder } from './types'
import { Plus, Search, Loader2, AlertCircle, RefreshCw, LogIn, ReceiptText, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'

export default function PurchaseOrderPage() {
  const {
    list,
    suppliers,
    bahanList,
    counts,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    createPO,
    updateStatus,
    verifyPenerimaan,
    refresh,
  } = usePurchaseOrder()

  const [showWizard, setShowWizard] = useState(false)
  const [verifyingPO, setVerifyingPO] = useState<PurchaseOrder | null>(null)

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Purchase Order (PO)"
        subtitle="Buat PO bertahap: rancang pesanan, kirim ke supplier, verifikasi penerimaan barang (+stok otomatis), dan monitor tagihan"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk mengelola Purchase Order.
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

        {/* Status Flow Stats Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'draft', label: 'Draft', count: counts.draft, textCls: 'text-slate-800' },
            { key: 'dikirim', label: 'Dikirim', count: counts.dikirim, textCls: 'text-blue-600' },
            { key: 'diterima', label: 'Diterima', count: counts.diterima, textCls: 'text-[#FF8F2B]' },
            { key: 'tagihan', label: 'Tagihan', count: counts.tagihan, textCls: 'text-amber-600' },
          ].map(st => (
            <button
              key={st.key}
              type="button"
              onClick={() => setStatusFilter(statusFilter === st.key ? 'all' : st.key)}
              className={clsx(
                'clay-card p-5 text-center transition-all cursor-pointer',
                statusFilter === st.key ? 'ring-2 ring-[#FF8F2B] bg-[#FFF6EC]/40' : 'hover:scale-[1.02]'
              )}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{st.label}</p>
              <p className={clsx('text-3xl font-black font-mono', st.textCls)}>{st.count}</p>
            </button>
          ))}
        </div>

        {/* Action Header: Search, Filter Tabs & Tambah PO */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari no. PO, supplier, atau catatan..."
                className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/tagihan"
                className="clay-btn flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#FF8F2B] cursor-pointer transition-colors"
              >
                <ReceiptText className="w-4 h-4 text-amber-500" />
                <span>Halaman Tagihan ({counts.tagihan})</span>
              </Link>

              <button
                onClick={() => setShowWizard(true)}
                className="clay-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat PO Baru
              </button>
            </div>
          </div>

          {/* Filter Bar Alur PO */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Status:
            </span>
            {[
              { key: 'all', label: 'Semua Status', count: counts.all },
              { key: 'draft', label: 'Draft', count: counts.draft },
              { key: 'dikirim', label: 'Dikirim', count: counts.dikirim },
              { key: 'diterima', label: 'Diterima', count: counts.diterima },
              { key: 'tagihan', label: 'Tagihan', count: counts.tagihan },
            ].map(f => {
              const isActive = statusFilter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                    isActive
                      ? 'clay-btn-primary text-white shadow-sm'
                      : 'clay-btn text-slate-600 hover:text-slate-900 bg-white'
                  )}
                >
                  <span>{f.label}</span>
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading / PO List Table */}
        {loading ? (
          <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF8F2B]" />
            <p className="text-xs font-semibold">Mengambil data purchase order dari database Supabase...</p>
          </div>
        ) : (
          <POTable
            list={list}
            onUpdateStatus={updateStatus}
            onRequestVerifyTerima={po => setVerifyingPO(po)}
          />
        )}
      </main>

      {/* Wizard Modal */}
      <POWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={createPO}
        suppliers={suppliers}
        bahanList={bahanList}
      />

      {/* Modal Verifikasi Penerimaan Barang */}
      <VerifyPenerimaanModal
        isOpen={!!verifyingPO}
        onClose={() => setVerifyingPO(null)}
        po={verifyingPO}
        onConfirm={verifyPenerimaan}
      />
    </div>
  )
}
