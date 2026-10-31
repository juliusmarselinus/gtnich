import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import type { DashboardLowStockBahan } from '../services/dashboardService'
import { card, cardTitle, textLink } from './ui'

export default function LowStockCard({ items }: { items: DashboardLowStockBahan[] }) {
  return (
    <section aria-label="Stok menipis" className={clsx(card, 'flex flex-col gap-3 p-5')}>
      <div className="flex items-center justify-between">
        <h2 className={cardTitle}>Stok menipis</h2>
        {items.length > 0 ? (
          <Link
            href="/dashboard/purchase-order"
            className="flex h-8 items-center rounded-full bg-koral px-3.5 text-xs font-bold text-white hover:bg-koral-gelap"
          >
            Buat PO
          </Link>
        ) : (
          <Link href="/dashboard/bahan" className={textLink}>
            Semua bahan
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="flex items-center gap-2 rounded-2xl bg-kuning-pucat p-4 text-sm text-kopi-muted">
          <CheckCircle2 className="h-4 w-4 text-aman" />
          Semua bahan di atas batas minimum.
        </p>
      ) : (
        items.slice(0, 4).map(item => {
          const habis = item.stock <= 0
          const pct = item.stockMinimum > 0 ? Math.min(100, (item.stock / item.stockMinimum) * 100) : 20
          return (
            <div key={item.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-kopi">{item.name}</span>
                {habis ? (
                  <span className="font-bold text-[#B42318]">Habis</span>
                ) : (
                  <span className="text-kopi-muted">
                    {item.stock.toLocaleString('id-ID')} / {item.stockMinimum.toLocaleString('id-ID')} {item.satuan}
                  </span>
                )}
              </div>
              <span className={clsx('block h-2 overflow-hidden rounded-full', habis ? 'bg-[#FBE2DC]' : 'bg-kuning-muda')}>
                {!habis && <span className="block h-full rounded-full bg-kuning" style={{ width: `${pct}%` }} />}
              </span>
            </div>
          )
        })
      )}
      {items.length > 4 && (
        <Link href="/dashboard/kondisi-bahan" className={clsx(textLink, 'mt-auto')}>
          +{items.length - 4} bahan lain
        </Link>
      )}
    </section>
  )
}
