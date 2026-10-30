'use client'

import { useState } from 'react'
import { Supplier } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, Edit2, Trash2, Phone, MapPin, Tag } from 'lucide-react'

interface SupplierTableProps {
  list: Supplier[]
  onEdit: (s: Supplier) => void
  onDelete: (id: string) => void
}

export default function SupplierTable({
  list,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="clay-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Nama Supplier
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Kategori Pasokan
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Min. Order
              </th>
              <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Riwayat
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors whitespace-nowrap">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-800 text-sm">{s.nama}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-[#FF8F2B]" /> {s.telepon}
                </p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF6EC] text-[#FF8F2B] font-bold clay-pill text-[11px] border border-[#FFE2C2]">
                  <Tag className="w-3 h-3" /> {s.kategoriNama}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                {formatRupiah(s.minimalOrder)}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl clay-btn text-[#FF8F2B] hover:text-[#E67215] font-bold text-xs"
                >
                  {s.riwayat?.length || 0} pesanan
                  {expandedId === s.id ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onEdit(s)}
                    title="Edit"
                    className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    title="Hapus"
                    className="p-2 rounded-xl clay-btn text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Riwayat Detail Expand View */}
      {expandedId && (
        <div className="p-6 bg-slate-50/80 border-t border-slate-100">
          {(() => {
            const currentSupplier = list.find(s => s.id === expandedId)
            if (!currentSupplier) return null
            return (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF8F2B]" /> {currentSupplier.alamat}
                </p>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">
                  Riwayat Pengiriman & Pasokan
                </p>
                {currentSupplier.riwayat && currentSupplier.riwayat.length > 0 ? (
                  <div className="space-y-2">
                    {currentSupplier.riwayat.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 clay-pill"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{r.keterangan}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{r.tanggal}</p>
                        </div>
                        <span className="font-mono text-xs font-black text-[#FF8F2B]">
                          {formatRupiah(r.jumlah)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada riwayat pesanan.</p>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {list.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm font-medium">
          Tidak ada supplier ditemukan.
        </div>
      )}
    </div>
  )
}
