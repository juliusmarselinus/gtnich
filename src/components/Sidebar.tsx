'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, LayoutDashboard, LogOut, X } from 'lucide-react'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from '@/context/SidebarContext'
import { navSections } from '@/lib/navigation'
import DapiHead from './ui/DapiHead'
import DapurTwinLogo from './ui/DapurTwinLogo'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isOpen, closeSidebar, isCollapsed, toggleCollapsed } = useSidebar()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>('operasional')

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
    // Saat sidebar diciutkan, klik ikon modul = buka sidebar + buka modul itu
    if (isCollapsed) {
      toggleCollapsed()
      setActiveSectionId(sectionId)
      return
    }
    setActiveSectionId(prev => {
      const willOpen = prev !== sectionId
      if (willOpen) {
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
  const isItemActive = (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href))
  const onNavigate = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) closeSidebar()
  }

  // Mode ciut hanya berlaku di desktop (lg); drawer mobile selalu lebar penuh
  const collapsed = isCollapsed
  const hideWhenCollapsed = collapsed ? 'lg:hidden' : ''

  const rowClass = (active: boolean) =>
    clsx(
      'flex min-h-[46px] w-full items-center gap-3 rounded-2xl px-2 text-sm transition-colors',
      collapsed && 'lg:justify-center lg:px-0',
      active ? 'bg-[#FFF1CC] font-bold text-kopi' : 'font-semibold text-[#3D3027] hover:bg-[#FFF7E3]'
    )

  const iconClass = (active: boolean) =>
    clsx(
      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
      active ? 'bg-kuning text-kopi' : 'bg-[#FFF7E3] text-kuning-teks'
    )

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && <div onClick={closeSidebar} className="fixed inset-0 z-40 bg-kopi/30 backdrop-blur-sm lg:hidden" />}

      <aside
        aria-label="Navigasi samping"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] select-none flex-col gap-3 bg-white p-3 transition-[transform,width] duration-300 ease-in-out',
          'lg:static lg:z-auto lg:h-full lg:translate-x-0 lg:rounded-[28px] lg:shadow-kartu',
          collapsed ? 'lg:w-[84px]' : 'lg:w-[248px]',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Blok brand: kuning + Dapi */}
        <div
          className={clsx(
            'relative flex-shrink-0 overflow-hidden rounded-[22px] bg-kuning',
            collapsed ? 'min-h-[132px] p-4 lg:h-[60px] lg:min-h-0 lg:p-0' : 'min-h-[132px] p-4'
          )}
        >
          <span aria-hidden="true" className={clsx('absolute right-4 top-4 h-7 w-7 rounded-full bg-koral-terang', hideWhenCollapsed)} />
          <DapiHead
            size={collapsed ? 50 : 84}
            className={clsx('absolute -bottom-4 -right-1', collapsed && 'lg:-bottom-2 lg:left-[5px] lg:right-auto')}
          />
          <Link href="/dashboard" onClick={onNavigate} className={clsx('relative flex flex-col gap-2', hideWhenCollapsed)}>
            <DapurTwinLogo realFill="#FFFFFF" />
            <span className="flex flex-col">
              <span className="text-[11px] font-medium text-[#5A3E05]">Dapur aktif</span>
              <span className="max-w-[130px] text-base font-bold leading-tight text-kopi">{storeName || 'Dapur Saya'}</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Tutup menu navigasi"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-kopi lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Overview */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-current={isOverviewActive ? 'page' : undefined}
          title={collapsed ? 'Overview' : undefined}
          className={clsx(rowClass(isOverviewActive), 'flex-shrink-0')}
        >
          <span className={iconClass(isOverviewActive)}>
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span className={hideWhenCollapsed}>Overview</span>
        </Link>

        <div className={clsx('flex flex-shrink-0 items-center justify-between px-2.5', hideWhenCollapsed)}>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#7A6A5C]">Daftar modul</span>
          <span className="text-[11px] font-semibold text-[#7A6A5C]">{navSections.length} modul</span>
        </div>

        {/* Modul: dropdown, satu terbuka */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5">
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
                className={clsx('rounded-2xl', expanded && 'bg-kuning-pucat')}
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
                  <span className={clsx('flex-1 text-left', hideWhenCollapsed)}>{section.label}</span>
                  <span
                    className={clsx(
                      'rounded-full bg-white px-1.5 text-[11px] font-bold text-kopi-muted ring-1 ring-krim-garis',
                      hideWhenCollapsed
                    )}
                  >
                    {section.items.length}
                  </span>
                  <ChevronDown
                    className={clsx(
                      'h-4 w-4 text-kopi-muted transition-transform duration-200',
                      expanded && 'rotate-180',
                      hideWhenCollapsed
                    )}
                  />
                </button>

                <div
                  className={clsx(
                    'overflow-hidden transition-all duration-200 ease-in-out',
                    expanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="ml-6 space-y-0.5 border-l-2 border-krim-garis py-1 pl-2 pr-1">
                    {section.items.map(({ href, label }) => {
                      const active = isItemActive(href)
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={onNavigate}
                          tabIndex={expanded ? 0 : -1}
                          aria-current={active ? 'page' : undefined}
                          className={clsx(
                            'flex min-h-[40px] items-center rounded-xl px-3 text-sm transition-colors',
                            active ? 'bg-white font-bold text-kopi ring-2 ring-kuning' : 'text-[#3D3027] hover:bg-white'
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
        </nav>

        {/* Pengguna */}
        <div
          className={clsx(
            'flex flex-shrink-0 items-center gap-2.5 rounded-[18px] bg-[#FFF7E3] p-2',
            collapsed && 'lg:justify-center'
          )}
        >
          <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-kuning text-[13px] font-extrabold uppercase text-kopi">
            {(user?.email || 'A').charAt(0)}
          </span>
          <span className={clsx('flex min-w-0 flex-1 flex-col', hideWhenCollapsed)}>
            <span className="truncate text-[13px] font-bold">{user?.email || 'Admin'}</span>
            <span className="text-xs text-kopi-muted">Sesi aktif</span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Keluar"
            title="Keluar"
            className={clsx(
              'flex h-[38px] w-[38px] items-center justify-center rounded-full text-kopi-muted hover:bg-white hover:text-koral',
              hideWhenCollapsed
            )}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  )
}
