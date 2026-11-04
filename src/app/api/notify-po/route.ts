import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPurchaseOrderNotificationEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Harap login untuk mengirim notifikasi PO' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      email,
      storeName,
      ownerName,
      noPO,
      supplierName,
      totalEstimasi,
      items,
      catatan,
    } = body

    if (!email || !noPO) {
      return NextResponse.json(
        { success: false, error: 'Email dan No. PO diperlukan.' },
        { status: 400 }
      )
    }

    const result = await sendPurchaseOrderNotificationEmail({
      email,
      storeName,
      ownerName,
      noPO,
      supplierName: supplierName || 'Supplier Rekanan',
      totalEstimasi: Number(totalEstimasi) || 0,
      items: items || [],
      catatan,
    })

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-po:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
