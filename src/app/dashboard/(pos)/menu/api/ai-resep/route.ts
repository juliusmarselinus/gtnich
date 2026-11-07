import { NextRequest, NextResponse } from 'next/server'

interface RawAIItem {
  nama?: string
  namaBahan?: string
  matchedBahanId?: string | null
  qty?: number | string
  satuan?: string
  hargaPerSatuan?: number | string
  satuanBeli?: string
}

// Satuan yang umum dijual di pasar / toko bahan di Indonesia
const SATUAN_BELI = ['kg', 'liter', 'butir', 'pcs', 'ikat', 'bungkus', 'botol', 'kaleng', 'sachet', 'lembar', 'pack']

function normalizeSatuanBeli(raw: string): string {
  const s = raw.toLowerCase().trim()
  if (['gram', 'gr', 'g', 'ons', 'kilogram'].includes(s)) return 'kg'
  if (['ml', 'l', 'litre'].includes(s)) return 'liter'
  if (['biji', 'buah'].includes(s)) return 'pcs'
  return SATUAN_BELI.includes(s) ? s : 'pcs'
}

// Takaran resep harus bisa dikonversi ke satuan beli; kalau tidak, pakai satuan beli
function normalizeSatuanResep(raw: string, beli: string): string {
  const s = raw.toLowerCase().trim()
  if (beli === 'kg') return ['gram', 'kg', 'sdm', 'sdt'].includes(s) ? s : 'gram'
  if (beli === 'liter') return ['ml', 'liter', 'sdm', 'sdt'].includes(s) ? s : 'ml'
  if (['butir', 'pcs', 'lembar'].includes(beli) && ['butir', 'pcs', 'lembar'].includes(s)) return s
  return beli
}

interface AIResepRequest {
  namaMenu: string
  existingBahan?: Array<{
    id: string
    nama: string
    satuan: string
    hargaPerSatuan?: number
  }>
}

function parseAIResponse(raw: string) {
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
  const rawItems: RawAIItem[] = Array.isArray(parsed.items)
    ? parsed.items
    : Array.isArray(parsed.resep)
    ? parsed.resep
    : Array.isArray(parsed)
    ? parsed
    : []

  return {
    kategori: typeof parsed.kategori === 'string' ? parsed.kategori : undefined,
    emoji: typeof parsed.emoji === 'string' ? parsed.emoji : undefined,
    items: rawItems
      .map((it: RawAIItem) => {
        const satuanBeli = normalizeSatuanBeli(String(it.satuanBeli || it.satuan || 'kg'))
        return {
          nama: String(it.nama || it.namaBahan || '').trim(),
          matchedBahanId: it.matchedBahanId ? String(it.matchedBahanId).trim() : null,
          qty: Number(it.qty) > 0 ? Number(it.qty) : 1,
          satuan: normalizeSatuanResep(String(it.satuan || 'gram'), satuanBeli),
          satuanBeli,
          // harga pasar per 1 satuanBeli
          hargaPerSatuan: Number(it.hargaPerSatuan) > 0 ? Number(it.hargaPerSatuan) : 0,
        }
      })
      .filter(it => it.nama.length > 0),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: AIResepRequest = await req.json()
    const { namaMenu, existingBahan = [] } = body

    if (!namaMenu || !namaMenu.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama menu tidak boleh kosong' },
        { status: 400 }
      )
    }

    const routerUrl = process.env.NEXT_9ROUTER_URL || 'https://router.hitungmin.my.id/v1'
    const routerKey = process.env.NEXT_9ROUTER_KEY || ''
    const routerModel = process.env.NEXT_9ROUTER_MODEL || 'gemini/gemini-3.1-flash-lite'

    if (!routerUrl || !routerKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Konfigurasi 9Router tidak lengkap di environment (NEXT_9ROUTER_URL / NEXT_9ROUTER_KEY)',
        },
        { status: 500 }
      )
    }

    let endpoint = routerUrl.trim()
    if (!endpoint.includes('/chat/completions') && !endpoint.includes('/generateContent')) {
      endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions'
    }

    const bahanContext =
      existingBahan.length > 0
        ? existingBahan.map(b => `- ID: "${b.id}", Nama: "${b.nama}", Satuan Master: "${b.satuan}"`).join('\n')
        : '(Belum ada master bahan baku di dapur)'

    const systemPrompt = `Anda adalah chef profesional, konsultan kuliner, dan manajer F&B restoran. Output Anda WAJIB HANYA berupa JSON valid tanpa teks pengantar, tanpa penjelasan, dan tanpa code fence (\`\`\`json).`

    const userPrompt = `Berdasarkan nama menu masakan: "${namaMenu.trim()}", tentukan komposisi resep bahan baku standar untuk 1 (satu) porsi saji.

DAFTAR MASTER BAHAN BAKU DI DAPUR SAAT INI:
${bahanContext}

INSTRUKSI PENTING:
1. Prioritaskan MENGGUNAKAN bahan yang ada di daftar master di atas jika relevan atau mirip (misal: menu butuh telur, jika ada master "Telur Ayam" gunakan ID dan nama master tersebut).
2. Jika bahan cocok dengan master bahan, sertakan "matchedBahanId" dengan ID dari daftar master. Jika belum ada di master dapur, isi "matchedBahanId" dengan null.
3. Tentukan takaran kuantitas "qty" (angka positif > 0) dan "satuan" (misal: gram, ml, butir, pcs, sdm, sdt, lembar, kg, liter) yang realistis untuk 1 porsi saji.
4. Isi "satuanBeli" dengan satuan yang UMUM dijual di pasar/toko Indonesia untuk bahan itu, pilih salah satu: kg, liter, butir, pcs, ikat, bungkus, botol, kaleng, sachet, lembar, pack. Contoh: tepung/gula/daging/cream cheese -> kg, minyak/susu cair -> liter, telur -> butir, daun bawang -> ikat.
5. "satuan" takaran resep harus bisa dikonversi ke satuanBeli: kg -> gram/sdm/sdt, liter -> ml/sdm/sdt, butir/pcs/lembar -> sama, selain itu -> sama dengan satuanBeli.
6. Isi "hargaPerSatuan" dengan perkiraan harga pasar wajar di Indonesia saat ini dalam Rupiah untuk 1 "satuanBeli" (contoh: tepung terigu per kg sekitar 13000, telur per butir sekitar 2000). Angka saja.
7. Berikan rekomendasi kategori menu ("Camilan", "Kue & Manisan", "Lauk Kering", "Minuman", "Makanan Berat", atau "Bumbu & Saus") dan emoji yang sesuai.

KEMBALIKAN HANYA JSON DENGAN FORMAT PERSIS SEPERTI INI:
{
  "kategori": "Makanan Berat",
  "emoji": "🍲",
  "items": [
    {
      "nama": "Nama Bahan",
      "matchedBahanId": "id-dari-daftar-atau-null",
      "qty": 100,
      "satuan": "gram",
      "satuanBeli": "kg",
      "hargaPerSatuan": 13000
    }
  ]
}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${routerKey.trim()}`,
      },
      body: JSON.stringify({
        model: routerModel,
        stream: false,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn('9Router call failed:', response.status, errText)

      // Fallback ke model 'opencode-code' jika model awal gagal
      if (routerModel !== 'opencode-code') {
        try {
          const retryRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${routerKey.trim()}`,
            },
            body: JSON.stringify({
              model: 'opencode-code',
              stream: false,
              temperature: 0.2,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
            }),
          })
          if (retryRes.ok) {
            const retryJson = await retryRes.json()
            const raw = retryJson?.choices?.[0]?.message?.content
            if (raw) {
              const parsed = parseAIResponse(raw)
              return NextResponse.json({ success: true, data: parsed, source: '9router-opencode-code' })
            }
          }
        } catch (retryErr) {
          console.warn('Retry with opencode-code failed:', retryErr)
        }
      }

      return NextResponse.json(
        { success: false, error: `9Router API Error (${response.status}): ${errText}` },
        { status: 502 }
      )
    }

    const json = await response.json()
    const rawContent = json?.choices?.[0]?.message?.content
    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: '9Router tidak mengembalikan konten respons' },
        { status: 502 }
      )
    }

    const parsed = parseAIResponse(rawContent)
    return NextResponse.json({ success: true, data: parsed, source: '9router' })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error in ai-resep route:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat memproses komposisi resep AI' },
      { status: 500 }
    )
  }
}
