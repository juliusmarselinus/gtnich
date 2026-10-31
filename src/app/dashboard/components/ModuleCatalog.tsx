import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { navSections, totalFitur } from '@/lib/navigation'
import { card } from './ui'

/** Katalog semua fitur (pengganti "Modul Sistem DapurTwin" di overview lama). */
export default function ModuleCatalog() {
  return (
    <section aria-label="Semua fitur DapurTwin" className={clsx(card, 'flex flex-col gap-[18px] p-6')}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-extrabold tracking-tight text-kopi">Semua fitur DapurTwin</h2>
        <span className="text-[13px] font-semibold text-kopi-muted">
          {totalFitur} fitur dalam {navSections.length} modul
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {navSections.map(section => {
          const SectionIcon = section.icon
          return (
            <div key={section.id} className="flex flex-col gap-1 rounded-[22px] bg-kuning-pucat p-3.5">
              <div className="flex items-center gap-2.5 px-1 pb-2 pt-0.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kuning text-kopi">
                  <SectionIcon className="h-[17px] w-[17px]" />
                </span>
                <span className="flex-1 text-base font-extrabold text-kopi">{section.label}</span>
                <span className="text-xs font-semibold text-kopi-muted">{section.items.length} fitur</span>
              </div>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2.5 rounded-2xl bg-white p-2.5 hover:ring-2 hover:ring-kuning"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-bold text-kopi">{item.label}</span>
                    <span className="text-xs text-kopi-muted">{item.desc}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-koral-gelap transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}
