'use client'

import { formatRupiah } from '@/lib/mock-data'
import { BahanUsageItem, MenuSalesBreakdownItem } from '../types'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { ChefHat, PackageSearch } from 'lucide-react'

interface UsageAndMenuBreakdownProps {
  bahanUsage: BahanUsageItem[]
  menuBreakdown: MenuSalesBreakdownItem[]
}

const COLORS = ['#FF8F2B', '#FFBF35', '#89BDF7', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']

export default function UsageAndMenuBreakdown({
  bahanUsage,
  menuBreakdown,
}: UsageAndMenuBreakdownProps) {
  const pieData = menuBreakdown.map(m => ({
    name: m.name,
    value: m.qty,
    revenue: m.revenue,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kebutuhan Bahan Terpakai */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#FFF6EC] text-[#FF8F2B]">
            <PackageSearch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bahan Baku Terpakai Paling Banyak
            </h3>
            <p className="text-[11px] text-slate-400">
              Akumulasi bahan yang terpotong melalui transaksi penjualan
            </p>
          </div>
        </div>

        {bahanUsage.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-600">Belum ada pemakaian bahan</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Catatan bahan otomatis terkumpul saat kasir menyelesaikan penjualan menu yang memiliki resep.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={bahanUsage}
                layout="vertical"
                margin={{ top: 0, right: 15, bottom: 0, left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="nama"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  width={75}
                />
                <Tooltip
                  formatter={(v: any, name: any, item: any) => [
                    `${v} ${item?.payload?.satuan || ''}`,
                    'Jumlah Terpakai',
                  ]}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 16,
                    border: '1px solid #cbd5e1',
                    boxShadow: '4px 4px 12px #d8e2ed',
                  }}
                />
                <Bar dataKey="qty" fill="#FF8F2B" radius={[0, 8, 8, 0]} name="Qty Dipakai" />
              </BarChart>
            </ResponsiveContainer>

            {/* List Detail Table */}
            <div className="overflow-x-auto pt-2 border-t border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                    <th className="pb-1.5">Nama Bahan</th>
                    <th className="pb-1.5 text-right">Terpakai</th>
                    <th className="pb-1.5 text-right">Est. Beban Bahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {bahanUsage.slice(0, 5).map(b => (
                    <tr key={b.nama} className="hover:bg-slate-50/50">
                      <td className="py-1.5">{b.nama}</td>
                      <td className="py-1.5 text-right font-mono font-bold text-slate-800">
                        {b.qty} <span className="text-[10px] text-slate-400 font-normal">{b.satuan}</span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-[#FF8F2B]">
                        {formatRupiah(b.totalEstimasiBiaya)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Distribusi Menu Terlaris */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-50 text-cyan-600">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Distribusi Pola Penjualan Menu
            </h3>
            <p className="text-[11px] text-slate-400">
              Porsi menu terjual dan kontribusi terhadap pendapatan
            </p>
          </div>
        </div>

        {menuBreakdown.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-600">Belum ada data porsi menu</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Catatan menu favorit akan terkumpul setelah ada pesanan kasir masuk.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, name: any, item: any) => [
                    `${v} porsi (${formatRupiah(item?.payload?.revenue || 0)})`,
                    'Terjual',
                  ]}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 16,
                    border: '1px solid #cbd5e1',
                    boxShadow: '4px 4px 12px #d8e2ed',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              </PieChart>
            </ResponsiveContainer>

            {/* List Detail Table */}
            <div className="overflow-x-auto pt-2 border-t border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                    <th className="pb-1.5">Nama Menu</th>
                    <th className="pb-1.5 text-center">Porsi</th>
                    <th className="pb-1.5 text-right">Omzet</th>
                    <th className="pb-1.5 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {menuBreakdown.slice(0, 5).map(m => (
                    <tr key={m.name} className="hover:bg-slate-50/50">
                      <td className="py-1.5 font-bold text-slate-800">{m.name}</td>
                      <td className="py-1.5 text-center font-mono">{m.qty}x</td>
                      <td className="py-1.5 text-right font-mono">{formatRupiah(m.revenue)}</td>
                      <td className="py-1.5 text-right font-mono font-bold text-cyan-600">
                        {formatRupiah(m.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
