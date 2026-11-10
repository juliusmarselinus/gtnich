'use client'

import { useState, useMemo } from 'react'
import { Supplier } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Tag,
  Building2,
  Receipt,
  Calendar,
} from 'lucide-react'
import Pagination from '@/components/ui/Pagination'

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
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return list.slice(start, start + PAGE_SIZE)
  }, [list, currentPage])

  if (list.length === 0) {
    return (
      <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#2B261F]">Tidak ada supplier ditemukan</h3>
        <p className="text-xs text-[#8C8275] mt-1 max-w-sm mx-auto">
          Coba sesuaikan kata kunci pencarian atau tambah mitra supplier baru untuk operasional dapur.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-[#F0EBE1] bg-[#FCFAF6] text-[#8C8275] text-[11px] font-bold uppercase tracking-wider">
              <th className="text-left px-6 py-4">Nama Supplier</th>
              <th className="text-left px-6 py-4">Kategori Pasokan</th>
              <th className="text-right px-6 py-4">Min. Order</th>
              <th className="text-center px-6 py-4">Riwayat Pasokan</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F2EB]">
            {paginatedList.map(s => {
              const isExpanded = expandedId === s.id
              const orderCount = s.riwayat?.length || 0

              return (
                <tr
                  key={s.id}
                  className="hover:bg-[#FFFDF9] transition-colors group"
                >
                  {/* Supplier info & Phone */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] font-extrabold flex items-center justify-center text-xs flex-shrink-0 border border-[#FFE49A]/60">
                        {s.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-[#2B261F] text-sm group-hover:text-[#FF6B00] transition-colors">
                          {s.nama}
                        </p>
                        <p className="text-[11px] text-[#8C8275] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-[#FF8F2B]" /> {s.telepon || '-'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kategori Badge */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF0E6] text-[#D8431F] font-bold text-[11px] border border-[#FFD9C7]">
                      <Tag className="w-3 h-3" /> {s.kategoriNama || 'Umum'}
                    </span>
                  </td>

                  {/* Minimal Order */}
                  <td className="px-6 py-4 text-right font-mono font-bold text-[#2B261F]">
                    {s.minimalOrder > 0 ? formatRupiah(s.minimalOrder) : 'Tanpa Min.'}
                  </td>

                  {/* Riwayat Pasokan Expand Button */}
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                        orderCount > 0
                          ? 'bg-[#E8F5E4] text-[#2D7A1F] border border-[#C5E8BD] hover:bg-[#DCF2D5]'
                          : 'bg-[#F5F2EB] text-[#8C8275] border border-[#EBE6DC] hover:bg-[#EBE6DC]'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{orderCount} PO</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(s)}
                        title="Edit Supplier"
                        className="p-2 rounded-xl text-[#7A7062] hover:text-[#2B261F] hover:bg-[#FFF9EC] border border-transparent hover:border-[#FFE49A]/60 transition-all duration-150 active:scale-90 hover:scale-105 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(s.id)}
                        title="Hapus Supplier"
                        className="p-2 rounded-xl text-[#8C8275] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-150 active:scale-90 hover:scale-105 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[#F5F2EB]">
        {paginatedList.map(s => {
          const isExpanded = expandedId === s.id
          const orderCount = s.riwayat?.length || 0

          return (
            <div key={s.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] font-extrabold flex items-center justify-center text-xs flex-shrink-0 border border-[#FFE49A]/60">
                    {s.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2B261F] text-sm">{s.nama}</h4>
                    <p className="text-[11px] text-[#8C8275] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#FF8F2B]" /> {s.telepon || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(s)}
                    className="p-1.5 rounded-lg text-[#7A7062] hover:bg-[#FFF9EC] transition-all duration-150 active:scale-90"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all duration-150 active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#D8431F] font-bold text-[11px] border border-[#FFD9C7]">
                  <Tag className="w-3 h-3" /> {s.kategoriNama || 'Umum'}
                </span>
                <span className="font-mono font-bold text-[#2B261F]">
                  Min: {s.minimalOrder > 0 ? formatRupiah(s.minimalOrder) : 'Rp 0'}
                </span>
              </div>

              {/* Riwayat Toggle for Mobile */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#F0EBE1] text-xs font-bold text-[#2B261F]"
              >
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#FF8F2B]" />
                  {orderCount} Riwayat Pembelian
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Expanded content in mobile */}
              {isExpanded && (
                <div className="pt-2 pl-2 space-y-2 border-l-2 border-[#FFE49A]">
                  <p className="text-[11px] text-[#8C8275] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8F2B] flex-shrink-0" />
                    {s.alamat || 'Alamat belum diatur'}
                  </p>
                  {s.riwayat && s.riwayat.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {s.riwayat.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-[#FFFDF9] border border-[#F0EBE1] rounded-xl px-3 py-2 text-xs"
                        >
                          <div>
                            <p className="font-bold text-[#2B261F]">{r.keterangan}</p>
                            <p className="text-[10px] text-[#8C8275]">{r.tanggal}</p>
                          </div>
                          <span className="font-mono font-bold text-[#D8431F]">
                            {formatRupiah(r.jumlah)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8C8275] italic">Belum ada riwayat pesanan.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop Riwayat Detail Accordion */}
      {expandedId && (
        <div className="hidden md:block p-6 bg-[#FCFAF6] border-t border-[#F0EBE1] animate-in fade-in-50 duration-200">
          {(() => {
            const currentSupplier = list.find(s => s.id === expandedId)
            if (!currentSupplier) return null
            return (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#EBE6DC]">
                  <div>
                    <h5 className="font-extrabold text-[#2B261F] text-xs uppercase tracking-wider">
                      Detail Mitra & Riwayat Pasokan
                    </h5>
                    <p className="text-xs text-[#7A7062] flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF8F2B]" />{' '}
                      {currentSupplier.alamat || 'Alamat belum diatur di sistem'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-[#2B261F]">
                    {currentSupplier.riwayat?.length || 0} Pengiriman Tercatat
                  </span>
                </div>

                {currentSupplier.riwayat && currentSupplier.riwayat.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentSupplier.riwayat.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-[#EBE6DC] shadow-xs"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#2B261F]">{r.keterangan}</p>
                          <p className="text-[10px] text-[#8C8275] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-[#FF8F2B]" /> {r.tanggal}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-[#D8431F]">
                          {formatRupiah(r.jumlah)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8C8275] italic py-2">
                    Belum ada riwayat transaksi Purchase Order dengan supplier ini.
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      )}

      <div className="p-3 border-t border-[#F0EBE1] bg-[#FCFAF6]">
        <Pagination
          currentPage={currentPage}
          totalItems={list.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="mitra supplier"
        />
      </div>
    </div>
  )
}
