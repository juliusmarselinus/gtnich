'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass,
  ShoppingBag,
  Package,
  Users,
  BarChart2,
  Store,
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Ringkasan', icon: Compass },
  { href: '/dashboard/orders', label: 'Daftar Pesanan', icon: ShoppingBag },
  { href: '/dashboard/products', label: 'Katalog & Stok', icon: Package },
  { href: '/dashboard/customers', label: 'Pelanggan', icon: Users },
  { href: '/dashboard/reports', label: 'Laporan Keuangan', icon: BarChart2 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3E6B48] flex items-center justify-center text-white shadow-sm shadow-[#3E6B48]/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
              OrderHub
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Pusat Kendali UMKM
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="px-3 pb-3 text-[11px] uppercase font-bold tracking-wider text-slate-400">
          Menu Utama
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all',
                isActive
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon
                className={clsx(
                  'w-4 h-4',
                  isActive ? 'text-[#3E6B48]' : 'text-slate-400'
                )}
              />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* Sinkronisasi Card */}
        <div className="pt-8 px-1">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#3E6B48]" />
              Sinkronisasi Aktif
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Order dari WhatsApp & web toko terhubung otomatis ke stok gudang.
            </p>
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              BS
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-slate-800">Budi Santoso</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Toko Camilan</p>
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
