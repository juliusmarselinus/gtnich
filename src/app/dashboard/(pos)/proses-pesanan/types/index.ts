import { OrderRecord, OrderStatus, OrderItemRecord } from '@/app/dashboard/(pos)/penjualan/types'

export type PesananTab = 'semua' | 'preorder' | 'menunggu' | 'diproses' | 'selesai' | 'batal'

export interface BahanKebutuhanItem {
  bahanId: string
  namaBahan: string
  satuan: string
  qtyDibutuhkan: number
  stokTersedia: number
  cukup: boolean
}

export interface PesananWithKebutuhan extends OrderRecord {
  kebutuhanBahan?: BahanKebutuhanItem[]
  bisaDiproses?: boolean
  bahanKurangCount?: number
}
