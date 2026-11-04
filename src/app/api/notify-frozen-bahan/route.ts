import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendFrozenBahanAlertEmail } from '@/lib/emailFrozenBahan'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Harap login untuk mengakses layanan ini' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, storeName, ownerName, items } = body

    if (!email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email dan daftar bahan beku (items) diperlukan.' },
        { status: 400 }
      )
    }

    const result = await sendFrozenBahanAlertEmail({
      email,
      storeName: storeName || 'DapurTwin',
      ownerName: ownerName || 'Pengelola Dapur',
      items,
    })

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-frozen-bahan:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
