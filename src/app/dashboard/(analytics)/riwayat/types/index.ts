export type RiwayatTab = 'penjualan' | 'po'

export interface RiwayatPenjualanItem {
  id: string
  orderId: string
  menuId: string | null
  namaMenu: string
  qty: number
  hargaJual: number
  hpp: number
  subtotal: number
}

export interface RiwayatPenjualan {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone?: string | null
  channel: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  discount: number
  shippingFee: number
  totalPrice: number
  totalHPP: number
  profit: number
  cashierName: string
  notes?: string | null
  createdAt: string
  items: RiwayatPenjualanItem[]
}

export interface RiwayatPOItem {
  id: string
  bahanId: string | null
  namaBahan: string
  qty: number
  satuan: string
  hargaEstimasi: number
  hargaAktual: number
  stokSebelum: number
  diterima: boolean
}

export interface RiwayatPO {
  id: string
  noPO: string
  supplierId: string | null
  namaSupplier: string
  status: 'draft' | 'dikirim' | 'diterima' | 'tagihan' | 'selesai' | string
  totalEstimasi: number
  totalAktual: number
  tanggalBuat: string
  tanggalTerima?: string | null
  catatan?: string | null
  createdAt: string
  items: RiwayatPOItem[]
}
