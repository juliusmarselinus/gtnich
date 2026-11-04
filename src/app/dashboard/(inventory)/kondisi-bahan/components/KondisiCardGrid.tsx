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
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  Trash2,
  Hourglass,
  Tag,
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
    cls: 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]',
    icon: ShieldCheck,
  },
  mendekati_expire: {
    label: 'Segera Olah (< 3 Hari)',
    cls: 'bg-[#FFF6D6] text-[#8A5A00] border-[#FFE49A]',
    icon: AlertTriangle,
  },
  kadaluarsa: {
    label: 'Ada Batch Kadaluarsa',
    cls: 'bg-[#FDE8E4] text-[#D8431F] border-[#F9C2B8]',
    icon: ShieldAlert,
  },
  sudah_dimusnahkan: {
    label: 'Sudah Dimusnahkan',
    cls: 'bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]',
    icon: ShieldCheck,
  },
  tidak_diketahui: {
    label: 'Belum Dianalisis',
    cls: 'bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]',
    icon: Clock,
  },
}

export default function KondisiCardGrid({ list, onKurangiStok, onRefresh }: KondisiCardGridProps) {
  // State untuk expand/collapse rincian batch per card bahan
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  // State untuk modal pengurangan stok kadaluarsa
  const [selectedBahanForAction, setSelectedBahanForAction] = useState<BahanKondisi | null>(null)
  const [selectedBatchForAction, setSelectedBatchForAction] = useState<BatchMasukItem | null>(null)

  // Catat ID bahan/batch yang telah dimusnahkan secara lokal (optimistic update seketika)
  const [dimusnahkanMap, setDimusnahkanMap] = useState<Record<string, boolean>>({})

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

  const handleSuccessAction = (bahanId: string, batchNo?: number) => {
    setDimusnahkanMap(prev => ({
      ...prev,
      [`bahan-${bahanId}`]: true,
      ...(batchNo ? { [`batch-${bahanId}-${batchNo}`]: true } : {}),
    }))
    // Otomatis refresh data terbaru dari backend
    if (onRefresh) {
      setTimeout(() => {
        onRefresh()
      }, 300)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {list.map(b => {
        const isLocallyDimusnahkan = !!dimusnahkanMap[`bahan-${b.id}`]
        const effectiveExpiredCount = isLocallyDimusnahkan ? 0 : b.expiredBatchesCount
        const isBahanEmpty = b.totalStok <= 0

        const isLowStock = b.totalStok <= b.stokMinimum
        const pct = b.stokMinimum > 0 ? Math.min(100, (b.totalStok / (b.stokMinimum * 3)) * 100) : 100
        const isExpanded = !!expandedCards[b.id]

        const hasDestroyedBatches = b.batches.some(bt => bt.isDibuang) || isLocallyDimusnahkan
        const rawFreshnessKey =
          isLocallyDimusnahkan || (isBahanEmpty && (b.aiStatusFreshness === 'kadaluarsa' || hasDestroyedBatches))
            ? 'sudah_dimusnahkan'
            : effectiveExpiredCount === 0 && (b.aiStatusFreshness === 'kadaluarsa' || hasDestroyedBatches)
            ? hasDestroyedBatches && (isBahanEmpty || b.batches.every(bt => bt.isDibuang))
              ? 'sudah_dimusnahkan'
              : 'segar'
            : b.aiStatusFreshness

        const freshness = rawFreshnessKey ? FRESHNESS_BADGE[rawFreshnessKey] : FRESHNESS_BADGE.tidak_diketahui
        const FreshIcon = freshness.icon

        const effectiveSisaHari =
          isLocallyDimusnahkan || isBahanEmpty
            ? null
            : b.aiSisaHari !== null && b.aiSisaHari !== undefined && b.aiSisaHari <= 0 && effectiveExpiredCount === 0
            ? null
            : b.aiSisaHari

        const tglExpireStr =
          isLocallyDimusnahkan || isBahanEmpty
            ? '-'
            : b.aiEstimasiExpire
            ? new Date(b.aiEstimasiExpire).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '-'

        return (
          <div
            key={b.id}
            className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-xs p-5 sm:p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              {/* Header Bahan & Badge Freshness AI */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF6D6] border border-[#FFE49A]/60 flex items-center justify-center flex-shrink-0 text-[#8A5A00] font-extrabold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#2B261F] group-hover:text-[#FF6B00] transition-colors">
                      {b.nama}
                    </p>
                    <p className="text-[10px] text-[#8C8275] font-mono mt-0.5">
                      {b.code || b.id.slice(0, 8)} • {b.batches.length} Batch Masuk
                    </p>
                  </div>
                </div>

                <span
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 shadow-xs',
                    freshness.cls
                  )}
                >
                  <FreshIcon className="w-3.5 h-3.5" />
                  {freshness.label}
                </span>
              </div>

              {/* Status Peringatan Batch Kadaluarsa & Action Pengurangan di Card ini */}
              {effectiveExpiredCount > 0 && !isBahanEmpty && (
                <div className="p-3.5 rounded-2xl bg-[#FEF4F2] border border-[#F9C2B8] text-[#D8431F] text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#D8431F] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-[#8F220B] leading-tight">
                        Peringatan Kadaluarsa Dapur
                      </p>
                      <p className="text-[11px] text-[#A6351B] mt-0.5 font-medium leading-normal">
                        Terdapat <strong>{effectiveExpiredCount} batch belanja</strong> bahan ini yang telah melewati batas aman simpan dan berisiko menurunkan mutu masakan.
                      </p>
                    </div>
                  </div>

                  {onKurangiStok && (
                    <button
                      type="button"
                      onClick={() => handleOpenKurangiModal(b)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#D8431F] to-[#B32B0D] hover:brightness-105 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Proses Pengurangan Stok ({effectiveExpiredCount} Batch Expire)</span>
                    </button>
                  )}
                </div>
              )}

              {/* AI Shelf-life Prediction Box Ringkasan Batch Terdekat */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#F0EBE1] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-[#7A7062] flex items-center gap-1">
                    <Hourglass className="w-3.5 h-3.5 text-[#FF8F2B]" /> Expire Batch Terdekat:
                  </span>
                  <span className="font-mono font-bold text-[#2B261F]">
                    {tglExpireStr}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#8C8275] font-medium">Batas Waktu Penggunaan:</span>
                  <span
                    className={clsx(
                      'font-mono font-black text-xs px-2.5 py-0.5 rounded-lg',
                      effectiveSisaHari !== null && effectiveSisaHari !== undefined
                        ? effectiveSisaHari <= 0
                          ? 'bg-[#FDE8E4] text-[#D8431F]'
                          : effectiveSisaHari <= 3
                          ? 'bg-[#FFF6D6] text-[#8A5A00]'
                          : 'bg-[#E8F5E4] text-[#2D7A1F]'
                        : 'text-[#8C8275]'
                    )}
                  >
                    {effectiveSisaHari !== null && effectiveSisaHari !== undefined
                      ? effectiveSisaHari <= 0
                        ? 'Sudah Kadaluarsa'
                        : `${effectiveSisaHari} Hari Lagi`
                      : '-'}
                  </span>
                </div>

                {b.aiAnalysis?.tipsPenyimpanan && (
                  <p className="text-[10px] text-[#7A7062] italic pt-1 border-t border-[#F0EBE1]">
                    💡 {b.aiAnalysis.tipsPenyimpanan}
                  </p>
                )}
              </div>

              {/* Level Total Stok Bahan Saat Ini */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-[#8C8275] font-bold uppercase tracking-wider">
                  <span>Total Persediaan Dapur</span>
                  <span className={clsx(isLowStock ? 'text-[#D8431F] font-extrabold' : 'text-[#2B261F] font-bold')}>
                    {b.totalStok} / min. {b.stokMinimum} {b.satuan}
                  </span>
                </div>
                <div className="h-2 bg-[#F5F2EB] p-0.5 rounded-full overflow-hidden border border-[#EBE6DC]">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      isLowStock ? 'bg-[#D8431F]' : 'bg-[#FF8F2B]'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Bagian Rincian Penomoran Batch Barang Masuk */}
              <div className="pt-2 border-t border-[#F0EBE1]">
                <button
                  type="button"
                  onClick={() => toggleExpand(b.id)}
                  className="w-full py-2 px-3 rounded-xl bg-[#FCFAF6] hover:bg-[#FFF9EC] text-[#7A7062] hover:text-[#2B261F] text-[11px] font-bold flex items-center justify-between transition-colors border border-[#F0EBE1] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#FF8F2B]" />
                    <span>Rincian {b.batches.length} Batch Masuk ({b.expiredBatchesCount} Expire)</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Dropdown Card Rincian Batch */}
                {isExpanded && (
                  <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto pr-1 animate-in fade-in-50 duration-150">
                    {b.batches.map(batch => {
                      const isBatchDibuang =
                        batch.isDibuang ||
                        isLocallyDimusnahkan ||
                        isBahanEmpty ||
                        !!dimusnahkanMap[`batch-${b.id}-${batch.batchNo}`]

                      const isBatchExpired = batch.isExpired && !isBatchDibuang

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
                            isBatchDibuang
                              ? 'bg-[#F5F2EB] border-[#EBE6DC] text-[#8C8275] opacity-75'
                              : isBatchExpired
                              ? 'bg-[#FEF4F2] border-[#F9C2B8] text-[#D8431F]'
                              : 'bg-white border-[#EBE6DC] text-[#2B261F]'
                          )}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={clsx(
                                  'w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono',
                                  isBatchDibuang ? 'bg-[#EBE6DC] text-[#7A7062]' : 'bg-[#FFF6D6] text-[#8A5A00] font-bold'
                                )}
                              >
                                #{batch.batchNo}
                              </span>
                              <span className={clsx(isBatchDibuang && 'line-through text-[#8C8275]')}>
                                {batch.sumberMasuk}
                              </span>
                            </span>
                            <span className={clsx('font-mono text-[11px]', isBatchDibuang && 'text-[#8C8275] line-through')}>
                              +{batch.batchQty} {b.satuan}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10.5px] text-[#8C8275] pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#A69C8E]" /> Masuk: {tglBatchMasuk}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={clsx(
                                  'font-bold font-mono px-1.5 py-0.5 rounded text-[10px]',
                                  isBatchDibuang
                                    ? 'bg-[#EBE6DC] text-[#7A7062]'
                                    : isBatchExpired
                                    ? 'bg-[#FDE8E4] text-[#D8431F]'
                                    : batch.aiSisaHari !== null && batch.aiSisaHari !== undefined && batch.aiSisaHari <= 3
                                    ? 'bg-[#FFF6D6] text-[#8A5A00]'
                                    : 'bg-[#E8F5E4] text-[#2D7A1F]'
                                )}
                              >
                                {isBatchDibuang
                                  ? 'Dimusnahkan'
                                  : isBatchExpired
                                  ? 'Kadaluarsa'
                                  : `Exp: ${tglBatchExpire} (${batch.aiSisaHari ?? '-'} hr)`}
                              </span>

                              {isBatchExpired && !isBatchDibuang && onKurangiStok && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleOpenKurangiModal(b, batch)
                                  }}
                                  title="Musnahkan stok batch kadaluarsa ini"
                                  className="px-2 py-0.5 rounded-lg bg-[#D8431F] hover:bg-[#B32B0D] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  <span>Musnahkan</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {batch.nomorReferensi && (
                            <p className="text-[10px] text-[#A69C8E] font-mono truncate">
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
            <div className="flex items-center justify-between gap-2 text-xs text-[#8C8275] pt-3 border-t border-[#F0EBE1] font-medium mt-2">
              <span className="font-mono whitespace-nowrap text-[#2B261F] font-bold">
                {formatRupiah(b.hargaPerSatuan)}/{b.satuan}
              </span>
              <span className="text-right text-[11px] text-[#8C8275] font-medium truncate flex items-center gap-1" title={b.namaSupplier}>
                <Tag className="w-3 h-3 text-[#FF8F2B] flex-shrink-0" />
                <span className="truncate">{b.namaSupplier || 'Supplier Umum'}</span>
              </span>
            </div>
          </div>
        )
      })}

      {list.length === 0 && (
        <div className="col-span-full rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs p-16 text-center text-[#8C8275] text-sm font-medium">
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
            handleSuccessAction(selectedBahanForAction.id, selectedBatchForAction?.batchNo)
          }}
          onProcess={onKurangiStok}
        />
      )}
    </div>
  )
}
