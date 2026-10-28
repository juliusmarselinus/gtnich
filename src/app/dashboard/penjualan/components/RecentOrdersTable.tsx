'use client'

import { OrderRecord } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Receipt, CheckCircle2, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

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
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
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
                      className="p-1.5 rounded-xl clay-btn text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
