import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendDailySalesReportEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Harap login untuk mengakses layanan ini' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email } = body
    const userId = user.id
    const targetEmail = email || user.email

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Email tujuan diperlukan' },
        { status: 400 }
      )
    }

    // Ambil tanggal hari ini (00:00:00 sampai 23:59:59)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()

    // 1. Ambil profil user
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, store_name')
      .eq('id', userId)
      .maybeSingle()

    const storeName = profile?.store_name || 'DapurTwin'
    const ownerName = profile?.full_name || targetEmail.split('@')[0] || 'Chef / Owner'

    // 2. Ambil seluruh transaksi orders hari ini
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    if (ordersErr) {
      console.error('Error fetching today orders:', ordersErr)
    }

    const todayOrders = orders || []
    const totalSales = todayOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    const totalProfit = todayOrders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0)
    const totalOrdersCount = todayOrders.length

    // Rangkum menu terlaris hari ini
    const menuSummaryMap = new Map<string, { namaMenu: string; qty: number; subtotal: number }>()
    todayOrders.forEach(o => {
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
      date: today,
      totalSales,
      totalOrders: totalOrdersCount,
      totalProfit,
      topMenus,
    })

    // 4. Catat notifikasi in-app
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: `Laporan Penjualan Harian (${today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
        detail: `Rekapitulasi penjualan pukul 22:00: ${totalOrdersCount} transaksi senilai Rp ${totalSales.toLocaleString('id-ID')} dengan profit Rp ${totalProfit.toLocaleString('id-ID')}. Salinan telah dikirimkan ke email Anda.`,
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
