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

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 16,
  border: '1px solid #F0E0B0',
  backgroundColor: '#FFF8E8',
  boxShadow: '0 8px 24px rgba(140,100,30,0.14)',
  color: '#2B1D00',
}

const cardClass =
  'rounded-[30px] bg-[#FFFBF2] border border-[#EDE0C4] shadow-[0_4px_18px_rgba(140,100,30,0.07)] p-6 sm:p-7 space-y-4'

const iconBadge =
  'w-10 h-10 rounded-2xl bg-[#FFE49A]/60 border border-[#FFD166] text-[#8A5A00] flex items-center justify-center'

const miniCardClass =
  'p-3 rounded-2xl bg-[#FFF6E0] border border-[#F0D898]/70'

export default function ChannelAndPaymentSection({
  channelBreakdown,
  paymentBreakdown,
}: ChannelAndPaymentSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Saluran Penjualan */}
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className={iconBadge}>
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2B1D00] uppercase tracking-wider">
              Kinerja Saluran Penjualan
            </h3>
            <p className="text-xs text-[#8A6A40] font-medium">
              Perbandingan omzet antar channel (Toko Langsung, WhatsApp, Online)
            </p>
          </div>
        </div>

        {channelBreakdown.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-[#FFF6E0] rounded-2xl border border-dashed border-[#FFD166]">
            <p className="text-xs font-bold text-[#8A5A00]">Belum ada data channel penjualan</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={channelBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 15, bottom: 0, left: 75 }}
              >
                <CartesianGrid strokeDasharray="3 4" stroke="#EDD9B0" strokeOpacity={0.6} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#9A7A55' }}
                  stroke="#D9C8A8"
                  tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <YAxis
                  type="category"
                  dataKey="channel"
                  tick={{ fontSize: 11, fill: '#4A3B32', fontWeight: 600 }}
                  stroke="#D9C8A8"
                  width={85}
                />
                <Tooltip
                  formatter={(v: unknown) => [formatRupiah(Number(v) || 0), 'Total Omzet']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="totalRevenue" fill="#FF8F28" radius={[0, 8, 8, 0]} name="Omzet" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {channelBreakdown.map(c => (
                <div key={c.channel} className={miniCardClass}>
                  <p className="text-[10px] font-bold text-[#9A7A55] uppercase truncate">{c.channel}</p>
                  <p className="text-xs font-mono font-black text-[#2B1D00] mt-0.5">
                    {formatRupiah(c.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-[#8A6A40] font-medium">{c.count} pesanan</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Metode Pembayaran */}
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className={iconBadge}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2B1D00] uppercase tracking-wider">
              Preferensi Metode Pembayaran
            </h3>
            <p className="text-xs text-[#8A6A40] font-medium">
              Distribusi transaksi melalui QRIS, tunai, maupun transfer bank
            </p>
          </div>
        </div>

        {paymentBreakdown.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-[#FFF6E0] rounded-2xl border border-dashed border-[#FFD166]">
            <p className="text-xs font-bold text-[#8A5A00]">Belum ada data pembayaran</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={paymentBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 15, bottom: 0, left: 75 }}
              >
                <CartesianGrid strokeDasharray="3 4" stroke="#EDD9B0" strokeOpacity={0.6} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#9A7A55' }}
                  stroke="#D9C8A8"
                  tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <YAxis
                  type="category"
                  dataKey="paymentMethod"
                  tick={{ fontSize: 11, fill: '#4A3B32', fontWeight: 600 }}
                  stroke="#D9C8A8"
                  width={85}
                />
                <Tooltip
                  formatter={(v: unknown) => [formatRupiah(Number(v) || 0), 'Total Diterima']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="totalRevenue" fill="#D8431F" radius={[0, 8, 8, 0]} name="Nominal" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentBreakdown.map(p => (
                <div key={p.paymentMethod} className={miniCardClass}>
                  <p className="text-[10px] font-bold text-[#9A7A55] uppercase truncate">
                    {p.paymentMethod}
                  </p>
                  <p className="text-xs font-mono font-black text-[#2B1D00] mt-0.5">
                    {formatRupiah(p.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-[#8A6A40] font-medium">{p.count} transaksi</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
