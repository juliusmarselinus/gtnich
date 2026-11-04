'use client'

import { useState, useMemo, Fragment } from 'react'
import { PurchaseOrder, POStatus } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, PackageCheck, Clock, FileCheck } from 'lucide-react'
import clsx from 'clsx'
import Pagination from '@/components/ui/Pagination'

const STATUS_CONFIG: Record<POStatus, { label: string; cls: string; nextStatus?: POStatus; nextLabel?: string }> = {
  draft: { label: 'Draft', cls: 'bg-[#FFEDB3] text-kuning-teks', nextStatus: 'dikirim', nextLabel: 'Kirim ke Supplier' },
  dikirim: { label: 'Dikirim', cls: 'bg-[#F2D9CC] text-[#C2502F]', nextStatus: 'diterima', nextLabel: 'Konfirmasi Terima Barang (+Stok)' },
  diterima: { label: 'Diterima', cls: 'bg-[#E2EBC0] text-[#5E7420]' },
  tagihan: { label: 'Tagihan', cls: 'bg-[#E3DCF3] text-[#6B5BB5]' },
}

const AVATAR_BG = ['bg-kuning-batang', 'bg-koral-muda', 'bg-[#E2EBC0]', 'bg-[#E3DCF3]', 'bg-krim']

function initialOf(name: string) {
  const clean = name.replace(/^(PT|CV|UD|Toko|Pasar)\.?\s+/i, '').trim()
  return (clean[0] || '?').toUpperCase()
}

interface POTableProps {
  list: PurchaseOrder[]
  onUpdateStatus: (id: string, newStatus: POStatus) => Promise<void>
  onRequestVerifyTerima?: (po: PurchaseOrder) => void
}

export default function POTable({
  list,
  onUpdateStatus,
  onRequestVerifyTerima,
}: POTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return list.slice(start, start + PAGE_SIZE)
  }, [list, currentPage])

  const handleAction = async (po: PurchaseOrder, nextStatus: POStatus) => {
    if (nextStatus === 'diterima') {
      // Jika ada handler modal verifikasi penerimaan, buka modal verifikasi
      if (onRequestVerifyTerima) {
        onRequestVerifyTerima(po)
        return
      }
    }
    setLoadingActionId(po.id)
    try {
      await onUpdateStatus(po.id, nextStatus)
    } finally {
      setLoadingActionId(null)
    }
  }

  return (
    <div className="rounded-[32px] bg-white p-2 sm:p-3 shadow-[0_14px_34px_rgba(120,80,30,0.10)]">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[760px] border-separate border-spacing-y-2">
          <thead>
            <tr className="whitespace-nowrap">
              <th className="text-left px-5 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                No. Pembelian & Tanggal
              </th>
              <th className="text-left px-5 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Supplier / Asal Beli
              </th>
              <th className="text-center px-4 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Status
              </th>
              <th className="text-right px-5 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Total
              </th>
              <th className="px-5 pt-3 pb-1 text-right font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Aksi & Rincian
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((po, idx) => {
              const cfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft
              const exp = expandedId === po.id
              const isProcessing = loadingActionId === po.id
              const supplierName = po.namaSupplier || 'Tanpa Supplier (Beli Langsung)'
              const rowBg = exp ? 'bg-kuning-pucat' : 'bg-[#FAF7F2] group-hover:bg-kuning-pucat'
              const edge = exp ? 'border-y-2 border-kuning-batang' : 'border-y-2 border-transparent'

              return (
                <Fragment key={po.id}>
                  <tr className="group transition-colors">
                    <td className={clsx('px-5 py-4 whitespace-nowrap rounded-l-3xl border-l-2', rowBg, edge, exp ? 'border-l-kuning-batang' : 'border-l-transparent', exp && 'rounded-bl-none')}>
                      <p className="font-black text-kopi text-sm">{po.noPO}</p>
                      <span className="text-[11px] text-kopi-muted block mt-0.5">
                        {po.tanggalBuat}
                      </span>
                      {po.catatan && (
                        <p className="text-[11px] text-kopi-muted mt-1 max-w-[260px] break-words whitespace-normal leading-tight" title={po.catatan}>
                          Catatan: {po.catatan}
                        </p>
                      )}
                    </td>

                    <td className={clsx('px-5 py-4', rowBg, edge)}>
                      <div className="flex items-center gap-3">
                        <span className={clsx('flex-shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center text-sm font-black text-kopi', AVATAR_BG[idx % AVATAR_BG.length])}>
                          {initialOf(supplierName)}
                        </span>
                        <div>
                          <p className="font-bold text-kopi text-sm leading-snug break-words max-w-[220px]">
                            {supplierName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-kopi-muted border border-krim-garis">
                              {po.items.length} jenis bahan
                            </span>
                            {po.items.slice(0, 2).map((item, itmIdx) => (
                              <span key={itmIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-kuning/20 text-[#6B4E00]">
                                {item.namaBahan} ({item.qty} {item.satuan})
                              </span>
                            ))}
                            {po.items.length > 2 && (
                              <span className="text-[10px] text-kopi-muted">
                                +{po.items.length - 2} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className={clsx('px-4 py-4 text-center whitespace-nowrap', rowBg, edge)}>
                      <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold', cfg.cls)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </td>

                    <td className={clsx('px-5 py-4 text-right font-black text-kopi text-sm whitespace-nowrap', rowBg, edge)}>
                      {formatRupiah(po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi)}
                    </td>

                    <td className={clsx('px-5 py-4 text-right whitespace-nowrap rounded-r-3xl border-r-2', rowBg, edge, exp ? 'border-r-kuning-batang' : 'border-r-transparent', exp && 'rounded-br-none')}>
                      <div className="flex items-center justify-end gap-2">
                        {cfg.nextStatus ? (
                          <button
                            onClick={() => handleAction(po, cfg.nextStatus!)}
                            disabled={isProcessing}
                            className={clsx(
                              'h-10 px-4 rounded-full font-bold text-xs transition-all duration-150 disabled:opacity-50 cursor-pointer whitespace-nowrap shadow-[0_6px_14px_rgba(43,34,28,0.15)] hover:-translate-y-0.5 active:scale-95',
                              cfg.nextStatus === 'diterima'
                                ? 'bg-[#C2502F] text-white hover:bg-[#a63f22]'
                                : 'bg-kopi text-white hover:bg-black'
                            )}
                          >
                            {isProcessing ? 'Memproses...' : cfg.nextLabel}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-[#5E7420] flex items-center gap-1">
                            <FileCheck className="w-4 h-4" /> Selesai
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedId(exp ? null : po.id)}
                          className={clsx(
                            'h-10 w-10 rounded-full cursor-pointer inline-flex items-center justify-center transition-all duration-200 active:scale-90',
                            exp ? 'bg-kuning text-kopi' : 'bg-white text-kopi-muted hover:text-kopi shadow-[0_3px_10px_rgba(120,80,30,0.08)]'
                          )}
                          title={exp ? 'Tutup rincian' : 'Lihat rincian bahan'}
                        >
                          <div className={clsx('transition-transform duration-200', exp && 'rotate-180')}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Detail expand */}
                  {exp && (
                    <tr key={`${po.id}-detail`} className="animate-in fade-in-0 duration-200">
                      <td colSpan={5} className="px-4 pb-4 pt-1 bg-kuning-pucat rounded-b-3xl border-2 border-t-0 border-kuning-batang">
                        <div className="rounded-2xl bg-white p-4 shadow-2xs">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-bold text-kopi-muted uppercase tracking-wider">
                              Detail Item Bahan Yang Dipesan
                            </p>
                            {po.tanggalTerima && (
                              <span className="text-[11px] text-[#5E7420] font-bold">
                                ✓ Diterima pada {new Date(po.tanggalTerima).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {po.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-2xl bg-[#FAF7F2] px-4 py-3 transition-all duration-150 hover:translate-x-1"
                              >
                                <div>
                                  <p className="text-sm font-bold text-kopi">{item.namaBahan}</p>
                                  <p className="text-[11px] text-kopi-muted mt-0.5">
                                    {item.qty} {item.satuan} × {formatRupiah(item.hargaEstimasi)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-kopi">
                                    {formatRupiah(item.qty * item.hargaEstimasi)}
                                  </p>
                                  <span
                                    className={clsx(
                                      'text-[11px] font-bold flex items-center gap-1 justify-end mt-0.5',
                                      item.diterima ? 'text-[#5E7420]' : 'text-[#C2502F]'
                                    )}
                                  >
                                    {item.diterima ? (
                                      <>
                                        <PackageCheck className="w-3 h-3" /> Stok Ditambahkan (+{item.qty})
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3 h-3" /> Menunggu Barang Datang
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {list.length === 0 && (
        <div className="text-center py-12 text-kopi-muted text-sm font-medium">
          Belum ada data Pembelian Stok di database.
        </div>
      )}

      <div className="p-3 border-t border-krim-garis/50 bg-[#FCFAF6] rounded-b-[28px]">
        <Pagination
          currentPage={currentPage}
          totalItems={list.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="pesanan pembelian (PO)"
        />
      </div>
    </div>
  )
}
