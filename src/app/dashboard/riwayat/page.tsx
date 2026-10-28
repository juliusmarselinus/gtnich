'use client'

import { useState, Fragment } from 'react'
import Topbar from '@/components/Topbar'
import { penjualanList, purchaseOrders } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

export default function RiwayatPage() {
  const [tab, setTab] = useState<'penjualan' | 'po'>('penjualan')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Riwayat Aktivitas Dapur" subtitle="Arsip log transaksi penjualan kasir dan riwayat pesanan purchase order ke distributor" />

      <main className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Clay Tabs */}
        <div className="flex gap-3">
          {[
            { key: 'penjualan', label: 'Riwayat Penjualan Menu' },
            { key: 'po', label: 'Riwayat Purchase Order (PO)' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as 'penjualan' | 'po'); setExpandedId(null) }}
              className={clsx(
                'px-5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                tab === t.key ? 'clay-btn-primary' : 'clay-btn text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Penjualan Table Clay Card */}
        {tab === 'penjualan' && (
          <div className="clay-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">No. Transaksi</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Waktu Transaksi</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Total Jual</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Laba Bersih</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penjualanList.map(t => {
                    const exp = expandedId === t.id
                    return (
                      <Fragment key={t.id}>
                        <tr className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800 text-sm">{t.noTransaksi}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{t.tanggal}</td>
                        <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">{formatRupiah(t.totalJual)}</td>
                        <td className="px-6 py-4 text-right font-mono font-black text-emerald-600 text-sm">{formatRupiah(t.profit)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setExpandedId(exp ? null : t.id)} className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800">
                            {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {exp && (
                        <tr key={`${t.id}-det`} className="bg-slate-50/70">
                          <td colSpan={5} className="px-8 py-5">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Rincian Menu Dipesan</p>
                            <div className="space-y-2">
                              {t.items.map((item, i) => (
                                <div key={i} className="flex justify-between bg-white rounded-2xl px-5 py-3 clay-pill text-xs">
                                  <span className="font-bold text-slate-800">{item.namaMenu} <span className="text-emerald-600 font-mono">({item.qty}x)</span></span>
                                  <span className="font-mono text-emerald-600 font-black">{formatRupiah(item.hargaJual * item.qty)}</span>
                                </div>
                              ))}
                            </div>
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
        )}

        {/* PO Table Clay Card */}
        {tab === 'po' && (
          <div className="clay-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">No. PO</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Supplier</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Tanggal</th>
                    <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Status</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Total Tagihan</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.map(po => {
                    const exp = expandedId === po.id
                    const statusCls: Record<string, string> = { draft: 'bg-slate-100 text-slate-600', dikirim: 'bg-blue-50 text-blue-600', diterima: 'bg-emerald-50 text-emerald-700', tagihan: 'bg-amber-50 text-amber-700' }
                    return (
                      <Fragment key={po.id}>
                        <tr className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                          <td className="px-6 py-4 font-mono font-bold text-slate-800 text-sm">{po.noPO}</td>
                          <td className="px-6 py-4 text-slate-800 font-bold">{po.namaSupplier}</td>
                          <td className="px-6 py-4 text-slate-500">{po.tanggalBuat}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={clsx('px-3 py-1 rounded-full text-[11px] font-bold clay-pill', statusCls[po.status])}>{po.status.toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">{formatRupiah(po.totalAktual || po.totalEstimasi)}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setExpandedId(exp ? null : po.id)} className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800 cursor-pointer">
                              {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                        {exp && (
                          <tr key={`${po.id}-det`} className="bg-slate-50/70">
                            <td colSpan={6} className="px-8 py-5">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Rincian Pasokan Bahan Masuk</p>
                              <div className="space-y-2">
                                {po.items.map((item, i) => (
                                  <div key={i} className="flex justify-between bg-white rounded-2xl px-5 py-3 clay-pill text-xs">
                                    <span className="font-bold text-slate-800">{item.namaBahan} — {item.qty} {item.satuan}</span>
                                    <span className="font-mono text-slate-800 font-black">{formatRupiah(item.qty * item.hargaEstimasi)}</span>
                                  </div>
                                ))}
                              </div>
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
        )}
      </main>
    </div>
  )
}
