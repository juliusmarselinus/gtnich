import { NextResponse } from 'next/server'

const BASE =
  process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com'

export async function GET(req: Request) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return NextResponse.json({ error: 'Server key belum diisi.' }, { status: 500 })
  }

  const orderId = new URL(req.url).searchParams.get('order_id') || ''
  if (!/^DT-[0-9]+-[0-9]+$/.test(orderId)) {
    return NextResponse.json({ error: 'order_id tidak valid.' }, { status: 400 })
  }

  const res = await fetch(`${BASE}/v2/${orderId}/status`, {
    headers: {
      Accept: 'application/json',
      Authorization: 'Basic ' + Buffer.from(serverKey + ':').toString('base64'),
    },
    cache: 'no-store',
  })
  const data = await res.json()
  const status: string = data.transaction_status || 'pending'

  return NextResponse.json({
    status,
    paid: status === 'settlement' || status === 'capture',
    expired: ['expire', 'cancel', 'deny', 'failure'].includes(status),
  })
}
