'use client'

import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen clay-bg text-slate-800 selection:bg-emerald-500/20 selection:text-emerald-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen relative">
        {children}
      </div>
    </div>
  )
}
