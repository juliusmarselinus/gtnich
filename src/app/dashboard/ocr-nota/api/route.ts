import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const apiKey = (formData.get('apiKey') as string) || ''
    const routerUrlInput = (formData.get('routerUrl') as string) || ''
    const routerKeyInput = (formData.get('routerKey') as string) || ''
    const routerModelInput = (formData.get('routerModel') as string) || ''
    const existingBahan = (formData.get('existingBahan') as string) || ''

    if (!file) {
      return NextResponse.json({ success: false, error: 'File nota tidak ditemukan' }, { status: 400 })
    }

    // Prioritaskan environment variable NEXT_9ROUTER_URL / NEXT_9ROUTER_KEY, lalu input form/localStorage
    const routerUrl = process.env.NEXT_9ROUTER_URL || process.env.ROUTER_URL || routerUrlInput || ''
    const routerKey = process.env.NEXT_9ROUTER_KEY || process.env.ROUTER_KEY || routerKeyInput || apiKey || ''
    const routerModel = process.env.ROUTER_MODEL || routerModelInput || 'google/gemini-2.0-flash'

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const prompt = `Anda adalah asisten AI OCR kasir dan logistik restoran/dapur profesional.
Tugas Anda: Ekstrak secara teliti dan akurat semua baris item bahan baku/belanja dari foto nota pembelian supplier ini.
Daftar bahan baku yang sudah ada di database saat ini: [${existingBahan}].

PENTING:
- Jangan mengarang data. Ekstrak teks asli nama barang, kuantitas, satuan, dan harga satuan dari gambar nota tersebut.
- Jika ada diskon atau potongan, hitung harga bersih atau cantumkan di catatan.
- Output WAJIB HANYA berupa JSON valid tanpa format markdown (tanpa \`\`\`json):
{
  "supplierName": "<nama toko / supplier dari nota, atau null>",
  "tanggalNota": "<tanggal di nota format YYYY-MM-DD, atau null>",
  "nomorNota": "<nomor invoice / nota jika ada, atau null>",
  "items": [
    {
      "nama": "<nama bahan / barang dari nota>",
      "qty": <angka kuantitas desimal/bulat>,
      "satuan": "<satuan bahan seperti kg, gram, liter, butir, pcs, pack, kaleng, box>",
      "harga": <angka harga satuan dalam Rupiah, bukan subtotal>
    }
  ],
  "totalAkumulasi": <total nominal keseluruhan nota>,
  "catatan": "<catatan tambahan jika ada informasi potongan atau pajak>"
}`

    // 1. Prioritaskan 9router URL jika diset (OpenAI / Gemini compatible multimodal endpoint)
    if (routerUrl && routerKey) {
      try {
        let endpoint = routerUrl.trim()
        if (!endpoint.includes('/chat/completions') && !endpoint.includes('/generateContent')) {
          endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions'
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${routerKey.trim()}`,
          },
          body: JSON.stringify({
            model: routerModel,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${base64Data}`,
                    },
                  },
                ],
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        })

        if (response.ok) {
          const json = await response.json()
          const rawContent = json?.choices?.[0]?.message?.content
          if (rawContent) {
            const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim()
            const parsed = JSON.parse(cleanContent)
            return NextResponse.json({ success: true, data: parsed, source: '9router' })
          }
        } else {
          const errResText = await response.text()
          console.warn('9Router call failed:', response.status, errResText)
        }
      } catch (routerErr) {
        console.warn('9Router exception:', routerErr)
      }
    }

    // 2. Jika 9router belum ada atau gagal, fallback ke Google Gemini Direct API
    const effectiveGeminiKey = apiKey || routerKey
    if (effectiveGeminiKey) {
      // Hilangkan parameter generationConfig responseMimeType jika bermasalah, atau gunakan prompt ketat
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey.trim()}`
      const geminiRes = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      })

      if (geminiRes.ok) {
        const json = await geminiRes.json()
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(cleanText)
          return NextResponse.json({ success: true, data: parsed, source: 'gemini' })
        }
      } else {
        const errText = await geminiRes.text()
        console.warn('Gemini Direct call failed:', geminiRes.status, errText)
        let errMsg = `Gagal memproses gambar melalui AI Vision: ${geminiRes.statusText}`
        try {
          const parsedErr = JSON.parse(errText)
          if (parsedErr?.error?.message) {
            errMsg = `${errMsg} (${parsedErr.error.message})`
          }
        } catch {
          // ignore
        }
        return NextResponse.json(
          {
            success: false,
            error: errMsg,
            details: errText,
          },
          { status: geminiRes.status }
        )
      }
    }

    // 3. Jika sama sekali tidak ada API key
    return NextResponse.json(
      {
        success: false,
        error:
          'API Key atau Router URL belum dikonfigurasi. Harap pasang NEXT_9ROUTER_URL & NEXT_9ROUTER_KEY di environment atau pasang di antarmuka.',
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in OCR API route:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
