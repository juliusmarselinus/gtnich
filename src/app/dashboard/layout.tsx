'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { SidebarProvider } from '@/context/SidebarContext'
import { TourProvider } from '@/context/TourContext'
import { createClient } from '@/lib/supabase/client'
import DapiHead from '@/components/ui/DapiHead'
import ProfileSetupModal from '@/components/ProfileSetupModal'
import TourContainer from '@/components/TourContainer'
import MobileNav from '@/components/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [existingProfileData, setExistingProfileData] = useState<{
    fullName?: string
    storeName?: string
    businessType?: string
    salesChannels?: string[]
    stockoutFrequency?: number | null
  }>({})

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsAuthenticated(false)
        router.replace('/login')
        return
      }

      setIsAuthenticated(true)
      const user = session.user
      setCurrentUserId(user.id)

      // 1. Coba periksa status menggunakan RPC Supabase jika sudah ada
      const { data: rpcStatus, error: rpcErr } = await supabase.rpc('check_user_profile_status')

      if (!rpcErr && rpcStatus && typeof rpcStatus === 'object') {
        const status = rpcStatus as {
          needs_setup?: boolean
          full_name?: string
          store_name?: string
          business_type?: string
          sales_channels?: string[]
          stockout_frequency?: number
        }

        setExistingProfileData({
          fullName: status.full_name || '',
          storeName: status.store_name || '',
          businessType: status.business_type || '',
          salesChannels: status.sales_channels || [],
          stockoutFrequency: status.stockout_frequency ?? 2,
        })

        // Jangan blokir pengguna yang login via provider eksternal (OAuth Google)
        const isOAuthUser = user.app_metadata?.provider === 'google'
        if (status.needs_setup && !isOAuthUser) {
          setNeedsProfileSetup(true)
          return
        }
      }

      // 2. Fallback baca langsung tabel public.profiles di Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // Jika kolom is_completed di Supabase bernilai true atau user adalah user OAuth Google, langsung izinkan masuk
      const isOAuthUser = user.app_metadata?.provider === 'google'
      if (isOAuthUser || (profile && (profile as any).is_completed === true)) {
        setNeedsProfileSetup(false)
        return
      }

      // Cek apakah data di profiles masih kosong atau bernilai default / placeholder
      const rawFullName = (profile?.full_name || '').trim()
      const rawStoreName = (profile?.store_name || '').trim()
      const userEmailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : ''

      const isPlaceholderName =
        !rawFullName ||
        rawFullName === 'Pemilik Dapur' ||
        rawFullName === 'User' ||
        rawFullName.toLowerCase() === userEmailPrefix

      const isPlaceholderStore =
        !rawStoreName ||
        rawStoreName === 'Dapur Saya' ||
        rawStoreName === 'Dapur Pemilik Dapur' ||
        rawStoreName.toLowerCase() === `dapur ${userEmailPrefix}`

      const fullName = isPlaceholderName ? '' : rawFullName
      const storeName = isPlaceholderStore ? '' : rawStoreName
      const businessType = profile?.business_type?.trim() || ''
      const salesChannels: string[] = Array.isArray(profile?.sales_channels) ? profile.sales_channels : []
      const stockoutFrequency = (profile as any)?.stockout_frequency !== undefined && (profile as any)?.stockout_frequency !== null
        ? Number((profile as any).stockout_frequency)
        : null

      setExistingProfileData({
        fullName,
        storeName,
        businessType,
        salesChannels,
        stockoutFrequency,
      })

      // Jika salah satu dari data profil di Supabase belum ada / belum diisi
      const isMissingAnyData =
        !fullName ||
        !storeName ||
        !businessType ||
        salesChannels.length === 0 ||
        stockoutFrequency === null

      if (isMissingAnyData) {
        setNeedsProfileSetup(true)
      }
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        router.replace('/login')
      } else if (session) {
        setIsAuthenticated(true)
        setCurrentUserId(session.user.id)
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
      <TourProvider>
        <div className="flex h-screen bg-krim text-kopi selection:bg-kuning/40 lg:p-4">
          <Sidebar />
          <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
        </div>
        <TourContainer />
        {needsProfileSetup && currentUserId && (
          <ProfileSetupModal
            userId={currentUserId}
            initialName={existingProfileData.fullName}
            initialStore={existingProfileData.storeName}
            initialBusinessType={existingProfileData.businessType}
            initialSalesChannels={existingProfileData.salesChannels}
            initialStockoutFrequency={existingProfileData.stockoutFrequency}
            onCompleted={() => {
              setNeedsProfileSetup(false)
              router.refresh()
            }}
          />
        )}
      </TourProvider>
    </SidebarProvider>
  )
}
