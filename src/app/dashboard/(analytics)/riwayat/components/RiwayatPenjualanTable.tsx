'use client'

import { Fragment, useState } from 'react'
import { RiwayatPenjualan } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, User, ShoppingBag, Receipt, Phone } from 'lucide-react'

interface RiwayatPenjualanTableProps {
  penjualanList: RiwayatPenjualan[]
}

export default function RiwayatPenjualanTable({ penjualanList }: RiwayatPenjualanTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (penjualanList.length === 0) {
    return (
      <div className="clay-card p-12 text-center text-slate-400">
        <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-xs font-bold text-slate-600">Tidak ada riwayat penjualan ditemukan</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Semua transaksi kasir yang selesai diproses akan dicatat di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="clay-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                No. Transaksi / Invoice
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Pelanggan & Saluran
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Waktu Transaksi
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Metode Pembayaran
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Total Bayar
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Estimasi Laba
              </th>
              <th className="px-6 py-4 text-center">Rincian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {penjualanList.map(t => {
              const exp = expandedId === t.id
              const createdDate = new Date(t.createdAt)
              return (
                <Fragment key={t.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 text-sm">
                      {t.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {t.customerName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {t.channel}
                        </span>
                        {t.customerPhone && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.customerPhone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <div>
                        {createdDate.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {createdDate.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700 block">{t.paymentMethod}</span>
                      <span className="inline-block text-[10px] font-bold text-[#FF8F2B] bg-[#FFF6EC] border border-[#FFE2C2] px-2 py-0.5 rounded-md mt-0.5">
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">
                      {formatRupiah(t.totalPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-[#FF8F2B] text-sm">
                      +{formatRupiah(t.profit)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setExpandedId(exp ? null : t.id)}
                        className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800 cursor-pointer inline-flex items-center justify-center"
                        title={exp ? 'Tutup rincian' : 'Lihat rincian'}
                      >
                        {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {exp && (
                    <tr key={`${t.id}-det`} className="bg-slate-50/70">
                      <td colSpan={7} className="px-8 py-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#FF8F2B]" />
                            Rincian Menu Dipesan ({t.items.length} Menu)
                          </p>
                          <span className="text-[11px] text-slate-400">
                            Kasir: <strong className="text-slate-700">{t.cashierName}</strong>
                          </span>
                        </div>

                        <div className="space-y-2">
                          {t.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-white rounded-2xl px-5 py-3 clay-pill text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{item.namaMenu}</span>
                                <span className="text-[#FF8F2B] font-mono font-bold ml-2">
                                  ({item.qty}x @ {formatRupiah(item.hargaJual)})
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-[#FF8F2B] font-black">
                                  {formatRupiah(item.subtotal || item.hargaJual * item.qty)}
                                </span>
                                {item.hpp > 0 && (
                                  <span className="block text-[10px] text-slate-400 font-mono">
                                    HPP: {formatRupiah(item.hpp * item.qty)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {t.notes && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800">
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
    </div>
  )
}
