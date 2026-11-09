'use client'

import {
  Bell,
  Package,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  Menu,
  X,
  TrendingUp,
  CheckCircle2,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
} from 'lucide-react'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useSidebar } from '@/context/SidebarContext'
import { useTour, PAGE_GUIDES } from '@/context/TourContext'
import { usePathname } from 'next/navigation'
import { formatRupiah } from '@/lib/mock-data'
import Link from 'next/link'
import clsx from 'clsx'

interface TopbarProps {
  title: string
  subtitle?: string
  /** elemen tambahan di kanan (mis. status kasir, tombol segarkan) */
  actions?: ReactNode
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null)
  const { notifications, unreadCount, markAllRead, dismissNotification, clearAll, applyPriceUpdate } = useNotifications()
  const { toggleSidebar, isCollapsed, toggleCollapsed } = useSidebar()
  const { openTour } = useTour()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cek apakah halaman ini memiliki panduan khusus
  const hasPageGuide = Boolean(PAGE_GUIDES[pathname] && PAGE_GUIDES[pathname].length > 0)

  const handleApplyPrice = async (notifId: string, bahanId: string, newPrice: number) => {
    try {
      setUpdatingPriceId(notifId)
      await applyPriceUpdate(notifId, bahanId, newPrice)
    } catch (err: unknown) {
      const e = err as Error
      console.error('Gagal memperbarui harga master:', e)
      alert(e.message || 'Gagal memperbarui harga master bahan.')
    } finally {
      setUpdatingPriceId(null)
    }
  }

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'penjualan':
        return <ShoppingCart className="h-3.5 w-3.5 text-kuning-teks" />
      case 'stok':
        return <AlertTriangle className="h-3.5 w-3.5 text-koral" />
      case 'tagihan':
        return <Receipt className="h-3.5 w-3.5 text-kuning-teks" />
      case 'po':
        return <Package className="h-3.5 w-3.5 text-kuning-teks" />
      default:
        return <Bell className="h-3.5 w-3.5 text-kuning-teks" />
    }
  }

  const roundBtn =
    'flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-kopi transition-colors hover:bg-kuning-muda cursor-pointer'

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 sm:gap-3 bg-krim/95 px-3 py-2.5 sm:px-6 md:px-8 sm:py-3 backdrop-blur-md border-b border-[#F0E6D8]/60 shadow-[0_1px_3px_rgba(43,34,28,0.04)]">
      {/* Kiri: Hamburger Menu + Judul */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile: buka drawer */}
        <button type="button" onClick={toggleSidebar} aria-label="Buka menu navigasi" className={clsx(roundBtn, 'lg:hidden')}>
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        {/* Desktop: ciutkan / buka sidebar */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          aria-expanded={!isCollapsed}
          className={clsx(roundBtn, 'hidden lg:flex')}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base sm:text-xl md:text-[24px] font-extrabold tracking-tight text-kopi leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate mt-0.5 text-[11px] sm:text-[13px] text-kopi-muted block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Kanan: Actions + Bantuan + Notifikasi */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {actions}

        {/* Tombol Panduan / Bantuan Cepat (Dinamis: Spesifik Halaman atau Tur Global) */}
        <button
          type="button"
          onClick={() => openTour(hasPageGuide)}
          title={hasPageGuide ? 'Panduan Penggunaan Halaman Ini' : 'Buka Panduan Fitur Dapi'}
          aria-label="Panduan Fitur Dapur"
          className={clsx(roundBtn, 'hover:text-[#FF8F28] relative')}
        >
          <HelpCircle className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          {hasPageGuide && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF8F28] rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Notifikasi */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifikasi, ${unreadCount} baru`}
            aria-expanded={showNotifications}
            className={clsx(roundBtn, 'relative')}
          >
            <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1 flex h-4 min-w-4 sm:h-[18px] sm:min-w-[18px] items-center justify-center rounded-full border border-white sm:border-2 bg-koral px-0.5 sm:px-1 text-[8px] sm:text-[9px] font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-3 flex max-h-[85vh] w-[22rem] max-w-[calc(100vw-24px)] flex-col rounded-[24px] bg-white p-4 shadow-kartu ring-1 ring-krim-garis">
            <div className="mb-2.5 flex flex-shrink-0 items-center justify-between border-b border-krim-garis pb-2.5">
              <span className="flex items-center gap-1.5 text-sm font-extrabold text-kopi">
                <Bell className="h-4 w-4 text-kuning-teks" />
                Notifikasi dapur
              </span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllRead} className="text-[11px] font-bold text-kopi-muted hover:text-kopi">
                    Tandai dibaca
                  </button>
                )}
                {notifications.length > 0 && (
                  <button type="button" onClick={clearAll} className="text-[11px] font-bold text-kopi-muted hover:text-koral">
                    Hapus semua
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Tutup panel notifikasi"
                  className="rounded-full p-1 text-kopi-muted hover:bg-kuning-muda hover:text-kopi"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-kopi-muted">Belum ada notifikasi baru.</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={clsx(
                      'relative space-y-1 rounded-2xl p-3 text-xs transition-colors',
                      n.isRead ? 'bg-kuning-pucat opacity-80' : 'bg-white ring-1 ring-krim-garis hover:bg-kuning-pucat'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="flex min-w-0 flex-1 items-center gap-1.5 font-extrabold text-kopi hover:text-koral-gelap"
                        >
                          {getTypeIcon(n.type)}
                          <span className="truncate">{n.title}</span>
                        </Link>
                      ) : (
                        <span className="flex min-w-0 flex-1 items-center gap-1.5 font-extrabold text-kopi">
                          {getTypeIcon(n.type)}
                          <span className="truncate">{n.title}</span>
                        </span>
                      )}
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        <span className="whitespace-nowrap text-[10px] text-kopi-muted">{n.timeAgo}</span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            e.preventDefault()
                            dismissNotification(n.id)
                          }}
                          aria-label="Hapus notifikasi ini"
                          className="flex h-5 w-5 items-center justify-center rounded-full text-kopi-muted hover:bg-koral-muda hover:text-koral"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {n.link ? (
                      <Link href={n.link} onClick={() => setShowNotifications(false)} className="block">
                        <p className="text-[12px] leading-snug text-kopi-muted">{n.detail}</p>
                      </Link>
                    ) : (
                      <p className="text-[12px] leading-snug text-kopi-muted">{n.detail}</p>
                    )}

                    {/* Update harga master bahan & HPP dari Purchase Order */}
                    {n.metadata?.isPriceUpdate && n.metadata?.bahanId && (
                      <div className="mt-2 space-y-2 rounded-xl bg-kuning-muda p-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-kopi-muted">Harga master lama</span>
                          <span className="font-bold text-kopi-muted line-through">
                            {formatRupiah(n.metadata.oldPrice || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-kopi">Harga baru dari PO</span>
                          <span className="text-xs font-black text-kopi">
                            {formatRupiah(n.metadata.newPrice || 0)} / {n.metadata.satuan || 'satuan'}
                          </span>
                        </div>

                        {n.metadata.applied ? (
                          <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-aman">
                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Harga master & HPP resep sudah diperbarui</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingPriceId === n.id}
                            onClick={e => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleApplyPrice(n.id, n.metadata!.bahanId!, n.metadata!.newPrice!)
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-koral px-3 py-2 text-[11px] font-bold text-white hover:bg-koral-gelap disabled:opacity-50"
                          >
                            {updatingPriceId === n.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Memperbarui harga…</span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-3 w-3" />
                                <span>Update harga master (HPP)</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  )
}
