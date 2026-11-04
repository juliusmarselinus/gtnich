'use client'

import { useState, useMemo } from 'react'
import { StokLog } from '../types'
import { TrendingUp, TrendingDown, Clock, Search, Database } from 'lucide-react'
import clsx from 'clsx'
import Pagination from '@/components/ui/Pagination'

const sourceBadge: Record<string, string> = {
  PO: 'bg-[#FFF0E6] text-[#FF6B00] border-[#FFD9C7]',
  Penjualan: 'bg-[#FFF6D6] text-[#8A5A00] border-[#FFE49A]',
  Manual: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]',
  Opname: 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]',
  Kadaluarsa: 'bg-[#FDE8E4] text-[#D8431F] border-[#F9C2B8]',
  'Pembatalan Penjualan': 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
  Penyesuaian: 'bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]',
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
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 15

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return logs.slice(start, start + PAGE_SIZE)
  }, [logs, currentPage])
  return (
    <div className="space-y-4">
      {/* Search & Source Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari nama bahan atau catatan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] placeholder:text-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'PO', 'Penjualan', 'Manual', 'Opname', 'Penyesuaian', 'Kadaluarsa'].map(src => (
            <button
              key={src}
              type="button"
              onClick={() => onFilterSourceChange(src)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                filterSource === src
                  ? 'bg-[#2B261F] text-white shadow-xs'
                  : 'bg-white text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
              )}
            >
              {src === 'all' ? 'Semua Sumber' : src}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-[#F0EBE1] bg-[#FCFAF6] text-[#8C8275] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="text-left px-6 py-4">Waktu Transaksi</th>
                <th className="text-left px-6 py-4">Bahan Baku</th>
                <th className="text-right px-6 py-4">Stok Sebelum</th>
                <th className="text-right px-6 py-4">Perubahan (Mutasi)</th>
                <th className="text-right px-6 py-4">Stok Sesudah</th>
                <th className="text-center px-6 py-4">Sumber / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {paginatedLogs.map(log => {
                const isMasuk = log.perubahan > 0
                return (
                  <tr key={log.id} className="hover:bg-[#FFFDF9] transition-colors group">
                    <td className="px-6 py-4 text-[#8C8275] font-mono text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#FF8F2B]" />
                        {log.tanggalFormatted}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-[#2B261F] text-sm group-hover:text-[#FF6B00] transition-colors">
                        {log.namaBahan}
                      </p>
                      <p className="text-[10px] text-[#8C8275] font-medium mt-0.5">Satuan: {log.satuan}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[#8C8275] font-semibold">
                      {log.stokSebelum}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 rounded-full border shadow-xs',
                          isMasuk
                            ? 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]'
                            : 'bg-[#FDE8E4] text-[#D8431F] border-[#F9C2B8]'
                        )}
                      >
                        {isMasuk ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {isMasuk ? '+' : ''}
                        {log.perubahan} {log.satuan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-[#2B261F] text-sm">
                      {log.stokSesudah}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span
                          className={clsx(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs',
                            sourceBadge[log.sumber] || 'bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]'
                          )}
                        >
                          {log.sumber}
                        </span>
                        {log.catatan && (
                          <span className="text-[10px] text-[#8C8275] max-w-[200px] truncate" title={log.catatan}>
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

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[#F5F2EB]">
          {paginatedLogs.map(log => {
            const isMasuk = log.perubahan > 0
            return (
              <div key={log.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-[#2B261F] text-sm">{log.namaBahan}</h4>
                    <p className="text-[10px] text-[#8C8275] flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-[#FF8F2B]" /> {log.tanggalFormatted}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs',
                      sourceBadge[log.sumber] || 'bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]'
                    )}
                  >
                    {log.sumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-[11px] text-[#8C8275]">
                    Sebelum: <strong className="text-[#2B261F] font-mono">{log.stokSebelum}</strong>
                    {' → '}
                    Sesudah: <strong className="text-[#2B261F] font-mono">{log.stokSesudah} {log.satuan}</strong>
                  </div>

                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border',
                      isMasuk
                        ? 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]'
                        : 'bg-[#FDE8E4] text-[#D8431F] border-[#F9C2B8]'
                    )}
                  >
                    {isMasuk ? '+' : ''}{log.perubahan} {log.satuan}
                  </span>
                </div>

                {log.catatan && (
                  <p className="text-[11px] text-[#8C8275] bg-[#FCFAF6] p-2 rounded-xl border border-[#F0EBE1]">
                    {log.catatan}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-16 text-[#8C8275] text-sm font-medium">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6" />
            </div>
            Belum ada catatan mutasi stok di database.
          </div>
        )}

        <div className="p-3 border-t border-[#F0EBE1] bg-[#FCFAF6]">
          <Pagination
            currentPage={currentPage}
            totalItems={logs.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemLabel="riwayat mutasi stok"
          />
        </div>
      </div>
    </div>
  )
}
