export type POStatus = 'draft' | 'dikirim' | 'diterima' | 'tagihan'

export interface POItem {
  id?: string
  poId?: string
  bahanId: string
  namaBahan: string
  satuan: string
  qty: number
  hargaEstimasi: number
  hargaAktual: number
  stokSebelum: number
  diterima: boolean
}

export interface PurchaseOrder {
  id: string
  userId: string
  noPO: string
  supplierId: string | null
  namaSupplier: string
  status: POStatus
  totalEstimasi: number
  totalAktual: number
  tanggalBuat: string
  tanggalTerima?: string | null
  catatan?: string | null
  items: POItem[]
  createdAt: string
  updatedAt: string
}

export interface SupplierOption {
  id: string
  nama: string
  kategori?: string
  minimalOrder?: number
}

export interface BahanOption {
  id: string
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
}

export interface CreatePOInput {
  supplierId: string | null
  namaSupplier: string
  status?: POStatus
  catatan?: string
  items: Array<{
    bahanId: string
    namaBahan: string
    satuan: string
    qty: number
    hargaEstimasi: number
    stokSebelum: number
  }>
}

export interface VerifyItemPenerimaan {
  itemId: string
  bahanId: string
  namaBahan: string
  satuan: string
  qtyPesan: number
  qtyDiterima: number
  hargaEstimasi: number
  hargaAktual: number
  isSesuai: boolean
  catatanItem?: string
}

export interface VerifyPenerimaanInput {
  poId: string
  items: VerifyItemPenerimaan[]
  totalAktual: number
  catatanPenerimaan?: string
  autoUpdateHargaMaster?: boolean
}
