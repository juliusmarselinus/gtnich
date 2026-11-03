'use client'

import { formatRupiah } from '@/lib/mock-data'
import { DailyTrendItem } from '../types'
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { Activity } from 'lucide-react'

interface TrendChartProps {
  trend: DailyTrendItem[]
  rangeLabel: string
}

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 16,
  border: '1px solid #F0E0B0',
  backgroundColor: '#FFF8E8',
  boxShadow: '0 8px 24px rgba(140,100,30,0.14)',
  color: '#2B1D00',
}

export default function TrendChart({ trend, rangeLabel }: TrendChartProps) {
  const hasData = trend.some(t => t.penjualan > 0 || t.profit > 0)

  return (
    <div className="rounded-[30px] bg-[#FFFBF2] border border-[#EDE0C4] shadow-[0_4px_18px_rgba(140,100,30,0.07)] p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFE49A]/60 border border-[#FFD166] text-[#8A5A00] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2B1D00] uppercase tracking-wider">
              Tren Omzet Penjualan &amp; Profit Bersih ({rangeLabel})
            </h3>
            <p className="text-xs text-[#8A6A40] font-medium">
              Evaluasi fluktuasi laba kotor &amp; omzet harian berdasarkan pesanan selesai
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#FFF6E0] rounded-2xl border border-dashed border-[#FFD166]">
          <p className="text-xs font-bold text-[#8A5A00]">Belum ada data transaksi pada rentang ini</p>
          <p className="text-[11px] text-[#B8935A] mt-1 max-w-sm">
            Data grafik akan muncul otomatis setiap kali ada transaksi kasir yang selesai dicatat.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trend} margin={{ top: 10, right: 15, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF8F28" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF8F28" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#228B5B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#228B5B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 4" stroke="#EDD9B0" strokeOpacity={0.6} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9A7A55' }} stroke="#D9C8A8" />
            <YAxis
              tick={{ fontSize: 11, fill: '#9A7A55' }}
              stroke="#D9C8A8"
              tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip
              formatter={(v: unknown) => [formatRupiah(Number(v) || 0)]}
              contentStyle={tooltipStyle}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12, fontWeight: 700, color: '#5A3A00' }} />
            <Area
              type="monotone"
              dataKey="penjualan"
              stroke="#FF8F28"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPenjualan)"
              name="Penjualan (Omzet)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#228B5B"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="Profit Bersih"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
