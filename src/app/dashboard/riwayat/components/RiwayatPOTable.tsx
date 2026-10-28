'use client'

import { Fragment, useState } from 'react'
import { RiwayatPO } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, Truck, PackageCheck, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

interface RiwayatPOTableProps {
  poList: RiwayatPO[]
}

export default function RiwayatPOTable({ poList }: RiwayatPOTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const statusCls: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 border border-slate-200',
    dikirim: 'bg-blue-50 text-blue-700 border border-blue-200',
    diterima: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    tagihan: 'bg-amber-50 text-amber-700 border border-amber-200',
    selesai: 'bg-teal-50 text-teal-700 border border-teal-200',
    batal: 'bg-rose-50 text-rose-700 border border-rose-200',
  }

  if (poList.length === 0) {
    return (
      <div className="clay-card p-12 text-center text-slate-400">
        <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-xs font-bold text-slate-600">Tidak ada riwayat purchase order ditemukan</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Semua pemesanan bahan baku ke supplier akan tersimpan di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="clay-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                No. PO
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Supplier
              </th>
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Tanggal Buat
              </th>
              <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Status
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Total Nilai PO
              </th>
              <th className="px-6 py-4 text-center">Rincian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {poList.map(po => {
              const exp = expandedId === po.id
              const dateCreated = new Date(po.tanggalBuat)
              const badgeClass = statusCls[po.status.toLowerCase()] || 'bg-slate-100 text-slate-600'
              return (
                <Fragment key={po.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 text-sm">
                      {po.noPO}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {po.namaSupplier}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div>
                        {dateCreated.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {dateCreated.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={clsx(
                          'px-3 py-1 rounded-full text-[11px] font-bold uppercase',
                          badgeClass
                        )}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">
                      {formatRupiah(po.totalAktual || po.totalEstimasi)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setExpandedId(exp ? null : po.id)}
                        className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800 cursor-pointer inline-flex items-center justify-center"
                        title={exp ? 'Tutup rincian' : 'Lihat rincian'}
                      >
                        {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {exp && (
                    <tr key={`${po.id}-det`} className="bg-slate-50/70">
                      <td colSpan={6} className="px-8 py-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Rincian Pasokan Bahan Masuk ({po.items.length} Item)
                          </p>
                          {po.tanggalTerima && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Diterima pada:{' '}
                              {new Date(po.tanggalTerima).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {po.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-white rounded-2xl px-5 py-3 clay-pill text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{item.namaBahan}</span>
                                <span className="text-slate-500 font-mono font-bold ml-2">
                                  — {item.qty} {item.satuan}
                                </span>
                                {item.diterima && (
                                  <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    ✓ Diterima
                                  </span>
                                )}
                              </div>
                              <div className="text-right font-mono text-slate-800 font-black">
                                {formatRupiah(item.qty * (item.hargaAktual || item.hargaEstimasi))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {po.catatan && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-700">
                            <strong>Catatan PO:</strong> {po.catatan}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
