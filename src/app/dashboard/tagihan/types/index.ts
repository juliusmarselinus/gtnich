import { PurchaseOrder, POItem } from '../../purchase-order/types'

export type { PurchaseOrder, POItem }

export interface TagihanFilter {
  search: string
  supplierId: string
  statusBayar: 'all' | 'belum_lunas' | 'lunas'
  rentangWaktu: 'all' | 'minggu_ini' | 'bulan_ini'
}

export interface PelunasanInput {
  poId: string
  noPO: string
  nominalBayar: number
  metodePembayaran: string
  catatan?: string
}
