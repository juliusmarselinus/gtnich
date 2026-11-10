import { NextRequest, NextResponse } from 'next/server'

// Helper untuk mengekstrak teks konten dari respon OpenAI-compatible / 9Router
// Mendukung JSON langsung maupun stream Server-Sent Events (SSE chunk data: {...})
// Termasuk mengekstrak reasoning_content jika model menaruh teks JSON di sana
function extractContentFrom9Router(rawText: string): string {
  // 1. Coba JSON langsung
  try {
    const directJson = JSON.parse(rawText)
    const content = directJson.choices?.[0]?.message?.content
    if (content && typeof content === 'string' && content.trim()) {
      return content
    }
  } catch {
    // Bukan JSON langsung, lanjutkan parse SSE
  }

  // 2. Coba parse stream Server-Sent Events (data: {...})
  let content = ''
  let reasoning = ''
  const lines = rawText.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
      try {
        const chunk = JSON.parse(trimmed.slice(6))
        const delta = chunk.choices?.[0]?.delta
        if (delta?.content) content += delta.content
        if (delta?.reasoning_content) reasoning += delta.reasoning_content
      } catch {
        // Abaikan parse error baris parsial
      }
    }
  }

  if (content.trim()) return content.trim()
  if (reasoning.trim()) return reasoning.trim()

  return rawText.trim()
}

// Helper untuk membersihkan dan mem-parse string JSON
function parseJsonPayload(text: string): any {
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }
  return JSON.parse(cleaned)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const clientApiKey = (formData.get('apiKey') as string) || ''
    const clientRouterUrl = (formData.get('routerUrl') as string) || ''
    const clientRouterKey = (formData.get('routerKey') as string) || ''
    const clientRouterModel = (formData.get('routerModel') as string) || ''
    const existingBahan = (formData.get('existingBahan') as string) || ''

    if (!file) {
      return NextResponse.json({ success: false, error: 'File nota tidak ditemukan' }, { status: 400 })
    }

    // Resolusi konfigurasi:
    // 1. Cek apakah ada Google Gemini API Key dari client (form/localStorage) atau env
    const effectiveGeminiKey =
      clientApiKey.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      ''

    // 2. Cek konfigurasi 9Router dari client atau env server
    const routerUrl = (clientRouterUrl.trim() || process.env.NEXT_9ROUTER_URL || 'https://router.hitungmin.my.id/v1').trim()
    const routerKey = (clientRouterKey.trim() || process.env.NEXT_9ROUTER_KEY || '').trim()
    // RESOLUSI MODEL & COMBO 9ROUTER
    // Default utama: 'opencode-code', lalu fallback ke 'gemini/gemini-3.1-flash-lite'
    const routerModelOrder = Array.from(
      new Set(
        [
          clientRouterModel.trim(),
          'opencode-code',
          'gemini/gemini-3.1-flash-lite',
          process.env.NEXT_9ROUTER_MODEL?.trim(),
        ].filter(Boolean) as string[]
      )
    )

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const prompt = `Anda adalah asisten AI OCR kasir dan logistik restoran/dapur profesional yang sangat teliti.
Tugas Anda: Ekstrak secara teliti dan akurat SEMUA baris item bahan baku/belanja dari dokumen/foto nota pembelian ini.
Daftar bahan baku yang sudah ada di database saat ini: [${existingBahan}].

PANDUAN EKSTRAKSI DOKUMEN / NOTA:
1. Nama Toko/Supplier ("supplierName"):
   - Cari nama supplier penerima pesanan atau toko penjual. Contoh di dokumen: "Supplier CV. RAFFA 3 SAUDARA" atau nama outlet pengirim.
2. Tanggal ("tanggalNota"):
   - Cari tanggal pembuatan nota/pesanan, format ke YYYY-MM-DD. Contoh: "17 Agustus 2025" -> "2025-08-17".
3. Nomor Dokumen/Nota ("nomorNota"):
   - Contoh: "No. 003/SPPG-CTM/VIII/2025" -> "003/SPPG-CTM/VIII/2025".
4. Baris Item Bahan ("items"):
   - Ekstrak SETIAP baris tabel tanpa ada yang terlewat.
   - "nama": Nama jenis bahan makanan asli dari tabel (misal: "Minyak", "Kecap Bango 900 Gram", "Saori Tiram 1 Liter", "Bawang Putih", dst).
   - "qty": Angka kuantitas (jika ada kolom banyaknya/angka, gunakan angka tersebut, misal 20, 5, 3, 10, 1).
   - "satuan": Satuan dari nota (misal: "Karton", "Botol", "Derigen", "Kg", "pcs", "pack").
   - "harga": Harga satuan per kemasan/satuan jika tertulis. Jika nota hanya menuliskan total keseluruhan di bawah tanpa rincian harga per baris, isi "harga": 0.
5. Total Nominal ("totalAkumulasi"):
   - Ambil nominal total akhir nota jika ada (contoh: "Rp 12.729.000" -> 12729000). Jika tidak tertera, hitung dari akumulasi qty x harga.
6. Output WAJIB HANYA berupa JSON valid tanpa format markdown (tanpa \`\`\`json):
{
  "supplierName": "<nama toko / supplier dari nota, atau null>",
  "tanggalNota": "<tanggal di nota format YYYY-MM-DD, atau null>",
  "nomorNota": "<nomor invoice / nota jika ada, atau null>",
  "items": [
    {
      "nama": "<nama bahan / barang dari nota>",
      "qty": <angka kuantitas>,
      "satuan": "<satuan bahan>",
      "harga": <angka harga satuan atau 0>
    }
  ],
  "totalAkumulasi": <total nominal keseluruhan nota>,
  "catatan": "<catatan tambahan jika ada>"
}`

    // PRIORITAS UTAMA: 9Router AI Vision COMBO (opencode-code & gemini/gemini-3.1-flash-lite)
    if (routerUrl && routerKey) {
      let endpoint = routerUrl.trim()
      if (!endpoint.includes('/chat/completions') && !endpoint.includes('/generateContent')) {
        endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions'
      }

      for (const modelToUse of routerModelOrder) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 60000)

          let response: Response
          try {
            response = await fetch(endpoint, {
              method: 'POST',
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${routerKey.trim()}`,
              },
              body: JSON.stringify({
                model: modelToUse,
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
          } finally {
            clearTimeout(timeoutId)
          }

          if (response.ok) {
            const rawText = await response.text()
            const extracted = extractContentFrom9Router(rawText)
            if (extracted) {
              try {
                const parsed = parseJsonPayload(extracted)
                if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
                  return NextResponse.json({
                    success: true,
                    data: parsed,
                    source: `9router (${modelToUse})`,
                  })
                }
              } catch (parseErr) {
                console.warn(`Failed parsing JSON from 9Router (${modelToUse}):`, parseErr)
              }
            }
          } else {
            const errResText = await response.text()
            console.warn(`9Router model ${modelToUse} failed: HTTP ${response.status}`, errResText.slice(0, 200))
          }
        } catch (routerErr: any) {
          console.warn(`9Router model ${modelToUse} exception:`, routerErr.name === 'AbortError' ? 'Timeout 60s' : routerErr.message)
        }
      }
    }

    // PRIORITAS CADANGAN: Google Gemini API Direct (jika 9Router berhalangan)
    if (effectiveGeminiKey) {
      try {
        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        let geminiSuccessResult = null
        let lastGeminiError = ''

        for (const model of modelsToTry) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 45000)

            const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveGeminiKey}`
            const geminiRes = await fetch(geminiEndpoint, {
              method: 'POST',
              signal: controller.signal,
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
                generationConfig: {
                  temperature: 0.1,
                  responseMimeType: 'application/json',
                },
              }),
            }).finally(() => clearTimeout(timeoutId))

            if (geminiRes.ok) {
              const json = await geminiRes.json()
              const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) {
                const parsed = parseJsonPayload(text)
                geminiSuccessResult = { parsed, model }
                break
              }
            } else {
              const errText = await geminiRes.text()
              lastGeminiError = `Gemini ${model} HTTP ${geminiRes.status}: ${errText.slice(0, 200)}`
            }
          } catch (mErr: any) {
            lastGeminiError = mErr.message || 'Gemini request error'
          }
        }

        if (geminiSuccessResult) {
          return NextResponse.json({
            success: true,
            data: geminiSuccessResult.parsed,
            source: `google-gemini-direct (${geminiSuccessResult.model})`,
          })
        }
      } catch (geminiErr: any) {
        console.warn('Gemini direct invocation exception:', geminiErr.message)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'Kunci AI Vision (Google Gemini API Key atau NEXT_9ROUTER_KEY) tidak tersedia atau gagal merespons gambar.',
      },
      { status: 502 }
    )
  } catch (error: any) {
    console.error('Error in OCR API route:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
