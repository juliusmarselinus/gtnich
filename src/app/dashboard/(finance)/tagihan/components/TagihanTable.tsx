'use client'

import { useState, useMemo } from 'react'
import { PurchaseOrder } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'
import Pagination from '@/components/ui/Pagination'

const AVATAR_BG = ['bg-kuning-batang', 'bg-koral-muda', 'bg-[#E2EBC0]', 'bg-[#E3DCF3]', 'bg-krim']

function initialOf(name: string) {
  const clean = name.replace(/^(PT|CV|UD|Toko|Pasar)\.?\s+/i, '').trim()
  return (clean[0] || '?').toUpperCase()
}

interface TagihanTableProps {
  list: PurchaseOrder[]
  onSelectDetail: (po: PurchaseOrder) => void
  onBayar: (po: PurchaseOrder) => void
}

export default function TagihanTable({
  list,
  onSelectDetail,
  onBayar,
}: TagihanTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return list.slice(start, start + PAGE_SIZE)
  }, [list, currentPage])

  // Fungsi utilitas hitung usia tagihan (hari belum pembayaran)
  const getOverdueInfo = (po: PurchaseOrder) => {
    const isLunas = po.catatan?.includes('[LUNAS') || false
    if (isLunas) return null

    const baseDateStr = po.tanggalTerima || po.tanggalBuat
    if (!baseDateStr) return null

    const baseTime = new Date(baseDateStr).getTime()
    if (isNaN(baseTime)) return null

    const diffDays = Math.floor((Date.now() - baseTime) / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) {
      return { text: 'Hari ini', isOverdue: false, days: 0 }
    } else if (diffDays === 1) {
      return { text: '1 hari lalu', isOverdue: false, days: 1 }
    } else if (diffDays >= 7) {
      return { text: `Belum bayar ${diffDays} hari`, isOverdue: true, days: diffDays }
    } else {
      return { text: `${diffDays} hari lalu`, isOverdue: false, days: diffDays }
    }
  }
  return (
    <div className="rounded-[32px] bg-white p-2 sm:p-3 shadow-[0_14px_34px_rgba(120,80,30,0.10)] overflow-hidden">
      {/* 1. TAMPILAN DESKTOP (Tabel Lebar Identik PO) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[780px] border-separate border-spacing-y-2">
          <thead>
            <tr className="whitespace-nowrap">
              <th className="text-left px-5 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                No. Tagihan / PO
              </th>
              <th className="text-left px-5 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Distributor / Supplier
              </th>
              <th className="text-left px-5 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Tgl Diterima
              </th>
              <th className="text-center px-4 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Status Pembayaran
              </th>
              <th className="text-right px-5 pt-3 pb-1 font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Total Tagihan Aktual
              </th>
              <th className="px-5 pt-3 pb-1 text-right font-bold text-kopi-muted/80 uppercase tracking-wider text-[11px]">
                Aksi & Tindakan
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((po, idx) => {
              const amount = po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi
              const isLunas = po.catatan?.includes('[LUNAS') || false
              const overdue = getOverdueInfo(po)
              const tglTerimaStr = po.tanggalTerima
                ? new Date(po.tanggalTerima).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : po.tanggalBuat
              const supplierName = po.namaSupplier || 'Tanpa Supplier (Beli Langsung)'

              return (
                <tr
                  key={po.id}
                  className="group transition-colors"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap rounded-l-3xl border-l-2 border-y-2 border-transparent bg-[#FAF7F2] group-hover:bg-kuning-pucat group-hover:border-kuning-batang/30">
                    <p className="font-black text-kopi text-xs sm:text-sm flex items-center gap-1.5 font-mono">
                      <FileText className="w-3.5 h-3.5 text-kopi-muted flex-shrink-0" />
                      {po.noPO}
                    </p>
                    <span className="text-[10px] text-kopi-muted block mt-0.5">
                      {po.items.length} item bahan dipesan
                    </span>
                  </td>

                  <td className="px-5 py-3.5 border-y-2 border-transparent bg-[#FAF7F2] group-hover:bg-kuning-pucat group-hover:border-kuning-batang/30">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={clsx(
                          'flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black text-kopi',
                          AVATAR_BG[idx % AVATAR_BG.length]
                        )}
                      >
                        {initialOf(supplierName)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-kopi text-xs sm:text-sm leading-snug truncate max-w-[180px] sm:max-w-[220px]" title={supplierName}>
                          {supplierName}
                        </p>
                        <span className="text-[10px] text-kopi-muted block mt-0.5">
                          Faktur Masuk
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-kopi-muted font-mono text-[11px] whitespace-nowrap border-y-2 border-transparent bg-[#FAF7F2] group-hover:bg-kuning-pucat group-hover:border-kuning-batang/30">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-kopi-muted" />
                      <span>{tglTerimaStr}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center whitespace-nowrap border-y-2 border-transparent bg-[#FAF7F2] group-hover:bg-kuning-pucat group-hover:border-kuning-batang/30">
                    {isLunas ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#E2EBC0] text-[#5E7420]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Terbayar
                      </span>
                    ) : (
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#F2D9CC] text-[#C2502F]">
                          <Clock className="w-3.5 h-3.5" /> Belum Dibayar
                        </span>
                        {overdue && (
                          <span
                            className={clsx(
                              'text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1',
                              overdue.isOverdue
                                ? 'bg-rose-100 text-rose-700 font-extrabold'
                                : 'bg-[#FFF0D4] text-[#8A5A00]'
                            )}
                          >
                            {overdue.isOverdue && <AlertTriangle className="w-2.5 h-2.5" />}
                            {overdue.text}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-right font-black text-kopi text-xs sm:text-sm whitespace-nowrap font-mono border-y-2 border-transparent bg-[#FAF7F2] group-hover:bg-kuning-pucat group-hover:border-kuning-batang/30">
                    {formatRupiah(amount)}
                  </td>

                  <td className="px-5 py-3.5 text-right whitespace-nowrap rounded-r-3xl border-r-2 border-y-2 border-transparent bg-[#FAF7F2] group-hover:bg-kuning-pucat group-hover:border-kuning-batang/30">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectDetail(po)}
                        className="h-9 px-3.5 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-kopi hover:bg-krim active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-1 shadow-[0_3px_10px_rgba(120,80,30,0.06)] hover:-translate-y-0.5"
                      >
                        <span>Rincian</span>
                        <ChevronRight className="w-3.5 h-3.5 text-kopi-muted" />
                      </button>

                      {!isLunas && (
                        <button
                          type="button"
                          onClick={() => onBayar(po)}
                          className="h-9 px-4 rounded-full bg-[#C2502F] hover:bg-[#a63f22] active:scale-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_6px_14px_rgba(194,80,47,0.25)] transition-all duration-150 hover:-translate-y-0.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 2. TAMPILAN MOBILE & TABLET (Card-based Layout Identik PO) */}
      <div className="md:hidden space-y-3 p-1">
        {paginatedList.map((po, idx) => {
          const amount = po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi
          const isLunas = po.catatan?.includes('[LUNAS') || false
          const overdue = getOverdueInfo(po)
          const tglTerimaStr = po.tanggalTerima
            ? new Date(po.tanggalTerima).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : po.tanggalBuat
          const supplierName = po.namaSupplier || 'Tanpa Supplier (Beli Langsung)'

          return (
            <div
              key={po.id}
              className="p-5 rounded-[26px] bg-[#FAF7F2] border border-[#EBE6DC]/80 space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'flex-shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center text-sm font-black text-kopi',
                      AVATAR_BG[idx % AVATAR_BG.length]
                    )}
                  >
                    {initialOf(supplierName)}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-kopi text-sm leading-snug">{supplierName}</h4>
                    <p className="text-[11px] text-kopi-muted font-mono mt-0.5">{po.noPO}</p>
                  </div>
                </div>

                {isLunas ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#E2EBC0] text-[#5E7420]">
                    <CheckCircle2 className="w-3 h-3" /> Lunas
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#F2D9CC] text-[#C2502F]">
                      <Clock className="w-3 h-3" /> Belum Lunas
                    </span>
                    {overdue && (
                      <span
                        className={clsx(
                          'text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5',
                          overdue.isOverdue ? 'bg-rose-100 text-rose-700 font-extrabold' : 'bg-[#FFF0D4] text-[#8A5A00]'
                        )}
                      >
                        {overdue.isOverdue && <AlertTriangle className="w-2.5 h-2.5" />}
                        {overdue.text}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EBE6DC]/60 text-xs">
                <div>
                  <span className="text-[10px] text-kopi-muted uppercase block font-semibold">Tgl Terima</span>
                  <span className="font-mono text-kopi font-bold text-[11px]">{tglTerimaStr}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-kopi-muted uppercase block font-semibold">Total Tagihan</span>
                  <span className="font-mono text-kopi font-black text-base">{formatRupiah(amount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectDetail(po)}
                  className="flex-1 py-2.5 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-kopi hover:bg-krim transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Rincian Item</span>
                  <ChevronRight className="w-3.5 h-3.5 text-kopi-muted" />
                </button>

                {!isLunas && (
                  <button
                    type="button"
                    onClick={() => onBayar(po)}
                    className="flex-1 py-2.5 rounded-full bg-[#C2502F] hover:bg-[#a63f22] text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bayar Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {list.length === 0 && (
        <div className="text-center py-12 text-kopi-muted text-sm font-medium">
          Belum ada data tagihan pembelian yang sesuai filter.
        </div>
      )}

      <div className="p-3 border-t border-krim-garis/50 bg-[#FCFAF6] rounded-b-[28px]">
        <Pagination
          currentPage={currentPage}
          totalItems={list.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="faktur tagihan"
        />
      </div>
    </div>
  )
}
