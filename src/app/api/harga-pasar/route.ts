import { NextRequest, NextResponse } from 'next/server'

interface EstimatePriceRequest {
  nama: string
  satuan: string
}

function parseEstimateResponse(raw: string): { harga: number; rentang?: string; catatan?: string } {
  let clean = raw.trim()
  if (clean.includes('```json')) {
    clean = clean.replace(/```json/g, '').replace(/```/g, '').trim()
  } else if (clean.includes('```')) {
    clean = clean.replace(/```/g, '').trim()
  }

  const firstBrace = clean.indexOf('{')
  const lastBrace = clean.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1)
  }

  const parsed = JSON.parse(clean)
  const harga = Number(parsed.harga) || 0
  return {
    harga: harga > 0 ? harga : 0,
    rentang: parsed.rentang ? String(parsed.rentang) : undefined,
    catatan: parsed.catatan ? String(parsed.catatan) : undefined,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: EstimatePriceRequest = await req.json()
    const { nama, satuan } = body

    if (!nama || !nama.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama bahan baku wajib diisi terlebih dahulu' },
        { status: 400 }
      )
    }

    const routerUrl = process.env.NEXT_9ROUTER_URL || 'https://router.hitungmin.my.id/v1'
    const routerKey = process.env.NEXT_9ROUTER_KEY || ''
    // Prioritaskan model gemini-3.5-flash-lite yang terbukti cepat (< 4 detik) dan stabil di router
    const routerModel = process.env.NEXT_9ROUTER_MODEL || 'gemini/gemini-3.5-flash-lite'

    if (!routerKey) {
      return NextResponse.json(
        { success: false, error: 'NEXT_9ROUTER_KEY belum dikonfigurasi di environment server.' },
        { status: 500 }
      )
    }

    let endpoint = routerUrl.trim().replace(/\/+$/, '')
    if (!endpoint.includes('/chat/completions')) {
      endpoint += '/chat/completions'
    }

    const satuanClean = satuan?.trim() || 'satuan'
    const prompt = `Berapa perkiraan harga pasaran grosir/eceran di Indonesia saat ini untuk bahan baku: "${nama.trim()}" per "${satuanClean}"?
Jawab HANYA JSON valid:
{
  "harga": 15000,
  "rentang": "Rp 13.000 - Rp 17.000",
  "catatan": "Harga pasar rata-rata"
}`

    // 15 detik timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${routerKey.trim()}`,
        },
        body: JSON.stringify({
          model: routerModel,
          stream: false,
          temperature: 0.1,
          messages: [
            { role: 'user', content: prompt },
          ],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errText = await response.text()
        console.warn('Router pricing call failed:', response.status, errText)
        return NextResponse.json(
          { success: false, error: 'Gagal menghubungi server estimasi harga pasar.' },
          { status: 502 }
        )
      }

      const resData = await response.json()
      const rawContent = resData.choices?.[0]?.message?.content || ''
      const parsed = parseEstimateResponse(rawContent)

      if (!parsed.harga || parsed.harga <= 0) {
        return NextResponse.json(
          { success: false, error: 'Tidak dapat memperkirakan harga untuk bahan ini.' },
          { status: 422 }
        )
      }

      return NextResponse.json({
        success: true,
        data: parsed,
      })
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Waktu permintaan habis saat mencari estimasi harga pasar.' },
          { status: 504 }
        )
      }
      throw fetchErr
    }
  } catch (err: any) {
    console.error('Error in harga-pasar api:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}
