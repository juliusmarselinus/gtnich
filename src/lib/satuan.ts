// Daftar standar satuan bahan baku umum di dapur & UMKM
export const DEFAULT_SATUAN_LIST = [
  'kg',
  'gram',
  'liter',
  'ml',
  'butir',
  'pcs',
  'sachet',
  'bungkus',
  'kaleng',
  'botol',
  'pack',
  'lembar',
  'sdm',
  'sdt',
] as const

export type CommonSatuan = typeof DEFAULT_SATUAN_LIST[number] | string

// Konversi unit takaran resep / order ke satuan master bahan baku
// Mengembalikan faktor pengali kuantitas terhadap harga dan stok master
const BASE_TO_GRAM: Record<string, number> = { kg: 1000, gram: 1, gr: 1, g: 1, mg: 0.001 }
const BASE_TO_ML: Record<string, number> = { liter: 1000, l: 1000, ml: 1 }

function toGram(u: string): number | null {
  if (u in BASE_TO_GRAM) return BASE_TO_GRAM[u]
  if (u === 'sdm') return 15
  if (u === 'sdt') return 5
  return null
}

function toMl(u: string): number | null {
  if (u in BASE_TO_ML) return BASE_TO_ML[u]
  if (u === 'sdm') return 15
  if (u === 'sdt') return 5
  return null
}

const COUNT_UNITS = ['pcs', 'butir', 'lembar']

export function getUnitConversionFactor(recipeUnit: string, baseUnit: string): number {
  const r = recipeUnit.toLowerCase().trim()
  const b = baseUnit.toLowerCase().trim()

  if (r === b) return 1

  // Kemasan dengan isi di dalam kurung, mis. "karung (50kg)", "jerigen (5L)", "tray (30 butir)", "lusin (12)"
  const pack = r.match(/\((\d+(?:[.,]\d+)?)\s*([a-z]*)/)
  if (pack) {
    const isi = Number(pack[1].replace(',', '.'))
    const isiUnit = pack[2] || (COUNT_UNITS.includes(b) ? b : '')
    if (isiUnit) return isi * getUnitConversionFactor(isiUnit, b)
  }

  // Berat (kg, gram, sdm, sdt)
  const rg = toGram(r), bg = toGram(b)
  if (rg !== null && bg !== null && (r in BASE_TO_GRAM || b in BASE_TO_GRAM)) return rg / bg

  // Volume (liter, ml, sdm, sdt)
  const rm = toMl(r), bm = toMl(b)
  if (rm !== null && bm !== null) return rm / bm

  // Hitungan: pcs / butir / lembar dianggap setara
  if (COUNT_UNITS.includes(r) && COUNT_UNITS.includes(b)) return 1

  // Jika satuan tidak saling ekuivalen matematis, anggap 1:1
  return 1
}

// Rekomendasi satuan yang kompatibel berdasarkan satuan master bahan
export function getCompatibleRecipeUnits(baseUnit: string): string[] {
  const b = baseUnit.toLowerCase().trim()

  if (['kg', 'gram', 'gr', 'g'].includes(b)) {
    return ['gram', 'kg', 'sdm', 'sdt']
  }

  if (['liter', 'l', 'ml'].includes(b)) {
    return ['ml', 'liter', 'sdm', 'sdt']
  }

  // Satuan hitungan satuan per biji / kemasan
  return Array.from(new Set([b, 'pcs', 'butir', 'pack', 'sachet', 'kaleng', 'botol']))
}

// Rekomendasi satuan pembelian di Purchase Order (termasuk satuan grosir/kemasan)
export function getCompatibleOrderUnits(baseUnit: string): string[] {
  const b = baseUnit.toLowerCase().trim()

  if (['kg', 'gram', 'gr', 'g'].includes(b)) {
    return ['kg', 'gram', 'karung (25kg)', 'karung (50kg)', 'dus/karton', 'pack', 'bal']
  }

  if (['liter', 'l', 'ml'].includes(b)) {
    return ['liter', 'ml', 'jerigen (5L)', 'jerigen (18L)', 'dus/karton', 'botol']
  }

  if (['butir', 'butir telur'].includes(b)) {
    return ['butir', 'tray (30 butir)', 'kg', 'ikat']
  }

  if (['lembar', 'pcs'].includes(b)) {
    return ['pcs', 'lembar', 'pack (50 pcs)', 'pack (100 pcs)', 'dus/karton', 'ikat']
  }

  // Default umum
  return Array.from(new Set([b, 'pack', 'dus/karton', 'lusin (12)', 'kodi (20)', 'gross (144)']))
}
