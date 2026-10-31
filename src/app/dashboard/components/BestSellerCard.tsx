import Link from 'next/link'
import clsx from 'clsx'
import { formatRupiah } from '@/lib/mock-data'
import type { DashboardBestSellerMenu } from '../services/dashboardService'
import { card, cardTitle, textLink } from './ui'

export default function BestSellerCard({ items }: { items: DashboardBestSellerMenu[] }) {
  const sold = items.filter(i => i.sold > 0)

  return (
    <section aria-label="Menu terlaris" className={clsx(card, 'flex flex-col gap-2 p-5')}>
      <div className="mb-0.5 flex items-center justify-between">
        <h2 className={cardTitle}>Menu terlaris</h2>
        <Link href="/dashboard/menu" className={textLink}>
          Kelola menu
        </Link>
      </div>

      {sold.length === 0 ? (
        <p className="py-8 text-center text-sm text-kopi-muted">Belum ada menu yang terjual.</p>
      ) : (
        <ol className="flex flex-col">
          {sold.slice(0, 3).map((m, i) => (
            <li key={m.id} className="flex items-center gap-3 py-1.5">
              <span
                className={clsx(
                  'flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-black',
                  i === 0 ? 'bg-kuning text-kopi' : 'bg-kuning-muda text-kuning-teks'
                )}
              >
                {i + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold text-kopi">{m.name}</span>
                <span className="text-xs text-kopi-muted">{formatRupiah(m.price)}</span>
              </span>
              <span className="text-[13px] font-bold text-kopi">{m.sold} porsi</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
