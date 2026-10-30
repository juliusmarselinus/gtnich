'use client'

import { formatRupiah } from '@/lib/mock-data'
import { DailyTrendItem } from '../types'
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

export default function TrendChart({ trend, rangeLabel }: TrendChartProps) {
  const hasData = trend.some(t => t.penjualan > 0 || t.profit > 0)

  return (
    <div className="clay-card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#FFF6EC] text-[#FF8F2B]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tren Omzet Penjualan & Profit Bersih ({rangeLabel})
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluasi fluktuasi laba kotor & omzet harian berdasarkan pesanan selesai
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-bold text-slate-600">Belum ada data transaksi pada rentang ini</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Data grafik akan muncul otomatis setiap kali ada transaksi penjualan kasir yang selesai dicatat.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend} margin={{ top: 10, right: 15, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF8F2B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FF8F2B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFBF35" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FFBF35" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip
              formatter={(v: any) => [formatRupiah(Number(v) || 0)]}
              contentStyle={{
                fontSize: 11,
                borderRadius: 16,
                border: '1px solid #cbd5e1',
                boxShadow: '4px 4px 12px #d8e2ed',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Area
              type="monotone"
              dataKey="penjualan"
              stroke="#FF8F2B"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPenjualan)"
              name="Penjualan (Omzet)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#FFBF35"
              strokeWidth={3}
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
