'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass, Package, BarChart2, ChefHat, LogOut,
  Truck, ClipboardList, ShoppingCart, History, BoxSelect,
  Lightbulb, Image, Database, Sparkles, FileText, UtensilsCrossed,
} from 'lucide-react'
import clsx from 'clsx'

const navSections = [
  {
    label: 'Operasional',
    items: [
      { href: '/dashboard', label: 'Ringkasan', icon: Compass },
      { href: '/dashboard/penjualan', label: 'Input Penjualan', icon: ShoppingCart },
      { href: '/dashboard/purchase-order', label: 'Purchase Order', icon: ClipboardList },
    ],
  },
  {
    label: 'Inventori',
    items: [
      { href: '/dashboard/bahan', label: 'Data Bahan', icon: Package },
      { href: '/dashboard/menu', label: 'Menu & Resep', icon: ChefHat },
      { href: '/dashboard/suppliers', label: 'Supplier', icon: Truck },
      { href: '/dashboard/kondisi-bahan', label: 'Kondisi Bahan', icon: BoxSelect },
      { href: '/dashboard/stok-log', label: 'Stok Log & Opname', icon: Database },
    ],
  },
  {
    label: 'Analitik',
    items: [
      { href: '/dashboard/laporan', label: 'Laporan', icon: BarChart2 },
      { href: '/dashboard/riwayat', label: 'Riwayat', icon: History },
      { href: '/dashboard/simulasi', label: 'Simulasi', icon: Sparkles },
      { href: '/dashboard/rekomendasi', label: 'Rekomendasi', icon: Lightbulb },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/dashboard/ocr-nota', label: 'OCR Nota', icon: Image },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3E6B48] flex items-center justify-center text-white shadow-sm shadow-[#3E6B48]/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
              DapurTwin
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Manajemen Dapur & Stok
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 px-4 py-4 space-y-5">
        {navSections.map((section) => {
          const isActive = (href: string) =>
            href === '/dashboard' ? pathname === href : pathname.startsWith(href)

          return (
            <div key={section.label}>
              <p className="px-3 pb-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                        active
                          ? 'bg-[#3E6B48]/10 text-[#3E6B48]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <Icon
                        className={clsx(
                          'w-4 h-4 flex-shrink-0',
                          active ? 'text-[#3E6B48]' : 'text-slate-400'
                        )}
                      />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3E6B48] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              DT
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-slate-800">Admin Dapur</p>
              <p className="text-[10px] text-slate-400 mt-0.5">DapurTwin</p>
            </div>
          </div>
          <Link href="/login" title="Keluar" className="text-slate-400 hover:text-rose-600 transition-colors">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
