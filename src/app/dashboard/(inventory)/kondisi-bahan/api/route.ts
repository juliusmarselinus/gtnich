import { NextResponse } from 'next/server'
import { kondisiBahanService } from '../services/kondisiBahanService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apiKey') || undefined
    const list = await kondisiBahanService.getBahanKondisi(apiKey)
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
