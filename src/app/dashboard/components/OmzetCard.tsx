import { formatRupiah } from '@/lib/mock-data'
import clsx from 'clsx'
import type { DashboardMetricSummary } from '../services/dashboardService'
import { card } from './ui'

interface OmzetCardProps {
  metrics?: DashboardMetricSummary
  hourlyToday: number[]
  isLoading?: boolean
}

const JAM = ['06', '08', '10', '12', '14', '16', '18', '20']

export default function OmzetCard({ metrics, hourlyToday, isLoading }: OmzetCardProps) {
  const up = !metrics?.omzetChange?.startsWith('-')
  const max = Math.max(...hourlyToday, 1)
  const peak = hourlyToday.indexOf(Math.max(...hourlyToday))
  const channels = Object.entries(metrics?.todayByChannel || {})
    .map(([k, v]) => `${v} ${k}`)
    .join(' · ')

  return (
    <section aria-label="Omzet hari ini" className={clsx(card, 'flex flex-1 flex-col gap-1.5 p-[22px]')}>
      <span className="text-sm font-medium text-kopi-muted">Omzet hari ini</span>
      <span className="flex flex-wrap items-baseline gap-2.5">
        <span className="text-[34px] font-black leading-none tracking-[-0.03em] text-kopi">
          {isLoading || !metrics ? '…' : formatRupiah(metrics.omzetHariIni)}
        </span>
        {metrics && (
          <span className={clsx('text-[13px] font-bold', up ? 'text-aman' : 'text-koral')}>
            {up ? '▲' : '▼'} {metrics.omzetChange.replace(/^[+-]/, '')}
          </span>
        )}
      </span>
      {channels && <span className="text-sm text-kopi-muted">{channels}</span>}

      <div className="mt-1.5 flex flex-wrap gap-2">
        <span className="rounded-full bg-kuning-muda px-3 py-1.5 text-[13px] font-semibold">
          <b className="font-extrabold">{metrics?.todayOrders ?? '…'}</b> pesanan
        </span>
        <span className="rounded-full bg-kuning-muda px-3 py-1.5 text-[13px] font-semibold">
          <b className="font-extrabold">{metrics?.totalMenus ?? '…'}</b> menu aktif
        </span>
        <span
          className={clsx(
            'rounded-full px-3 py-1.5 text-[13px] font-semibold',
            (metrics?.lowStockCount ?? 0) > 0 ? 'bg-koral-muda text-[#A3341F]' : 'bg-kuning-muda'
          )}
        >
          <b className="font-extrabold">{metrics?.lowStockCount ?? '…'}</b> bahan menipis
        </span>
      </div>

      <div
        role="img"
        aria-label={`Omzet per dua jam hari ini, tertinggi sekitar jam ${JAM[peak]}.00`}
        className="mt-auto flex h-12 items-end gap-[5px] pt-3"
      >
        {hourlyToday.map((v, i) => (
          <span
            key={JAM[i]}
            title={`${JAM[i]}.00 · ${formatRupiah(v)}`}
            className={clsx('flex-1 rounded-full', i === peak && v > 0 ? 'bg-kuning' : 'bg-kuning-batang')}
            style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
          />
        ))}
      </div>
    </section>
  )
}
