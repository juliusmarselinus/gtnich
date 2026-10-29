export type RekomendasiTipe = 'Stok' | 'Keuangan' | 'Penjualan'
export type RekomendasiPriority = 'tinggi' | 'sedang' | 'rendah'

export interface RekomendasiItem {
  id: string
  tipe: RekomendasiTipe
  judul: string
  deskripsi: string
  confidence: number
  priority: RekomendasiPriority
  actionLink?: string
  actionLabel?: string
  relatedId?: string
}

export interface RekomendasiSummary {
  total: number
  kritisCount: number
  stokCount: number
  keuanganCount: number
  penjualanCount: number
}
