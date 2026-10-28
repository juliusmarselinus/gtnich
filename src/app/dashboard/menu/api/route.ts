import { NextResponse } from 'next/server'
import { menuService } from '../services/menuService'

export async function GET() {
  try {
    const list = await menuService.getAll()
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newMenu = await menuService.create(body)
    return NextResponse.json({ success: true, data: newMenu }, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
