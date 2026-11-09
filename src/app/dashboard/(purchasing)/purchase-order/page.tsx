'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Topbar from '@/components/Topbar'
import POTable from './components/POTable'
import POWizardModal from './components/POWizardModal'
import VerifyPenerimaanModal from './components/VerifyPenerimaanModal'
import AIRekomendasiModal from './components/AIRekomendasiModal'
import { usePurchaseOrder } from './hooks/usePurchaseOrder'
import { PurchaseOrder, AIPORekomendasiItem, CreatePOInput } from './types'
import { Plus, Search, Loader2, AlertCircle, RefreshCw, LogIn, ReceiptText, SlidersHorizontal, ScanLine, PencilLine, Truck, PackageCheck, Wallet, Bot } from 'lucide-react'
import clsx from 'clsx'
import DapiHead from '@/components/ui/DapiHead'
import { useToast } from '@/context/ToastContext'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { getKemasanPasarFallback } from './utils/kemasanPasar'

const STATUS_CARDS = [
  { key: 'draft', label: 'Draft', hint: 'Belum dikirim ke supplier', Icon: PencilLine, tint: 'bg-[#FFEDB3]', on: 'bg-kuning text-kopi' },
  { key: 'dikirim', label: 'Dikirim', hint: 'Menunggu barang datang', Icon: Truck, tint: 'bg-[#F2D9CC]', on: 'bg-[#C2502F] text-white' },
  { key: 'diterima', label: 'Diterima', hint: 'Stok sudah masuk', Icon: PackageCheck, tint: 'bg-[#E2EBC0]', on: 'bg-[#7F9A2E] text-white' },
  { key: 'tagihan', label: 'Tagihan', hint: 'Menunggu pembayaran', Icon: Wallet, tint: 'bg-[#E3DCF3]', on: 'bg-[#6B5BB5] text-white' },
] as const

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

  const toast = useToast()

  const handleCreatePOWithToast = async (input: CreatePOInput) => {
    try {
      await createPO(input)
      toast.success(
        'Purchase Order Berhasil Dibuat',
        `PO untuk ${input.namaSupplier || 'Supplier'} siap diproses.`
      )
    } catch (err: any) {
      toast.error('Gagal Membuat PO', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  const handleUpdateStatusWithToast = async (poId: string, newStatus: any) => {
    try {
      await updateStatus(poId, newStatus)
      const statusLabel =
        newStatus === 'dikirim'
          ? 'Dikirim ke Supplier'
          : newStatus === 'diterima'
          ? 'Diterima'
          : newStatus === 'tagihan'
          ? 'Masuk ke Tagihan'
          : newStatus
      toast.success('Status PO Diperbarui', `Status PO berhasil diubah menjadi "${statusLabel}".`)
    } catch (err: any) {
      toast.error('Gagal Memperbarui Status', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  const handleVerifyPenerimaanWithToast = async (input: any) => {
    try {
      await verifyPenerimaan(input)
      toast.success(
        'Barang Diterima & Stok Bertambah',
        'Stok bahan baku dapur telah otomatis diperbarui sesuai kuantitas aktual.'
      )
    } catch (err: any) {
      toast.error('Gagal Verifikasi Barang', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

  const [showWizard, setShowWizard] = useState(false)
  const [verifyingPO, setVerifyingPO] = useState<PurchaseOrder | null>(null)
  const searchParams = useSearchParams()

  // State Rekomendasi Cerdas AI
  const [showAIModal, setShowAIModal] = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const [aiItems, setAiItems] = useState<AIPORekomendasiItem[]>([])

  // State untuk mengisi form PO otomatis dari rekomendasi
  const [wizardPreload, setWizardPreload] = useState<{
    items: CreatePOInput['items']
    catatan: string
    supplierId: string
  } | null>(null)

  // Buka modal secara langsung jika diarahkan dengan query ?buat=1 atau ?action=create
  // Otomatis pre-load bahan yang stoknya menipis/kritis sebagai item rekomendasi pembelian
  useEffect(() => {
    if (searchParams.get('buat') === '1' || searchParams.get('action') === 'create') {
      if (loading) return // Tunggu bahanList selesai dimuat

      // Filter bahan yang stoknya di bawah atau sama dengan stok minimum (atau stok <= 0)
      const lowStockBahan = bahanList.filter(b => {
        const min = b.stokMinimum ?? 5
        return b.stok <= min
      })

      // Jika tidak ada yang menipis secara kritis, ambil bahan stok terendah
      const targetBahanList = lowStockBahan.length > 0 ? lowStockBahan : bahanList.slice(0, 3)

      if (targetBahanList.length > 0) {
        const autoItems: CreatePOInput['items'] = targetBahanList.map(b => {
          const fallback = getKemasanPasarFallback(b.nama, b.satuan, b.hargaPerSatuan)
          const min = b.stokMinimum ?? 5
          const rawNeed = (min * 2) - b.stok
          const targetQty = Math.max(
            fallback.minQtyBeli,
            Math.ceil(Math.max(1, rawNeed) / fallback.isiKemasan) * fallback.isiKemasan
          )

          return {
            bahanId: b.id,
            namaBahan: b.nama,
            satuan: b.satuan,
            qty: targetQty,
            hargaEstimasi: b.hargaPerSatuan,
            stokSebelum: b.stok,
          }
        })

        // Tentukan supplier dominan jika ada
        const dominantSupplierId =
          targetBahanList.find(b => b.supplierId)?.supplierId || (suppliers[0]?.id || '')

        setWizardPreload({
          items: autoItems,
          catatan: `Pemesanan restock otomatis: ${autoItems.length} bahan dipesan berdasarkan rekomendasi stok menipis operasional dapur.`,
          supplierId: dominantSupplierId,
        })
      } else {
        setWizardPreload(null)
      }

      setShowWizard(true)
    }
  }, [searchParams, loading, bahanList, suppliers])

  const handleFetchAIRekomendasi = async () => {
    setShowAIModal(true)
    setLoadingAI(true)
    try {
      const res = await fetch('/dashboard/purchase-order/api/ai-rekomendasi', {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success && data.data) {
        setAiSummary(data.data.summary || '')
        setAiItems(data.data.items || [])
      } else {
        setAiSummary('Gagal mendapatkan rekomendasi: ' + (data.error || 'Terjadi kesalahan'))
        setAiItems([])
      }
    } catch (e: any) {
      setAiSummary('Gagal memuat rekomendasi AI: ' + (e.message || 'Koneksi terputus'))
      setAiItems([])
    } finally {
      setLoadingAI(false)
    }
  }

  const handleApplyAIRekomendasi = (selectedItems: CreatePOInput['items'], notes: string) => {
    // Cari supplier dominan jika ada
    const matchedSuppliers = selectedItems
      .map(item => {
        const found = bahanList.find(b => b.id === item.bahanId)
        return found
      })
      .filter(Boolean)

    // Tentukan supplier yang cocok jika mayoritas sama
    let dominantSupplierId = ''
    if (suppliers.length > 0) {
      // Prioritaskan supplier pertama yang relevan jika ada
      dominantSupplierId = suppliers[0]?.id || ''
    }

    setWizardPreload({
      items: selectedItems,
      catatan: notes,
      supplierId: dominantSupplierId,
    })

    setShowAIModal(false)
    setShowWizard(true)
  }

  const handleOpenManualWizard = () => {
    setWizardPreload(null)
    setShowWizard(true)
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Belanja Stok Bahan (PO)"
        subtitle="Rencana belanja bahan ke pasar atau supplier, cek barang saat datang, dan catat nota tagihan"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
        {/* Banner Akun / Sesi Belum Login */}
        {!userEmail && !loading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Anda belum login ke Supabase Auth. Silakan login terlebih dahulu untuk mengelola Pembelian Stok.
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

          <div className="relative flex flex-col gap-3 p-5 sm:p-8 md:p-10 md:max-w-[58%]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-kopi">Pembelian Stok</h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              Pesan bahan ke supplier, cek barang datang, dan pantau tagihan di satu tempat.
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <button
                data-tour="po-create-btn"
                onClick={handleOpenManualWizard}
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 flex-shrink-0" /> Buat Pembelian Stok Baru
              </button>
              <button
                onClick={handleFetchAIRekomendasi}
                className="h-11 px-5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                <Bot className="w-4 h-4 flex-shrink-0" /> Rekomendasi Restock AI
              </button>
              <Link
                href="/dashboard/tagihan"
                className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 hover:bg-white/80 active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                <ReceiptText className="w-4 h-4" /> Halaman Tagihan ({counts.tagihan})
              </Link>
              <Link
                href="/dashboard/ocr-nota"
                className="h-11 px-5 rounded-full border-2 border-kopi text-kopi text-sm font-bold flex items-center gap-2 hover:bg-kopi/5 active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                <ScanLine className="w-4 h-4" /> Foto Nota
              </Link>
            </div>
          </div>

          {/* Kartu nota miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">NOTA</span>
            <span className="h-2 rounded bg-krim-garis" />
            <span className="h-2 w-[70%] rounded bg-krim-garis" />
            <span className="h-2 w-[85%] rounded bg-krim-garis" />
          </div>

          {/* Dapi menyembul keluar dari atas kotak */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* Status Flow Stats Card */}
        <div data-tour="po-status-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_CARDS.map(st => {
            const active = statusFilter === st.key
            const count = counts[st.key as keyof typeof counts]
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setStatusFilter(statusFilter === st.key ? 'all' : st.key)}
                className={clsx(
                  'relative overflow-hidden rounded-[28px] p-5 text-left flex flex-col gap-4 min-h-[140px] transition-all duration-200 cursor-pointer hover:-translate-y-1 active:scale-95 group',
                  active
                    ? clsx(st.on, 'shadow-[0_18px_30px_rgba(43,34,28,0.22)] scale-[1.02]')
                    : clsx(st.tint, 'text-kopi shadow-[0_6px_14px_rgba(120,80,30,0.08)] hover:shadow-md')
                )}
              >
                <span aria-hidden className={clsx('absolute -right-10 -bottom-12 h-36 w-36 rounded-full transition-transform duration-300 group-hover:scale-110', active ? 'bg-white/20' : 'bg-white/55')} />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm sm:text-base font-extrabold">{st.label}</span>
                  <span className={clsx('h-9 w-9 rounded-full flex items-center justify-center transition-transform duration-200', active ? 'bg-white/30 scale-105' : 'bg-white/60 group-hover:scale-105')}>
                    <st.Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="relative">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight leading-none font-mono truncate">{count}</p>
                  <p className={clsx('text-xs mt-1.5 line-clamp-1', active ? 'opacity-85' : 'text-kopi-muted')}>{st.hint}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Search & Filter Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-kopi-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari no. PO, supplier, atau catatan..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-white text-sm text-kopi placeholder:text-kopi-muted/70 shadow-[0_4px_14px_rgba(120,80,30,0.08)] outline-none focus:ring-2 focus:ring-kuning"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none flex-nowrap">
            <span className="text-[11px] font-bold text-kopi-muted uppercase tracking-wider flex items-center gap-1.5 mr-1 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Status
            </span>
            {[
              { key: 'all', label: 'Semua Status', count: counts.all, on: 'bg-kopi text-white' },
              { key: 'draft', label: 'Draft', count: counts.draft, on: 'bg-kuning text-kopi' },
              { key: 'dikirim', label: 'Dikirim', count: counts.dikirim, on: 'bg-[#C2502F] text-white' },
              { key: 'diterima', label: 'Diterima', count: counts.diterima, on: 'bg-[#7F9A2E] text-white' },
              { key: 'tagihan', label: 'Tagihan', count: counts.tagihan, on: 'bg-[#6B5BB5] text-white' },
            ].map(f => {
              const isActive = statusFilter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={clsx(
                    'h-10 pl-4 pr-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-2 active:scale-95 flex-shrink-0 whitespace-nowrap',
                    isActive
                      ? clsx(f.on, 'shadow-[0_8px_16px_rgba(43,34,28,0.18)] scale-105')
                      : 'bg-white text-kopi shadow-[0_3px_10px_rgba(120,80,30,0.08)] hover:-translate-y-0.5'
                  )}
                >
                  <span>{f.label}</span>
                  <span
                    className={clsx(
                      'min-w-[26px] h-[26px] px-1.5 rounded-full flex items-center justify-center text-[11px]',
                      isActive ? 'bg-white/30' : 'bg-krim'
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
          <TableSkeleton rows={6} cols={5} />
        ) : (
          <div data-tour="po-table">
            <POTable
              list={list}
              onUpdateStatus={handleUpdateStatusWithToast}
              onRequestVerifyTerima={po => setVerifyingPO(po)}
            />
          </div>
        )}
      </main>

      {/* Wizard Modal */}
      <POWizardModal
        isOpen={showWizard}
        onClose={() => {
          setShowWizard(false)
          setWizardPreload(null)
        }}
        onSave={handleCreatePOWithToast}
        suppliers={suppliers}
        bahanList={bahanList}
        initialItems={wizardPreload?.items}
        initialCatatan={wizardPreload?.catatan}
        initialSupplierId={wizardPreload?.supplierId}
        initialStep={wizardPreload && wizardPreload.items.length > 0 ? 2 : 1}
        onSupplierCreated={() => refresh()}
        onBahanCreated={() => refresh()}
      />

      {/* Modal Rekomendasi Restock AI */}
      <AIRekomendasiModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        loading={loadingAI}
        summary={aiSummary}
        items={aiItems}
        onApplyRecommendation={handleApplyAIRekomendasi}
        onRefreshRecommendation={handleFetchAIRekomendasi}
      />

      {/* Modal Verifikasi Penerimaan Barang */}
      <VerifyPenerimaanModal
        isOpen={!!verifyingPO}
        onClose={() => setVerifyingPO(null)}
        po={verifyingPO}
        onConfirm={handleVerifyPenerimaanWithToast}
      />
    </div>
  )
}
