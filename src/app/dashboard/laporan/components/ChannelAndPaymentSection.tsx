'use client'

import { formatRupiah } from '@/lib/mock-data'
import { ChannelBreakdownItem, PaymentBreakdownItem } from '../types'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { Share2, CreditCard } from 'lucide-react'

interface ChannelAndPaymentSectionProps {
  channelBreakdown: ChannelBreakdownItem[]
  paymentBreakdown: PaymentBreakdownItem[]
}

export default function ChannelAndPaymentSection({
  channelBreakdown,
  paymentBreakdown,
}: ChannelAndPaymentSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Saluran Penjualan */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kinerja Berdasarkan Saluran Penjualan
            </h3>
            <p className="text-[11px] text-slate-400">
              Perbandingan pendapatan antar channel (WhatsApp, Toko Langsung, Online)
            </p>
          </div>
        </div>

        {channelBreakdown.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-600">Belum ada data channel</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={channelBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 15, bottom: 0, left: 75 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <YAxis
                  type="category"
                  dataKey="channel"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  width={85}
                />
                <Tooltip
                  formatter={(v: any) => [formatRupiah(Number(v) || 0), 'Total Omzet']}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 16,
                    border: '1px solid #cbd5e1',
                  }}
                />
                <Bar dataKey="totalRevenue" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Omzet" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {channelBreakdown.map(c => (
                <div key={c.channel} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{c.channel}</p>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    {formatRupiah(c.totalRevenue)}
                  </p>
                  <p className="text-[10px] text-slate-500">{c.count} pesanan</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metode Pembayaran */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Preferensi Metode Pembayaran
            </h3>
            <p className="text-[11px] text-slate-400">
              Distribusi pembayaran tunai, QRIS, maupun transfer bank
            </p>
          </div>
        </div>

        {paymentBreakdown.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-600">Belum ada data pembayaran</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={paymentBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 15, bottom: 0, left: 75 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <YAxis
                  type="category"
                  dataKey="paymentMethod"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  width={85}
                />
                <Tooltip
                  formatter={(v: any) => [formatRupiah(Number(v) || 0), 'Total Diterima']}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 16,
                    border: '1px solid #cbd5e1',
                  }}
                />
                <Bar dataKey="totalRevenue" fill="#f59e0b" radius={[0, 8, 8, 0]} name="Nominal" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentBreakdown.map(p => (
                <div key={p.paymentMethod} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
                    {p.paymentMethod}
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    {formatRupiah(p.totalRevenue)}
                  </p>
                  <p className="text-[10px] text-slate-500">{p.count} transaksi</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
