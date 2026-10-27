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

function getMenuBreakdown() {
  const count: Record<string, number> = {}
  penjualanList.forEach(p => {
    p.items.forEach(item => {
      count[item.namaMenu] = (count[item.namaMenu] || 0) + item.qty
    })
  })
  return Object.entries(count).map(([name, value]) => ({ name, value }))
}

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#84cc16']

const bahanUsage = getBahanUsage()
const menuBreakdown = getMenuBreakdown()

const totalRevenue = penjualanList.reduce((s, p) => s + p.totalJual, 0)
const totalProfit = penjualanList.reduce((s, p) => s + p.profit, 0)
const totalTransaksi = penjualanList.length

export default function LaporanPage() {
  return (
    <div className="flex-1 pb-16">
      <Topbar title="Laporan & Statistik Dapur" subtitle="Analisis kinerja omzet, estimasi kebutuhan bahan terpakai, dan pola menu terlaris" />

      <main className="p-8 space-y-7 max-w-7xl mx-auto">
        {/* Summary Clay Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Total Omzet Terkumpul', value: formatRupiah(totalRevenue), sub: `${totalTransaksi} transaksi penjualan` },
            { label: 'Total Estimasi Profit', value: formatRupiah(totalProfit), sub: `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin rata-rata` },
            { label: 'Nilai Keranjang Rata-rata', value: formatRupiah(Math.round(totalRevenue / totalTransaksi)), sub: 'Per transaksi pelanggan' },
          ].map(s => (
            <div key={s.label} className="clay-card p-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-black text-slate-800 mt-1.5 font-mono">{s.value}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart Clay Card */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tren Penjualan & Profit 7 Hari</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatRupiah(Number(v) || 0)} contentStyle={{ fontSize: 11, borderRadius: 16, border: '1px solid #cbd5e1', boxShadow: '4px 4px 12px #d8e2ed' }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Line type="monotone" dataKey="penjualan" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Penjualan" />
              <Line type="monotone" dataKey="profit" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar + Pie Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kebutuhan Bahan */}
          <div className="clay-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kebutuhan Bahan Terpakai Terbanyak</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bahanUsage} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="nama" tick={{ fontSize: 10, fill: '#64748b' }} width={70} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 16, border: '1px solid #cbd5e1' }} />
                <Bar dataKey="qty" fill="#10b981" radius={[0, 8, 8, 0]} name="Qty Dipakai" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Menu Breakdown */}
          <div className="clay-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Distribusi Pola Penjualan Menu</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={menuBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                  {menuBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 16, border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  )
}
