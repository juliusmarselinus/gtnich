import { NextResponse } from 'next/server'

const BASE =
  process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com'

export async function POST(req: Request) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return NextResponse.json({ error: 'MIDTRANS_SERVER_KEY belum diisi di .env.local' }, { status: 500 })
  }

  const { amount } = await req.json()
  const gross = Math.round(Number(amount))
  if (!gross || gross <= 0) {
    return NextResponse.json({ error: 'Nominal tidak valid.' }, { status: 400 })
  }

  const orderId = `DT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`

  const res = await fetch(`${BASE}/v2/charge`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(serverKey + ':').toString('base64'),
    },
    body: JSON.stringify({
      payment_type: 'qris',
      transaction_details: { order_id: orderId, gross_amount: gross },
      qris: { acquirer: 'gopay' },
    }),
  })

  const data = await res.json()
  console.error('[QRIS] Midtrans raw response:', JSON.stringify(data))
  if (!String(data.status_code || '').startsWith('2')) {
    const errMsg = [data.status_message, data.validation_messages?.join(', ')]
      .filter(Boolean)
      .join(' — ') || 'Midtrans menolak permintaan.'
    return NextResponse.json(
      { error: errMsg, midtrans_status_code: data.status_code },
      { status: 502 }
    )
  }

  // Midtrans bisa kembalikan QR lewat:
  // 1. actions[].url  → direct image URL (production / beberapa sandbox)
  // 2. qr_string      → raw QRIS string (sandbox Gopay)
  const qrAction = (data.actions || []).find(
    (a: { name: string }) =>
      a.name === 'generate-qr-code' ||
      a.name === 'get-qr-code' ||
      String(a.name).includes('qr')
  )
  const qrUrl: string | null = qrAction?.url ?? null
  const qrString: string | null = data.qr_string ?? null

  // expiry_time dari Midtrans berformat "YYYY-MM-DD HH:mm:ss" (WIB)
  const expiresAt = data.expiry_time
    ? Date.parse(String(data.expiry_time).replace(' ', 'T') + '+07:00')
    : Date.now() + 15 * 60 * 1000

  return NextResponse.json({
    orderId,
    qrUrl,
    qrString,
    expiresAt,
  })
}
