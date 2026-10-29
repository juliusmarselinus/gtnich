import { NextResponse } from 'next/server'
import { purchaseOrderService } from '../services/purchaseOrderService'

export async function GET() {
  try {
    const list = await purchaseOrderService.getAll()
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newPO = await purchaseOrderService.createPO(body)
    return NextResponse.json({ success: true, data: newPO }, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
