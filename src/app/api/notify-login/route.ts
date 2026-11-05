import { NextResponse } from 'next/server'
import { sendLoginNotificationEmail } from '@/lib/resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Sesi pengguna tidak valid' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { userName, loginMethod } = body

    // Gunakan email terverifikasi dari session Supabase untuk keamanan
    const email = user.email
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email pengguna tidak ditemukan' }, { status: 400 })
    }

    // Ambil IP address dari request headers jika tersedia
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Kirim email notifikasi secara asynchronous
    const result = await sendLoginNotificationEmail({
      email,
      userName: userName || user.user_metadata?.full_name || email.split('@')[0],
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
