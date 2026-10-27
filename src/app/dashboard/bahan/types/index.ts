export interface Supplier {
  id: string
  user_id?: string
  code?: string
  nama: string
  telepon?: string
  alamat?: string
  kategori?: string
  minimal_order?: number
  created_at?: string
  updated_at?: string
}

export interface Bahan {
  id: string
  userId?: string
  code?: string
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
  stokMinimum: number
  supplierId?: string | null
  supplier?: Supplier | null
  createdAt?: string
  updatedAt?: string
}

export type StockCondition = 'habis' | 'rendah' | 'ok'

export type FilterStatus = 'all' | 'ok' | 'rendah' | 'habis'

export interface BahanFormData {
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
  stokMinimum: number
  supplierId: string
}
