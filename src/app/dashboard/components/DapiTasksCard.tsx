'use client'

import Link from 'next/link'
import { ChevronRight, ClipboardList, PackageCheck, Receipt, PartyPopper } from 'lucide-react'
import clsx from 'clsx'
import DapiMascot from '@/components/ui/DapiMascot'
import SunCloud from '@/components/ui/SunCloud'
import type { DashboardLowStockBahan, DashboardTask, DashboardTaskKind } from '../services/dashboardService'
import { card } from './ui'

const taskIcon: Record<DashboardTaskKind, React.ElementType> = {
  po_draft: ClipboardList,
  po_baru: ClipboardList,
  terima_barang: PackageCheck,
  bayar_tagihan: Receipt,
}

interface DapiTasksCardProps {
  tasks: DashboardTask[]
  lowStockItems: DashboardLowStockBahan[]
  isLoading?: boolean
}

/** Kartu utama beranda: Dapi di atas kuning + daftar tugas yang diturunkan dari data stok & PO. */
export default function DapiTasksCard({ tasks, lowStockItems, isLoading }: DapiTasksCardProps) {
  const hasAlert = lowStockItems.length > 0
  const empty = habisAtauMenipis(lowStockItems)

  return (
    <section aria-label="Tugas dari Dapi" className={clsx(card, 'flex w-full min-w-0 flex-col overflow-hidden')}>
      <div className="relative h-40 overflow-hidden bg-kuning px-6 py-5">
        <SunCloud className="left-[46%] top-4 h-12 w-28" />
        <span className="relative block text-[13px] font-semibold text-[#5A3E05]">Dari Dapi</span>
        <h2 className="relative mt-0.5 text-2xl font-extrabold tracking-tight text-kopi">
          {isLoading ? 'Dapi cek dapur dulu…' : tasks.length > 0 ? `${tasks.length} tugas buat hari ini` : 'Dapur aman hari ini'}
        </h2>
        {hasAlert && (
          <span className="relative mt-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-bold text-[#A3341F]">
            <span className="h-[7px] w-[7px] rounded-full bg-koral" />
            {empty}
          </span>
        )}
        <DapiMascot
          width={168}
          mood={hasAlert ? 'khawatir' : 'senang'}
          className="absolute -bottom-14 right-4 hidden sm:block"
        />
      </div>

      {tasks.length === 0 && !isLoading ? (
        <div className="flex flex-1 items-center gap-3 px-6 py-6 text-sm text-kopi-muted">
          <PartyPopper className="h-5 w-5 text-kuning-teks" />
          Tidak ada stok menipis, PO tertunda, atau tagihan terbuka.
        </div>
      ) : (
        <ol className="flex flex-col px-3.5 pb-3.5 pt-2">
          {tasks.map((t, i) => {
            const Icon = taskIcon[t.kind]
            const primary = i === 0
            return (
              <li
                key={t.id}
                className={clsx('flex items-center gap-3 px-2 py-3', i < tasks.length - 1 && 'border-b border-[#F6ECDD]')}
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-kuning-muda text-kuning-teks">
                  <Icon className="h-[19px] w-[19px]" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px] font-bold text-kopi">{t.title}</span>
                  <span className="truncate text-[13px] text-kopi-muted">{t.detail}</span>
                </span>
                {primary ? (
                  <Link
                    href={t.href}
                    className="flex h-9 flex-shrink-0 items-center rounded-full bg-koral px-4 text-[13px] font-bold text-white hover:bg-koral-gelap"
                  >
                    {t.actionLabel}
                  </Link>
                ) : (
                  <Link
                    href={t.href}
                    aria-label={`${t.actionLabel}: ${t.title}`}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-kuning text-kuning-teks hover:bg-kuning-muda"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function habisAtauMenipis(items: DashboardLowStockBahan[]) {
  if (items.length === 0) return ''
  const habis = items.find(i => i.stock <= 0)
  if (habis) return `${habis.name} habis`
  return `${items[0].name} menipis`
}
