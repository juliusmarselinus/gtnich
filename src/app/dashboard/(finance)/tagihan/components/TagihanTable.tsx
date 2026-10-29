'use client'

import { useState } from 'react'
import { PurchaseOrder } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import {
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  X,
  Package,
} from 'lucide-react'
import clsx from 'clsx'

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
  return (
    <div className="clay-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[780px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                No. Tagihan / PO
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Distributor / Supplier
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Tgl Diterima
              </th>
              <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Status Pembayaran
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Total Tagihan Aktual
              </th>
              <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(po => {
              const amount = po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi
              const isLunas = po.catatan?.includes('[LUNAS') || false
              const tglTerimaStr = po.tanggalTerima
                ? new Date(po.tanggalTerima).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : po.tanggalBuat

              return (
                <tr
                  key={po.id}
                  className="hover:bg-slate-50/50 transition-colors whitespace-nowrap"
                >
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {po.noPO}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {po.items.length} item bahan dipesan
                    </p>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{po.namaSupplier}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tglTerimaStr}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {isLunas ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Lunas Terbayar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Menunggu Pembayaran
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">
                    {formatRupiah(amount)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectDetail(po)}
                        className="px-3 py-1.5 rounded-xl clay-btn text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                      >
                        <span>Lihat Rincian</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {!isLunas && (
                        <button
                          onClick={() => onBayar(po)}
                          className="px-3.5 py-1.5 rounded-xl clay-btn-primary text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
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

      {list.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm font-medium">
          Belum ada data tagihan supplier. Tagihan akan otomatis masuk setelah barang pada Purchase Order diterima.
        </div>
      )}
    </div>
  )
}
