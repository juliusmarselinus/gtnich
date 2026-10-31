import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import clsx from 'clsx'
import type { DashboardRecentOrder } from '../services/dashboardService'

const STEPS = ['Menunggu', 'Diproses', 'Dikirim', 'Selesai']
const PROGRESS: Record<string, string> = { menunggu: '18%', diproses: '45%' }

interface ActiveOrderStripProps {
  activeOrders: DashboardRecentOrder[]
  onOpen: (order: DashboardRecentOrder) => void
}

/** Strip kuning ala "player bar" template: pesanan terlama yang belum selesai. */
export default function ActiveOrderStrip({ activeOrders, onOpen }: ActiveOrderStripProps) {
  const current = activeOrders[0]
  const queued = activeOrders.length - 1

  return (
    <section
      aria-label="Pesanan berjalan"
      className="flex flex-wrap items-center gap-4 rounded-[28px] bg-kuning px-[18px] py-3.5 text-kopi"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-koral">
        <ChefHat className="h-5 w-5" />
      </span>

      {current ? (
        <>
          <button
            type="button"
            onClick={() => onOpen(current)}
            className="flex min-w-0 flex-[0_1_220px] flex-col text-left"
          >
            <span className="truncate text-[15px] font-extrabold">
              {current.status === 'menunggu' ? 'Menunggu dimasak' : 'Sedang diproses'} · {current.customerName}
            </span>
            <span className="text-[13px] text-[#4A3205]">
              {current.invoiceNumber} · {current.items.reduce((n, i) => n + i.qty, 0)} item
            </span>
          </button>
          <span className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
            <span className="flex justify-between text-xs font-semibold text-[#5A3E05]">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className={clsx(
                    (i === 0 || (i === 1 && current.status === 'diproses')) && 'font-extrabold text-kopi'
                  )}
                >
                  {s}
                </span>
              ))}
            </span>
            <span className="block h-2 overflow-hidden rounded-full bg-white/55">
              <span className="block h-full rounded-full bg-white" style={{ width: PROGRESS[current.status] || '10%' }} />
            </span>
          </span>
          {queued > 0 && <span className="text-[13px] font-bold text-[#4A3205]">+{queued} antre</span>}
        </>
      ) : (
        <span className="flex-1 text-[15px] font-bold">Tidak ada pesanan yang sedang berjalan.</span>
      )}

      <Link
        href="/dashboard/penjualan"
        className="flex h-[38px] items-center rounded-full bg-white px-4 text-[13px] font-bold hover:bg-kuning-pucat"
      >
        {current ? 'Semua pesanan' : 'Buka kasir'}
      </Link>
    </section>
  )
}
