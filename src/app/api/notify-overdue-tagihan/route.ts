import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { sendOverdueBillEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      ownerName,
      storeName,
      noPO,
      supplierName,
      totalTagihan,
      daysLate,
      tanggalTerima,
    } = body

    if (!email || !noPO) {
      return NextResponse.json(
        { success: false, error: 'Email dan noPO diperlukan.' },
        { status: 400 }
      )
    }

    const res = await sendOverdueBillEmail({
      email,
      ownerName,
      storeName: storeName || 'DapurTwin',
      noPO,
      supplierName: supplierName || 'Supplier',
      totalTagihan: Number(totalTagihan) || 0,
      daysLate: Number(daysLate) || 1,
      tanggalTerima,
    })

    return NextResponse.json({ success: true, result: res })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-overdue-tagihan:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
