'use client'

import Topbar from '@/components/Topbar'
import { penjualanList, bahanList, menuList } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'

// Compute data from mock
const trendData = [
  { date: '22 Okt', penjualan: 0, profit: 0 },
  { date: '23 Okt', penjualan: 0, profit: 0 },
  { date: '24 Okt', penjualan: 180000, profit: 113100 },
  { date: '25 Okt', penjualan: 195000, profit: 128925 },
  { date: '26 Okt', penjualan: 340000, profit: 213400 },
  { date: '27 Okt', penjualan: 210000, profit: 135675 },
]

// Count bahan usage across all resep × penjualan
function getBahanUsage() {
  const usage: Record<string, number> = {}
  penjualanList.forEach(p => {
    p.items.forEach(item => {
      const menu = menuList.find(m => m.id === item.menuId)
      if (!menu) return
      menu.resep.forEach(r => {
        usage[r.namaBahan] = (usage[r.namaBahan] || 0) + r.qty * item.qty
      })
    })
  })
  return Object.entries(usage)
    .map(([nama, qty]) => ({ nama, qty: Math.round(qty * 100) / 100 }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)
}

// Menu breakdown by total sold
function getMenuBreakdown() {
  const count: Record<string, number> = {}
  penjualanList.forEach(p => {
    p.items.forEach(item => {
      count[item.namaMenu] = (count[item.namaMenu] || 0) + item.qty
    })
  })
  return Object.entries(count).map(([name, value]) => ({ name, value }))
}

const COLORS = ['#3E6B48', '#5A8A64', '#7BA680', '#9CC19C', '#C5DBC9', '#EAF0EC']

const bahanUsage = getBahanUsage()
const menuBreakdown = getMenuBreakdown()

const totalRevenue = penjualanList.reduce((s, p) => s + p.totalJual, 0)
const totalProfit = penjualanList.reduce((s, p) => s + p.profit, 0)
const totalTransaksi = penjualanList.length

export default function LaporanPage() {
  return (
    <div className="flex-1 pb-16">
      <Topbar title="Laporan" subtitle="Analisis penjualan, kebutuhan bahan, dan pola transaksi" />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Penjualan', value: formatRupiah(totalRevenue), sub: `${totalTransaksi} transaksi` },
            { label: 'Total Profit', value: formatRupiah(totalProfit), sub: `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` },
            { label: 'Rata-rata/Transaksi', value: formatRupiah(Math.round(totalRevenue / totalTransaksi)), sub: 'Per transaksi' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5">
              <p className="text-[10px] font-bold text-[#9C9589] uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-[#1F1D1A] mt-1 font-mono">{s.value}</p>
              <p className="text-[11px] text-[#3E6B48] font-medium mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">Tren Penjualan 7 Hari</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE5DF" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9C9589' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9C9589' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #EAE5DF' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="penjualan" stroke="#3E6B48" strokeWidth={2} dot={{ r: 4 }} name="Penjualan" />
              <Line type="monotone" dataKey="profit" stroke="#9CC19C" strokeWidth={2} dot={{ r: 4 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kebutuhan Bahan */}
          <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">Kebutuhan Bahan Terpakai</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bahanUsage} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE5DF" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9C9589' }} />
                <YAxis type="category" dataKey="nama" tick={{ fontSize: 10, fill: '#9C9589' }} width={60} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #EAE5DF' }} />
                <Bar dataKey="qty" fill="#3E6B48" radius={[0, 4, 4, 0]} name="Qty Dipakai" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Menu Breakdown */}
          <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-semibold text-[#1F1D1A] uppercase tracking-wider">Pola Penjualan per Menu</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={menuBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                  {menuBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #EAE5DF' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  )
}
