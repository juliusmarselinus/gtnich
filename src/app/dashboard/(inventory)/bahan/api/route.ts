import { NextResponse } from 'next/server'
import { bahanService } from '../services/bahanService'

export async function GET() {
  try {
    const list = await bahanService.getAll()
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newBahan = await bahanService.create(body)
    return NextResponse.json({ success: true, data: newBahan }, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
