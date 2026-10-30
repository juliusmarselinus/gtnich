'use client'

import { StokLog } from '../types'
import { TrendingUp, TrendingDown, Clock, Search } from 'lucide-react'
import clsx from 'clsx'

const sourceBadge: Record<string, string> = {
  PO: 'bg-blue-50 text-blue-700 border-blue-200/50',
  Penjualan: 'bg-amber-50 text-amber-700 border-amber-200/50',
  Manual: 'bg-purple-50 text-purple-700 border-purple-200/50',
  Opname: 'bg-[#FFF6EC] text-[#FF8F2B] border-[#FFE2C2]',
  Penyesuaian: 'bg-slate-100 text-slate-700 border-slate-200',
}

interface StokLogTableProps {
  logs: StokLog[]
  search: string
  onSearchChange: (v: string) => void
  filterSource: string
  onFilterSourceChange: (v: string) => void
}

export default function StokLogTable({
  logs,
  search,
  onSearchChange,
  filterSource,
  onFilterSourceChange,
}: StokLogTableProps) {
  return (
    <div className="space-y-4">
      {/* Search & Source Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari nama bahan atau catatan..."
            className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'PO', 'Penjualan', 'Manual', 'Opname'].map(src => (
            <button
              key={src}
              onClick={() => onFilterSourceChange(src)}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filterSource === src
                  ? 'clay-btn-primary shadow-sm'
                  : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              {src === 'all' ? 'Semua Sumber' : src}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Waktu Transaksi
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Bahan Baku
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Stok Sebelum
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Perubahan (Mutasi)
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Stok Sesudah
              </th>
              <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Sumber / Keterangan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => {
              const isMasuk = log.perubahan > 0
              return (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {log.tanggalFormatted}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{log.namaBahan}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Satuan: {log.satuan}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-400 font-semibold">
                    {log.stokSebelum}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 font-mono font-black text-xs px-2.5 py-1 rounded-full clay-pill',
                        isMasuk
                          ? 'bg-[#FFF6EC] text-[#FF8F2B]'
                          : 'bg-rose-50 text-rose-600'
                      )}
                    >
                      {isMasuk ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isMasuk ? '+' : ''}
                      {log.perubahan} {log.satuan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">
                    {log.stokSesudah}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold border clay-pill',
                          sourceBadge[log.sumber] || 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {log.sumber}
                      </span>
                      {log.catatan && (
                        <span className="text-[10px] text-slate-400 max-w-[180px] truncate" title={log.catatan}>
                          {log.catatan}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Belum ada catatan mutasi stok di database.
          </div>
        )}
      </div>
    </div>
  )
}
