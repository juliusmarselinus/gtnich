import { NextResponse } from 'next/server'
import { sendWelcomeRegistrationEmail } from '@/lib/resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Pendaftaran belum terverifikasi' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userName, storeName, registrationMethod } = body
    const email = user.email

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email akun tidak ditemukan' }, { status: 400 })
    }

    const result = await sendWelcomeRegistrationEmail({
      email,
      userName: userName || user.user_metadata?.full_name || email.split('@')[0],
      storeName: storeName || user.user_metadata?.store_name || 'Dapur Anda',
      registrationMethod: registrationMethod || 'Email & Kata Sandi',
    })

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-register:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
