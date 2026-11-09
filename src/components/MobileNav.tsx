'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  Menu,
} from 'lucide-react'
import clsx from 'clsx'
import { useSidebar } from '@/context/SidebarContext'

export default function MobileNav() {
  const pathname = usePathname()
  const { toggleSidebar, isOpen } = useSidebar()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Beranda',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      href: '/dashboard/penjualan',
      label: 'Kasir POS',
      icon: ShoppingCart,
      isActive: pathname.startsWith('/dashboard/penjualan'),
    },
    {
      href: '/dashboard/bahan',
      label: 'Bahan',
      icon: Package,
      isActive: pathname.startsWith('/dashboard/bahan') || pathname.startsWith('/dashboard/kondisi-bahan'),
    },
    {
      href: '/dashboard/purchase-order',
      label: 'Beli (PO)',
      icon: ClipboardList,
      isActive: pathname.startsWith('/dashboard/purchase-order') || pathname.startsWith('/dashboard/tagihan'),
    },
  ]

  return (
    <nav
      aria-label="Navigasi bawah mobile"
      className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden bg-white/95 backdrop-blur-md border-t border-[#F0E6D8] shadow-[0_-4px_24px_rgba(43,34,28,0.08)] px-2 py-1.5 transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[58px] transition-all duration-150 active:scale-95',
                active ? 'text-[#2B1D00]' : 'text-[#8A6A40] hover:text-[#2B1D00]'
              )}
            >
              <span
                className={clsx(
                  'flex items-center justify-center w-9 h-7 rounded-full transition-colors',
                  active ? 'bg-[#FFB800] text-[#2B1D00] shadow-xs' : 'text-[#8A6A40]'
                )}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span
                className={clsx(
                  'text-[10px] mt-0.5 leading-tight truncate max-w-[62px]',
                  active ? 'font-black text-[#2B1D00]' : 'font-semibold text-[#8A6A40]'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Tombol Menu Lengkap (Membuka Sidebar Drawer) */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Tutup navigasi lengkap' : 'Buka menu lengkap'}
          className={clsx(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[58px] transition-all duration-150 active:scale-95 cursor-pointer',
            isOpen ? 'text-[#2B1D00]' : 'text-[#8A6A40] hover:text-[#2B1D00]'
          )}
        >
          <span
            className={clsx(
              'flex items-center justify-center w-9 h-7 rounded-full transition-colors',
              isOpen ? 'bg-[#FFB800] text-[#2B1D00] shadow-xs' : 'text-[#8A6A40]'
            )}
          >
            <Menu className="w-4 h-4" />
          </span>
          <span
            className={clsx(
              'text-[10px] mt-0.5 leading-tight truncate max-w-[62px]',
              isOpen ? 'font-black text-[#2B1D00]' : 'font-semibold text-[#8A6A40]'
            )}
          >
            Lainnya
          </span>
        </button>
      </div>
    </nav>
  )
}
