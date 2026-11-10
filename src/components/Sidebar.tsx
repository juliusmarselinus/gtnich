'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, LayoutDashboard, LogOut, Settings, X, HelpCircle } from 'lucide-react'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from '@/context/SidebarContext'
import { useTour } from '@/context/TourContext'
import { navSections } from '@/lib/navigation'
import DapiHead from './ui/DapiHead'
import DapurTwinLogo from './ui/DapurTwinLogo'
import PengaturanModal from './PengaturanModal'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isOpen, closeSidebar, isCollapsed, toggleCollapsed } = useSidebar()
  const { openTour, activeSectionNeeded, isTourOpen } = useTour()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>('operasional')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Jika tur butuh modul tertentu terbuka, otomatis buka accordion-nya
  useEffect(() => {
    if (isTourOpen && activeSectionNeeded) {
      if (isCollapsed) toggleCollapsed()
      setActiveSectionId(activeSectionNeeded)
    }
  }, [isTourOpen, activeSectionNeeded, isCollapsed, toggleCollapsed])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUser({ email: data.user.email || 'Admin' })
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_name')
        .eq('id', data.user.id)
        .maybeSingle()
      setStoreName(profile?.store_name || data.user.user_metadata?.store_name || null)
    })
  }, [supabase])

  // Buka otomatis hanya modul yang berisi halaman aktif
  useEffect(() => {
    const matchedSection = navSections.find(section =>
      section.items.some(item => pathname.startsWith(item.href))
    )
    if (matchedSection) setActiveSectionId(matchedSection.id)
  }, [pathname])

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) {
      toggleCollapsed()
      setActiveSectionId(sectionId)
      return
    }
    setActiveSectionId(prev => (prev === sectionId ? null : sectionId))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isOverviewActive = pathname === '/dashboard'
  const isItemActive = (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href))
  const onNavigate = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) closeSidebar()
  }

  const collapsed = isCollapsed
  const hideWhenCollapsed = collapsed ? 'lg:hidden' : ''

  const rowClass = (active: boolean) =>
    clsx(
      'flex min-h-[42px] w-full items-center gap-2.5 rounded-2xl px-2.5 text-[13px] transition-all duration-150 cursor-pointer active:scale-[0.98]',
      collapsed && 'lg:justify-center lg:px-0',
      active
        ? 'bg-[#FFF1CC] font-bold text-kopi shadow-[0_2px_8px_rgba(255,184,0,0.18)]'
        : 'font-semibold text-[#3D3027] hover:bg-[#FFF7E3] hover:translate-x-0.5'
    )

  const iconClass = (active: boolean) =>
    clsx(
      'flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-150',
      active ? 'bg-kuning text-kopi scale-105 shadow-xs' : 'bg-[#FFF7E3] text-kuning-teks group-hover:scale-105'
    )

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && <div onClick={closeSidebar} className="fixed inset-0 z-40 bg-kopi/30 backdrop-blur-sm lg:hidden" />}

      <aside
        aria-label="Navigasi samping"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[268px] select-none flex-col justify-between gap-2 bg-white p-2.5 sm:p-3 transition-[transform,width] duration-300 ease-in-out',
          'lg:static lg:z-auto lg:h-full lg:translate-x-0 lg:rounded-[28px] lg:shadow-kartu',
          collapsed ? 'lg:w-[86px]' : 'lg:w-[256px]',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Bagian Atas: Brand + Overview + Daftar Modul */}
        <div className="flex flex-col gap-2 min-h-0 flex-1">
          {/* Blok brand: kuning + Dapi Mascot */}
          <div
            className={clsx(
              'relative flex-shrink-0 overflow-hidden rounded-[22px] bg-kuning',
              collapsed
                ? 'h-[66px] p-2 flex items-center justify-center'
                : 'h-[80px] px-4 py-2.5 flex items-center justify-between shadow-2xs'
            )}
          >
            <span
              aria-hidden="true"
              className={clsx('absolute right-14 top-2 h-7 w-7 rounded-full bg-koral-terang/80', hideWhenCollapsed)}
            />

            <Link
              href="/dashboard"
              onClick={onNavigate}
              className={clsx('relative z-10 flex flex-col justify-center min-w-0', hideWhenCollapsed)}
            >
              <DapurTwinLogo realFill="#FFFFFF" />
              <span className="text-[12px] font-bold text-kopi truncate max-w-[136px] leading-tight mt-0.5">
                {storeName || 'Dapur Saya'}
              </span>
            </Link>

            {/* Maskot Dapi */}
            <div
              className={clsx(
                'relative flex-shrink-0 pointer-events-none',
                collapsed ? 'flex items-center justify-center' : '-mr-3 -mb-3'
              )}
            >
              <DapiHead size={collapsed ? 46 : 60} mood="senang" />
            </div>

            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Tutup menu navigasi"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-kopi lg:hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Overview Button */}
          <Link
            href="/dashboard"
            onClick={onNavigate}
            data-tour="tour-overview"
            aria-current={isOverviewActive ? 'page' : undefined}
            title={collapsed ? 'Overview' : undefined}
            className={clsx(rowClass(isOverviewActive), 'flex-shrink-0')}
          >
            <span className={iconClass(isOverviewActive)}>
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span className={clsx('truncate', hideWhenCollapsed)}>Overview</span>
          </Link>

          {/* Label Header Modul */}
          <div className={clsx('flex flex-shrink-0 items-center justify-between px-2 pt-0.5', hideWhenCollapsed)}>
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#7A6A5C]">
              Daftar Modul
            </span>
            <span className="text-[10px] font-semibold text-[#A89A8E]">{navSections.length} modul</span>
          </div>

          {/* Navigasi Modul (Semua sub-item terbuka penuh tanpa scroll terpisah) */}
          <nav className="space-y-1 overflow-y-auto flex-1 pr-0.5 scrollbar-none">
            {navSections.map(section => {
              const SectionIcon = section.icon
              const expanded = activeSectionId === section.id && !collapsed
              const hasActiveChild = section.items.some(item => isItemActive(item.href))

              return (
                <div
                  key={section.id}
                  ref={el => {
                    sectionRefs.current[section.id] = el
                  }}
                  data-tour={`tour-modul-${section.id}`}
                  className={clsx('rounded-2xl transition-colors', expanded && 'bg-kuning-pucat/80')}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={expanded}
                    title={collapsed ? section.label : undefined}
                    className={rowClass(hasActiveChild && !expanded)}
                  >
                    <span className={iconClass(hasActiveChild)}>
                      <SectionIcon className="h-4 w-4" />
                    </span>
                    <span className={clsx('flex-1 text-left truncate', hideWhenCollapsed)}>
                      {section.label}
                    </span>
                    <span
                      className={clsx(
                        'rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-kopi-muted ring-1 ring-krim-garis/80',
                        hideWhenCollapsed
                      )}
                    >
                      {section.items.length}
                    </span>
                    <ChevronDown
                      className={clsx(
                        'h-3.5 w-3.5 text-kopi-muted transition-transform duration-200',
                        expanded && 'rotate-180',
                        hideWhenCollapsed
                      )}
                    />
                  </button>

                  {/* Sub-menu: TAMPIL PENUH TANPA SCROLLBAR */}
                  <div
                    className={clsx(
                      'overflow-hidden transition-all duration-250 ease-in-out',
                      expanded ? 'max-h-[320px] opacity-100 py-1' : 'max-h-0 opacity-0 py-0 pointer-events-none'
                    )}
                  >
                    <div className="ml-5 space-y-0.5 border-l-2 border-krim-garis/90 pl-2.5 pr-1">
                      {section.items.map(({ href, label }) => {
                        const active = isItemActive(href)
                        const tourKey =
                          href === '/dashboard/penjualan'
                            ? 'tour-penjualan'
                            : href === '/dashboard/proses-pesanan'
                            ? 'tour-proses-pesanan'
                            : href === '/dashboard/purchase-order'
                            ? 'tour-purchase-order'
                            : href === '/dashboard/tagihan'
                            ? 'tour-tagihan'
                            : href === '/dashboard/bahan'
                            ? 'tour-bahan'
                            : href === '/dashboard/menu'
                            ? 'tour-menu'
                            : href === '/dashboard/suppliers'
                            ? 'tour-suppliers'
                            : href === '/dashboard/kondisi-bahan'
                            ? 'tour-kondisi-bahan'
                            : href === '/dashboard/stok-log'
                            ? 'tour-stok-log'
                            : href === '/dashboard/laporan'
                            ? 'tour-laporan'
                            : href === '/dashboard/riwayat'
                            ? 'tour-riwayat'
                            : href === '/dashboard/simulasi'
                            ? 'tour-simulasi'
                            : href === '/dashboard/rekomendasi'
                            ? 'tour-rekomendasi'
                            : href === '/dashboard/ocr-nota'
                            ? 'tour-ocr-nota'
                            : undefined

                        return (
                          <Link
                            key={href}
                            href={href}
                            data-tour={tourKey}
                            onClick={onNavigate}
                            tabIndex={expanded ? 0 : -1}
                            aria-current={active ? 'page' : undefined}
                            className={clsx(
                              'flex min-h-[34px] items-center rounded-xl px-2.5 text-[12.5px] transition-all duration-150 active:scale-[0.98]',
                              active
                                ? 'bg-white font-bold text-kopi ring-1.5 ring-kuning shadow-2xs translate-x-1'
                                : 'text-[#3D3027] hover:bg-white/90 hover:translate-x-0.5'
                            )}
                          >
                            <span className="truncate">{label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Menu Pengaturan & Panduan Fitur: Tergabung di nav bar yang sama, bukan di dalam dropdown */}
            <div className="pt-2 mt-1 border-t border-krim-garis/80 space-y-1">
              {/* Tombol Pengaturan Usaha (Modal) */}
              <button
                type="button"
                data-tour="tour-pengaturan"
                onClick={() => {
                  setIsSettingsOpen(true)
                  onNavigate()
                }}
                title={collapsed ? 'Pengaturan' : undefined}
                className={clsx(
                  rowClass(isSettingsOpen),
                  'flex-shrink-0 cursor-pointer w-full text-left'
                )}
              >
                <span className={iconClass(isSettingsOpen)}>
                  <Settings className="h-4 w-4" />
                </span>
                <span className={clsx('truncate', hideWhenCollapsed)}>Pengaturan</span>
              </button>

              {/* Tombol Panduan Fitur */}
              <button
                type="button"
                onClick={() => {
                  openTour()
                  onNavigate()
                }}
                title={collapsed ? 'Panduan Fitur Dapi' : undefined}
                className={clsx(rowClass(false), 'flex-shrink-0 text-left cursor-pointer w-full')}
              >
                <span className={iconClass(false)}>
                  <HelpCircle className="h-4 w-4" />
                </span>
                <span className={clsx('truncate', hideWhenCollapsed)}>Panduan Fitur</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bagian Bawah: Hanya Profil Pengguna */}
        <div className="flex flex-col gap-1.5 flex-shrink-0 pt-2 border-t border-krim-garis/80">
          {/* Profil Pengguna */}
          <div
            className={clsx(
              'flex flex-shrink-0 items-center gap-2.5 rounded-[20px] bg-[#FFF7E3] p-1.5 sm:p-2 border border-[#FFE49A]/60 shadow-2xs',
              collapsed && 'lg:justify-center'
            )}
          >
            <span className="flex h-[35px] w-[35px] flex-shrink-0 items-center justify-center rounded-full bg-kuning text-xs font-extrabold uppercase text-kopi shadow-2xs">
              {(user?.email || 'A').charAt(0)}
            </span>
            <span className={clsx('flex min-w-0 flex-1 flex-col', hideWhenCollapsed)}>
              <span className="truncate text-xs font-bold text-slate-800">{user?.email || 'Admin'}</span>
              <span className="text-[10px] text-kopi-muted font-medium">Sesi aktif</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Keluar"
              title="Keluar"
              className={clsx(
                'flex h-[34px] w-[34px] items-center justify-center rounded-full text-kopi-muted hover:bg-white hover:text-koral transition-colors cursor-pointer',
                hideWhenCollapsed
              )}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Pengaturan Sistem */}
      <PengaturanModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}
