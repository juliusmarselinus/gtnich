import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const existingBahan = (formData.get('existingBahan') as string) || ''

    if (!file) {
      return NextResponse.json({ success: false, error: 'File nota tidak ditemukan' }, { status: 400 })
    }

    // Gunakan konfigurasi 9Router dengan model opencode-code (didukung gemini-3.1-flash-lite)
    const routerUrl = process.env.NEXT_9ROUTER_URL || 'https://router.hitungmin.my.id/v1'
    const routerKey = process.env.NEXT_9ROUTER_KEY || 'sk-c294c01527d313cd-aaa9eu-c656a5e8'
    const routerModel = process.env.NEXT_9ROUTER_MODEL || 'opencode-code'

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
            stream: false,
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
            temperature: 0.1,
          }),
        })

        if (response.ok) {
          const json = await response.json()
          const rawContent = json?.choices?.[0]?.message?.content
          if (rawContent) {
            // Bersihkan markdown fence ```json dan teks keterangan lain
            let cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim()
            const firstBrace = cleanContent.indexOf('{')
            const lastBrace = cleanContent.lastIndexOf('}')
            if (firstBrace !== -1 && lastBrace !== -1) {
              cleanContent = cleanContent.substring(firstBrace, lastBrace + 1)
            }
            const parsed = JSON.parse(cleanContent)
            return NextResponse.json({ success: true, data: parsed, source: '9router-gemini-3.1-flash-lite' })
          }
        } else {
          const errResText = await response.text()
          console.warn('9Router call failed:', response.status, errResText)
          return NextResponse.json(
            { success: false, error: `9Router error (${response.status}): ${errResText}` },
            { status: response.status }
          )
        }
      } catch (routerErr: any) {
        console.warn('9Router exception:', routerErr)
        return NextResponse.json(
          { success: false, error: routerErr.message || 'Gagal memproses gambar ke 9Router' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Konfigurasi 9Router tidak lengkap' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in OCR API route:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
