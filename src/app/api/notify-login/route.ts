import { NextResponse } from 'next/server'
import { sendLoginNotificationEmail } from '@/lib/resend'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, userName, loginMethod } = body

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email diperlukan' }, { status: 400 })
    }

    // Ambil IP address dari request headers jika tersedia
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Kirim email notifikasi secara asynchronous
    const result = await sendLoginNotificationEmail({
      email,
      userName,
      loginMethod: loginMethod || 'Email & Kata Sandi',
      loginTime: new Date(),
      ipAddress,
    })

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-login:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
