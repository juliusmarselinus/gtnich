export interface ParsedItem {
  id?: string
  nama: string
  qty: number
  satuan: string
  harga: number
  matchedBahanId?: string
}

export interface OCRScanResult {
  supplierName?: string
  tanggalNota?: string
  nomorNota?: string
  items: ParsedItem[]
  totalAkumulasi: number
  catatan?: string
}

export interface SupplierOption {
  id: string
  nama: string
}

export interface BahanOption {
  id: string
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
}

export interface RouterConfig {
  routerUrl: string
  routerKey: string
  routerModel?: string
}
