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

const COLORS = ['#D8431F', '#FF8F28', '#FFB800', '#228B5B', '#0284C7', '#8B5CF6', '#EC4899', '#14B8A6']

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
      {/* 1. Kebutuhan Bahan Terpakai */}
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className={iconBadge}>
            <PackageSearch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2B1D00] uppercase tracking-wider">
              Bahan Baku Terpakai Paling Banyak
            </h3>
            <p className="text-xs text-[#8A6A40] font-medium">
              Akumulasi bahan yang terpotong melalui transaksi penjualan kasir
            </p>
          </div>
        </div>

        {bahanUsage.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-[#FFF6E0] rounded-2xl border border-dashed border-[#FFD166]">
            <p className="text-xs font-bold text-[#8A5A00]">Belum ada pemakaian bahan</p>
            <p className="text-[11px] text-[#B8935A] mt-1 max-w-xs">
              Catatan bahan otomatis terkumpul saat kasir menyelesaikan penjualan menu yang memiliki resep.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={bahanUsage}
                layout="vertical"
                margin={{ top: 0, right: 15, bottom: 0, left: 65 }}
              >
                <CartesianGrid strokeDasharray="3 4" stroke="#EDD9B0" strokeOpacity={0.6} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9A7A55' }} stroke="#D9C8A8" />
                <YAxis
                  type="category"
                  dataKey="nama"
                  tick={{ fontSize: 11, fill: '#4A3B32', fontWeight: 600 }}
                  stroke="#D9C8A8"
                  width={80}
                />
                <Tooltip
                  formatter={(v: unknown, _name: unknown, item: { payload?: BahanUsageItem }) => [
                    `${v} ${item?.payload?.satuan || ''}`,
                    'Jumlah Terpakai',
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="qty" fill="#FF8F28" radius={[0, 8, 8, 0]} name="Qty Dipakai" />
              </BarChart>
            </ResponsiveContainer>

            {/* List Detail Table */}
            <div className="overflow-x-auto pt-2 border-t border-[#EDD9B0]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#9A7A55] text-[10px] uppercase font-bold border-b border-[#EDD9B0]">
                    <th className="pb-2">Nama Bahan</th>
                    <th className="pb-2 text-right">Terpakai</th>
                    <th className="pb-2 text-right">Est. Beban Modal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5E8CC]/60 font-medium text-slate-700">
                  {bahanUsage.slice(0, 5).map(b => (
                    <tr key={b.nama} className="hover:bg-[#FFF6E0] transition-colors">
                      <td className="py-2 font-bold text-[#2B1D00]">{b.nama}</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-800">
                        {b.qty} <span className="text-[10px] text-[#9A7A55] font-normal">{b.satuan}</span>
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-[#D8431F]">
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

      {/* 2. Distribusi Menu Terlaris */}
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className={iconBadge}>
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2B1D00] uppercase tracking-wider">
              Distribusi Pola Penjualan Menu
            </h3>
            <p className="text-xs text-[#8A6A40] font-medium">
              Porsi menu terjual dan kontribusi terhadap total pendapatan
            </p>
          </div>
        </div>

        {menuBreakdown.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-[#FFF6E0] rounded-2xl border border-dashed border-[#FFD166]">
            <p className="text-xs font-bold text-[#8A5A00]">Belum ada data porsi menu</p>
            <p className="text-[11px] text-[#B8935A] mt-1 max-w-xs">
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
                  formatter={(v: unknown, _name: unknown, item: { payload?: { revenue?: number } }) => [
                    `${v} porsi (${formatRupiah(item?.payload?.revenue || 0)})`,
                    'Terjual',
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6, fontWeight: 600, color: '#5A3A00' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* List Detail Table */}
            <div className="overflow-x-auto pt-2 border-t border-[#EDD9B0]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#9A7A55] text-[10px] uppercase font-bold border-b border-[#EDD9B0]">
                    <th className="pb-2">Nama Menu</th>
                    <th className="pb-2 text-center">Porsi</th>
                    <th className="pb-2 text-right">Omzet</th>
                    <th className="pb-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5E8CC]/60 font-medium text-slate-700">
                  {menuBreakdown.slice(0, 5).map(m => (
                    <tr key={m.name} className="hover:bg-[#FFF6E0] transition-colors">
                      <td className="py-2 font-bold text-[#2B1D00]">{m.name}</td>
                      <td className="py-2 text-center font-mono font-bold text-slate-800 bg-[#F5EDD8] rounded-md">
                        {m.qty}x
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-[#2B1D00]">
                        {formatRupiah(m.revenue)}
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-[#228B5B]">
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
