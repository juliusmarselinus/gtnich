'use client'

import { OrderRecord, OrderStatus } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { ShoppingBag, ChevronDown, ChevronUp, ReceiptText } from 'lucide-react'
import { useState, Fragment } from 'react'
import { ReceiptModal, orderToReceipt } from './Receipt'
import clsx from 'clsx'

interface RecentOrdersTableProps {
  orders: OrderRecord[]
  onUpdateStatus?: (order: OrderRecord, statusBaru: OrderStatus) => Promise<void>
}

const STATUS_UI: Record<string, { label: string; cls: string }> = {
  menunggu: { label: 'Menunggu', cls: 'bg-[#FFEDB3] text-[#8A5A00]' },
  preorder: { label: 'Pre-order', cls: 'bg-[#E3DCF3] text-[#6B5BB5]' },
  diproses: { label: 'Diproses', cls: 'bg-[#F2D9CC] text-[#C2502F]' },
  selesai: { label: 'Selesai', cls: 'bg-[#E2EBC0] text-[#5E7420]' },
  batal: { label: 'Batal', cls: 'bg-slate-100 text-slate-500' },
}

const NEXT_STEP: Record<string, { to: OrderStatus; label: string } | undefined> = {
  menunggu: { to: 'diproses', label: 'Proses' },
  preorder: { to: 'diproses', label: 'Proses' },
  diproses: { to: 'selesai', label: 'Selesai' },
}

const CARD = 'bg-white rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)]'
const TH = 'px-5 py-4 font-bold text-[#9A7B3A] uppercase tracking-wider text-[11px]'

export default function RecentOrdersTable({ orders, onUpdateStatus }: RecentOrdersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  const changeStatus = async (o: OrderRecord, to: OrderStatus) => {
    if (!onUpdateStatus) return
    if (to === 'batal' && !window.confirm(`Batalkan pesanan ${o.invoiceNumber}? Stok bahan akan dikembalikan.`)) return
    setBusyId(o.id)
    setStatusError(null)
    try {
      await onUpdateStatus(o, to)
    } catch (e) {
      setStatusError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }
  const [receiptOrder, setReceiptOrder] = useState<OrderRecord | null>(null)

  if (orders.length === 0) {
    return (
      <div className={`${CARD} py-12 text-center text-slate-400 text-xs`}>
        Belum ada riwayat transaksi penjualan kasir yang tersimpan.
      </div>
    )
  }

  return (
    <>
      {statusError && (
        <div className="mb-3 px-4 py-3 rounded-2xl bg-[#FDE7E1] text-[#B8391E] text-xs font-semibold">
          {statusError}
        </div>
      )}
      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[#FFF6D6] whitespace-nowrap">
                <th className={`text-left ${TH}`}>No. Nota</th>
                <th className={`text-left ${TH}`}>Pelanggan / Saluran</th>
                <th className={`text-left ${TH}`}>Waktu</th>
                <th className={`text-left ${TH}`}>Status</th>
                <th className={`text-right ${TH}`}>Total Penjualan</th>
                <th className={`text-right ${TH}`}>Laba Bersih</th>
                <th className={`text-right ${TH}`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF1D0]">
              {orders.map(o => {
                const exp = expandedId === o.id
                const tglStr = new Date(o.createdAt).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <Fragment key={o.id}>
                    <tr className="hover:bg-[#FFFBEF] transition-colors whitespace-nowrap">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 text-xs">{o.invoiceNumber}</p>
                        <span className="text-[10px] text-slate-400">{o.paymentMethod}</span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{o.customerName}</p>
                        <span className="inline-block mt-0.5 text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFF6D6] text-[#7A5A10] font-bold">
                          {o.channel}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-[11px]">{tglStr}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${(STATUS_UI[o.status] || STATUS_UI.selesai).cls}`}>
                          {(STATUS_UI[o.status] || STATUS_UI.selesai).label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right font-extrabold text-slate-900 text-sm">
                        {formatRupiah(o.totalPrice)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#FFF6D6] font-extrabold text-[#8A5A00] text-xs">
                          {formatRupiah(o.profit)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {onUpdateStatus && NEXT_STEP[o.status] && (
                            <button
                              type="button"
                              disabled={busyId === o.id}
                              onClick={() => changeStatus(o, NEXT_STEP[o.status]!.to)}
                              className="px-3 h-8 rounded-full bg-[#2B221C] text-white text-[11px] font-bold disabled:opacity-50 cursor-pointer transition-all duration-150 active:scale-95 hover:bg-black"
                            >
                              {busyId === o.id ? '...' : NEXT_STEP[o.status]!.label}
                            </button>
                          )}
                          {onUpdateStatus && NEXT_STEP[o.status] && (
                            <button
                              type="button"
                              disabled={busyId === o.id}
                              onClick={() => changeStatus(o, 'batal')}
                              className="px-3 h-8 rounded-full bg-[#FDE7E1] text-[#B8391E] text-[11px] font-bold disabled:opacity-50 cursor-pointer transition-all duration-150 active:scale-95 hover:bg-[#FAD3CB]"
                            >
                              Batal
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(o)}
                            className="px-3 h-8 rounded-full bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs hover:shadow-xs"
                          >
                            <ReceiptText className="w-3.5 h-3.5" /> Struk
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedId(exp ? null : o.id)}
                            className="w-8 h-8 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 cursor-pointer inline-flex items-center justify-center transition-all duration-200 active:scale-90"
                            title={exp ? 'Tutup rincian' : 'Lihat rincian item'}
                          >
                            <div className={clsx('transition-transform duration-200', exp && 'rotate-180')}>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {exp && (
                      <tr className="bg-[#FFFBEF] animate-in fade-in-0 duration-200">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-bold text-[#9A7B3A] uppercase tracking-wider flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 text-[#D98B00]" />
                              Rincian Menu ({o.items?.length || 0} item)
                            </p>
                            <span className="text-[11px] text-slate-400">
                              Kasir: <strong className="text-slate-700 font-semibold">{o.cashierName || '-'}</strong>
                            </span>
                          </div>

                          {!o.items || o.items.length === 0 ? (
                            <div className="py-2 text-[11px] text-slate-400 italic">
                              Tidak ada rincian item tersimpan untuk transaksi ini.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {o.items.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  className="flex justify-between items-center bg-white rounded-[20px] px-5 py-3 text-xs shadow-2xs transition-all hover:translate-x-1 duration-150"
                                >
                                  <div>
                                    <span className="font-bold text-slate-900">{item.namaMenu}</span>
                                    <span className="text-[#D98B00] font-bold ml-2">
                                      ({item.qty}x @ {formatRupiah(item.hargaJual)})
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-slate-900 font-extrabold font-mono">
                                      {formatRupiah(item.subtotal || item.hargaJual * item.qty)}
                                    </span>
                                    {item.hpp > 0 && (
                                      <span className="block text-[10px] text-slate-400 font-mono">
                                        HPP {formatRupiah(item.hpp * item.qty)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {o.notes && (
                            <div className="mt-3 px-4 py-3 rounded-[20px] bg-[#FDE8E4] text-[11px] text-[#B3361B] animate-in fade-in-0 duration-150">
                              <strong className="font-bold">Catatan:</strong> {o.notes}
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

      {receiptOrder && (
        <ReceiptModal data={orderToReceipt(receiptOrder)} onClose={() => setReceiptOrder(null)} />
      )}
    </>
  )
}