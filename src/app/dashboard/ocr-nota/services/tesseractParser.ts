import { ParsedItem, OCRScanResult, BahanOption } from '../types'

// Satuan umum dalam nota restoran / pasar
const UNIT_KEYWORDS = [
  'kg', 'kilogram', 'kilo', 'gr', 'gram', 'g',
  'ltr', 'liter', 'lt', 'l', 'ml', 'mili',
  'pcs', 'pc', 'buah', 'btr', 'butir', 'ikat',
  'pak', 'pack', 'bungkus', 'bks', 'dus', 'box', 'sak', 'kaleng', 'klg', 'botol', 'btl', 'sachet'
]

// Normalisasi satuan ke format standar aplikasi
function normalizeSatuan(raw?: string): string {
  if (!raw) return 'pcs'
  const s = raw.toLowerCase().trim()
  if (s.includes('kg') || s.includes('kilo')) return 'kg'
  if (s.includes('gr') || s.includes('gram')) return 'gram'
  if (s.includes('ltr') || s.includes('liter') || s === 'lt' || s === 'l') return 'liter'
  if (s.includes('ml')) return 'ml'
  if (s.includes('btr') || s.includes('butir')) return 'butir'
  if (s.includes('pak') || s.includes('pack') || s.includes('bks')) return 'pack'
  if (s.includes('dus') || s.includes('box')) return 'box'
  if (s.includes('kaleng') || s.includes('klg')) return 'kaleng'
  if (s.includes('botol') || s.includes('btl')) return 'botol'
  return 'pcs'
}

// Bersihkan string angka (misal "Rp 15.000,00" atau "15000" atau "15.000" atau "15,000") menjadi number
export function parseCurrencyNumber(str: string): number {
  if (!str) return 0
  let clean = str.replace(/[^\d.,]/g, '').trim()
  if (!clean) return 0

  // Jika ada koma dan titik (misal 15.000,00)
  if (clean.includes('.') && clean.includes(',')) {
    const lastDot = clean.lastIndexOf('.')
    const lastComma = clean.lastIndexOf(',')
    if (lastComma > lastDot) {
      // Format Indo: 15.000,00 -> buang titik, ganti koma jadi titik
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else {
      // Format US: 15,000.00 -> buang koma
      clean = clean.replace(/,/g, '')
    }
  } else if (clean.includes('.')) {
    // Cek apakah titik desimal atau ribuan
    const parts = clean.split('.')
    if (parts.length > 2) {
      clean = clean.replace(/\./g, '')
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        clean = parts[0] + parts[1]
      } else if (parts[1].length === 2 && parts[0].length >= 4) {
        clean = clean.replace('.', '')
      }
    }
  } else if (clean.includes(',')) {
    const parts = clean.split(',')
    if (parts.length > 2) {
      clean = clean.replace(/,/g, '')
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        clean = parts[0] + parts[1]
      } else {
        clean = parts[0]
      }
    }
  }

  const num = parseFloat(clean)
  return isNaN(num) ? 0 : Math.round(num)
}

// Hitung kemiripan string sederhana (Levenshtein / Dice similarity)
function getSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1.toLowerCase() : s2.toLowerCase()
  const shorter = s1.length > s2.length ? s2.toLowerCase() : s1.toLowerCase()
  if (longer.length === 0) return 1.0
  if (longer.includes(shorter)) return 0.85

  let matches = 0
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++
  }
  return matches / longer.length
}

// Bersihkan nomor urut di awal string nama (misal "1. ", "2) ", "#1 ")
function cleanLeadingNumber(str: string): string {
  return str.replace(/^(\d+[\.\)\-:]\s*|#\d+\s*)/, '').trim()
}

// Cek apakah baris adalah baris pembatas, total, kasir, tanggal, atau footer nota
function isIgnoredLine(lower: string): boolean {
  if (
    lower.startsWith('total') ||
    lower.startsWith('grand total') ||
    lower.startsWith('subtotal') ||
    lower.startsWith('sub total') ||
    lower.startsWith('harga jual') ||
    lower.startsWith('tunai') ||
    lower.startsWith('cash') ||
    lower.startsWith('kembali') ||
    lower.startsWith('kembalian') ||
    lower.startsWith('change') ||
    lower.startsWith('bayar') ||
    lower.startsWith('payment') ||
    lower.startsWith('debit') ||
    lower.startsWith('qris') ||
    lower.startsWith('kartu') ||
    lower.startsWith('terima kasih') ||
    lower.startsWith('thank you') ||
    lower.startsWith('telp') ||
    lower.startsWith('telepon') ||
    lower.startsWith('operator') ||
    lower.startsWith('kasir') ||
    lower.startsWith('alamat') ||
    lower.startsWith('npwp') ||
    lower.startsWith('nota pembelian') ||
    lower.startsWith('tgl') ||
    lower.startsWith('tanggal') ||
    lower.startsWith('date') ||
    lower.includes('layanan konsumen') ||
    lower.includes('call center') ||
    lower.includes('kritik & saran') ||
    lower.includes('pajak') ||
    lower.includes('ppn') ||
    lower.includes('diskon')
  ) {
    return true
  }

  // Jika baris hanya tanda garis/bintang strip (misal "----------------")
  if (/^[-=*_.#~/\\]+$/.test(lower)) {
    return true
  }

  return false
}

export function parseReceiptRawText(
  rawText: string,
  existingBahanList: BahanOption[] = []
): OCRScanResult {
  const rawLines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  let supplierName: string | undefined = undefined
  let tanggalNota: string | undefined = undefined
  let nomorNota: string | undefined = undefined
  let detectedTotal = 0

  // 1. Ekstrak Tanggal
  const dateRegex = /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/
  for (const line of rawLines) {
    const match = line.match(dateRegex)
    if (match) {
      const p1 = parseInt(match[1])
      const p2 = parseInt(match[2])
      const p3 = parseInt(match[3])
      const year = p3 < 100 ? 2000 + p3 : p3
      const month = String(p2).padStart(2, '0')
      const day = String(p1).padStart(2, '0')
      tanggalNota = `${year}-${month}-${day}`
      break
    }
  }

  // 2. Ekstrak Nomor Nota / Invoice
  const noNotaRegex = /(?:no\.?|nota|inv|invoice|struk|faktur|bill)[\s:#-]*([A-Za-z0-9\/-]+)/i
  for (const line of rawLines) {
    const match = line.match(noNotaRegex)
    if (match && match[1] && match[1].length >= 3 && !match[1].toLowerCase().includes('tanggal')) {
      nomorNota = match[1]
      break
    }
  }

  // 3. Deteksi Supplier (Baris awal yang bukan invoice/tanggal/telepon)
  for (let i = 0; i < Math.min(5, rawLines.length); i++) {
    const line = rawLines[i]
    const lower = line.toLowerCase()
    if (
      !isIgnoredLine(lower) &&
      !lower.includes('nota') &&
      !lower.includes('struk') &&
      !lower.includes('kasir') &&
      !lower.includes('tanggal') &&
      !lower.includes('tgl') &&
      !lower.includes('invoice') &&
      line.length >= 3 &&
      !/^\d+$/.test(line) &&
      !dateRegex.test(line)
    ) {
      supplierName = line.replace(/[^a-zA-Z0-9\s.&'-]/g, '').trim()
      break
    }
  }

  // 4. Deteksi Total Nota dari Baris Total / Subtotal
  for (const line of rawLines) {
    const lower = line.toLowerCase()
    if (
      lower.startsWith('total') ||
      lower.startsWith('grand total') ||
      lower.startsWith('subtotal') ||
      lower.startsWith('harga jual')
    ) {
      const nums = line.match(/[Rp\s]*[\d.,]+/gi)
      if (nums) {
        for (const n of nums) {
          const val = parseCurrencyNumber(n)
          if (val > detectedTotal && val >= 500 && val < 1000000000) {
            detectedTotal = val
          }
        }
      }
    }
  }

  // Helper untuk mengekstrak kuantitas & satuan dari teks nama jika ada
  function extractQtyUnitFromName(nameStr: string): { cleanName: string; qty: number; satuan: string } {
    let cleanName = nameStr
    let qty = 1
    let satuan = 'pcs'

    const sizeMatch = cleanName.match(/\b(\d+([.,]\d+)?)\s*(kg|kilogram|kilo|gr|gram|g|ltr|liter|lt|ml|pcs|btr|butir|pak|pack|dus|box|btl|botol)\b/i)
    if (sizeMatch) {
      qty = parseFloat(sizeMatch[1].replace(',', '.')) || 1
      satuan = normalizeSatuan(sizeMatch[3])
    }

    return { cleanName, qty, satuan }
  }

  const items: ParsedItem[] = []

  // 5. Ekstraksi Item Belanja
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i]
    const lower = line.toLowerCase()

    if (isIgnoredLine(lower)) continue

    // Cek Kasus A: Format 2 Baris (Baris berikutnya adalah baris angka qty & subtotal)
    // Syarat penting: Baris saat ini (line) tidak boleh berakhiran dengan angka harga (karena jika berakhiran harga, itu Kasus C)
    const currentLineTokens = line.split(/\s+/)
    const currentLineLastNum = currentLineTokens.length >= 2 ? parseCurrencyNumber(currentLineTokens[currentLineTokens.length - 1]) : 0

    if (currentLineLastNum < 500 && i + 1 < rawLines.length) {
      const nextLine = rawLines[i + 1]
      const nextLower = nextLine.toLowerCase()

      const numbersInNextLine = nextLine.split(/\s+/).filter(tok => /^\d[\d.,]*$/.test(tok))
      const twoLinePattern = /^(\d+([.,]\d+)?)\s*(?:[xX@]|pcs|kg|gr|ltr|btr|pack|dus)?\s+([Rp\s\d.,]+)$/i
      const matchSub = nextLine.match(twoLinePattern)

      if (
        !isIgnoredLine(nextLower) &&
        !dateRegex.test(nextLower) &&
        (matchSub || (numbersInNextLine.length >= 2 && numbersInNextLine.length <= 4 && line.length >= 2 && !/^\d+$/.test(line)))
      ) {
        const rawName = cleanLeadingNumber(line)
        const { cleanName, qty: extractedQty, satuan: extractedSatuan } = extractQtyUnitFromName(rawName)

        let qty = extractedQty
        let harga = 0

        if (numbersInNextLine.length >= 2) {
          const firstNum = parseFloat(numbersInNextLine[0].replace(',', '.'))
          if (firstNum > 0 && firstNum < 1000) {
            qty = firstNum
          }
          const val2 = parseCurrencyNumber(numbersInNextLine[1])
          const val3 = numbersInNextLine[2] ? parseCurrencyNumber(numbersInNextLine[2]) : 0
          harga = (val2 >= 500 && val2 < 500000000) ? val2 : val3
        } else if (matchSub) {
          qty = parseFloat(matchSub[1].replace(',', '.')) || 1
          harga = parseCurrencyNumber(matchSub[3])
        }

        if (cleanName.length >= 2 && harga >= 500 && harga < 500000000) {
          items.push({
            nama: cleanName,
            qty: qty > 0 ? qty : 1,
            satuan: extractedSatuan,
            harga,
          })
          i++ // Lewati baris angka kedua
          continue
        }
      }
    }

    // Kasus B: 1 Baris Tradisional Pasar (Nama Item + Qty + Harga Satuan + Subtotal)
    // Cek format multi-angka spasi di baris yang sama terlebih dahulu sebelum regex umum
    const tokens = line.split(/\s+/)
    if (tokens.length >= 3) {
      const lastToken = tokens[tokens.length - 1]
      const secondLastToken = tokens[tokens.length - 2]
      const thirdLastToken = tokens[tokens.length - 3]

      const lastNum = parseCurrencyNumber(lastToken)
      const secondNum = parseCurrencyNumber(secondLastToken)
      const thirdNum = parseFloat(thirdLastToken.replace(',', '.'))

      // Jika format: Nama + Qty + Harga Satuan + Subtotal (contoh: "Mentega Blueband 1 9500 9500")
      if (lastNum >= 500 && secondNum >= 500 && lastNum < 500000000) {
        const hasQty = !isNaN(thirdNum) && thirdNum > 0 && thirdNum < 500
        const qty = hasQty ? thirdNum : 1
        const nameTokens = hasQty
          ? tokens.slice(0, tokens.length - 3)
          : tokens.slice(0, tokens.length - 2)
        const rawName = cleanLeadingNumber(nameTokens.join(' '))

        if (rawName.length >= 2) {
          items.push({
            nama: rawName,
            qty,
            satuan: 'pcs',
            harga: secondNum,
          })
          continue
        }
      }
    }

    // Kasus C: 1 Baris dengan Satuan (misal: "Telur Ayam 2 kg 56.000")
    const unitPatternStr = UNIT_KEYWORDS.join('|')
    const singleLineUnitRegex = new RegExp(
      `^(.+?)\\s+(\\d+([.,]\\d+)?)\\s*(${unitPatternStr})?\\s+([Rp\\s\\d.,]+)$`,
      'i'
    )
    const mUnit = line.match(singleLineUnitRegex)
    if (mUnit) {
      const rawNama = cleanLeadingNumber(mUnit[1].trim())
      const rawQty = parseFloat(mUnit[2].replace(',', '.')) || 1
      const rawSatuan = normalizeSatuan(mUnit[4])
      const rawHarga = parseCurrencyNumber(mUnit[5])

      if (rawNama.length >= 2 && rawHarga >= 500 && rawHarga < 500000000) {
        items.push({
          nama: rawNama,
          qty: rawQty,
          satuan: rawSatuan,
          harga: rawHarga,
        })
        continue
      }
    }

    // Kasus D: 1 Baris Tunggal dengan 1 Angka Harga di Ujung
    if (tokens.length >= 2) {
      const lastToken = tokens[tokens.length - 1]
      const lastNum = parseCurrencyNumber(lastToken)
      if (lastNum >= 500 && lastNum < 500000000) {
        const nameTokens = tokens.slice(0, tokens.length - 1)
        const rawName = cleanLeadingNumber(nameTokens.join(' '))
        const { cleanName, qty, satuan } = extractQtyUnitFromName(rawName)

        if (cleanName.length >= 2) {
          items.push({
            nama: cleanName,
            qty,
            satuan,
            harga: lastNum,
          })
          continue
        }
      }
    }
  }

  // 6. Pencocokan Cerdas (Fuzzy Match) ke Master Bahan
  if (existingBahanList.length > 0) {
    for (const item of items) {
      let bestMatch: BahanOption | null = null
      let highestScore = 0

      for (const bahan of existingBahanList) {
        const score = getSimilarity(item.nama, bahan.nama)
        if (score > highestScore && score >= 0.45) {
          highestScore = score
          bestMatch = bahan
        }
      }

      if (bestMatch) {
        item.matchedBahanId = bestMatch.id
        if (item.satuan === 'pcs' && bestMatch.satuan) {
          item.satuan = bestMatch.satuan
        }
      }
    }
  }

  // 7. Fallback Safety: Jika nota difoto miring/buram sehingga parser tidak menemukan item sama sekali
  // Sediakan 1 item template agar pengguna tidak mentok di halaman error
  if (items.length === 0) {
    const rawPreview = rawLines.slice(0, 3).join(' ')
    items.push({
      nama: rawPreview.length >= 3 ? rawPreview.slice(0, 35) : 'Bahan Baku Nota',
      qty: 1,
      satuan: 'pcs',
      harga: detectedTotal > 0 ? detectedTotal : 10000,
    })
  }

  const calculatedTotal = items.reduce((sum, it) => sum + it.qty * it.harga, 0)
  const finalTotal = detectedTotal > 0 ? detectedTotal : calculatedTotal

  return {
    supplierName: supplierName || 'Supplier Toko / Pasar',
    tanggalNota: tanggalNota || new Date().toISOString().split('T')[0],
    nomorNota,
    items,
    totalAkumulasi: finalTotal,
    catatan: `Tesseract.js Engine (Terdeteksi ${items.length} item bahan)`,
  }
}
