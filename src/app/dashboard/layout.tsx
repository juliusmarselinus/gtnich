'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { SidebarProvider } from '@/context/SidebarContext'
import { createClient } from '@/lib/supabase/client'
import DapiHead from '@/components/ui/DapiHead'

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

  // Layar tunggu saat sesi diverifikasi
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-krim text-kopi">
        <span className="flex h-20 w-20 items-end justify-center overflow-hidden rounded-[24px] bg-kuning">
          <DapiHead size={64} className="animate-bounce [animation-duration:1.6s]" />
        </span>
        <p className="text-sm font-semibold">Dapi cek sesi dulu…</p>
      </div>
    )
  }

  // Sedang dialihkan ke /login
  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-krim text-kopi selection:bg-kuning/40 lg:p-4">
        <Sidebar />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </SidebarProvider>
  )
}
