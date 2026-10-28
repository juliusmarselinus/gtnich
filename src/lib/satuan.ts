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
  return [b, 'pcs', 'butir', 'pack', 'sachet', 'kaleng', 'botol']
}
