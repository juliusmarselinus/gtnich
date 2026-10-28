'use client'

import { formatRupiah } from '@/lib/mock-data'
import { Receipt, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface RecentSalesTableProps {
  sales: {
    id: string
    invoiceNumber: string
    customerName: string
    channel: string
    paymentMethod: string
    totalPrice: number
    profit: number
    createdAt: string
  }[]
}

export default function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <div className="clay-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Transaksi Penjualan Terakhir
            </h3>
            <p className="text-[11px] text-slate-400">
              Daftar nota kasir terbaru yang masuk dalam rekapitulasi laporan
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/penjualan"
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          Ke Kasir Penjualan <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Belum ada riwayat penjualan pada periode ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5">Invoice</th>
                <th className="pb-2.5">Pelanggan</th>
                <th className="pb-2.5">Saluran</th>
                <th className="pb-2.5">Metode Bayar</th>
                <th className="pb-2.5 text-right">Total Transaksi</th>
                <th className="pb-2.5 text-right">Profit</th>
                <th className="pb-2.5 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {sales.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{s.invoiceNumber}</td>
                  <td className="py-2.5">{s.customerName}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {s.channel}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-500">{s.paymentMethod}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                    {formatRupiah(s.totalPrice)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">
                    +{formatRupiah(s.profit)}
                  </td>
                  <td className="py-2.5 text-right text-[11px] text-slate-400">
                    {new Date(s.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    •{' '}
                    {new Date(s.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
