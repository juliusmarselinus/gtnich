export type SimTab = 'penjualan' | 'supplier' | 'supply'

export interface SimulasiResepItem {
  id: string
  bahanId: string
  namaBahan: string
  satuan: string
  qty: number
  hargaPerSatuan: number
  stokTersedia: number
}

export interface SimulasiMenuItem {
  id: string
  nama: string
  kategori: string
  emoji: string
  hargaJual: number
  estimasiHPP: number
  profitPercent: number
  resep: SimulasiResepItem[]
}

export interface SimulasiBahanItem {
  id: string
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
  stokMinimum: number
}
