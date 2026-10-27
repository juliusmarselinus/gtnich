export interface RiwayatSupplier {
  id?: string
  supplierId?: string
  tanggal: string
  keterangan: string
  jumlah: number
  createdAt?: string
}

export interface Supplier {
  id: string
  userId?: string
  code?: string
  nama: string
  telepon: string
  alamat: string
  kategori: string
  hargaRataRata: number
  minimalOrder: number
  riwayat: RiwayatSupplier[]
  createdAt?: string
  updatedAt?: string
}

export interface SupplierFormData {
  nama: string
  telepon: string
  alamat: string
  kategori: string
  hargaRataRata: number
  minimalOrder: number
}
