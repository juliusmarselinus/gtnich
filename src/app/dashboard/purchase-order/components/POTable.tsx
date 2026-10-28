'use client'

import { useState, Fragment } from 'react'
import { PurchaseOrder, POStatus } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, PackageCheck, Truck, Clock, FileCheck } from 'lucide-react'
import clsx from 'clsx'

const STATUS_CONFIG: Record<POStatus, { label: string; cls: string; nextStatus?: POStatus; nextLabel?: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600', nextStatus: 'dikirim', nextLabel: 'Kirim ke Supplier' },
  dikirim: { label: 'Dikirim', cls: 'bg-blue-50 text-blue-600 border border-blue-200/50', nextStatus: 'diterima', nextLabel: 'Konfirmasi Terima Barang (+Stok)' },
  diterima: { label: 'Diterima', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', nextStatus: 'tagihan', nextLabel: 'Masuk Antrean Tagihan' },
  tagihan: { label: 'Tagihan', cls: 'bg-amber-50 text-amber-700 border border-amber-200/50' },
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
    <div className="clay-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
            <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">No. PO</th>
            <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Supplier Tujuan</th>
            <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Tanggal Buat</th>
            <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Status Proses</th>
            <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Total Estimasi</th>
            <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-wider text-[11px]">Aksi Alur</th>
            <th className="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {list.map(po => {
            const cfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft
            const exp = expandedId === po.id
            const isProcessing = loadingActionId === po.id

            return (
              <Fragment key={po.id}>
                <tr className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-slate-800 text-sm">{po.noPO}</p>
                    {po.catatan && (
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[220px]" title={po.catatan}>
                        {po.catatan}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{po.namaSupplier}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{po.tanggalBuat}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx('inline-flex px-3 py-1 rounded-full text-[11px] font-bold clay-pill', cfg.cls)}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">
                    {formatRupiah(po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cfg.nextStatus ? (
                      <button
                        onClick={() => handleAction(po, cfg.nextStatus!)}
                        disabled={isProcessing}
                        className={clsx(
                          'px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all disabled:opacity-50 shadow-sm cursor-pointer',
                          cfg.nextStatus === 'diterima'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        )}
                      >
                        {isProcessing ? 'Memproses...' : cfg.nextLabel}
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 flex items-center justify-end gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setExpandedId(exp ? null : po.id)}
                      className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800"
                    >
                      {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>

                {/* Detail expand */}
                {exp && (
                  <tr key={`${po.id}-detail`} className="bg-slate-50/70">
                    <td colSpan={7} className="px-8 py-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Detail Item Bahan Yang Dipesan
                        </p>
                        {po.tanggalTerima && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            ✓ Diterima pada {new Date(po.tanggalTerima).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {po.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 clay-pill"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-800">{item.namaBahan}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {item.qty} {item.satuan} × {formatRupiah(item.hargaEstimasi)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono font-black text-slate-800">
                                {formatRupiah(item.qty * item.hargaEstimasi)}
                              </p>
                              <span
                                className={clsx(
                                  'text-[10px] font-bold flex items-center gap-1 justify-end mt-0.5',
                                  item.diterima ? 'text-emerald-600' : 'text-amber-600'
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
        <div className="text-center py-12 text-slate-400 text-sm font-medium">
          Belum ada data Purchase Order di database.
        </div>
      )}
    </div>
  )
}
