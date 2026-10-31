import Link from 'next/link'
import clsx from 'clsx'
import { formatRupiah } from '@/lib/mock-data'
import type { DashboardRevenueDay } from '../services/dashboardService'
import { card, cardTitle, rupiahPendek, textLink } from './ui'

export default function WeeklyRevenueCard({ days }: { days: DashboardRevenueDay[] }) {
  const total = days.reduce((s, d) => s + d.revenue, 0)
  const max = Math.max(...days.map(d => d.revenue), 1)
  const top = days.reduce((a, b) => (b.revenue > a.revenue ? b : a), days[0] || { date: '-', revenue: 0, orders: 0 })

  return (
    <section aria-label="Omzet 7 hari" className={clsx(card, 'flex flex-col gap-3 p-5')}>
      <div className="flex items-center justify-between">
        <h2 className={cardTitle}>Omzet 7 hari</h2>
        <span className="text-sm font-bold text-kopi">Rp {rupiahPendek(total)}</span>
      </div>

      {total === 0 ? (
        <p className="flex h-[150px] items-center justify-center text-sm text-kopi-muted">Belum ada penjualan tercatat.</p>
      ) : (
        <>
          <div
            role="img"
            aria-label={`Omzet harian 7 hari, tertinggi ${top.date} ${formatRupiah(top.revenue)}`}
            className="flex h-[130px] items-end gap-2"
          >
            {days.map((d, i) => (
              <div
                key={`${d.date}-${i}`}
                title={`${d.date}: ${formatRupiah(d.revenue)} · ${d.orders} pesanan`}
                className={clsx('flex-1 rounded-full', i === days.length - 1 ? 'bg-kuning' : 'bg-kuning-batang')}
                style={{ height: `${Math.max(8, (d.revenue / max) * 100)}%` }}
              />
            ))}
          </div>
          <div className="flex gap-2 text-xs text-kopi-muted">
            {days.map((d, i) => (
              <span
                key={`${d.date}-l-${i}`}
                className={clsx('flex-1 text-center', i === days.length - 1 && 'font-extrabold text-kopi')}
              >
                {d.date}
              </span>
            ))}
          </div>
        </>
      )}

      <Link href="/dashboard/laporan" className={clsx(textLink, 'mt-auto')}>
        Lihat statistik lengkap →
      </Link>
    </section>
  )
}
