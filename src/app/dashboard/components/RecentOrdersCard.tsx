import Link from 'next/link'
import clsx from 'clsx'
import { formatRupiah } from '@/lib/mock-data'
import type { DashboardRecentOrder } from '../services/dashboardService'
import { card, cardTitle, channelInitials, formatJam, textLink } from './ui'

interface RecentOrdersCardProps {
  orders: DashboardRecentOrder[]
  onSelect: (order: DashboardRecentOrder) => void
}

export default function RecentOrdersCard({ orders, onSelect }: RecentOrdersCardProps) {
  return (
    <section aria-label="Transaksi masuk" className={clsx(card, 'flex flex-col gap-1.5 p-5')}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className={cardTitle}>Transaksi masuk</h2>
        <Link href="/dashboard/riwayat" className={textLink}>
          Riwayat
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-kopi-muted">Belum ada transaksi masuk.</p>
      ) : (
        orders.slice(0, 4).map(o => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o)}
            className="flex items-center gap-3 rounded-[14px] px-1.5 py-2 text-left hover:bg-kuning-pucat"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-kuning-muda text-xs font-extrabold text-kuning-teks">
              {channelInitials(o.channel)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-bold text-kopi">{o.customerName}</span>
              <span className="text-xs text-kopi-muted">
                {o.invoiceNumber} · {formatJam(o.createdAt)}
              </span>
            </span>
            <span className="text-sm font-bold text-kopi">{formatRupiah(o.totalPrice)}</span>
          </button>
        ))
      )}

      {orders.length > 0 && <span className="mt-auto pt-1.5 text-xs text-kopi-muted">Klik transaksi untuk lihat nota</span>}
    </section>
  )
}
