'use client'

import { useState } from 'react'
import { PesananWithKebutuhan } from '../types'
import { OrderStatus } from '@/app/dashboard/(pos)/penjualan/types'
import { formatRupiah } from '@/lib/mock-data'
import {
  Clock,
  User,
  Phone,
  Layers,
  ChefHat,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  Receipt,
  MessageCircle,
} from 'lucide-react'
import clsx from 'clsx'

interface PesananCardProps {
  order: PesananWithKebutuhan
  busy?: boolean
  onUpdateStatus: (order: PesananWithKebutuhan, statusBaru: OrderStatus) => Promise<void>
  onTandaiLunas?: (order: PesananWithKebutuhan) => Promise<void>
  onViewReceipt: (order: PesananWithKebutuhan) => void
}

const STATUS_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  preorder: {
    label: 'Pre-Order',
    cls: 'bg-[#E3DCF3] text-[#6B5BB5] border-[#D4C8EB]',
    dot: 'bg-[#6B5BB5]',
  },
  menunggu: {
    label: 'Menunggu',
    cls: 'bg-[#FFEDB3] text-[#8A5A00] border-[#FDE08A]',
    dot: 'bg-[#D97706]',
  },
  diproses: {
    label: 'Sedang Dimasak / Diproses',
    cls: 'bg-[#F2D9CC] text-[#C2502F] border-[#E8C2B0]',
    dot: 'bg-[#C2502F]',
  },
  selesai: {
    label: 'Selesai & Disajikan',
    cls: 'bg-[#E2EBC0] text-[#5E7420] border-[#D4DF9E]',
    dot: 'bg-[#65A30D]',
  },
  batal: {
    label: 'Dibatalkan',
    cls: 'bg-slate-100 text-slate-500 border-slate-200',
    dot: 'bg-slate-400',
  },
}

export default function PesananCard({
  order,
  busy = false,
  onUpdateStatus,
  onTandaiLunas,
  onViewReceipt,
}: PesananCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const statusInfo = STATUS_BADGE[order.status] || STATUS_BADGE.menunggu

  const formatTanggal = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  // Helper normalisasi cek lunas
  const isLunas = String(order.paymentStatus || '').toLowerCase() === 'lunas'

  // Teks catatan bersih tanpa tag [PREORDER]
  const cleanNotes = (order.notes || '').replace(/\[PREORDER\]/g, '').trim()

  return (
    <div
      className={clsx(
        'relative rounded-[28px] bg-white border border-[#EBE6DC] shadow-[0_4px_20px_rgba(120,80,30,0.06)] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(120,80,30,0.12)] flex flex-col justify-between space-y-4',
        order.status === 'preorder' && 'border-purple-200/80 bg-gradient-to-b from-purple-50/20 to-white',
        order.status === 'diproses' && 'border-orange-200/80 bg-gradient-to-b from-orange-50/20 to-white',
        order.status === 'selesai' && 'border-emerald-200/60 opacity-95',
        order.status === 'batal' && 'border-slate-200/60 opacity-70 bg-slate-50/50'
      )}
    >
      <div className="space-y-3.5">
        {/* Header Nota & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-black text-sm text-slate-900 tracking-tight">
                {order.invoiceNumber}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4EFE6] font-extrabold text-kopi">
                {order.channel}
              </span>
              {order.tableNumber && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black tracking-wide shadow-2xs">
                  {order.tableNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-slate-400" /> {formatTanggal(order.createdAt)}
            </p>
          </div>

          <span
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 shadow-2xs',
              statusInfo.cls
            )}
          >
            <span className={clsx('w-2 h-2 rounded-full', statusInfo.dot)} />
            {statusInfo.label}
          </span>
        </div>

        {/* Info Pelanggan & Kasir */}
        <div className="p-3.5 rounded-2xl bg-[#FFFBF5] border border-[#F2E5D0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF0DB] text-[#D97706] flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 leading-tight">
                {order.customerName || 'Pelanggan Walk-In'}
              </p>
              {order.customerPhone && (
                <p className="text-[10.5px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-2.5 h-2.5" /> {order.customerPhone}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Metode Bayar
            </span>
            <span className="text-xs font-bold text-slate-700">
              {order.paymentMethod} •{' '}
              <span
                className={clsx(
                  isLunas ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'
                )}
              >
                {isLunas ? 'Lunas' : 'Belum Lunas'}
              </span>
            </span>
            {!isLunas && onTandaiLunas && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onTandaiLunas(order)}
                className="mt-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer ml-auto disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Terima Kasir (Lunas)
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan Item Pesanan */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-[#FF8F2B]" /> Daftar Menu Pesanan
          </p>
          <div className="space-y-1">
            {order.items?.map(it => (
              <div
                key={it.id || it.namaMenu}
                className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50/80 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono font-bold text-[11px] flex items-center justify-center shadow-2xs">
                    {it.qty}x
                  </span>
                  <span className="font-bold text-slate-800">{it.namaMenu}</span>
                </div>
                <span className="font-mono text-slate-600 font-semibold">
                  {formatRupiah(it.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan Pelanggan */}
        {cleanNotes && (
          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[10.5px] uppercase tracking-wide text-amber-800 block">
                Catatan Khusus:
              </span>
              <p className="text-xs font-medium italic mt-0.5 leading-snug">{cleanNotes}</p>
            </div>
          </div>
        )}

        {/* Pengecekan Kesiapan Stok Bahan Resep (Khusus Pre-Order / Menunggu) */}
        {(order.status === 'preorder' || order.status === 'menunggu') &&
          order.kebutuhanBahan &&
          order.kebutuhanBahan.length > 0 && (
            <div
              className={clsx(
                'p-3.5 rounded-2xl border text-xs space-y-2',
                order.bisaDiproses
                  ? 'bg-emerald-50/80 border-emerald-200/70 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200/70 text-rose-900'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  {order.bisaDiproses ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Bahan Baku Dapur Siap Diproses</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Ada {order.bahanKurangCount} Bahan Kurang</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetail(!showDetail)}
                  className="text-[11px] font-bold underline flex items-center gap-0.5 cursor-pointer opacity-80 hover:opacity-100"
                >
                  {showDetail ? 'Tutup Resep' : 'Cek Bahan'}
                  {showDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Rincian bahan jika di-expand */}
              {showDetail && (
                <div className="pt-2 border-t border-black/10 space-y-1 text-[11px]">
                  {order.kebutuhanBahan.map(b => (
                    <div
                      key={b.bahanId}
                      className="flex items-center justify-between py-0.5 font-medium"
                    >
                      <span>{b.namaBahan}:</span>
                      <span
                        className={clsx(
                          'font-mono font-bold',
                          b.cukup ? 'text-emerald-700' : 'text-rose-600 font-extrabold'
                        )}
                      >
                        Perlu {b.qtyDibutuhkan} {b.satuan} (Ada: {b.stokTersedia})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Footer Total & Tombol Aksi Transisi Status */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Tagihan</span>
          <span className="font-mono font-black text-xl text-slate-900">
            {formatRupiah(order.totalPrice)}
          </span>
        </div>

        {/* Tombol Aksi Operasional Berdasarkan Status */}
        <div className="flex items-center gap-2">
          {/* Tombol Cetak / Lihat Struk */}
          <button
            type="button"
            onClick={() => onViewReceipt(order)}
            className="h-10 px-3 rounded-full border border-[#EDD9B0] bg-white hover:bg-[#FFF6E0] text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Lihat Struk Pesanan"
          >
            <Receipt className="w-3.5 h-3.5" />
          </button>

          {/* Transisi Status: Pre-Order / Menunggu -> Diproses */}
          {(order.status === 'preorder' || order.status === 'menunggu') && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onUpdateStatus(order, 'diproses')}
                className="flex-1 h-10 px-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(234,88,12,0.25)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Masak / Proses</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm(`Batalkan pesanan ${order.invoiceNumber}?`)) {
                    onUpdateStatus(order, 'batal')
                  }
                }}
                className="h-10 px-3.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Batalkan Pesanan"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Transisi Status: Diproses -> Selesai */}
          {order.status === 'diproses' && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onUpdateStatus(order, 'selesai')}
                className="flex-1 h-10 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Tandai Selesai &amp; Siap Diambil</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm(`Batalkan pesanan ${order.invoiceNumber}? Stok bahan akan dikembalikan otomatis.`)) {
                    onUpdateStatus(order, 'batal')
                  }
                }}
                className="h-10 px-3.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Batalkan Pesanan"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Pesanan Selesai / Batal: Label Info Statis */}
          {order.status === 'selesai' && (
            <div className="flex-1 h-10 px-4 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200/50">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Selesai &amp; Telah Diserahkan</span>
            </div>
          )}

          {order.status === 'batal' && (
            <div className="flex-1 h-10 px-4 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>Pesanan Dibatalkan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
