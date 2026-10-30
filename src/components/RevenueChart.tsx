'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { revenueData } from '@/lib/mock-data'

const formatK = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
  return `${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1D1A] text-[#FAF8F5] rounded-lg px-3 py-2 text-xs shadow-md border border-[#383531]">
        <p className="text-[#9C9589] mb-0.5">{label} 2026</p>
        <p className="font-semibold text-white">
          Rp {payload[0].value.toLocaleString('id-ID')}
        </p>
        <p className="text-[11px] text-[#DCD6CD] mt-0.5">
          {payload[1]?.value} transaksi selesai
        </p>
      </div>
    )
  }
  return null
}

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scandiChart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF8F2B" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#FF8F2B" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F4F0EB" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9C9589' }}
          axisLine={{ stroke: '#EAE5DF' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatK}
          tick={{ fontSize: 11, fill: '#9C9589' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#FF8F2B"
          strokeWidth={2}
          fill="url(#scandiChart)"
          dot={{ fill: '#FF8F2B', strokeWidth: 2, r: 3, stroke: '#FFFFFF' }}
          activeDot={{ r: 5, fill: '#FF8F2B', stroke: '#FFFFFF', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="orders"
          stroke="#C85A32"
          strokeWidth={0}
          fill="transparent"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
