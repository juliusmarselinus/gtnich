import { AIExpiryAnalysis } from '../types'

// Basis pengetahuan cerdas (Food Shelf-life Intelligence) untuk bahan dapur & UMKM
// Digunakan sebagai default cerdas atau fallback bila API Key LLM eksternal belum diisi
const SHELF_LIFE_KB: Array<{
  keywords: string[]
  days: number
  kategori: AIExpiryAnalysis['kategoriKetahanan']
  tips: string
  alasan: string
}> = [
  {
    keywords: ['cabai', 'cabe', 'tomat', 'bayam', 'kangkung', 'sawi', 'daun', 'pisang', 'alpukat', 'stroberi'],
    days: 5,
    kategori: 'sangat_rentan',
    tips: 'Simpan di chiller/kulkas dengan wadah beralas tisu kering. Jauhkan dari kelembaban berlebih.',
    alasan: 'Kategori buah/sayur segar dengan kadar air tinggi rentan mengalami pembusukan dan jamur dalam hitungan hari.',
  },
  {
    keywords: ['susu murni', 'daging', 'ayam', 'ikan', 'seafood', 'udang'],
    days: 3,
    kategori: 'sangat_rentan',
    tips: 'Wajib disimpan dalam freezer (-18°C) jika belum diolah. Di chiller hanya tahan 1-3 hari.',
    alasan: 'Produk hewani segar rentan terhadap perkembangbiakan bakteri patogen.',
  },
  {
    keywords: ['telur', 'susu uht', 'mentega', 'keju', 'singkong', 'kentang', 'wortel', 'bawang', 'tahu', 'tempe'],
    days: 14,
    kategori: 'rentan',
    tips: 'Simpan di suhu sejuk kering berventilasi baik (untuk umbi/bawang) atau di kulkas bagian tengah (untuk dairy/telur).',
    alasan: 'Memiliki lapisan pelindung alami atau proses pasteurisasi, tahan 1-3 minggu pada kondisi tepat.',
  },
  {
    keywords: ['tepung', 'terigu', 'tapioka', 'maizena', 'beras', 'ketan', 'cokelat bubuk', 'kacang'],
    days: 180,
    kategori: 'sedang',
    tips: 'Simpan dalam toples/kontainer kedap udara rapat. Hindari paparan sinar matahari langsung dan tempat lembab.',
    alasan: 'Kadar air sangat rendah sehingga aman dari mikroba hingga 6 bulan, asalkan terbebas dari kutu dan kelembaban.',
  },
  {
    keywords: ['gula', 'garam', 'minyak', 'madu', 'kecap', 'cuka', 'soda kue', 'vanili', 'merica', 'kemasan'],
    days: 365,
    kategori: 'tahan_lama',
    tips: 'Tutup rapat wadah setelah digunakan. Simpan di rak lemari kering pada suhu ruang.',
    alasan: 'Garam, gula, dan minyak bertindak sebagai pengawet alami sehingga memiliki masa simpan sangat panjang.',
  },
]

export async function analyzeShelfLife(
  namaBahan: string,
  tanggalMasukISO: string,
  apiKey?: string
): Promise<{
  aiEstimasiExpire: string
  aiSisaHari: number
  aiStatusFreshness: 'segar' | 'mendekati_expire' | 'kadaluarsa'
  aiAnalysis: AIExpiryAnalysis
}> {
  const tanggalMasuk = new Date(tanggalMasukISO)
  const now = new Date()

  let analysis: AIExpiryAnalysis | null = null

  // 1. JIKA API KEY TERSEDIA (Google Gemini API / LLM)
  if (apiKey && apiKey.trim() !== '') {
    try {
      const prompt = `Analisis masa kadaluarsa (shelf-life) untuk bahan baku dapur/kuliner: "${namaBahan}".
Berikan output HANYA berupa JSON valid tanpa markdown, dengan format:
{
  "perkiraanUmurHari": <angka perkiraan jumlah hari sejak barang masuk sampai expire pada penyimpanan standar>,
  "kategoriKetahanan": <salah satu dari: "sangat_rentan" | "rentan" | "sedang" | "tahan_lama">,
  "tipsPenyimpanan": "<saran cara penyimpanan agar awet>",
  "alasan": "<penjelasan singkat ilmiah>",
  "confidence": <angka 1-100>
}`

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      })

      if (response.ok) {
        const json = await response.json()
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          analysis = JSON.parse(text)
        }
      } else {
        console.warn('Gemini API call failed, falling back to local food intelligence:', response.statusText)
      }
    } catch (e) {
      console.warn('AI API evaluation exception, using local rule-based intelligence:', e)
    }
  }

  // 2. FALLBACK: Rule-Based Intelligent Engine
  if (!analysis) {
    const lowerName = namaBahan.toLowerCase()
    const matched = SHELF_LIFE_KB.find(rule =>
      rule.keywords.some(kw => lowerName.includes(kw))
    )

    if (matched) {
      analysis = {
        perkiraanUmurHari: matched.days,
        kategoriKetahanan: matched.kategori,
        tipsPenyimpanan: matched.tips,
        alasan: matched.alasan,
        confidence: 90,
      }
    } else {
      // Default perkiraan umum (30 hari)
      analysis = {
        perkiraanUmurHari: 30,
        kategoriKetahanan: 'sedang',
        tipsPenyimpanan: 'Simpan di tempat bersih, sejuk, dan terlindung dari sinar matahari langsung.',
        alasan: 'Perkiraan standar untuk bahan dapur olahan/kering.',
        confidence: 75,
      }
    }
  }

  const finalAnalysis: AIExpiryAnalysis = analysis!

  // Hitung tanggal kedaluwarsa = tanggalMasuk + perkiraanUmurHari
  const expireDate = new Date(tanggalMasuk)
  expireDate.setDate(expireDate.getDate() + finalAnalysis.perkiraanUmurHari)

  // Hitung selisih hari dari SEKARANG sampai expireDate
  const diffTime = expireDate.getTime() - now.getTime()
  const sisaHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let status: 'segar' | 'mendekati_expire' | 'kadaluarsa' = 'segar'
  if (sisaHari <= 0) {
    status = 'kadaluarsa'
  } else if (sisaHari <= 3) {
    status = 'mendekati_expire'
  }

  return {
    aiEstimasiExpire: expireDate.toISOString(),
    aiSisaHari: sisaHari,
    aiStatusFreshness: status,
    aiAnalysis: finalAnalysis,
  }
}
