'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { SidebarProvider } from '@/context/SidebarContext'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsAuthenticated(false)
        router.replace('/login')
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        router.replace('/login')
      } else if (session) {
        setIsAuthenticated(true)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  // Tampilkan loading screen sementara saat sesi diverifikasi
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center clay-bg text-slate-600 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#FF8F2B]" />
        <p className="text-xs font-semibold tracking-wide">Memverifikasi sesi akun...</p>
      </div>
    )
  }

  // Jika tidak authenticated (sedang proses redirect ke /login)
  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen clay-bg text-slate-800 selection:bg-orange-500/20 selection:text-orange-950 relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen relative">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
