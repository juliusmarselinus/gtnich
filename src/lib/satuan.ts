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

// Konversi unit takaran resep ke satuan master bahan baku
// Mengembalikan faktor pengali kuantitas terhadap harga dan stok master
export function getUnitConversionFactor(recipeUnit: string, baseUnit: string): number {
  const r = recipeUnit.toLowerCase().trim()
  const b = baseUnit.toLowerCase().trim()

  if (r === b) return 1

  // Berat: kg <-> gram
  if (r === 'gram' && b === 'kg') return 0.001       // 1 gram = 0.001 kg
  if (r === 'gr' && b === 'kg') return 0.001
  if (r === 'g' && b === 'kg') return 0.001
  if (r === 'kg' && (b === 'gram' || b === 'gr' || b === 'g')) return 1000 // 1 kg = 1000 gram

  // Volume: liter <-> ml
  if (r === 'ml' && (b === 'liter' || b === 'l')) return 0.001     // 1 ml = 0.001 liter
  if ((r === 'liter' || r === 'l') && b === 'ml') return 1000     // 1 liter = 1000 ml

  // Sendok makan (sdm) estimasi ~ 15 gram / 15 ml
  if (r === 'sdm' && b === 'kg') return 0.015
  if (r === 'sdm' && (b === 'gram' || b === 'gr' || b === 'g')) return 15
  if (r === 'sdm' && (b === 'liter' || b === 'l')) return 0.015
  if (r === 'sdm' && b === 'ml') return 15

  // Sendok teh (sdt) estimasi ~ 5 gram / 5 ml
  if (r === 'sdt' && b === 'kg') return 0.005
  if (r === 'sdt' && (b === 'gram' || b === 'gr' || b === 'g')) return 5
  if (r === 'sdt' && (b === 'liter' || b === 'l')) return 0.005
  if (r === 'sdt' && b === 'ml') return 5

  // Pembelian Kemasan / Grosir umum di PO
  if (r.startsWith('karung (25kg)') && b === 'kg') return 25
  if (r.startsWith('karung (50kg)') && b === 'kg') return 50
  if (r.startsWith('jerigen (5l)') && (b === 'liter' || b === 'l')) return 5
  if (r.startsWith('jerigen (18l)') && (b === 'liter' || b === 'l')) return 18
  if (r.startsWith('tray (30') && (b === 'butir' || b === 'pcs')) return 30
  if (r.startsWith('pack (50') && (b === 'lembar' || b === 'pcs')) return 50
  if (r.startsWith('pack (100') && (b === 'lembar' || b === 'pcs')) return 100
  if (r.startsWith('lusin') && (b === 'pcs' || b === 'butir' || b === 'lembar')) return 12
  if (r.startsWith('kodi') && (b === 'pcs' || b === 'lembar')) return 20
  if (r.startsWith('gross') && (b === 'pcs' || b === 'lembar')) return 144

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
