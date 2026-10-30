'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import {
  LayoutDashboard, Package, BarChart2, ChefHat, LogOut,
  Truck, ClipboardList, ShoppingCart, History, BoxSelect,
  Lightbulb, Image, Database, Sparkles, UtensilsCrossed, Receipt, X,
  ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface NavSection {
  id: string
  label: string
  icon: React.ElementType
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    id: 'operasional',
    label: 'Operasional',
    icon: ShoppingCart,
    items: [
      { href: '/dashboard/penjualan', label: 'Input Penjualan', icon: ShoppingCart },
      { href: '/dashboard/purchase-order', label: 'Pembelian Stok', icon: ClipboardList },
      { href: '/dashboard/tagihan', label: 'Tagihan Supplier', icon: Receipt },
    ],
  },
  {
    id: 'inventaris',
    label: 'Inventaris',
    icon: Package,
    items: [
      { href: '/dashboard/bahan', label: 'Data Bahan', icon: Package },
      { href: '/dashboard/menu', label: 'Menu & Resep', icon: ChefHat },
      { href: '/dashboard/suppliers', label: 'Supplier', icon: Truck },
      { href: '/dashboard/kondisi-bahan', label: 'Kondisi Bahan', icon: BoxSelect },
      { href: '/dashboard/stok-log', label: 'Stok Log & Opname', icon: Database },
    ],
  },
  {
    id: 'analitik',
    label: 'Analitik & Laporan',
    icon: BarChart2,
    items: [
      { href: '/dashboard/laporan', label: 'Laporan Keuangan', icon: BarChart2 },
      { href: '/dashboard/riwayat', label: 'Riwayat Transaksi', icon: History },
      { href: '/dashboard/simulasi', label: 'Simulasi Bisnis', icon: Sparkles },
      { href: '/dashboard/rekomendasi', label: 'Rekomendasi AI', icon: Lightbulb },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Utilitas',
    icon: Sparkles,
    items: [
      { href: '/dashboard/ocr-nota', label: 'OCR Nota', icon: Image },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isOpen, closeSidebar } = useSidebar()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Track the single open module ID
  const [activeSectionId, setActiveSectionId] = useState<string | null>('operasional')

  // Automatically expand only the module that contains the currently active route
  useEffect(() => {
    const matchedSection = navSections.find((section) =>
      section.items.some((item) =>
        item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
      )
    )
    if (matchedSection) {
      setActiveSectionId(matchedSection.id)
    }
  }, [pathname])

  const toggleSection = (sectionId: string) => {
    setActiveSectionId((prev) => {
      const willOpen = prev !== sectionId
      if (willOpen) {
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        }, 120)
        return sectionId
      }
      return null
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isOverviewActive = pathname === '/dashboard'
  const isItemActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer: Clean Warm White Aesthetic */}
      <aside
        className={clsx(
          'w-64 h-screen max-h-screen bg-[#FFFFFF] border-r border-[#EBE3D7] flex flex-col flex-shrink-0 select-none z-50 p-3 transition-transform duration-300 ease-in-out',
          'lg:static lg:translate-x-0',
          'fixed inset-y-0 left-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="clay-card p-3 flex-shrink-0 mb-2.5 flex items-center justify-between border-[#EBE3D7]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFBF35] to-[#FF8F2B] flex items-center justify-center text-white shadow-xs transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 drop-shadow-xs" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight flex items-center gap-1.5">
                DapurTwin
                <span className="inline-block w-2 h-2 rounded-full bg-[#FF8F2B]" />
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Manajemen Dapur & Stok
              </span>
            </div>
          </Link>

          {/* Tombol Close di Mobile */}
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-xl clay-btn text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STANDALONE OVERVIEW BUTTON */}
        <div className="mb-2 px-0.5 flex-shrink-0">
          <Link
            href="/dashboard"
            onClick={() => {
              if (window.innerWidth < 1024) closeSidebar()
            }}
            className={clsx(
              'flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all duration-150 rounded-xl border',
              isOverviewActive
                ? 'bg-[#FFF5EB] text-[#FF8F2B] border-[#FFD8B0] shadow-xs'
                : 'text-slate-700 hover:text-slate-900 bg-[#FAF7F2] hover:bg-white border-[#EBE3D7]'
            )}
          >
            <div
              className={clsx(
                'w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
                isOverviewActive
                  ? 'bg-gradient-to-tr from-[#FFBF35] to-[#FF8F2B] text-white shadow-2xs'
                  : 'bg-white text-[#FF8F2B] border border-[#EBE3D7]'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <span className="block text-xs font-extrabold tracking-tight">Overview</span>
              <span className="block text-[10px] text-slate-500 font-normal">
                Pusat Kendali & Modul
              </span>
            </div>
            <span
              className={clsx(
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                isOverviewActive ? 'bg-[#FF8F2B]' : 'bg-transparent'
              )}
            />
          </Link>
        </div>

        {/* Header Label Modul */}
        <div className="px-2 pb-1 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Daftar Modul
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-semibold">
            {navSections.length} Modul
          </span>
        </div>

        {/* Nav Sections with Accordion */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
          {navSections.map((section) => {
            const isExpanded = activeSectionId === section.id
            const SectionIcon = section.icon
            const hasActiveChild = section.items.some((item) => isItemActive(item.href))

            return (
              <div
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el
                }}
                className={clsx(
                  'rounded-xl transition-all duration-150 p-1',
                  hasActiveChild
                    ? 'bg-[#FFF8F0] border border-[#FFD8B0]'
                    : 'bg-transparent'
                )}
              >
                {/* Module Dropdown Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={clsx(
                    'w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer',
                    hasActiveChild
                      ? 'text-[#FF8F2B]'
                      : 'text-slate-800 hover:text-slate-950 hover:bg-[#FAF7F2]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={clsx(
                        'w-5 h-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0',
                        hasActiveChild
                          ? 'bg-[#FF8F2B] text-white shadow-2xs'
                          : 'bg-[#F0EBE1] text-slate-700'
                      )}
                    >
                      <SectionIcon className="w-3 h-3" />
                    </div>
                    <span className="tracking-tight text-[11px] uppercase font-bold text-slate-850">
                      {section.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-white text-slate-600 font-semibold border border-[#EBE3D7]">
                      {section.items.length}
                    </span>
                    <ChevronDown
                      className={clsx(
                        'w-3.5 h-3.5 text-slate-500 transition-transform duration-200',
                        isExpanded ? 'rotate-180 text-[#FF8F2B]' : 'rotate-0'
                      )}
                    />
                  </div>
                </button>

                {/* Submenu Dropdown Container */}
                <div
                  className={clsx(
                    'overflow-hidden transition-all duration-200 ease-in-out',
                    isExpanded ? 'max-h-72 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="space-y-0.5 pl-2 pr-1 py-0.5 border-l-2 border-[#FFD8B0] ml-3">
                    {section.items.map(({ href, label, icon: Icon }) => {
                      const active = isItemActive(href)
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => {
                            if (window.innerWidth < 1024) closeSidebar()
                          }}
                          className={clsx(
                            'flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 rounded-lg',
                            active
                              ? 'bg-white text-[#FF8F2B] border border-[#FFD8B0] shadow-xs font-bold'
                              : 'text-slate-700 hover:text-slate-950 hover:bg-[#FAF7F2]'
                          )}
                        >
                          <div
                            className={clsx(
                              'w-5 h-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0',
                              active ? 'bg-[#FFF0E0] text-[#FF8F2B]' : 'text-slate-500'
                            )}
                          >
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="truncate text-[11px]">{label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* User Footer Clay Card */}
        <div className="clay-card p-2.5 flex-shrink-0 mt-2 border-[#EBE3D7]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFBF35] to-[#FF8F2B] text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
                DT
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-900">Admin Dapur</p>
                <p className="text-[10px] text-[#FF8F2B] font-semibold">DapurTwin Active</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="text-slate-500 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
