'use client'

import { useState } from 'react'
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
      <Topbar title="Riwayat" subtitle="Histori transaksi penjualan dan purchase order" />

      <main className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#EAE5DF]">
          {[{ key: 'penjualan', label: 'Riwayat Penjualan' }, { key: 'po', label: 'Riwayat Purchase Order' }].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as 'penjualan' | 'po'); setExpandedId(null) }}
              className={clsx('px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px', tab === t.key ? 'border-[#3E6B48] text-[#3E6B48]' : 'border-transparent text-[#9C9589] hover:text-[#1F1D1A]')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Penjualan Table */}
        {tab === 'penjualan' && (
          <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                  <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">No. Transaksi</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Tanggal</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Total Jual</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Profit</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0EB]">
                {penjualanList.map(t => {
                  const exp = expandedId === t.id
                  return (
                    <>
                      <tr key={t.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-5 py-4 font-mono font-semibold text-[#1F1D1A]">{t.noTransaksi}</td>
                        <td className="px-5 py-4 text-[#9C9589]">{t.tanggal}</td>
                        <td className="px-5 py-4 text-right font-mono font-semibold text-[#1F1D1A]">{formatRupiah(t.totalJual)}</td>
                        <td className="px-5 py-4 text-right font-mono font-semibold text-[#3E6B48]">{formatRupiah(t.profit)}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setExpandedId(exp ? null : t.id)} className="p-1.5 rounded-lg hover:bg-[#EAE5DF] text-[#9C9589]">
                            {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {exp && (
                        <tr key={`${t.id}-det`} className="bg-[#FAF8F5]">
                          <td colSpan={5} className="px-8 py-4">
                            <div className="space-y-2">
                              {t.items.map((item, i) => (
                                <div key={i} className="flex justify-between bg-white rounded-lg px-4 py-2.5 border border-[#EAE5DF] text-xs">
                                  <span className="font-medium text-[#1F1D1A]">{item.namaMenu} × {item.qty}</span>
                                  <span className="font-mono text-[#3E6B48] font-semibold">{formatRupiah(item.hargaJual * item.qty)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PO Table */}
        {tab === 'po' && (
          <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                  <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">No. PO</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Supplier</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Tanggal</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0EB]">
                {purchaseOrders.map(po => {
                  const exp = expandedId === po.id
                  const statusCls: Record<string, string> = { draft: 'bg-slate-100 text-slate-600', dikirim: 'bg-blue-50 text-blue-600', diterima: 'bg-[#EAF0EC] text-[#3E6B48]', tagihan: 'bg-amber-50 text-amber-700' }
                  return (
                    <>
                      <tr key={po.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-5 py-4 font-mono font-semibold text-[#1F1D1A]">{po.noPO}</td>
                        <td className="px-5 py-4 text-[#1F1D1A] font-medium">{po.namaSupplier}</td>
                        <td className="px-5 py-4 text-[#9C9589]">{po.tanggalBuat}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={clsx('px-2 py-1 rounded-lg text-[11px] font-semibold', statusCls[po.status])}>{po.status.charAt(0).toUpperCase() + po.status.slice(1)}</span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-semibold text-[#1F1D1A]">{formatRupiah(po.totalAktual || po.totalEstimasi)}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setExpandedId(exp ? null : po.id)} className="p-1.5 rounded-lg hover:bg-[#EAE5DF] text-[#9C9589]">
                            {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {exp && (
                        <tr key={`${po.id}-det`} className="bg-[#FAF8F5]">
                          <td colSpan={6} className="px-8 py-4">
                            <div className="space-y-2">
                              {po.items.map((item, i) => (
                                <div key={i} className="flex justify-between bg-white rounded-lg px-4 py-2.5 border border-[#EAE5DF] text-xs">
                                  <span className="text-[#1F1D1A] font-medium">{item.namaBahan} — {item.qty} {item.satuan}</span>
                                  <span className="font-mono text-[#1F1D1A]">{formatRupiah(item.qty * item.hargaEstimasi)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
