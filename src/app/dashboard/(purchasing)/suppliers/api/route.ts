import { NextResponse } from 'next/server'
import { supplierService } from '../services/supplierService'

export async function GET() {
  try {
    const list = await supplierService.getAll()
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newSupplier = await supplierService.create(body)
    return NextResponse.json({ success: true, data: newSupplier }, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
