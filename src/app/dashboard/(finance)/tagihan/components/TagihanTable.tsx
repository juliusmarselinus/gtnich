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
  Package,
} from 'lucide-react'

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
      {/* 1. TAMPILAN DESKTOP (Tabel Lebar Lengkap) */}
      <div className="hidden md:block overflow-x-auto">
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
                      <Building2 className="w-3.5 h-3.5 text-[#FF8F2B]" />
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
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]">
                        <CheckCircle2 className="w-3 h-3 text-[#FF8F2B]" /> Lunas Terbayar
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
                        <span>Rincian</span>
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

      {/* 2. TAMPILAN MOBILE: Kolom Terpadu & Multi-Informasi Efisien */}
      <div className="block md:hidden divide-y divide-slate-100">
        {list.map(po => {
          const amount = po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi
          const isLunas = po.catatan?.includes('[LUNAS') || false
          const tglTerimaStr = po.tanggalTerima
            ? new Date(po.tanggalTerima).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : po.tanggalBuat

          return (
            <div key={po.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
              {/* Baris 1: No PO + Status Tagihan */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-black text-slate-900 text-sm flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#FF8F2B]" />
                    {po.noPO}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold truncate max-w-[140px]">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {po.namaSupplier}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{po.items.length} item</span>
                  </div>
                </div>

                <div>
                  {isLunas ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]">
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#FF8F2B]" /> Lunas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-2.5 h-2.5 text-amber-600" /> Menunggu
                    </span>
                  )}
                </div>
              </div>

              {/* Baris 2: Tanggal Diterima & Total Nominal Tagihan */}
              <div className="flex items-end justify-between pt-1 border-t border-slate-100/80">
                <div className="text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Terima: {tglTerimaStr}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-medium block">Total Tagihan</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {formatRupiah(amount)}
                  </span>
                </div>
              </div>

              {/* Baris 3: Tombol Aksi */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectDetail(po)}
                  className="flex-1 py-2 rounded-xl clay-btn text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Lihat Rincian</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {!isLunas && (
                  <button
                    type="button"
                    onClick={() => onBayar(po)}
                    className="flex-1 py-2 rounded-xl clay-btn-primary text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-sm text-white"
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
        <div className="text-center py-16 text-slate-400 text-sm font-medium">
          Belum ada data tagihan supplier. Tagihan akan otomatis masuk setelah barang pada Pembelian Stok diterima.
        </div>
      )}
    </div>
  )
}
