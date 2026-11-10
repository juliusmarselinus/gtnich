import Link from 'next/link'
import { formatRupiah } from '@/lib/mock-data'
import type { DashboardForecast } from '../services/dashboardService'

/** Kartu "kembaran dapur": perkiraan besok dari rata-rata 7 hari, jalan pintas ke Simulasi. */
export default function KembaranCard({ forecast }: { forecast?: DashboardForecast }) {
  return (
    <section aria-label="Perkiraan besok" className="relative flex flex-1 flex-col gap-1.5 overflow-hidden rounded-[28px] bg-kuning-muda p-[22px]">
      <svg aria-hidden="true" width="130" height="84" viewBox="0 0 140 90" className="absolute -right-3 -top-2">
        <circle cx="50" cy="45" r="38" fill="none" stroke="#FFE19A" strokeWidth="9" />
        <circle cx="90" cy="45" r="38" fill="none" stroke="#FFE19A" strokeWidth="9" strokeDasharray="13 9" />
      </svg>
      <span className="relative text-[13px] font-bold text-[#7A4F00]">
        Kembaran dapur · {forecast ? forecast.dayLabel : 'besok'}
      </span>
      <span className="relative text-[22px] font-extrabold tracking-tight text-kopi">
        {forecast ? `Perkiraan ${forecast.orders} pesanan` : '…'}
      </span>
      {forecast && (
        <span className="relative text-sm text-[#5C4A3B]">
          Sekitar {formatRupiah(forecast.revenue)}, dari rata-rata {forecast.basisDays} hari terakhir
        </span>
      )}
      <Link
        href="/dashboard/simulasi"
        className="relative mt-auto flex h-[38px] items-center self-start rounded-full bg-white px-4 text-[13px] font-bold text-kopi hover:bg-kuning-pucat transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-2xs hover:shadow-xs"
      >
        Coba skenario lain
      </Link>
    </section>
  )
}
