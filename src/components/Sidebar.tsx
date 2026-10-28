'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import {
  Compass, Package, BarChart2, ChefHat, LogOut,
  Truck, ClipboardList, ShoppingCart, History, BoxSelect,
  Lightbulb, Image, Database, Sparkles, UtensilsCrossed, Receipt,
} from 'lucide-react'
import clsx from 'clsx'

const navSections = [
  {
    label: 'Operasional',
    items: [
      { href: '/dashboard', label: 'Ringkasan', icon: Compass },
      { href: '/dashboard/penjualan', label: 'Input Penjualan', icon: ShoppingCart },
      { href: '/dashboard/purchase-order', label: 'Purchase Order', icon: ClipboardList },
      { href: '/dashboard/tagihan', label: 'Tagihan Supplier', icon: Receipt },
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
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-68 min-h-screen bg-[#f3f6fa] border-r border-slate-200/80 flex flex-col flex-shrink-0 select-none overflow-y-auto relative z-20 p-4">
      {/* Brand Header Clay Card */}
      <div className="clay-card p-4 flex-shrink-0 mb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-105">
            <UtensilsCrossed className="w-6 h-6 drop-shadow" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-800 block leading-tight flex items-center gap-1.5">
              DapurTwin
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Manajemen Dapur & Stok
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 space-y-4">
        {navSections.map((section) => {
          const isActive = (href: string) =>
            href === '/dashboard' ? pathname === href : pathname.startsWith(href)

          return (
            <div key={section.label} className="space-y-1.5">
              <p className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        'flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 rounded-2xl',
                        active
                          ? 'clay-card text-emerald-700 bg-white shadow-[inset_2px_2px_4px_#ffffff,4px_4px_10px_#d8e2ed]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      )}
                    >
                      <div className={clsx(
                        'w-7 h-7 rounded-xl flex items-center justify-center transition-colors',
                        active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'
                      )}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Footer Clay Card */}
      <div className="clay-card p-3 flex-shrink-0 mt-5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-emerald-500/20">
              DT
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-slate-800">Admin Dapur</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">DapurTwin Active</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar"
            className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
