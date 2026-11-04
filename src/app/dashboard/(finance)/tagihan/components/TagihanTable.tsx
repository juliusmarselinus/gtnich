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
    <div className="rounded-[32px] bg-white p-2 sm:p-4 shadow-[0_14px_34px_rgba(120,80,30,0.10)] border border-[#EBE6DC] overflow-hidden">
      {/* 1. TAMPILAN DESKTOP (Tabel Lebar Bersih DapurTwin) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[780px] border-separate border-spacing-y-2">
          <thead>
            <tr className="whitespace-nowrap">
              <th className="text-left px-5 pt-3 pb-1 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                No. Tagihan / PO
              </th>
              <th className="text-left px-5 pt-3 pb-1 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Distributor / Supplier
              </th>
              <th className="text-left px-5 pt-3 pb-1 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Tgl Diterima
              </th>
              <th className="text-center px-5 pt-3 pb-1 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Status Pembayaran
              </th>
              <th className="text-right px-5 pt-3 pb-1 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Total Tagihan Aktual
              </th>
              <th className="px-5 pt-3 pb-1 text-right font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody>
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
                  className="rounded-2xl transition-all duration-200 bg-[#FFFDF9] hover:bg-[#FFF6EC] shadow-[0_2px_8px_rgba(120,80,30,0.04)]"
                >
                  <td className="px-5 py-4 rounded-l-2xl">
                    <p className="font-mono font-bold text-[#2B1D00] text-sm flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {po.noPO}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {po.items.length} item bahan dipesan
                    </p>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FFE4BF] text-[#7A4B00] flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {po.namaSupplier ? po.namaSupplier[0].toUpperCase() : 'S'}
                      </div>
                      <span className="font-bold text-[#2B1D00]">{po.namaSupplier}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tglTerimaStr}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center">
                    {isLunas ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E8F5E4] text-[#2D7A1F] border border-[#C3E6BD]">
                        <CheckCircle2 className="w-3 h-3 text-[#2D7A1F]" /> Lunas Terbayar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FDE8E4] text-[#D8431F] border border-[#FAD3CB]">
                        <Clock className="w-3 h-3 text-[#D8431F]" /> Menunggu Pembayaran
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-mono font-black text-[#2B1D00] text-sm">
                    {formatRupiah(amount)}
                  </td>

                  <td className="px-5 py-4 text-right rounded-r-2xl">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectDetail(po)}
                        className="px-3.5 py-1.5 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <span>Rincian</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {!isLunas && (
                        <button
                          onClick={() => onBayar(po)}
                          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] hover:from-[#FF7A10] hover:to-[#E55F00] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs shadow-[#FF8F2B]/20 transition-all hover:scale-102"
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
      <div className="block md:hidden space-y-3">
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
            <div
              key={po.id}
              className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EBE6DC] space-y-3 hover:border-[#FFB800] transition-colors shadow-xs"
            >
              {/* Baris 1: No PO + Status Tagihan */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-black text-[#2B1D00] text-sm flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#FF8F2B]" />
                    {po.noPO}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                    <span className="flex items-center gap-1 text-[#2B1D00] font-semibold truncate max-w-[140px]">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {po.namaSupplier}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{po.items.length} item</span>
                  </div>
                </div>

                <div>
                  {isLunas ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E4] text-[#2D7A1F] border border-[#C3E6BD]">
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#2D7A1F]" /> Lunas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE8E4] text-[#D8431F] border border-[#FAD3CB]">
                      <Clock className="w-2.5 h-2.5 text-[#D8431F]" /> Menunggu
                    </span>
                  )}
                </div>
              </div>

              {/* Baris 2: Tanggal Diterima & Total Nominal Tagihan */}
              <div className="flex items-end justify-between pt-1 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Terima: {tglTerimaStr}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-medium block">Total Tagihan</span>
                  <span className="font-mono font-black text-[#2B1D00] text-sm">
                    {formatRupiah(amount)}
                  </span>
                </div>
              </div>

              {/* Baris 3: Tombol Aksi */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectDetail(po)}
                  className="flex-1 py-2 rounded-xl bg-white border border-[#EBE6DC] text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Lihat Rincian</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {!isLunas && (
                  <button
                    type="button"
                    onClick={() => onBayar(po)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-[#FF8F2B]/20 text-white"
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
