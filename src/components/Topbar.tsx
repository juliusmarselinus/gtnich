'use client'

import { Bell, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
  onSearch?: (term: string) => void
}

export default function Topbar({ title, subtitle, onSearch }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    {
      title: 'Order Baru Masuk',
      detail: 'Siti Rahayu memesan 3x Keripik Pisang (Rp 85.000)',
      time: 'Baru saja',
    },
    {
      title: 'Peringatan Stok Rendah',
      detail: 'Stok Sambal Rendang tersisa 3 pcs di penyimpanan dapur',
      time: '24m yang lalu',
    },
  ]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#f3f6fa]/80 backdrop-blur-md border-b border-slate-200/60">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, item, invoice..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 clay-inset text-xs text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl clay-card hover:bg-white text-slate-600 hover:text-slate-900 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 clay-card p-4 z-50 animate-in fade-in zoom-in-95 duration-100 border border-white">
              <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Notifikasi Dapur
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">2 Baru</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-emerald-50/50 transition-colors text-xs border border-slate-100/80">
                    <p className="font-bold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.detail}</p>
                    <span className="text-[10px] text-emerald-600 block mt-1.5 font-medium">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
