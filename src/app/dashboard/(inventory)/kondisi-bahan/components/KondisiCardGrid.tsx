'use client'

import { useState } from 'react'
import { BahanKondisi, BatchMasukItem } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import {
  Package,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  Trash2,
  AlertOctagon,
} from 'lucide-react'
import clsx from 'clsx'
import KurangiStokModal from './KurangiStokModal'

interface KondisiCardGridProps {
  list: BahanKondisi[]
  onKurangiStok?: (params: {
    bahanId: string
    jumlah: number
    alasan: string
    nomorBatch?: number
  }) => Promise<void>
  onRefresh?: () => void
}

const FRESHNESS_BADGE = {
  segar: {
    label: 'Segar & Aman',
    cls: 'bg-[#FFF6EC] text-[#FF8F2B] border-[#FFE2C2]',
    icon: ShieldCheck,
  },
  mendekati_expire: {
    label: 'Segera Olah (Exp < 3 Hari)',
    cls: 'bg-amber-50 text-amber-700 border-amber-200/50',
    icon: AlertTriangle,
  },
  kadaluarsa: {
    label: 'Ada Batch Kadaluarsa',
    cls: 'bg-rose-50 text-rose-700 border-rose-200/50',
    icon: ShieldAlert,
  },
  tidak_diketahui: {
    label: 'Belum Dianalisis',
    cls: 'bg-slate-100 text-slate-600',
    icon: Clock,
  },
}

export default function KondisiCardGrid({ list, onKurangiStok, onRefresh }: KondisiCardGridProps) {
  // State untuk expand/collapse rincian batch per card bahan
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  // State untuk modal pengurangan stok kadaluarsa
  const [selectedBahanForAction, setSelectedBahanForAction] = useState<BahanKondisi | null>(null)
  const [selectedBatchForAction, setSelectedBatchForAction] = useState<BatchMasukItem | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleOpenKurangiModal = (bahan: BahanKondisi, batch?: BatchMasukItem) => {
    setSelectedBahanForAction(bahan)
    setSelectedBatchForAction(batch || null)
  }

  const handleCloseKurangiModal = () => {
    setSelectedBahanForAction(null)
    setSelectedBatchForAction(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {list.map(b => {
        const isLowStock = b.totalStok <= b.stokMinimum
        const pct = b.stokMinimum > 0 ? Math.min(100, (b.totalStok / (b.stokMinimum * 3)) * 100) : 100
        const isExpanded = !!expandedCards[b.id]

        const freshness = b.aiStatusFreshness ? FRESHNESS_BADGE[b.aiStatusFreshness] : FRESHNESS_BADGE.tidak_diketahui
        const FreshIcon = freshness.icon

        const tglExpireStr = b.aiEstimasiExpire
          ? new Date(b.aiEstimasiExpire).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-'

        return (
          <div key={b.id} className="clay-card p-6 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header Bahan & Badge Freshness AI */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF6EC] border border-[#FFE2C2] flex items-center justify-center clay-pill flex-shrink-0 text-[#FF8F2B]">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{b.nama}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {b.code || b.id.slice(0, 8)} • {b.batches.length} Batch Masuk
                    </p>
                  </div>
                </div>

                <span
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold clay-pill border flex-shrink-0',
                    freshness.cls
                  )}
                >
                  <FreshIcon className="w-3.5 h-3.5" />
                  {freshness.label}
                </span>
              </div>

              {/* Status Peringatan Batch Kadaluarsa & Action Pengurangan di Card ini */}
              {b.expiredBatchesCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-rose-900 leading-tight">
                        Peringatan Kadaluarsa Dapur
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5 font-medium leading-normal">
                        Terdapat <strong>{b.expiredBatchesCount} batch belanja</strong> bahan ini yang telah melewati batas aman simpan dan berisiko menurunkan mutu masakan.
                      </p>
                    </div>
                  </div>

                  {onKurangiStok && (
                    <button
                      type="button"
                      onClick={() => handleOpenKurangiModal(b)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Proses Pengurangan Stok ({b.expiredBatchesCount} Batch Expire)</span>
                    </button>
                  )}
                </div>
              )}

              {/* AI Shelf-life Prediction Box Ringkasan Batch Terdekat */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFFBF5] to-slate-50 border border-[#F2E3D0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF8F2B]" /> Expire Batch Terdekat:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {tglExpireStr}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Batas Waktu Penggunaan:</span>
                  <span
                    className={clsx(
                      'font-mono font-black text-xs px-2.5 py-0.5 rounded-lg',
                      b.aiSisaHari !== null && b.aiSisaHari !== undefined
                        ? b.aiSisaHari <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : b.aiSisaHari <= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#FFF6EC] text-[#FF8F2B]'
                        : 'text-slate-400'
                    )}
                  >
                    {b.aiSisaHari !== null && b.aiSisaHari !== undefined
                      ? b.aiSisaHari <= 0
                        ? 'Sudah Kadaluarsa'
                        : `${b.aiSisaHari} Hari Lagi`
                      : '-'}
                  </span>
                </div>

                {b.aiAnalysis?.tipsPenyimpanan && (
                  <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/50">
                    💡 {b.aiAnalysis.tipsPenyimpanan}
                  </p>
                )}
              </div>

              {/* Level Total Stok Bahan Saat Ini */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Total Persediaan Dapur</span>
                  <span className={clsx(isLowStock ? 'text-rose-500 font-extrabold' : 'text-slate-700 font-bold')}>
                    {b.totalStok} / min. {b.stokMinimum} {b.satuan}
                  </span>
                </div>
                <div className="h-2 clay-inset p-0.5 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      isLowStock ? 'bg-rose-500' : 'bg-[#FF8F2B]'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Bagian Rincian Penomoran Batch Barang Masuk (PO / Mutasi) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleExpand(b.id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-[#FFF6EC]/50 text-slate-600 hover:text-slate-800 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#FF8F2B]" />
                    <span>Rincian {b.batches.length} Batch Masuk ({b.expiredBatchesCount} Expire)</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Dropdown Card Rincian Batch (Dalam 1 Card yang Sama) */}
                {isExpanded && (
                  <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto pr-1 animate-in fade-in-50 duration-150">
                    {b.batches.map(batch => {
                      const tglBatchMasuk = new Date(batch.tanggalMasuk).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                      const tglBatchExpire = batch.aiEstimasiExpire
                        ? new Date(batch.aiEstimasiExpire).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                          })
                        : '-'

                      return (
                        <div
                          key={batch.batchId}
                          className={clsx(
                            'p-2.5 rounded-xl border text-xs space-y-1 transition-colors',
                            batch.isExpired
                              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                              : 'bg-white border-slate-200/80 text-slate-700'
                          )}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono">
                                #{batch.batchNo}
                              </span>
                              <span>{batch.sumberMasuk}</span>
                            </span>
                            <span className="font-mono text-[11px]">
                              +{batch.batchQty} {b.satuan}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" /> Masuk: {tglBatchMasuk}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={clsx(
                                  'font-bold font-mono px-1.5 py-0.2 rounded text-[10px]',
                                  batch.isExpired
                                    ? 'bg-rose-200 text-rose-800'
                                    : batch.aiSisaHari !== null && batch.aiSisaHari !== undefined && batch.aiSisaHari <= 3
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-50 text-emerald-700'
                                )}
                              >
                                {batch.isExpired ? 'Sudah Expire' : `Exp: ${tglBatchExpire} (${batch.aiSisaHari ?? '-'} hari)`}
                              </span>

                              {batch.isExpired && onKurangiStok && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleOpenKurangiModal(b, batch)
                                  }}
                                  title="Kurangi stok batch kadaluarsa ini"
                                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  <span>Kurangi</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {batch.nomorReferensi && (
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              Ref: {batch.nomorReferensi}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Harga & Supplier */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100 font-medium mt-2">
              <span className="font-mono whitespace-nowrap">{formatRupiah(b.hargaPerSatuan)}/{b.satuan}</span>
              <span className="text-right text-[11px] text-slate-400 font-medium truncate" title={b.namaSupplier}>
                {b.namaSupplier}
              </span>
            </div>
          </div>
        )
      })}

      {list.length === 0 && (
        <div className="col-span-full clay-card py-16 text-center text-slate-400 text-sm font-medium">
          Tidak ada bahan yang sesuai filter.
        </div>
      )}

      {/* Modal Pengurangan Stok Bahan Kadaluarsa */}
      {selectedBahanForAction && onKurangiStok && (
        <KurangiStokModal
          isOpen={!!selectedBahanForAction}
          bahan={selectedBahanForAction}
          batch={selectedBatchForAction}
          onClose={handleCloseKurangiModal}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
          onProcess={onKurangiStok}
        />
      )}
    </div>
  )
}
