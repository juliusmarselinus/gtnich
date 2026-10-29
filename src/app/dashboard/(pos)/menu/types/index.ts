export interface ResepItemInput {
  bahanId: string
  namaBahan?: string
  satuan?: string // Satuan yang digunakan di resep (misal: gram, sdm, ml, kg)
  hargaPerSatuan?: number
  qty: number
}

export interface ResepItemDetail {
  id: string
  userId: string
  menuId: string
  bahanId: string
  namaBahan: string
  satuan: string // Satuan pemakaian resep
  satuanBase?: string // Satuan master bahan baku di tabel bahan
  hargaPerSatuan: number
  qty: number
  subtotalHPP: number
}

export interface MenuItem {
  id: string
  userId: string
  code?: string | null
  sku?: string | null
  nama: string
  kategori: string
  emoji: string
  hargaJual: number
  estimasiHPP: number
  profit: number
  profitPercent: number
  isActive: boolean
  resep: ResepItemDetail[]
  createdAt: string
  updatedAt: string
}

export interface BahanOption {
  id: string
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
}

export interface MenuFormData {
  nama: string
  kategori: string
  sku?: string
  emoji?: string
  hargaJual: number
  resep: ResepItemInput[]
}
