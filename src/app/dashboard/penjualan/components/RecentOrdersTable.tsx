'use client'

import { OrderRecord } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Receipt, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, Fragment } from 'react'

interface RecentOrdersTableProps {
  orders: OrderRecord[]
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <div className="clay-card py-10 text-center text-slate-400 text-xs">
        Belum ada riwayat transaksi penjualan kasir yang tersimpan.
      </div>
    )
  }

  return (
    <div className="clay-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
              <th className="text-left px-5 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                No. Nota Invoice
              </th>
              <th className="text-left px-5 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Pelanggan / Saluran
              </th>
              <th className="text-left px-5 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Waktu Transaksi
              </th>
              <th className="text-right px-5 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Total Penjualan
              </th>
              <th className="text-right px-5 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Laba Bersih
              </th>
              <th className="px-4 py-3.5 text-right font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Rincian
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(o => {
              const exp = expandedId === o.id
              const tglStr = new Date(o.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <Fragment key={o.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-bold text-slate-800 text-xs">{o.invoiceNumber}</p>
                      <span className="text-[10px] text-slate-400">{o.paymentMethod}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700">{o.customerName}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
                        {o.channel}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {tglStr}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono font-black text-slate-800 text-sm">
                      {formatRupiah(o.totalPrice)}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                      {formatRupiah(o.profit)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedId(exp ? null : o.id)}
                        className="p-1.5 rounded-xl clay-btn text-slate-500 hover:text-slate-800 cursor-pointer inline-flex items-center justify-center"
                        title={exp ? 'Tutup rincian' : 'Lihat rincian item'}
                      >
                        {exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Dropdown Rincian Item Pesanan */}
                  {exp && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                            Rincian Menu ({o.items?.length || 0} Item)
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Kasir: <strong className="text-slate-700 font-semibold">{o.cashierName || '-'}</strong>
                          </span>
                        </div>

                        {(!o.items || o.items.length === 0) ? (
                          <div className="py-2 text-[11px] text-slate-400 italic">
                            Tidak ada rincian item tersimpan untuk transaksi ini.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {o.items.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="flex justify-between items-center bg-white rounded-xl px-4 py-2.5 clay-pill text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-800">{item.namaMenu}</span>
                                  <span className="text-emerald-600 font-mono font-bold ml-2">
                                    ({item.qty}x @ {formatRupiah(item.hargaJual)})
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-emerald-600 font-black">
                                    {formatRupiah(item.subtotal || item.hargaJual * item.qty)}
                                  </span>
                                  {item.hpp > 0 && (
                                    <span className="block text-[9px] text-slate-400 font-mono">
                                      HPP: {formatRupiah(item.hpp * item.qty)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {o.notes && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-800">
                            <strong className="font-bold">Catatan:</strong> {o.notes}
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
