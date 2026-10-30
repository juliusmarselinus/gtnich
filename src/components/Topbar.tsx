'use client'

import { Bell, Search, Sparkles, Check, ExternalLink, Package, ShoppingCart, Receipt, AlertTriangle, Menu, X, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useSidebar } from '@/context/SidebarContext'
import Link from 'next/link'
import clsx from 'clsx'

interface TopbarProps {
  title: string
  subtitle?: string
  onSearch?: (term: string) => void
}

export default function Topbar({ title, subtitle, onSearch }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAllRead, dismissNotification, clearAll } = useNotifications()
  const { toggleSidebar } = useSidebar()
  const dropdownRef = useRef<HTMLDivElement>(null)

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
        return <ShoppingCart className="w-3.5 h-3.5 text-[#FF8F2B]" />
      case 'stok':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
      case 'tagihan':
        return <Receipt className="w-3.5 h-3.5 text-amber-500" />
      case 'po':
        return <Package className="w-3.5 h-3.5 text-blue-500" />
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#EBE3D7]">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Buka menu navigasi"
          className="lg:hidden p-2 rounded-xl clay-card text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, item, invoice..."
            onChange={e => onSearch && onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl clay-card hover:bg-white text-slate-600 hover:text-slate-900 transition-all relative cursor-pointer"
            title="Notifikasi Dapur"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF8F2B] text-white text-[9px] font-black flex items-center justify-center shadow-sm shadow-[#FF8F2B]/40">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-88 max-w-[90vw] clay-card p-4 z-50 animate-in fade-in zoom-in-95 duration-100 border border-white max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 flex-shrink-0">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8F2B]" />
                  Notifikasi Dapur
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] text-slate-400 hover:text-[#FF8F2B] font-bold transition-colors cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-[10px] text-slate-400 hover:text-rose-500 font-bold transition-colors cursor-pointer"
                      title="Bersihkan semua notifikasi"
                    >
                      Hapus Semua
                    </button>
                  )}
                  <span className="text-[10px] bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} Baru
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Tutup panel notifikasi"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada notifikasi aktivitas baru.
                  </div>
                ) : (
                  notifications.map(n => {
                    return (
                      <div
                        key={n.id}
                        className={clsx(
                          'p-3 rounded-2xl transition-colors text-xs border border-slate-100/80 space-y-1 relative group',
                          n.isRead
                            ? 'bg-slate-50/60 opacity-80'
                            : 'bg-white hover:bg-[#FFF6EC]/60 shadow-sm'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          {n.link ? (
                            <Link
                              href={n.link}
                              onClick={() => setShowNotifications(false)}
                              className="font-extrabold text-slate-800 hover:text-[#FF8F2B] flex items-center gap-1.5 flex-1 min-w-0 transition-colors"
                            >
                              {getTypeIcon(n.type)}
                              <span className="truncate">{n.title}</span>
                            </Link>
                          ) : (
                            <span className="font-extrabold text-slate-800 flex items-center gap-1.5 flex-1 min-w-0">
                              {getTypeIcon(n.type)}
                              <span className="truncate">{n.title}</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {n.timeAgo}
                            </span>
                            {/* Tombol X Hapus Notifikasi */}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                e.preventDefault()
                                dismissNotification(n.id)
                              }}
                              className="w-5 h-5 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus notifikasi ini"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {n.link ? (
                          <Link
                            href={n.link}
                            onClick={() => setShowNotifications(false)}
                            className="block"
                          >
                            <p className="text-[11px] text-slate-500 leading-snug">{n.detail}</p>
                          </Link>
                        ) : (
                          <p className="text-[11px] text-slate-500 leading-snug">{n.detail}</p>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
