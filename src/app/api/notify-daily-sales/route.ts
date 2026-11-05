import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendDailySalesReportEmail } from '@/lib/resend'

function getWibDateBounds(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find(p => p.type === 'year')?.value
  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  const yyyyMmDd = `${year}-${month}-${day}`

  const startIso = new Date(`${yyyyMmDd}T00:00:00+07:00`).toISOString()
  const endIso = new Date(`${yyyyMmDd}T23:59:59.999+07:00`).toISOString()

  return { startIso, endIso, yyyyMmDd }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    let targetUserId: string | null = null
    let targetEmail: string | null = null
    let supabase: any = null

    // Skenario 1: Dipanggil dari cron job n8n menggunakan Bearer CRON_SECRET
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !serviceKey) {
        return NextResponse.json(
          { success: false, error: 'Konfigurasi Supabase server belum lengkap' },
          { status: 500 }
        )
      }

      supabase = createSupabaseClient(supabaseUrl, serviceKey)
      const body = await request.json().catch(() => ({}))
      targetUserId = body.userId || null
      targetEmail = body.email || null

      if (!targetUserId) {
        // Ambil user profil pertama jika tidak diberikan userId spesifik di cron
        const { data: firstProfile } = await supabase.from('profiles').select('id, full_name').limit(1).maybeSingle()
        targetUserId = firstProfile?.id || null
      }
    } else {
      // Skenario 2: Dipanggil dari sesi browser user aktif
      supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Harap login atau sediakan token cron yang valid' },
          { status: 401 }
        )
      }

      targetUserId = user.id
      const body = await request.json().catch(() => ({}))
      targetEmail = body.email || user.email
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID tidak ditemukan' },
        { status: 400 }
      )
    }

    // Hitung awal & akhir hari secara akurat di zona waktu WIB (Asia/Jakarta)
    const { startIso, endIso, yyyyMmDd } = getWibDateBounds()

    // 1. Ambil profil user
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, store_name')
      .eq('id', targetUserId)
      .maybeSingle()

    const storeName = profile?.store_name || 'DapurTwin'
    const ownerName = profile?.full_name || targetEmail?.split('@')[0] || 'Chef / Owner'

    if (!targetEmail) {
      // Dapatkan email dari tabel auth.users jika menggunakan service role
      const { data: authUser } = await supabase.auth.admin?.getUserById(targetUserId).catch(() => ({ data: null }))
      targetEmail = authUser?.user?.email || null
    }

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Email tujuan tidak ditemukan' },
        { status: 400 }
      )
    }

    // 2. Ambil seluruh transaksi orders hari ini berdasarkan WIB
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', targetUserId)
      .gte('created_at', startIso)
      .lte('created_at', endIso)

    if (ordersErr) {
      console.error('Error fetching today orders:', ordersErr)
    }

    const todayOrders = orders || []
    const totalSales = todayOrders.reduce((sum: number, o: any) => sum + (Number(o.total_price) || 0), 0)
    const totalProfit = todayOrders.reduce((sum: number, o: any) => sum + (Number(o.profit) || 0), 0)
    const totalOrdersCount = todayOrders.length

    // Rangkum menu terlaris hari ini
    const menuSummaryMap = new Map<string, { namaMenu: string; qty: number; subtotal: number }>()
    todayOrders.forEach((o: any) => {
      ;(o.order_items || []).forEach((item: any) => {
        const key = item.nama_menu
        const cur = menuSummaryMap.get(key)
        const qty = Number(item.qty) || 0
        const subtotal = Number(item.subtotal) || 0
        if (cur) {
          cur.qty += qty
          cur.subtotal += subtotal
        } else {
          menuSummaryMap.set(key, { namaMenu: key, qty, subtotal })
        }
      })
    })

    const topMenus = Array.from(menuSummaryMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    // 3. Kirim Email Laporan Harian
    const emailResult = await sendDailySalesReportEmail({
      email: targetEmail,
      ownerName,
      storeName,
      date: new Date(`${yyyyMmDd}T22:00:00+07:00`),
      totalSales,
      totalOrders: totalOrdersCount,
      totalProfit,
      topMenus,
    })

    // 4. Catat notifikasi in-app
    try {
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        title: `Laporan Penjualan Harian (${yyyyMmDd})`,
        detail: `Rekapitulasi penjualan pukul 22:00 WIB: ${totalOrdersCount} transaksi senilai Rp ${totalSales.toLocaleString('id-ID')} dengan profit Rp ${totalProfit.toLocaleString('id-ID')}. Salinan telah dikirimkan ke email Anda.`,
        type: 'penjualan',
        link: '/dashboard/laporan',
        is_read: false,
      })
    } catch (notifErr) {
      console.warn('Gagal catat in-app notifikasi laporan:', notifErr)
    }

    return NextResponse.json({
      success: true,
      emailResult,
      summary: {
        tanggalWib: yyyyMmDd,
        totalSales,
        totalProfit,
        totalOrders: totalOrdersCount,
        topMenusCount: topMenus.length,
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-daily-sales:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
