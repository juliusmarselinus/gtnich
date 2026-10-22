'use client'

import { Bell, Search } from 'lucide-react'
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
      title: 'Order Baru via WhatsApp',
      detail: 'Siti Rahayu memesan 3x Keripik Pisang (Rp 85.000)',
      time: 'Baru saja',
    },
    {
      title: 'Peringatan Bahan Baku',
      detail: 'Stok Sambal Rendang tersisa 3 pcs di gudang',
      time: '24m yang lalu',
    },
  ]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200/80">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, item, invoice..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Pemberitahuan</span>
                <span className="text-[10px] text-slate-500">2 Baru</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <div key={i} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs">
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.detail}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{n.time}</span>
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
