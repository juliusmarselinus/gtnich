'use client'

import { Fragment, useState, useMemo } from 'react'
import { RiwayatPO } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, Truck, PackageCheck } from 'lucide-react'
import clsx from 'clsx'
import Pagination from '@/components/ui/Pagination'

interface RiwayatPOTableProps {
  poList: RiwayatPO[]
}

export default function RiwayatPOTable({ poList }: RiwayatPOTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return poList.slice(start, start + PAGE_SIZE)
  }, [poList, currentPage])

  const statusCls: Record<string, string> = {
    draft: 'bg-[#F5EDD8] text-[#5A3A00] border border-[#E8D4A0]',
    dikirim: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',
    diterima: 'bg-[#E6F5E4] text-[#1A6B40] border border-[#C3E6BD]',
    tagihan: 'bg-[#EDE9FF] text-[#7E22CE] border border-[#DDD6FE]',
    selesai: 'bg-[#E6F5E4] text-[#1A6B40] border border-[#C3E6BD]',
    batal: 'bg-rose-50 text-rose-700 border border-rose-200',
  }

  if (poList.length === 0) {
    return (
      <div className="rounded-[30px] bg-[#FFFBF2] border border-[#EDE0C4] shadow-[0_4px_18px_rgba(140,100,30,0.07)] p-12 text-center">
        <Truck className="w-10 h-10 mx-auto text-[#D9C8A8] mb-2" />
        <p className="text-xs font-bold text-[#5A3A00]">Tidak ada riwayat purchase order ditemukan</p>
        <p className="text-[11px] text-[#9A7A55] mt-0.5">
          Semua pemesanan bahan baku ke supplier akan tersimpan di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[30px] bg-[#FFFBF2] border border-[#EDE0C4] shadow-[0_4px_18px_rgba(140,100,30,0.07)] overflow-hidden">
      {/* Mobile Card View (< sm) */}
      <div className="sm:hidden divide-y divide-[#F0E0B8]/70">
        {paginatedList.map(po => {
          const exp = expandedId === po.id
          const dateCreated = new Date(po.tanggalBuat)
          const badgeClass = statusCls[po.status.toLowerCase()] || 'bg-[#F5EDD8] text-[#5A3A00]'
          return (
            <div key={`m-po-${po.id}`} className="p-4 space-y-3 bg-[#FFFBF2]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-black text-[#2B1D00] text-sm block">
                    {po.noPO}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#5A3A00]">
                    <Truck className="w-3 h-3 text-[#9A7A55]" />
                    <span className="font-bold">{po.namaSupplier}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-black text-[#2B1D00] text-sm block">
                    {formatRupiah(po.totalAktual || po.totalEstimasi)}
                  </span>
                  <span
                    className={clsx(
                      'inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase',
                      badgeClass
                    )}
                  >
                    {po.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#9A7A55] pt-1 border-t border-[#F5EEDB]">
                <span>
                  {dateCreated.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {dateCreated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedId(exp ? null : po.id)}
                  className="p-1 rounded-lg bg-[#F5EDD8] border border-[#E8D4A0] text-[#5A3A00] transition-all duration-150 active:scale-90"
                >
                  {exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {exp && (
                <div className="mt-2 p-3 rounded-2xl bg-[#FFF6E0] space-y-2 border border-[#F0D898]/70 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#8A5A00] font-bold">
                    <span>Pasokan Bahan ({po.items.length})</span>
                    {po.tanggalTerima && (
                      <span>Diterima: {new Date(po.tanggalTerima).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {po.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#FFFBF2] p-2 rounded-xl text-xs">
                        <span className="font-medium text-[#2B1D00] truncate max-w-[170px]">
                          {item.namaBahan} ({item.qty} {item.satuan})
                        </span>
                        <span className="font-mono font-bold text-[#FF8F28]">
                          {formatRupiah(item.qty * (item.hargaAktual || item.hargaEstimasi))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop Table View (>= sm) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-[#EDD9B0] bg-[#FFF6E0] whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-[#9A7A55] uppercase tracking-wider text-[11px]">
                No. PO
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#9A7A55] uppercase tracking-wider text-[11px]">
                Supplier
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#9A7A55] uppercase tracking-wider text-[11px]">
                Tanggal Buat
              </th>
              <th className="text-center px-6 py-4 font-bold text-[#9A7A55] uppercase tracking-wider text-[11px]">
                Status
              </th>
              <th className="text-right px-6 py-4 font-bold text-[#9A7A55] uppercase tracking-wider text-[11px]">
                Total Nilai PO
              </th>
              <th className="px-6 py-4 text-center text-[#9A7A55] font-bold text-[11px] uppercase tracking-wider">Rincian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0E0B8]/60">
            {paginatedList.map(po => {
              const exp = expandedId === po.id
              const dateCreated = new Date(po.tanggalBuat)
              const badgeClass = statusCls[po.status.toLowerCase()] || 'bg-[#F5EDD8] text-[#5A3A00]'
              return (
                <Fragment key={po.id}>
                  <tr className="hover:bg-[#FFF6E0] transition-colors whitespace-nowrap">
                    <td className="px-6 py-4 font-mono font-bold text-[#2B1D00] text-sm">
                      {po.noPO}
                    </td>
                    <td className="px-6 py-4 text-[#2B1D00] font-bold">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#9A7A55]" />
                        {po.namaSupplier}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#5A3A00] font-medium">
                      <div>
                        {dateCreated.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-[#9A7A55]">
                        {dateCreated.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={clsx(
                          'px-3 py-1 rounded-full text-[11px] font-bold uppercase',
                          badgeClass
                        )}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-[#2B1D00] text-sm">
                      {formatRupiah(po.totalAktual || po.totalEstimasi)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setExpandedId(exp ? null : po.id)}
                        className="p-2 rounded-xl bg-[#F5EDD8] border border-[#E8D4A0] text-[#5A3A00] hover:bg-[#FFE49A]/80 cursor-pointer inline-flex items-center justify-center transition-all duration-150 active:scale-90 hover:scale-105"
                        title={exp ? 'Tutup rincian' : 'Lihat rincian'}
                      >
                        {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {exp && (
                    <tr key={`${po.id}-det`} className="bg-[#FFF6E0]">
                      <td colSpan={6} className="px-8 py-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-[#8A5A00] uppercase tracking-wider flex items-center gap-1.5">
                            <PackageCheck className="w-3.5 h-3.5 text-[#FF8F28]" />
                            Rincian Pasokan Bahan Masuk ({po.items.length} Item)
                          </p>
                          {po.tanggalTerima && (
                            <span className="text-[11px] text-[#8A5A00] font-medium">
                              Diterima pada:{' '}
                              {new Date(po.tanggalTerima).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {po.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-[#FFFBF2] border border-[#EDE0C4] rounded-2xl px-5 py-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-[#2B1D00]">{item.namaBahan}</span>
                                <span className="text-[#5A3A00] font-mono font-bold ml-2">
                                  — {item.qty} {item.satuan}
                                </span>
                                {item.diterima && (
                                  <span className="ml-2 text-[10px] font-bold text-[#1A6B40] bg-[#E6F5E4] border border-[#C3E6BD] px-2 py-0.5 rounded-full">
                                    ✓ Diterima
                                  </span>
                                )}
                              </div>
                              <div className="text-right font-mono text-[#2B1D00] font-black">
                                {formatRupiah(item.qty * (item.hargaAktual || item.hargaEstimasi))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {po.catatan && (
                          <div className="mt-3 p-3 rounded-xl bg-[#FFF6E0] border border-[#F0D898] text-[11px] text-[#5A3A00]">
                            <strong>Catatan PO:</strong> {po.catatan}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-[#EDD9B0]/50 bg-[#FFFDF7]">
        <Pagination
          currentPage={currentPage}
          totalItems={poList.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="purchase order"
        />
      </div>
    </div>
  )
}
