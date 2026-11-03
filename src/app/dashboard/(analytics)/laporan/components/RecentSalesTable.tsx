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
    <div className="rounded-[30px] bg-[#FFFBF2] border border-[#EDE0C4] shadow-[0_4px_18px_rgba(140,100,30,0.07)] p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFE49A]/60 border border-[#FFD166] text-[#8A5A00] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2B1D00] uppercase tracking-wider">
              Transaksi Penjualan Terakhir
            </h3>
            <p className="text-xs text-[#8A6A40] font-medium">
              Daftar nota kasir terbaru yang masuk dalam rekapitulasi laporan periode ini
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/penjualan"
          className="text-xs font-bold text-[#D8431F] hover:text-[#c03917] flex items-center gap-1.5 transition-colors"
        >
          <span>Ke Kasir Penjualan</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#9A7A55] bg-[#FFF6E0] rounded-2xl border border-dashed border-[#FFD166]">
          Belum ada riwayat penjualan pada periode ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EDD9B0] text-[10px] font-bold text-[#9A7A55] uppercase tracking-wider">
                <th className="pb-3">Invoice</th>
                <th className="pb-3">Pelanggan</th>
                <th className="pb-3">Saluran</th>
                <th className="pb-3">Metode Bayar</th>
                <th className="pb-3 text-right">Total Transaksi</th>
                <th className="pb-3 text-right">Profit Bersih</th>
                <th className="pb-3 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E8CC]/60 font-medium text-slate-700">
              {sales.map(s => (
                <tr key={s.id} className="hover:bg-[#FFF6E0] transition-colors">
                  <td className="py-3 font-mono font-bold text-[#2B1D00]">{s.invoiceNumber}</td>
                  <td className="py-3 font-medium text-slate-800">{s.customerName}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EDD8] text-[#5A3A00] border border-[#E8D4A0]">
                      {s.channel}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-[#5A3A00] bg-[#FFF0CC]">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-[#2B1D00]">
                    {formatRupiah(s.totalPrice)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-[#228B5B]">
                    +{formatRupiah(s.profit)}
                  </td>
                  <td className="py-3 text-right text-[11px] text-[#9A7A55] font-mono">
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
