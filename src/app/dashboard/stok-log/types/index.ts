export type StokLogSource = 'PO' | 'Penjualan' | 'Manual' | 'Opname' | 'Penyesuaian'

export interface BahanSimple {
  id: string
  code?: string | null
  nama: string
  satuan: string
  stok: number
}

export interface StokLog {
  id: string
  userId: string
  bahanId: string
  namaBahan: string
  satuan: string
  perubahan: number
  stokSebelum: number
  stokSesudah: number
  sumber: StokLogSource
  referenceId?: string | null
  catatan?: string | null
  createdAt: string
  tanggalFormatted: string
}

export interface OpnameEntry {
  bahanId: string
  namaBahan: string
  satuan: string
  stokSystem: number
  stokAktual: number
  selisih: number
}

export interface ManualMutasiInput {
  bahanId: string
  tipe: 'masuk' | 'keluar'
  jumlah: number
  catatan?: string
}
