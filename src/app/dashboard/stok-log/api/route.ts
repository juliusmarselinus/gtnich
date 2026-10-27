import { NextResponse } from 'next/server'
import { stokLogService } from '../services/stokLogService'

export async function GET() {
  try {
    const logs = await stokLogService.getLogs()
    return NextResponse.json({ success: true, data: logs })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await stokLogService.recordManualMutasi(body)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
