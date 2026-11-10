'use client'

import { Fragment, useState, useMemo } from 'react'
import { RiwayatPenjualan } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, User, ShoppingBag, Receipt } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'

interface RiwayatPenjualanTableProps {
  penjualanList: RiwayatPenjualan[]
}

export default function RiwayatPenjualanTable({ penjualanList }: RiwayatPenjualanTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return penjualanList.slice(start, start + PAGE_SIZE)
  }, [penjualanList, currentPage])

  if (penjualanList.length === 0) {
    return (
      <div className="rounded-[30px] bg-[#FFFBF2] border border-[#EDE0C4] shadow-[0_4px_18px_rgba(140,100,30,0.07)] p-12 text-center">
        <Receipt className="w-10 h-10 mx-auto text-[#D9C8A8] mb-2" />
        <p className="text-xs font-bold text-[#5A3A00]">Tidak ada riwayat penjualan ditemukan</p>
        <p className="text-[11px] text-[#9A7A55] mt-0.5">
          Semua transaksi kasir yang selesai diproses akan dicatat di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[30px] bg-[#FFFBF2] border border-[#EDE0C4] shadow-[0_4px_18px_rgba(140,100,30,0.07)] overflow-hidden">
      {/* Mobile Card View (< sm) */}
      <div className="sm:hidden divide-y divide-[#EDD9B0]/70">
        {paginatedList.map(t => {
          const exp = expandedId === t.id
          const createdDate = new Date(t.createdAt)
          return (
            <div key={`m-${t.id}`} className="p-4 space-y-3 bg-[#FFFBF2]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-black text-[#2B1D00] text-sm block">
                    {t.invoiceNumber}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#5A3A00]">
                    <User className="w-3 h-3 text-[#9A7A55]" />
                    <span className="font-bold">{t.customerName}</span>
                    <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-[#F5EDD8] text-[#5A3A00] border border-[#E8D4A0]">
                      {t.channel}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-black text-[#2B1D00] text-sm block">
                    {formatRupiah(t.totalPrice)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#228B5B]">
                    +{formatRupiah(t.profit)} laba
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#9A7A55] pt-1 border-t border-[#F5EEDB]">
                <span>
                  {createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {createdDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#FF8F2B] bg-[#FFF6EC] border border-[#FFE2C2] px-2 py-0.5 rounded-md">
                    {t.paymentMethod}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedId(exp ? null : t.id)}
                    className="p-1 rounded-lg bg-[#F5EDD8] border border-[#E8D4A0] text-[#5A3A00] transition-all duration-150 active:scale-90"
                  >
                    {exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {exp && (
                <div className="mt-2 p-3 rounded-2xl bg-[#FFF6E0] space-y-2 border border-[#F0D898]/70 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#8A5A00] font-bold">
                    <span>Menu ({t.items.length})</span>
                    <span>Kasir: {t.cashierName}</span>
                  </div>
                  <div className="space-y-1.5">
                    {t.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#FFFBF2] p-2 rounded-xl text-xs">
                        <span className="font-medium text-[#2B1D00] truncate max-w-[170px]">
                          {item.qty}x {item.namaMenu}
                        </span>
                        <span className="font-mono font-bold text-[#FF8F28]">
                          {formatRupiah(item.subtotal || item.hargaJual * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {t.notes && (
                    <p className="text-[10px] text-[#5A3A00] italic pt-1 border-t border-[#EDD9B0]">
                      Catatan: {t.notes}
                    </p>
                  )}
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
            <tr className="border-b border-[#EDD9B0] bg-[#FFF0CC] whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-[#8A5A00] uppercase tracking-wider text-[11px]">
                No. Transaksi / Invoice
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#8A5A00] uppercase tracking-wider text-[11px]">
                Pelanggan &amp; Saluran
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#8A5A00] uppercase tracking-wider text-[11px]">
                Waktu Transaksi
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#8A5A00] uppercase tracking-wider text-[11px]">
                Metode Pembayaran
              </th>
              <th className="text-right px-6 py-4 font-bold text-[#8A5A00] uppercase tracking-wider text-[11px]">
                Total Bayar
              </th>
              <th className="text-right px-6 py-4 font-bold text-[#8A5A00] uppercase tracking-wider text-[11px]">
                Estimasi Laba
              </th>
              <th className="px-6 py-4 text-center text-[#8A5A00] font-bold text-[11px] uppercase tracking-wider">
                Rincian
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDD9B0]/70">
            {paginatedList.map(t => {
              const exp = expandedId === t.id
              const createdDate = new Date(t.createdAt)
              return (
                <Fragment key={t.id}>
                  <tr className="bg-[#FFFBF2] hover:bg-[#FFF6E0] transition-colors whitespace-nowrap">
                    <td className="px-6 py-4 font-mono font-bold text-[#2B1D00] text-sm">
                      {t.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#2B1D00] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#9A7A55]" />
                        {t.customerName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EDD8] text-[#5A3A00] border border-[#E8D4A0]">
                          {t.channel}
                        </span>
                        {t.customerPhone && (
                          <span className="text-[10px] text-[#9A7A55] font-mono">
                            {t.customerPhone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#5A3A00] font-medium">
                      <div>
                        {createdDate.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-[#9A7A55]">
                        {createdDate.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#2B1D00] block">{t.paymentMethod}</span>
                      <span className="inline-block text-[10px] font-bold text-[#FF8F2B] bg-[#FFF6EC] border border-[#FFE2C2] px-2 py-0.5 rounded-md mt-0.5">
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-[#2B1D00] text-sm">
                      {formatRupiah(t.totalPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-[#228B5B] text-sm">
                      +{formatRupiah(t.profit)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setExpandedId(exp ? null : t.id)}
                        className="p-2 rounded-xl bg-[#F5EDD8] border border-[#E8D4A0] text-[#5A3A00] hover:bg-[#FFE49A]/80 cursor-pointer inline-flex items-center justify-center transition-all duration-150 active:scale-90 hover:scale-105"
                        title={exp ? 'Tutup rincian' : 'Lihat rincian'}
                      >
                        {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {exp && (
                    <tr key={`${t.id}-det`} className="bg-[#FFF6E0]">
                      <td colSpan={7} className="px-8 py-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-[#8A5A00] uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#FF8F28]" />
                            Rincian Menu Dipesan ({t.items.length} Menu)
                          </p>
                          <span className="text-[11px] text-[#9A7A55]">
                            Kasir: <strong className="text-[#2B1D00]">{t.cashierName}</strong>
                          </span>
                        </div>

                        <div className="space-y-2">
                          {t.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-[#FFFBF2] border border-[#EDE0C4] rounded-2xl px-5 py-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-[#2B1D00]">{item.namaMenu}</span>
                                <span className="text-[#FF8F28] font-mono font-bold ml-2">
                                  ({item.qty}x @ {formatRupiah(item.hargaJual)})
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-[#FF8F28] font-black">
                                  {formatRupiah(item.subtotal || item.hargaJual * item.qty)}
                                </span>
                                {item.hpp > 0 && (
                                  <span className="block text-[10px] text-[#9A7A55] font-mono">
                                    HPP: {formatRupiah(item.hpp * item.qty)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {t.notes && (
                          <div className="mt-3 p-3 rounded-xl bg-[#FFF6E0] border border-[#F0D898] text-[11px] text-[#5A3A00]">
                            <strong>Catatan:</strong> {t.notes}
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
          totalItems={penjualanList.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="transaksi kasir"
        />
      </div>
    </div>
  )
}
