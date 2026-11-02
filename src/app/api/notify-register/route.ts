import { NextResponse } from 'next/server'
import { sendWelcomeRegistrationEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, userName, storeName, registrationMethod } = body

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email diperlukan' }, { status: 400 })
    }

    const result = await sendWelcomeRegistrationEmail({
      email,
      userName,
      storeName,
      registrationMethod: registrationMethod || 'Email & Kata Sandi',
    })

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-register:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
